import { manualBankDetails } from '../../config/manualBank';
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '../../hooks/useTheme';
import { foodService } from '../../services/food';
import { paymentService } from '../../services/payment';
import { sendLocalNotification } from '../../utils/notifications';
import PaymentMethodSelector, { PaymentMethod } from '../../components/PaymentMethodSelector';

const { width } = Dimensions.get('window');

type CartItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
};

export default function DiningPaymentScreen() {
    const { total, serviceName, type, items } = useLocalSearchParams();
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('flutterwave');
    const [receiptAsset, setReceiptAsset] = useState<any>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [diningDetails, setDiningDetails] = useState<any>(null);
    const [reference] = useState(`DINE-${((typeof serviceName === 'string' ? serviceName : 'DIN')).substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);

    const cartItems = useMemo<CartItem[]>(() => {
        if (typeof items !== 'string') return [];

        try {
            const parsed = JSON.parse(items);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Failed to parse dining cart:', error);
            return [];
        }
    }, [items]);

    const numericTotal = Number(total || 0);
    const totalQty = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    const handleUpload = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'We need access to your gallery to upload the receipt.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setReceiptAsset(result.assets[0]);
            Alert.alert('Success', 'Proof of payment selected successfully.');
        }
    };

    // ⚡ Flutterwave Dining Checkout
    const handlePayWithFlutterwave = async () => {
        if (cartItems.length === 0) {
            Alert.alert('Error', 'Your cart is empty.');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Submit order without receipt in pending status
            const formData = new FormData();
            formData.append('type', String(type || 'room_service'));
            formData.append('payment_reference', reference);
            formData.append('metadata[service_name]', String(serviceName || 'Dining'));
            formData.append('metadata[notes]', 'Paid via Flutterwave online checkout');

            cartItems.forEach((item, index) => {
                formData.append(`items[${index}][menu_item_id]`, String(item.id));
                formData.append(`items[${index}][quantity]`, String(item.quantity));
            });

            const orderResponse = await foodService.placeOrderWithReceipt(formData);
            const createdOrder = orderResponse.data;

            // 2. Initialize Flutterwave
            const flwData = await paymentService.initializeFlutterwave('food_order', createdOrder.id);

            const checkoutUrl = flwData.payment_url || flwData.cashier_url;
            if (!checkoutUrl) {
                throw new Error(flwData.message || 'Unable to open Flutterwave Checkout.');
            }

            // 3. Launch In-App Checkout
            await paymentService.openFlutterwaveCheckout(checkoutUrl);

            // 4. Verify payment
            const verifyResult = await paymentService.verifyFlutterwave(flwData.reference);

            setDiningDetails({
                id: createdOrder.id,
                reference: flwData.reference,
                amount: numericTotal,
                method: 'flutterwave',
                isPaid: verifyResult.is_paid,
                confirmedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });

            await sendLocalNotification(
                verifyResult.is_paid ? 'Dining Payment Confirmed' : 'Dining Payment Pending',
                verifyResult.is_paid
                    ? `Your dining payment for ${serviceName || 'Dining'} has been verified.`
                    : 'Payment is awaiting verification. Kitchen preparation has not started.'
            );

            setIsSuccess(true);
        } catch (error: any) {
            console.error('Flutterwave Dining Error:', error);
            Alert.alert('Payment Error', error.response?.data?.message || error.message || 'Failed to complete Flutterwave payment.');
        } finally {
            setIsLoading(false);
        }
    };

    // 🏦 Manual Bank Transfer
    const handleFinishManual = async () => {
        if (cartItems.length === 0) {
            Alert.alert('Error', 'Your cart is empty. Please go back and add an item first.');
            return;
        }

        if (!receiptAsset) {
            Alert.alert('Error', 'Please upload proof of payment.');
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('type', String(type || 'room_service'));
            formData.append('payment_reference', reference);
            formData.append('metadata[service_name]', String(serviceName || 'Dining'));
            formData.append('metadata[notes]', 'Dining order payment awaiting verification');

            cartItems.forEach((item, index) => {
                formData.append(`items[${index}][menu_item_id]`, String(item.id));
                formData.append(`items[${index}][quantity]`, String(item.quantity));
            });

            const uri = receiptAsset.uri;
            const filename = uri.split('/').pop() || 'receipt.jpg';
            const fileType = receiptAsset.mimeType || 'image/jpeg';

            formData.append('receipt', {
                uri,
                name: filename,
                type: fileType,
            } as any);

            const orderResponse = await foodService.placeOrderWithReceipt(formData);
            const createdOrder = orderResponse.data;

            setDiningDetails({
                id: createdOrder.id,
                reference: reference,
                amount: numericTotal,
                method: 'bank_transfer',
                isPaid: false,
                confirmedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });

            setReceiptAsset(null);
            setIsSuccess(true);
        } catch (error: any) {
            console.error('Failed to place dining order:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to place dining order. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.successScroll}>
                <View style={[styles.successCircle, { backgroundColor: colors.tint + '15' }]}>
                    <Ionicons name="restaurant-outline" size={60} color={colors.tint} />
                </View>
                <Text style={[styles.successTitle, { color: colors.text, fontFamily: fonts.heading }]}>
                    {diningDetails?.isPaid ? 'Dining Order Confirmed' : 'Order Submitted'}
                </Text>
                <Text style={[styles.successMsg, { color: colors.text, fontFamily: fonts.body }]}>
                    {diningDetails?.isPaid
                        ? `Your order for ${serviceName || 'Dining'} has been confirmed via Flutterwave and sent directly to the kitchen.`
                        : `Your order for ${serviceName || 'Dining'} has been received. Our team will verify your receipt shortly.`}
                </Text>

                {/* 🧾 Executive Dining Receipt Card */}
                <View style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.receiptHeader}>
                        <Text style={[styles.receiptHeaderTitle, { color: colors.tint, fontFamily: fonts.heading }]}>
                            INSIGNIA DINING RECEIPT
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: diningDetails?.isPaid ? '#27AE60' + '20' : '#F39C12' + '20' }]}>
                            <Text style={[styles.statusBadgeText, { color: diningDetails?.isPaid ? '#27AE60' : '#F39C12', fontFamily: fonts.button }]}>
                                {diningDetails?.isPaid ? 'PAID & SENT' : 'PENDING REVIEW'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.receiptRow}>
                        <Text style={[styles.receiptKey, { color: colors.text }]}>Service</Text>
                        <Text style={[styles.receiptValue, { color: colors.text, fontFamily: fonts.button }]}>{serviceName || 'Dining'}</Text>
                    </View>

                    <View style={styles.receiptRow}>
                        <Text style={[styles.receiptKey, { color: colors.text }]}>Order Type</Text>
                        <Text style={[styles.receiptValue, { color: colors.text, fontFamily: fonts.button }]}>
                            {type === 'pickup' ? 'Self Pickup' : 'Executive Room Service'}
                        </Text>
                    </View>

                    <View style={styles.receiptRow}>
                        <Text style={[styles.receiptKey, { color: colors.text }]}>Items Count</Text>
                        <Text style={[styles.receiptValue, { color: colors.text, fontFamily: fonts.button }]}>
                            {cartItems.length} dishes ({totalQty} total)
                        </Text>
                    </View>

                    <View style={styles.receiptRow}>
                        <Text style={[styles.receiptKey, { color: colors.text }]}>Payment Method</Text>
                        <Text style={[styles.receiptValue, { color: colors.tint, fontFamily: fonts.button }]}>
                            {diningDetails?.method === 'flutterwave' ? '⚡ Flutterwave Checkout' : '🏦 Bank Transfer'}
                        </Text>
                    </View>

                    <View style={styles.receiptRow}>
                        <Text style={[styles.receiptKey, { color: colors.text }]}>Reference</Text>
                        <Text style={[styles.receiptValue, { color: colors.text, fontSize: 12 }]}>{diningDetails?.reference}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.receiptRow}>
                        <Text style={[styles.receiptTotalKey, { color: colors.text, fontFamily: fonts.heading }]}>Total Amount</Text>
                        <Text style={[styles.receiptTotalValue, { color: colors.tint, fontFamily: fonts.heading }]}>
                            ₦{numericTotal.toLocaleString()}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.homeBtn}
                    onPress={() => router.replace('/(tabs)')}
                >
                    <LinearGradient
                        colors={[colors.tint, '#5D1031']}
                        style={styles.homeBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={[styles.homeBtnText, { fontFamily: fonts.button }]}>Return Home</Text>
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
                <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Dining Payment</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.amountBox, { marginBottom: 20 }]}>
                    <Text style={[styles.amountLabel, { color: colors.text }]}>Total Bill</Text>
                    <Text style={[styles.amountValue, { color: colors.tint, fontFamily: fonts.heading }]}>₦{numericTotal.toLocaleString()}</Text>
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Dining Summary</Text>
                    <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailKey, { color: colors.text }]}>Service</Text>
                            <Text style={[styles.detailValue, { color: colors.text, fontFamily: fonts.button }]}>{serviceName || 'Dining'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailKey, { color: colors.text }]}>Delivery Mode</Text>
                            <Text style={[styles.detailValue, { color: colors.text, fontFamily: fonts.button }]}>
                                {type === 'pickup' ? 'Pickup' : 'Room Service'}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailKey, { color: colors.text }]}>Total Items</Text>
                            <Text style={[styles.detailValue, { color: colors.text, fontFamily: fonts.button }]}>{totalQty}</Text>
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
                            Complete payment securely through Flutterwave. Kitchen preparation begins after verified payment.
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.section}>
                            <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Corporate Bank Account</Text>
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
                                style={[styles.uploadBox, { backgroundColor: colors.card, borderColor: receiptAsset ? colors.tint : colors.border, borderStyle: 'dashed' }]}
                                onPress={handleUpload}
                            >
                                {receiptAsset ? (
                                    <View style={styles.uploadedContent}>
                                        <Image source={{ uri: receiptAsset.uri }} style={{ width: 60, height: 60, borderRadius: 10, marginBottom: 10 }} />
                                        <Text style={[styles.uploadText, { color: colors.tint, fontFamily: fonts.button }]}>Receipt Selected</Text>
                                        <Text style={styles.uploadSub}>Tap to replace receipt</Text>
                                    </View>
                                ) : (
                                    <View style={styles.uploadPlaceholder}>
                                        <Ionicons name="cloud-upload-outline" size={40} color="#999" />
                                        <Text style={[styles.uploadText, { color: colors.text, fontFamily: fonts.button }]}>Upload Transfer Receipt</Text>
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
                                        Pay ₦{numericTotal.toLocaleString()} with Flutterwave
                                    </Text>
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.finishBtn, { opacity: receiptAsset ? 1 : 0.5 }]}
                        disabled={!receiptAsset || isLoading}
                        onPress={handleFinishManual}
                    >
                        <LinearGradient
                            colors={[colors.tint, '#6B2D5A']}
                            style={styles.finishBtnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={[styles.finishBtnText, { fontFamily: fonts.button }]}>
                                {isLoading ? 'Submitting Receipt...' : 'Confirm Dining Order'}
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
