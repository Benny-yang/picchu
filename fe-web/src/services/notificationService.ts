import api from './api';
import { handleApiError } from './serviceUtils';

export const notificationService = {
    list: async (): Promise<any[]> => {
        try {
            const response = await api.get('/notifications');
            return response.data.data || [];
        } catch (error) {
            return handleApiError(error, 'List notifications failed');
        }
    },

    markAsRead: async (id: number): Promise<void> => {
        try {
            await api.post(`/notifications/${id}/read`);
        } catch (error) {
            return handleApiError(error, `Mark notification ${id} as read failed`);
        }
    },

    getUnreadCount: async (): Promise<number> => {
        try {
            const response = await api.get('/notifications/unread-count');
            return response.data.data?.count || 0;
        } catch (error) {
            return handleApiError(error, 'Get unread count failed');
        }
    },
};
