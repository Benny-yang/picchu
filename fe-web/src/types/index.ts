// =============================================================================
// API Response & Service Error
// =============================================================================

/** Standard API response wrapper from the backend. */
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

/** Typed error thrown by all service modules. */
export class ServiceError extends Error {
    public context?: any;

    constructor(message: string, context?: any) {
        super(message);
        this.context = context;
        this.name = 'ServiceError';
    }
}

// =============================================================================
// Domain Models
// =============================================================================

/** Activity displayed on ActivityCard and ActivityDetailModal. */
export interface Activity {
    id: number | string;
    title: string;
    location: string;
    date: string;
    timeLeft?: string;
    tags: string[];
    image: string;
    userAvatar?: string;
}

/** Work/Post displayed on WorkCard and WorkDetailModal. */
export interface Work {
    id?: number | string;
    url?: string;
    image?: string;
    multiple?: boolean;
    imageCount?: number;
    likes?: number;
    comments?: number;
}

/** Comment on a work or activity. */
export interface Comment {
    id: number;
    userId: number;
    user: {
        username: string;
        avatarUrl?: string;
        averageRating?: number;
        profile?: {
            avatarUrl?: string;
            roles?: string; // JSON string, e.g. ["photographer", "model"]
            isPhotographer?: boolean;
            isModel?: boolean;
        };
    };
    content: string;
    createdAt: string;
}

/** User profile information. */
export interface UserProfile {
    id: number;
    userId: number;
    displayName: string;
    username: string;
    avatarUrl: string;
    bio: string;
    roles: string | string[] | null; // JSON string or array; use parseRoles() from roleUtils.ts
    gender: string;
    city: string;
    phone: string;
    isPhotographer: boolean;
    isModel: boolean;
    createdAt: string;
    updatedAt: string;
}

/** Authenticated or public user. */
export interface User {
    id: number;
    email: string;
    username: string;
    isPhotographer: boolean;
    isVerified: boolean;
    averageRating: number;
    createdAt: string;
    updatedAt: string;
    profile?: UserProfile;
}

/** Rating record from the API. */
export interface Rating {
    id: number;
    activityId: number;
    raterId: number;
    targetId: number;
    score: number;
    comment: string;
    createdAt: string;
    activity?: { id: number; title: string };
    rater?: { id: number; username: string; profile?: UserProfile };
    target?: { id: number; username: string; profile?: UserProfile };
}

/** Rating input for the ActivityRatingModal form. */
export interface RatingInput {
    targetId: number;
    score: number;
    comment: string;
}

/** Participant in an activity (used by ActivityRatingModal). */
export interface Participant {
    id: number;
    name: string;
    avatar: string;
    role: string[];
    rating: number;
    isLeader: boolean;
    isRated: boolean;
    myRating?: {
        score: number;
        comment: string;
    };
}

/** Applicant for an activity (used by ApplicationManagementModal). */
export interface Applicant {
    id: string;
    userId: number;
    username: string;
    avatar: string;
    role: string;
    rating: number;
    status: 'pending' | 'accepted' | 'rejected';
    message: string;
}

/** Notification displayed in NotificationDropdown. */
export interface Notification {
    id: number;
    type: string;
    content: string;
    referenceId: string;
    time: string;
    isRead: boolean;
    actor?: {
        id: number;
        username: string;
        profile?: {
            avatarUrl: string;
        };
    };
}

/** Review displayed in ReviewHistoryModal. */
export interface Review {
    id: number;
    reviewerId: number;
    reviewerName: string;
    reviewerAvatar: string;
    reviewerRoles: string[];
    rating: number;
    comment: string;
    date: string;
    activityTitle: string;
}

// =============================================================================
// Filter / Params DTOs
// =============================================================================

/** Query filter for activity listing. */
export interface ActivityFilter {
    location?: string;
    dateFrom?: string;
    dateTo?: string;
    tags?: string;
    offset?: number;
    limit?: number;
}

/** Query parameters for works wall. */
export interface WallParams {
    type: 'trending' | 'following';
    cursor?: string;
    seed?: number;
    limit?: number;
}
