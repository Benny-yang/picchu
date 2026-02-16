export interface Review {
    id: number;
    reviewerName: string;
    reviewerAvatar: string;
    rating: number;
    comment: string;
    date: string;
    activityTitle: string;
}

export const mockReviews: Review[] = [
    {
        id: 1,
        reviewerName: "Jason Wu",
        reviewerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jason",
        rating: 5,
        comment: "非常專業的模特兒，配合度高，動作到位！",
        date: "2024/05/20",
        activityTitle: "夏季海灘人像攝影"
    },
    {
        id: 2,
        reviewerName: "Sarah Chen",
        reviewerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        rating: 5,
        comment: "準時且敬業，溝通非常順暢，期待下次合作。",
        date: "2024/04/15",
        activityTitle: "都市時尚街拍"
    },
    {
        id: 3,
        reviewerName: "Mike Huang",
        reviewerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
        rating: 4,
        comment: "表現力不錯，但希望能有更多不同的表情變化。",
        date: "2024/03/10",
        activityTitle: "室內棚拍創作"
    },
    {
        id: 4,
        reviewerName: "Emily Zhang",
        reviewerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
        rating: 5,
        comment: "超級棒的合作體驗，人很親切！",
        date: "2024/02/28",
        activityTitle: "日系清新風格"
    }
];

export const getReviewsByUsername = (_username: string): Review[] => {
    // In a real app, this would filter by username or fetch from API
    // For now, we return the same mock data for everyone
    return mockReviews;
};
