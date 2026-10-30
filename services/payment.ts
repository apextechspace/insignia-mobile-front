import api from './api';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export type OrderType = 'booking' | 'order' | 'food_order' | 'service_booking';

export interface PaymentInitResponse {
    status: string;
    payment_url: string;
    cashier_url: string; // compatibility
    reference: string;
    order_id: number;
    order_type: OrderType;
    amount: number;
    message?: string;
}

export interface PaymentVerifyResponse {
    status: string;
    is_paid: boolean;
    record: any;
    message?: string;
}

export const paymentService = {
    /**
     * Request Flutterwave checkout payment URL from backend
     */
    async initializeFlutterwave(orderType: OrderType, orderId: number): Promise<PaymentInitResponse> {
        const response = await api.post('/payments/flutterwave/initialize', {
            order_type: orderType,
            order_id: orderId,
            redirect_url: Platform.OS === 'web' ? `${window.location.origin}/payment-complete` : Linking.createURL('payment-complete'),
        });
        return response.data;
    },

    /**
     * Poll / verify payment status by Flutterwave transaction reference
     */
    async verifyFlutterwave(reference: string): Promise<PaymentVerifyResponse> {
        const response = await api.get(`/payments/flutterwave/verify/${reference}`);
        return response.data;
    },

    /**
     * Open Flutterwave secure checkout within an in-app browser session
     */
    async openFlutterwaveCheckout(paymentUrl: string): Promise<WebBrowser.WebBrowserAuthSessionResult> {
        if (Platform.OS === 'web') {
            const target = new URL(paymentUrl);
            if (target.protocol !== 'https:') throw new Error('The payment provider returned an invalid secure checkout link.');
            // Popup auth sessions can stall after asynchronous email/booking requests.
            // Hosted checkout returns to payment-complete in this same tab, where
            // the existing backend verification remains authoritative.
            window.location.assign(target.href);
            return { type: WebBrowser.WebBrowserResultType.OPENED };
        }
        const redirectUrl = Linking.createURL('payment-complete');
        return await WebBrowser.openAuthSessionAsync(paymentUrl, redirectUrl);
    },

    /**
     * Generic payment gateway helpers
     */
    async initializePayment(orderType: OrderType, orderId: number): Promise<PaymentInitResponse> {
        return this.initializeFlutterwave(orderType, orderId);
    },

    async verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
        return this.verifyFlutterwave(reference);
    },

    async openPaymentCheckout(paymentUrl: string): Promise<WebBrowser.WebBrowserAuthSessionResult> {
        return this.openFlutterwaveCheckout(paymentUrl);
    },

};
