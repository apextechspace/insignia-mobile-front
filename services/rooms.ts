import api from './api';

export const roomService = {
    getAvailableRooms: async (check_in: string, check_out: string, guests: number) =>
        (await api.get('/rooms', { params: { check_in, check_out, guests } })).data,
    getAllRooms: async () => {
        const response = await api.get('/rooms');
        return response.data;
    },

    getRoomById: async (id: string) => {
        const response = await api.get(`/rooms/${id}`);
        return response.data;
    },

    bookRoom: async (bookingData: any) => {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    }
};
