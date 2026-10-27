import axios from 'axios';
import { Platform } from 'react-native';
import { sessionService } from './session';

// For real devices, use your machine's local IP address
export const BACKEND_URL = 'http://192.168.1.120:8000';
const DEV_API_URL = `${BACKEND_URL}/api`;

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || DEV_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 25000, // 25 seconds timeout for gateway calls
});

// Request interceptor
api.interceptors.request.use(
    async (config) => {
        const token = await sessionService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            // Server responded with error code
            console.error('API Error:', error.response.status, error.response.data);

            const requestUrl = String(error.config?.url || '');
            const isAuthScreenRequest = requestUrl.includes('/login') || requestUrl.includes('/register');

            if (error.response.status === 401 && !isAuthScreenRequest) {
                await sessionService.handleUnauthorized();
            }
        } else if (error.request) {
            // Request made but no response
            console.error('Network Error:', error.request);
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
