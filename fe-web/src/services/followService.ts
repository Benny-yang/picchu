import api from './api';
import { handleApiError } from './serviceUtils';

export const followService = {
    follow: async (userId: number): Promise<void> => {
        try {
            await api.post(`/users/${userId}/follow`);
        } catch (error) {
            return handleApiError(error, `Follow user ${userId} failed`);
        }
    },

    unfollow: async (userId: number): Promise<void> => {
        try {
            await api.delete(`/users/${userId}/follow`);
        } catch (error) {
            return handleApiError(error, `Unfollow user ${userId} failed`);
        }
    },
    checkStatus: async (userId: number): Promise<boolean> => {
        try {
            const response = await api.get(`/users/${userId}/follow`);
            return response.data?.data?.isFollowing || false;
        } catch (error) {
            // console.error(`Check follow status for ${userId} failed`, error);
            // It might return 404 or 400 if not following? Or just false.
            // Assuming 200 OK with isFollowing: boolean
            return false;
        }
    },

    getFollowers: async (userId: number): Promise<any[]> => {
        try {
            const response = await api.get(`/users/${userId}/followers`);
            return response.data.data || [];
        } catch (error) {
            console.error('Get followers failed:', error);
            return [];
        }
    },

    getFollowing: async (userId: number): Promise<any[]> => {
        try {
            const response = await api.get(`/users/${userId}/following`);
            return response.data.data || [];
        } catch (error) {
            console.error('Get following failed:', error);
            return [];
        }
    }
};
