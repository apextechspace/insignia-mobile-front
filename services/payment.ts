import api from './api';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

export type OrderType = 'booking' | 'order' | 'food_order' | 'service_booking';

export interface OPayInitResponse {
    status: string;
    cashier_url: string;
    reference: string;
    order_id: number;
    order_type: OrderType;
    amount: number;
    message?: string;
}

export interface OPayVerifyResponse {
    status: string;
    is_paid: boolean;
    record: any;
    message?: string;
}

export const paymentService = {
    /**
     * Request OPay cashier payment URL from backend
     */
    async initializeOPay(orderType: OrderType, orderId: number): Promise<OPayInitResponse> {
        const response = await api.post('/payments/opay/initialize', {
            order_type: orderType,
            order_id: orderId,
        });
        return response.data;
    },

    /**
     * Poll/verify payment status by reference
     */
    async verifyOPay(reference: string): Promise<OPayVerifyResponse> {
        const response = await api.get(`/payments/opay/verify/${reference}`);
        return response.data;
    },

    /**
     * Open OPay hosted cashier within an in-app browser session
     */
    async openOPayCashier(cashierUrl: string): Promise<WebBrowser.WebBrowserAuthSessionResult> {
        const redirectUrl = Linking.createURL('payment-complete');
        return await WebBrowser.openAuthSessionAsync(cashierUrl, redirectUrl);
    },
};
