import api from './api';

export interface Rating {
    id: number;
    activityId: number;
    raterId: number;
    targetId: number;
    score: number;
    comment: string;
    createdAt: string;
    // Relationships
    activity?: any;
    rater?: any;
    target?: any;
}

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
