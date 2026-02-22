import api from './api';
import { handleApiError } from './serviceUtils';
import type { ActivityFilter } from '../types';

export const activityService = {
    list: async (filter?: ActivityFilter): Promise<{ data: any[]; total: number }> => {
        try {
            const params = new URLSearchParams();
            if (filter?.location) params.set('location', filter.location);
            if (filter?.dateFrom) params.set('dateFrom', filter.dateFrom);
            if (filter?.dateTo) params.set('dateTo', filter.dateTo);
            if (filter?.tags) params.set('tags', filter.tags);
            if (filter?.offset !== undefined) params.set('offset', String(filter.offset));
            if (filter?.limit !== undefined) params.set('limit', String(filter.limit));

            const response = await api.get(`/activities?${params.toString()}`);
            const result = response.data.data;
            return { data: result?.data || [], total: result?.total || 0 };
        } catch (error) {
            return handleApiError(error, 'List activities failed');
        }
    },

    getById: async (id: number): Promise<any> => {
        try {
            const response = await api.get(`/activities/${id}`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error, `Get activity ${id} failed`);
        }
    },

    create: async (data: any): Promise<any> => {
        try {
            const response = await api.post('/activities', data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error, 'Create activity failed');
        }
    },

    update: async (id: number, data: any): Promise<any> => {
        try {
            const response = await api.put(`/activities/${id}`, data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error, `Update activity ${id} failed`);
        }
    },

    remove: async (id: number): Promise<void> => {
        try {
            await api.delete(`/activities/${id}`);
        } catch (error) {
            return handleApiError(error, `Delete activity ${id} failed`);
        }
    },

    // --- Participation ---

    apply: async (id: number, message?: string): Promise<void> => {
        try {
            await api.post(`/activities/${id}/apply`, { message: message || '' });
        } catch (error) {
            return handleApiError(error, `Apply to activity ${id} failed`);
        }
    },

    cancelApplication: async (id: number): Promise<void> => {
        try {
            await api.delete(`/activities/${id}/apply`);
        } catch (error) {
            return handleApiError(error, `Cancel application for activity ${id} failed`);
        }
    },

    cancelActivity: async (id: number, reason: string): Promise<void> => {
        try {
            await api.post(`/activities/${id}/cancel`, { reason });
        } catch (error) {
            return handleApiError(error, `Cancel activity ${id} failed`);
        }
    },

    getStatus: async (id: number): Promise<string> => {
        try {
            const response = await api.get(`/activities/${id}/status`);
            return response.data.data?.status || 'idle';
        } catch (error) {
            return handleApiError(error, `Get status for activity ${id} failed`);
        }
    },

    // --- Host Management ---

    listApplicants: async (id: number): Promise<any[]> => {
        try {
            const response = await api.get(`/activities/${id}/applicants`);
            return response.data.data || [];
        } catch (error) {
            return handleApiError(error, `List applicants for activity ${id} failed`);
        }
    },

    updateApplicantStatus: async (activityId: number, userId: number, status: string): Promise<void> => {
        try {
            await api.put(`/activities/${activityId}/applicants/${userId}/status`, { status });
        } catch (error) {
            return handleApiError(error, `Update applicant ${userId} status failed`);
        }
    },

    // --- Comments ---

    getComments: async (id: number): Promise<any[]> => {
        try {
            const response = await api.get(`/activities/${id}/comments`);
            return response.data.data || [];
        } catch (error) {
            return handleApiError(error, `Get comments for activity ${id} failed`);
        }
    },

    postComment: async (id: number, content: string): Promise<any> => {
        try {
            const response = await api.post(`/activities/${id}/comments`, { content });
            return response.data.data;
        } catch (error) {
            return handleApiError(error, `Post comment for activity ${id} failed`);
        }
    },

    // --- Participants & Ratings ---

    getParticipants: async (id: number): Promise<any[]> => {
        try {
            const response = await api.get(`/activities/${id}/participants`);
            return response.data.data || [];
        } catch (error) {
            return handleApiError(error, `Get participants for activity ${id} failed`);
        }
    },

    submitRating: async (activityId: number, input: { targetUserID: number; rating: number; comment?: string }): Promise<void> => {
        try {
            await api.post(`/activities/${activityId}/rate`, {
                targetUserId: input.targetUserID,
                rating: input.rating,
                comment: input.comment || '',
            });
        } catch (error) {
            return handleApiError(error, `Submit rating for activity ${activityId} failed`);
        }
    },

    getRatings: async (activityId: number): Promise<any> => {
        try {
            const response = await api.get(`/activities/${activityId}/ratings`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error, `Get ratings for activity ${activityId} failed`);
        }
    },
    // Invite User
    inviteUser: async (activityId: number | string, userId: number, message: string) => {
        try {
            const response = await api.post(`/activities/${activityId}/invite`, {
                userId,
                message
            });
            return response.data;
        } catch (error) {
            return handleApiError(error, 'Failed to invite user');
        }
    },
};
