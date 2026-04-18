import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

import { serviceService } from '../../services/services';

const { width } = Dimensions.get('window');

export default function ServicePaymentScreen() {
    const { id, name, price, scheduled_at, notes } = useLocalSearchParams();
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [reference] = useState(`SRV-${((typeof name === 'string' ? name : 'SVC')).substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);

    const cleanPriceStr = (price as string || '0').replace(/[^0-9.]/g, '');
    const unitPrice = parseFloat(cleanPriceStr) || 0;

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

    const handleFinish = async () => {
        if (!receiptImage) {
            Alert.alert("Error", "Please upload proof of payment.");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('service_id', String(id));
            formData.append('notes', `Schedule: ${scheduled_at}\nRequests: ${notes}`);
            formData.append('payment_reference', reference);
            // ServiceBooking array accepts scheduled_at, but we'll include it in notes since API parsing for datetime might be strict.
            // If backend allows raw datetime string, we can pass scheduled_at. Let's rely on notes for guaranteed delivery.

            // Append file
            const filename = receiptImage.split('/').pop() || 'receipt.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('receipt', {
                uri: receiptImage,
                name: filename,
                type: type,
            } as any);

            await serviceService.bookService(formData);
            setReceiptImage(null); // Clear state
            setIsSuccess(true);
        } catch (error: any) {
            console.error('Failed to book service:', error);
            Alert.alert("Error", error.response?.data?.message || "Failed to finalize concierge booking. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <View style={[styles.successCircle, { backgroundColor: colors.tint + '15' }]}>
                    <Ionicons name="star" size={60} color={colors.tint} />
                </View>
                <Text style={[styles.successTitle, { color: colors.text, fontFamily: fonts.heading }]}>Concierge Confirmed</Text>
                <Text style={[styles.successMsg, { color: colors.text, fontFamily: fonts.body }]}>
                    Your luxury service for {name} has been processed. Your lifestyle manager will review the request and deploy it according to your schedule.
                </Text>
                <TouchableOpacity
                    style={styles.homeBtn}
                    onPress={() => router.replace('/(tabs)')}
                >
                    <LinearGradient
                        colors={[colors.tint, '#6B2D5A']}
                        style={styles.homeBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={[styles.homeBtnText, { fontFamily: fonts.button }]}>Return to Dashboard</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Secure Concierge Transfer</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.amountBox, { marginBottom: 20 }]}>
                    <Text style={[styles.amountLabel, { color: colors.text }]}>Service Value</Text>
                    <Text style={[styles.amountValue, { color: colors.tint, fontFamily: fonts.heading }]}>₦{Number(unitPrice).toLocaleString() || 0}</Text>
                </View>

                {/* Instruction Summary */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Service Synopsis</Text>
                    <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailKey, { color: colors.text }]}>Service</Text>
                            <Text style={[styles.detailValue, { color: colors.text, fontFamily: fonts.button }]}>{name}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailKey, { color: colors.text }]}>Timeline</Text>
                            <Text style={[styles.detailValue, { color: colors.text, fontFamily: fonts.button }]} numberOfLines={1}>{scheduled_at}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailKey, { color: colors.text }]}>Requests</Text>
                            <Text style={[styles.detailValue, { color: colors.tint, fontFamily: fonts.button }]} numberOfLines={1}>{notes}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Payment Transfer</Text>
                    <View style={[styles.bankCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.bankRow}>
                            <Text style={[styles.bankKey, { color: colors.text }]}>Bank Name</Text>
                            <Text style={[styles.bankValue, { color: colors.text, fontFamily: fonts.button }]}>First Executive Bank</Text>
                        </View>
                        <View style={styles.bankRow}>
                            <Text style={[styles.bankKey, { color: colors.text }]}>Account Number</Text>
                            <Text style={[styles.bankValue, { color: colors.text, fontFamily: fonts.button }]}>0123 4567 8910</Text>
                        </View>
                        <View style={styles.bankRow}>
                            <Text style={[styles.bankKey, { color: colors.text }]}>Account Name</Text>
                            <Text style={[styles.bankValue, { color: colors.text, fontFamily: fonts.button }]}>Insignia Lifestyle Mgt</Text>
                        </View>
                        <View style={styles.bankRow}>
                            <Text style={[styles.bankKey, { color: colors.text }]}>Reference</Text>
                            <Text style={[styles.bankValue, { color: colors.tint, fontFamily: fonts.button }]}>{reference}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Upload Proof of Transfer</Text>
                    <TouchableOpacity
                        style={[styles.uploadBox, { backgroundColor: colors.card, borderColor: receiptImage ? colors.tint : colors.border, borderStyle: 'dashed' }]}
                        onPress={handleUpload}
                    >
                        {receiptImage ? (
                            <View style={styles.uploadedContent}>
                                <Image source={{ uri: receiptImage }} style={{ width: 60, height: 60, borderRadius: 10, marginBottom: 10 }} />
                                <Text style={[styles.uploadText, { color: colors.tint, fontFamily: fonts.button }]}>Receipt Sent</Text>
                                <Text style={styles.uploadSub}>Tap to change</Text>
                            </View>
                        ) : (
                            <View style={styles.uploadPlaceholder}>
                                <Ionicons name="cloud-upload-outline" size={40} color="#999" />
                                <Text style={[styles.uploadText, { color: colors.text, fontFamily: fonts.button }]}>Upload Receipt</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                    <Ionicons name="information-circle-outline" size={20} color="#999" />
                    <Text style={styles.infoText}>
                        Your lifestyle manager will immediately begin preparations once the transfer is verified.
                    </Text>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 25) }]}>
                <TouchableOpacity
                    style={[styles.finishBtn, { opacity: receiptImage && !isLoading ? 1 : 0.5 }]}
                    disabled={!receiptImage || isLoading}
                    onPress={handleFinish}
                >
                    <LinearGradient
                        colors={[colors.tint, '#6B2D5A']}
                        style={styles.finishBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={[styles.finishBtnText, { fontFamily: fonts.button }]}>
                            {isLoading ? 'Processing...' : 'Confirm Request'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 18 },
    scrollContent: { padding: 25 },
    amountBox: { alignItems: 'center', marginBottom: 40 },
    amountLabel: { fontSize: 14, opacity: 0.6, marginBottom: 5 },
    amountValue: { fontSize: 36 },
    detailsCard: { borderRadius: 20, borderWidth: 1, padding: 20 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    detailKey: { fontSize: 13, opacity: 0.5 },
    detailValue: { fontSize: 14 },
    section: { marginBottom: 35 },
    sectionLabel: { fontSize: 16, marginBottom: 15 },
    bankCard: { borderRadius: 20, borderWidth: 1, padding: 20 },
    bankRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    bankKey: { fontSize: 13, opacity: 0.5 },
    bankValue: { fontSize: 14 },
    uploadBox: { height: 160, borderRadius: 20, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
    uploadPlaceholder: { alignItems: 'center' },
    uploadedContent: { alignItems: 'center' },
    uploadText: { fontSize: 16, marginTop: 10 },
    uploadSub: { fontSize: 12, color: '#999', marginTop: 5 },
    infoBox: { flexDirection: 'row', padding: 15, borderRadius: 12, marginBottom: 20 },
    infoText: { flex: 1, fontSize: 12, color: '#666', marginLeft: 10, lineHeight: 18 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 25, borderTopWidth: 1 },
    finishBtn: { height: 54 },
    finishBtnGradient: { width: '100%', height: '100%', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    finishBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    successCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    successTitle: { fontSize: 28, textAlign: 'center', marginBottom: 15 },
    successMsg: { fontSize: 16, textAlign: 'center', lineHeight: 24, opacity: 0.7, paddingHorizontal: 40, marginBottom: 40 },
    homeBtn: { height: 54, width: width - 80 },
    homeBtnGradient: { width: '100%', height: '100%', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    homeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});
