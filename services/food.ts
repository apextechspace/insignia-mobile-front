import api from './api';

export const foodService = {
    getMenu: async (serviceId?: number) => {
        const response = await api.get('/menu', { params: { service_id: serviceId } });
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/menu/categories');
        return response.data;
    },

    placeOrder: async (orderData: { 
        items: Array<{ menu_item_id: number, quantity: number }>, 
        type: 'room_service' | 'pickup',
        metadata?: any 
    }) => {
        const response = await api.post('/food-orders', orderData);
        return response.data;
    },

    placeOrderWithReceipt: async (formData: FormData) => {
        const response = await api.post('/food-orders', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getMyOrders: async () => {
        const response = await api.get('/food-orders');
        return response.data;
    },

    getOrderDetails: async (id: number) => {
        const response = await api.get(`/food-orders/${id}`);
        return response.data;
    }
};
