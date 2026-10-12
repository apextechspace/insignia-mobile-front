import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const AUTH_TOKEN_KEY = 'auth_token';

let unauthorizedHandler: null | (() => void | Promise<void>) = null;
let isHandlingUnauthorized = false;

const isWeb = Platform.OS === 'web';

const getSecureToken = async (): Promise<string | null> => {
    if (isWeb) {
        return AsyncStorage.getItem(AUTH_TOKEN_KEY);
    }
    try {
        return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    } catch {
        return AsyncStorage.getItem(AUTH_TOKEN_KEY);
    }
};

const migrateLegacyToken = async (): Promise<string | null> => {
    if (isWeb) {
        return AsyncStorage.getItem(AUTH_TOKEN_KEY);
    }
    try {
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
    } catch {
        return AsyncStorage.getItem(AUTH_TOKEN_KEY);
    }
};

export const sessionService = {
    getToken: async (): Promise<string | null> => {
        try {
            return await migrateLegacyToken();
        } catch {
            return null;
        }
    },

    setToken: async (token: string): Promise<void> => {
        if (isWeb) {
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
            return;
        }
        try {
            await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
        } catch {
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        }
    },

    clearToken: async (): Promise<void> => {
        if (isWeb) {
            await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
            return;
        }
        try {
            await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        } catch {
            // ignore
        }
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
