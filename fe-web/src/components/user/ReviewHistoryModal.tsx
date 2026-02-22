import React, { useEffect, useState } from 'react';
import { X, Star, Calendar, User } from 'lucide-react';
import { ratingService } from '../../services/ratingService';
import type { Review } from '../../types';

interface ReviewHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string; // Keep for display
    userId?: number;  // Add userId for fetching
    totalRating: string;
    reviews?: Review[]; // Optional: pass pre-fetched reviews
}

const ReviewHistoryModal: React.FC<ReviewHistoryModalProps> = ({
    isOpen,
    onClose,
    // username, // Unused
    userId,
    totalRating,
    reviews: propReviews, // Rename to avoid conflict
}) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (propReviews) {
            setReviews(propReviews);
            return;
        }

        const fetchReviews = async () => {
            if (isOpen && userId) {
                setIsLoading(true);
                try {
                    const data = await ratingService.getUserReviews(userId);
                    // Transform API data to UI format if needed
                    // Backend Rating struct:
                    // ID, ActivityID, RaterID, TargetID, Score, Comment, CreatedAt
                    // Preloaded: Activity, Rater, Target
                    // We need to map it to Review interface
                    const mapped: Review[] = data.map((r: any) => {
                        // Parse roles logic similar to ActivityDetailModal
                        const profile = r.rater?.profile;
                        const rolesData = profile?.roles;
                        let parsedRoles: string[] = [];
                        try {
                            if (Array.isArray(rolesData)) {
                                parsedRoles = rolesData;
                            } else if (typeof rolesData === 'string' && rolesData.trim() !== '') {
                                if (rolesData.startsWith('[')) {
                                    parsedRoles = JSON.parse(rolesData);
                                } else {
                                    parsedRoles = [rolesData];
                                }
                            }
                            if (parsedRoles.length === 0) {
                                if (profile?.isPhotographer) parsedRoles.push('攝影師');
                                if (profile?.isModel) parsedRoles.push('模特兒');
                            }
                        } catch {
                            // ignore
                        }

                        return {
                            id: r.id,
                            reviewerId: r.raterId || r.rater?.id,
                            reviewerName: r.rater?.username || 'Unknown',
                            reviewerAvatar: r.rater?.profile?.avatarUrl ? (r.rater.profile.avatarUrl.startsWith('http') ? r.rater.profile.avatarUrl : `http://localhost:8080/${r.rater.profile.avatarUrl}`) : '',
                            reviewerRoles: parsedRoles,
                            rating: r.score,
                            comment: r.comment,
                            date: new Date(r.createdAt).toLocaleDateString(),
                            activityTitle: r.activity?.title || 'Activity',
                        };
                    });
                    setReviews(mapped);
                } catch (error) {
                    console.error('Failed to fetch reviews:', error);
                    setReviews([]);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchReviews();
    }, [isOpen, userId, propReviews]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl animate-scale-in overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-[#191919]">評價紀錄</h2>
                        <div className="flex items-center gap-2 mt-1">

                            <div className="flex items-center gap-1">
                                <Star size={14} className="fill-[#FFAF3C] text-[#FFAF3C]" />
                                <span className="font-bold text-[#191919] text-sm">{totalRating}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-[#191919]"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009bcd]" />
                        </div>
                    ) : reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div
                                        className="flex items-center gap-3 cursor-pointer group"
                                        onClick={() => {
                                            if (review.reviewerId) {
                                                window.location.href = `?view=profile&uid=${review.reviewerId}`;
                                            }
                                        }}
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50 group-hover:opacity-80 transition-opacity">
                                            {review.reviewerAvatar ? (
                                                <img
                                                    src={review.reviewerAvatar}
                                                    alt={review.reviewerName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                                    <User size={16} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-semibold text-[#191919] text-sm group-hover:text-[#009bcd] transition-colors">
                                                    {review.reviewerName}
                                                </div>
                                                {review.reviewerRoles && review.reviewerRoles.length > 0 && (
                                                    <div className="flex gap-1">
                                                        {review.reviewerRoles.map((role, idx) => (
                                                            <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                                {role === 'photographer' ? '攝影師' : role === 'model' ? '模特兒' : role}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                                <span>{review.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5 bg-gray-50 px-2 py-1 rounded-md">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={12}
                                                className={`${star <= review.rating ? 'fill-[#FFAF3C] text-[#FFAF3C]' : 'fill-gray-200 text-gray-200'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="pl-[52px]">
                                    <p className="text-[#262626] text-sm leading-relaxed mb-3">
                                        {review.comment}
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#009bcd] text-xs rounded-lg font-medium">
                                        <Calendar size={12} />
                                        <span>活動：{review.activityTitle}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                <Star size={32} className="text-gray-300" />
                            </div>
                            <p>尚無評價紀錄</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewHistoryModal;
