import { manualBankDetails } from '../../config/manualBank';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

import { productService } from '../../services/products';
import { paymentService } from '../../services/payment';
import { sendLocalNotification } from '../../utils/notifications';
import PaymentMethodSelector, { PaymentMethod } from '../../components/PaymentMethodSelector';

const { width } = Dimensions.get('window');

export default function ShopPaymentScreen() {
    const { total, name, id, quantity, delivery_location } = useLocalSearchParams();
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('flutterwave');
    const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [reference] = useState(`BOUT-${((typeof name === 'string' ? name : 'ITEM')).substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);

    const handleUpload = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Required", "We need access to your gallery to upload the receipt.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setReceiptImage(result.assets[0].uri);
            Alert.alert("Success", "Proof of payment selected successfully.");
        }
    };

    // ⚡ Flutterwave Instant Payment
    const handlePayWithFlutterwave = async () => {
        setIsLoading(true);
        try {
            // 1. Create order in pending status
            const formData = new FormData();
            formData.append('product_id', String(id));
            formData.append('quantity', String(quantity));
            formData.append('notes', `Delivery for ${name}`);
            formData.append('payment_reference', reference);
            formData.append('delivery_location', String(delivery_location || 'Room Delivery'));

            const createdOrder = await productService.createOrder(formData);

            // 2. Initialize Flutterwave
            const flwData = await paymentService.initializeFlutterwave('order', createdOrder.id);

            const checkoutUrl = flwData.payment_url || flwData.cashier_url;
            if (!checkoutUrl) {
                throw new Error(flwData.message || 'Unable to open Flutterwave Checkout.');
            }

            // 3. Open Checkout
            await paymentService.openFlutterwaveCheckout(checkoutUrl);

            // 4. Verify payment
            const verifyResult = await paymentService.verifyFlutterwave(flwData.reference);

            setOrderDetails({
                id: createdOrder.id,
                reference: flwData.reference,
                amount: total,
                method: 'flutterwave',
                isPaid: verifyResult.is_paid,
                confirmedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });

            await sendLocalNotification(
                verifyResult.is_paid ? 'Boutique Payment Confirmed' : 'Boutique Payment Pending',
                verifyResult.is_paid
                    ? `Your boutique payment for ${name} has been verified.`
                    : 'Payment is awaiting verification. Your order is not yet cleared for dispatch.'
            );

            setIsSuccess(true);
        } catch (error: any) {
            console.error('Flutterwave Order Error:', error);
            Alert.alert("Payment Error", error.response?.data?.message || error.message || "Failed to process Flutterwave payment.");
        } finally {
            setIsLoading(false);
        }
    };

    // 🏦 Direct Bank Transfer
    const handleFinishManual = async () => {
        if (!receiptImage) {
            Alert.alert("Error", "Please upload proof of payment.");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('product_id', String(id));
            formData.append('quantity', String(quantity));
            formData.append('notes', `Delivery for ${name}`);
            formData.append('payment_reference', reference);
            formData.append('delivery_location', String(delivery_location || 'Room Delivery'));

            const filename = receiptImage.split('/').pop() || 'receipt.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('receipt', {
                uri: receiptImage,
                name: filename,
                type: type,
            } as any);

            const createdOrder = await productService.createOrder(formData);

            setOrderDetails({
                id: createdOrder.id,
                reference: reference,
                amount: total,
                method: 'bank_transfer',
                isPaid: false,
                confirmedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });

            await sendLocalNotification(
                "Order Placed", 
                `Your order for ${name} has been received and is being prepared for delivery.`
            );

            setReceiptImage(null);
            setIsSuccess(true);
        } catch (error: any) {
            console.error('Order Error:', error);
            Alert.alert("Order Failed", error.response?.data?.message || "Something went wrong while confirming your order.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.successScroll}>
                <View style={[styles.successCircle, { backgroundColor: colors.tint + '15' }]}>
                    <Ionicons name="bag-check" size={60} color={colors.tint} />
                </View>
                <Text style={[styles.successTitle, { color: colors.text, fontFamily: fonts.heading }]}>
                    {orderDetails?.isPaid ? 'Order Confirmed' : 'Order Placed'}
                </Text>
                <Text style={[styles.successMsg, { color: colors.text, fontFamily: fonts.body }]}>
                    {orderDetails?.isPaid
                        ? `Your order for ${name} has been verified via Flutterwave and sent to dispatch.`
                        : `Your order for ${name} has been received. Our team will verify your receipt shortly.`}
                </Text>

                {/* 🧾 Executive Boutique Receipt */}
                <View style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.receiptHeader}>
                        <Text style={[styles.receiptHeaderTitle, { color: colors.tint, fontFamily: fonts.heading }]}>
                            INSIGNIA BOUTIQUE RECEIPT
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: orderDetails?.isPaid ? '#27AE60' + '20' : '#F39C12' + '20' }]}>
                            <Text style={[styles.statusBadgeText, { color: orderDetails?.isPaid ? '#27AE60' : '#F39C12', fontFamily: fonts.button }]}>
                                {orderDetails?.isPaid ? 'PAID' : 'PENDING REVIEW'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.receiptRow}>
                        <Text style={[styles.receiptKey, { color: colors.text }]}>Item</Text>
                        <Text style={[styles.receiptValue, { color: colors.text, fontFamily: fonts.button }]}>{name}</Text>
                    </View>

                    <View style={styles.receiptRow}>
                        <Text style={[styles.receiptKey, { color: colors.text }]}>Quantity</Text>
                        <Text style={[styles.receiptValue, { color: colors.text, fontFamily: fonts.button }]}>{quantity}x</Text>
                    </View>

                    <View style={styles.receiptRow}>
                        <Text style={[styles.receiptKey, { color: colors.text }]}>Delivery Location</Text>
                        <Text style={[styles.receiptValue, { color: colors.text, fontFamily: fonts.button }]}>
                            {delivery_location || 'Room Delivery'}
                        </Text>
                    </View>

                    <View style={styles.receiptRow}>
                        <Text style={[styles.receiptKey, { color: colors.text }]}>Payment Method</Text>
                        <Text style={[styles.receiptValue, { color: colors.tint, fontFamily: fonts.button }]}>
                            {orderDetails?.method === 'flutterwave' ? '⚡ Flutterwave Checkout' : '🏦 Bank Transfer'}
                        </Text>
                    </View>

                    <View style={styles.receiptRow}>
                        <Text style={[styles.receiptKey, { color: colors.text }]}>Reference</Text>
                        <Text style={[styles.receiptValue, { color: colors.text, fontSize: 12 }]}>{orderDetails?.reference}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.receiptRow}>
                        <Text style={[styles.receiptTotalKey, { color: colors.text, fontFamily: fonts.heading }]}>Total Paid</Text>
                        <Text style={[styles.receiptTotalValue, { color: colors.tint, fontFamily: fonts.heading }]}>
                            ₦{Number(total).toLocaleString()}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.homeBtn}
                    onPress={() => router.replace('/management/orders')}
                >
                    <LinearGradient
                        colors={[colors.tint, '#5D1031']}
                        style={styles.homeBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={[styles.homeBtnText, { fontFamily: fonts.button }]}>View Order History</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Secure Checkout</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.amountBox, { marginBottom: 20 }]}>
                    <Text style={[styles.amountLabel, { color: colors.text }]}>Total Amount Due</Text>
                    <Text style={[styles.amountValue, { color: colors.tint, fontFamily: fonts.heading }]}>₦{Number(total).toLocaleString()}</Text>
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Purchase Summary</Text>
                    <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailKey, { color: colors.text }]}>Product</Text>
                            <Text style={[styles.detailValue, { color: colors.text, fontFamily: fonts.button }]}>{name}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailKey, { color: colors.text }]}>Quantity</Text>
                            <Text style={[styles.detailValue, { color: colors.text, fontFamily: fonts.button }]}>{quantity}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailKey, { color: colors.text }]}>Delivery Destination</Text>
                            <Text style={[styles.detailValue, { color: colors.text, fontFamily: fonts.button }]}>
                                {delivery_location || 'Room Delivery'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 💳 Payment Method Selector */}
                <PaymentMethodSelector 
                    selectedMethod={selectedMethod} 
                    onSelect={setSelectedMethod} 
                />

                {selectedMethod === 'flutterwave' ? (
                    <View style={[styles.gatewayNoticeBox, { backgroundColor: colors.card, borderColor: colors.tint + '40' }]}>
                        <View style={styles.gatewayNoticeHeader}>
                            <Ionicons name="shield-checkmark" size={24} color={colors.tint} />
                            <Text style={[styles.gatewayNoticeTitle, { color: colors.text, fontFamily: fonts.heading }]}>
                                Flutterwave Secure Checkout
                            </Text>
                        </View>
                        <Text style={[styles.gatewayNoticeText, { color: colors.text, fontFamily: fonts.body }]}>
                            Pay securely using the payment methods available at Flutterwave checkout.
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.section}>
                            <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Corporate Bank Details</Text>
                            <View style={[styles.bankCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.bankRow}>
                                    <Text style={[styles.bankKey, { color: colors.text }]}>Bank Name</Text>
                                    <Text style={[styles.bankValue, { color: colors.text, fontFamily: fonts.button }]}>{manualBankDetails.bankName || 'Unavailable'}</Text>
                                </View>
                                <View style={styles.bankRow}>
                                    <Text style={[styles.bankKey, { color: colors.text }]}>Account Number</Text>
                                    <Text style={[styles.bankValue, { color: colors.text, fontFamily: fonts.button }]}>{manualBankDetails.accountNumber || 'Unavailable'}</Text>
                                </View>
                                <View style={styles.bankRow}>
                                    <Text style={[styles.bankKey, { color: colors.text }]}>Account Name</Text>
                                    <Text style={[styles.bankValue, { color: colors.text, fontFamily: fonts.button }]}>{manualBankDetails.accountName || 'Unavailable'}</Text>
                                </View>
                                <View style={styles.bankRow}>
                                    <Text style={[styles.bankKey, { color: colors.text }]}>Reference</Text>
                                    <Text style={[styles.bankValue, { color: colors.tint, fontFamily: fonts.button }]}>{reference}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Upload Payment Receipt</Text>
                            <TouchableOpacity
                                style={[styles.uploadBox, { backgroundColor: colors.card, borderColor: receiptImage ? colors.tint : colors.border, borderStyle: 'dashed' }]}
                                onPress={handleUpload}
                            >
                                {receiptImage ? (
                                    <View style={styles.uploadedContent}>
                                        <Image source={{ uri: receiptImage }} style={{ width: 60, height: 60, borderRadius: 10, marginBottom: 10 }} />
                                        <Text style={[styles.uploadText, { color: colors.tint, fontFamily: fonts.button }]}>Receipt Selected</Text>
                                        <Text style={styles.uploadSub}>Tap to replace receipt</Text>
                                    </View>
                                ) : (
                                    <View style={styles.uploadPlaceholder}>
                                        <Ionicons name="cloud-upload-outline" size={40} color="#999" />
                                        <Text style={[styles.uploadText, { color: colors.text, fontFamily: fonts.button }]}>Upload Receipt Proof</Text>
                                        <Text style={styles.uploadSub}>JPG or PNG (Max 5MB)</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 20) }]}>
                {selectedMethod === 'flutterwave' ? (
                    <TouchableOpacity
                        style={styles.finishBtn}
                        disabled={isLoading}
                        onPress={handlePayWithFlutterwave}
                    >
                        <LinearGradient
                            colors={[colors.tint, '#5D1031']}
                            style={styles.finishBtnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <View style={styles.btnRow}>
                                    <Ionicons name="flash" size={18} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={[styles.finishBtnText, { fontFamily: fonts.button }]}>
                                        Pay ₦{Number(total).toLocaleString()} with Flutterwave
                                    </Text>
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.finishBtn, { opacity: receiptImage ? 1 : 0.5 }]}
                        disabled={!receiptImage || isLoading}
                        onPress={handleFinishManual}
                    >
                        <LinearGradient
                            colors={[colors.tint, '#6B2D5A']}
                            style={styles.finishBtnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={[styles.finishBtnText, { fontFamily: fonts.button }]}>
                                {isLoading ? 'Submitting Receipt...' : 'Finish Order'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 18 },
    scrollContent: { padding: 25 },
    successScroll: { padding: 25, alignItems: 'center', justifyContent: 'center', minHeight: '100%' },
    amountBox: { alignItems: 'center', marginBottom: 20 },
    amountLabel: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6, marginBottom: 5 },
    amountValue: { fontSize: 32 },
    section: { marginBottom: 25 },
    sectionLabel: { fontSize: 16, marginBottom: 12, letterSpacing: 0.5 },
    detailsCard: { borderRadius: 16, padding: 18, borderWidth: 1 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    detailKey: { fontSize: 13, opacity: 0.7 },
    detailValue: { fontSize: 14 },
    bankCard: { borderRadius: 16, padding: 18, borderWidth: 1 },
    bankRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    bankKey: { fontSize: 13, opacity: 0.7 },
    bankValue: { fontSize: 14 },
    uploadBox: { height: 140, borderRadius: 16, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    uploadPlaceholder: { alignItems: 'center' },
    uploadedContent: { alignItems: 'center' },
    uploadText: { fontSize: 14, marginTop: 8 },
    uploadSub: { fontSize: 11, color: '#999', marginTop: 4 },
    footer: { padding: 20, borderTopWidth: 1 },
    finishBtn: { borderRadius: 14, overflow: 'hidden' },
    finishBtnGradient: { height: 54, justifyContent: 'center', alignItems: 'center' },
    finishBtnText: { color: '#FFF', fontSize: 15, letterSpacing: 1 },
    btnRow: { flexDirection: 'row', alignItems: 'center' },
    gatewayNoticeBox: { borderRadius: 16, padding: 20, borderWidth: 1.5, marginBottom: 25 },
    gatewayNoticeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    gatewayNoticeTitle: { fontSize: 16, marginLeft: 10 },
    gatewayNoticeText: { fontSize: 13, opacity: 0.7, lineHeight: 18 },
    successCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    successTitle: { fontSize: 22, marginBottom: 10, textAlign: 'center' },
    successMsg: { fontSize: 14, textAlign: 'center', opacity: 0.7, lineHeight: 22, paddingHorizontal: 20, marginBottom: 25 },
    receiptCard: { width: '100%', borderRadius: 20, padding: 22, borderWidth: 1, marginBottom: 30 },
    receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    receiptHeaderTitle: { fontSize: 14, letterSpacing: 1 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusBadgeText: { fontSize: 11 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 12 },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    receiptKey: { fontSize: 13, opacity: 0.6 },
    receiptValue: { fontSize: 13 },
    receiptTotalKey: { fontSize: 16 },
    receiptTotalValue: { fontSize: 18 },
    homeBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
    homeBtnGradient: { height: 54, justifyContent: 'center', alignItems: 'center' },
    homeBtnText: { color: '#FFF', fontSize: 15, letterSpacing: 1 },
});
