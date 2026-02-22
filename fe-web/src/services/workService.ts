import api from './api';
import { handleApiError } from './serviceUtils';
import type { WallParams } from '../types';

export const workService = {
    getWall: async (params: WallParams): Promise<{ data: any[]; nextCursor: string; seed: number }> => {
        try {
            const query = new URLSearchParams();
            query.set('type', params.type);
            if (params.cursor) query.set('cursor', params.cursor);
            if (params.seed) query.set('seed', String(params.seed));
            if (params.limit) query.set('limit', String(params.limit));

            const response = await api.get(`/works?${query.toString()}`);
            const result = response.data.data;
            return {
                data: result?.data || [],
                nextCursor: result?.next_cursor || '',
                seed: result?.seed || 0,
            };
        } catch (error) {
            return handleApiError(error, 'Get works wall failed');
        }
    },

    getById: async (id: number): Promise<any> => {
        try {
            const response = await api.get(`/works/${id}`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error, `Get work ${id} failed`);
        }
    },

    create: async (data: any): Promise<any> => {
        try {
            const response = await api.post('/works', data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error, 'Create work failed');
        }
    },

    update: async (id: number, data: any): Promise<any> => {
        try {
            const response = await api.put(`/works/${id}`, data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error, `Update work ${id} failed`);
        }
    },

    remove: async (id: number): Promise<void> => {
        try {
            await api.delete(`/works/${id}`);
        } catch (error) {
            return handleApiError(error, `Delete work ${id} failed`);
        }
    },

    // --- Like ---

    like: async (id: number): Promise<void> => {
        try {
            await api.post(`/works/${id}/like`);
        } catch (error) {
            return handleApiError(error, `Like work ${id} failed`);
        }
    },

    unlike: async (id: number): Promise<void> => {
        try {
            await api.delete(`/works/${id}/like`);
        } catch (error) {
            return handleApiError(error, `Unlike work ${id} failed`);
        }
    },

    // --- Comments ---

    getComments: async (id: number): Promise<any[]> => {
        try {
            const response = await api.get(`/works/${id}/comments`);
            return response.data.data || [];
        } catch (error) {
            return handleApiError(error, `Get comments for work ${id} failed`);
        }
    },

    postComment: async (id: number, content: string): Promise<any> => {
        try {
            const response = await api.post(`/works/${id}/comments`, { content });
            return response.data.data;
        } catch (error) {
            return handleApiError(error, `Post comment for work ${id} failed`);
        }
    },
};
