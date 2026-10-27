import api from './api';

export interface BookingData {
    room_id: number;
    check_in: string; // YYYY-MM-DD
    check_out: string; // YYYY-MM-DD
    guests?: number;
    payment_reference?: string;
    receipt_url?: string;
}

export interface BookingResponse {
    id: number;
    user_id: number;
    room_id: number;
    check_in: string;
    check_out: string;
    total_price: string;
    status: string;
    paid_at?: string | null;
    checked_in_at?: string | null;
    checked_out_at?: string | null;
    payment_reference?: string | null;
    receipt_url?: string | null;
    room?: { name: string; image?: string };
    created_at: string;
    updated_at: string;
}

export const bookingService = {
    createBooking: async (formData: FormData): Promise<BookingResponse> => {
        const response = await api.post<BookingResponse>('/bookings', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    },

    getMyBookings: async (): Promise<BookingResponse[]> => {
        const response = await api.get<BookingResponse[]>('/bookings');
        return response.data;
    }
};

export default bookingService;
