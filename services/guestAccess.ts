import api from './api';
import { sessionService } from './session';
export const guestAccess = {
  request: async (email: string, name?: string, phone?: string) =>
    (await api.post('/guest-access/request', { email, name, phone }, { timeout: 60000 })).data as { request_id: string },
  verify: async (request_id: string, code?: string, token?: string) => {
    const { data } = await api.post('/guest-access/verify', { request_id, code, token });
    await sessionService.setToken(data.access_token);
    return data.user;
  },
};
