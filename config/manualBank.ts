import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export type ManualBankDetails = {
    bankName: string;
    accountNumber: string;
    accountName: string;
    isConfigured: boolean;
};

const unavailable: ManualBankDetails = {
    bankName: '',
    accountNumber: '',
    accountName: '',
    isConfigured: false,
};

/**
 * Server-managed IPL account. Refresh when a payment screen regains focus.
 * Never fall back to bundled environment or placeholder bank numbers.
 */
export function useManualBankDetails(orderType: 'booking' | 'order' | 'food_order' | 'service_booking' = 'booking'): ManualBankDetails {
    const [details, setDetails] = useState<ManualBankDetails>(unavailable);

    useFocusEffect(useCallback(() => {
        let active = true;
        setDetails(unavailable);
        api.get('/payment-methods/manual-bank', {
            params: { order_type: orderType },
            headers: { 'Cache-Control': 'no-cache' },
        }).then(({ data }) => {
            if (!active) return;
            const bankName = String(data.bank_name || '').trim();
            const accountNumber = String(data.account_number || '').trim();
            const accountName = String(data.account_name || '').trim();
            const isConfigured = data.is_configured === true
                && !!bankName && /^\d{10}$/.test(accountNumber) && !!accountName;
            setDetails(isConfigured
                ? { bankName, accountNumber, accountName, isConfigured: true }
                : unavailable);
        }).catch(() => {
            if (active) setDetails(unavailable);
        });
        return () => { active = false; };
    }, [orderType]));

    return details;
}
