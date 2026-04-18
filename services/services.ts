import api from './api';

export const serviceService = {
    getAllServices: async (category?: string) => {
        const params = category && category !== 'All' ? { category } : {};
        const response = await api.get('/services', { params });
        return response.data;
    },

    bookService: async (formData: FormData) => {
        const response = await api.post('/service-bookings', formData);
        return response.data;
    },

    getMyServiceBookings: async () => {
        const response = await api.get('/service-bookings');
        return response.data;
    }
};
