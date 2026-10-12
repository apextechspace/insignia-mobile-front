import api from './api';

export const apartmentService = {
    listGuests: async () => {
        const response = await api.get('/guests');
        return response.data;
    },

    registerGuest: async (guestData: { 
        guest_name: string, 
        guest_phone?: string, 
        relationship?: string, 
        visit_date?: string, 
        expected_arrival?: string, 
        purpose?: string, 
        notes?: string 
    }) => {
        const response = await api.post('/guests', guestData);
        return response.data;
    },

    listMaintenance: async () => {
        const response = await api.get('/maintenance');
        return response.data;
    },

    submitMaintenance: async (maintenanceData: {
        category: string,
        title: string,
        description: string,
        priority?: 'low' | 'normal' | 'urgent'
    }) => {
        const response = await api.post('/maintenance', maintenanceData);
        return response.data;
    }
};
