import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'auth_token';

let unauthorizedHandler: null | (() => void | Promise<void>) = null;
let isHandlingUnauthorized = false;

const getSecureToken = async () => {
    return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
};

const migrateLegacyToken = async () => {
    const secureToken = await getSecureToken();
    if (secureToken) {
        return secureToken;
    }

    const legacyToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (!legacyToken) {
        return null;
    }

    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, legacyToken);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    return legacyToken;
};

export const sessionService = {
    getToken: async () => {
        return migrateLegacyToken();
    },

    setToken: async (token: string) => {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    },

    clearToken: async () => {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    },

    setUnauthorizedHandler: (handler: null | (() => void | Promise<void>)) => {
        unauthorizedHandler = handler;
    },

    handleUnauthorized: async () => {
        if (isHandlingUnauthorized) {
            return;
        }

        isHandlingUnauthorized = true;

        try {
            await sessionService.clearToken();
            if (unauthorizedHandler) {
                await unauthorizedHandler();
            }
        } finally {
            isHandlingUnauthorized = false;
        }
    },
};
