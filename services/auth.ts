import api from './api';

export const authService = {
    login: async (credentials: any) => {
        const response = await api.post('/login', credentials);
        return response.data;
    },

    register: async (userData: any) => {
        const response = await api.post('/register', userData);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/logout');
        return response.data;
    },

    getUser: async () => {
        const response = await api.get('/user');
        return response.data;
    },

    setupPin: async (pin: string) => {
        const response = await api.post('/user/setup-pin', { pin });
        return response.data;
    },

    verifyPin: async (pin: string) => {
        const response = await api.post('/user/verify-pin', { pin });
        return response.data;
    },

    updateProfile: async (formData: FormData) => {
        const response = await api.post('/user/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updatePushToken: async (token: string) => {
        const response = await api.post('/user/push-token', { token });
        return response.data;
    }
};
