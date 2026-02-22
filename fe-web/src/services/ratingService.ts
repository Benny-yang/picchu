import api from './api';
import type { Rating } from '../types';

export const ratingService = {
    async getUserReviews(userId: number): Promise<Rating[]> {
        const response = await api.get(`/users/${userId}/reviews`);
        return response.data.data;
    },

    async submitRating(activityId: number, targetUserId: number, rating: number, comment: string) {
        return await api.post(`/activities/${activityId}/rate`, {
            targetUserId,
            rating,
            comment
        });
    }
};
