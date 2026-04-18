import api from './api';

export const productService = {
    getAllProducts: async (category?: string) => {
        const params = category && category !== 'All' ? { category } : {};
        const response = await api.get('/products', { params });
        return response.data;
    },

    getProductById: async (id: string) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    createOrder: async (formData: FormData) => {
        const response = await api.post('/orders', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    },

    getMyOrders: async () => {
        const response = await api.get('/orders');
        return response.data;
    }
};
