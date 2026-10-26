/** Guest-visible manual transfer details must be verified before enabling this method. */
const bankName = process.env.EXPO_PUBLIC_MANUAL_BANK_NAME?.trim() || '';
const accountNumber = process.env.EXPO_PUBLIC_MANUAL_ACCOUNT_NUMBER?.replace(/\s+/g, '') || '';
const accountName = process.env.EXPO_PUBLIC_MANUAL_ACCOUNT_NAME?.trim() || '';

export const manualBankDetails = {
    bankName,
    accountNumber,
    accountName,
    isConfigured: Boolean(bankName && /^\d{10}$/.test(accountNumber) && accountName),
};
