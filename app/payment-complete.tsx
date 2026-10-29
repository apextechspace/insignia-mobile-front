import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { paymentService } from '../services/payment';
import { useTheme } from '../hooks/useTheme';

export default function PaymentCompleteScreen() {
    const params = useLocalSearchParams<{ reference?: string; tx_ref?: string; order_type?: string }>();
    const reference = typeof params.reference === 'string' ? params.reference : params.tx_ref;
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [paid, setPaid] = useState(false);
    const [message, setMessage] = useState('Checking your payment…');

    const verify = useCallback(async () => {
        setLoading(true);
        try {
            if (!reference || typeof reference !== 'string') {
                setMessage('No payment reference was supplied. Open your booking or order to check its status.');
                return;
            }
            const result = await paymentService.verifyFlutterwave(reference);
            setPaid(result.is_paid === true);
            setMessage(result.is_paid
                ? 'Your payment has been verified. Your receipt will be emailed to you.'
                : 'Payment has not yet been confirmed. You can check again or view your booking or order.');
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'We could not verify the payment. Please check again before making another payment.');
        } finally {
            setLoading(false);
        }
    }, [reference]);

    useEffect(() => {
        WebBrowser.maybeCompleteAuthSession();
        void verify();
    }, [verify]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {loading && <ActivityIndicator size="large" color={colors.tint} />}
            <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>
                {loading ? 'Checking payment' : paid ? 'Payment confirmed' : 'Payment status'}
            </Text>
            <Text style={[styles.message, { color: colors.text, fontFamily: fonts.body }]}>{message}</Text>
            {!loading && !paid && reference && (
                <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={() => void verify()}>
                    <Text style={styles.buttonText}>Check again</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={() => router.replace(
                params.order_type === 'order' ? '/management/orders'
                    : params.order_type === 'service_booking' || params.order_type === 'food_order'
                        ? '/management/service-orders' : '/management/bookings'
            )}>
                <Text style={styles.buttonText}>View booking or order</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 28, alignItems: 'center' },
    title: { fontSize: 26, textAlign: 'center', marginVertical: 20 },
    message: { fontSize: 16, lineHeight: 25, textAlign: 'center', marginBottom: 24 },
    button: { paddingHorizontal: 24, paddingVertical: 15, borderRadius: 12, marginBottom: 12 },
    buttonText: { color: '#fff', fontWeight: '600' },
});
