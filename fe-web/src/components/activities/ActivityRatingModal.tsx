import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import UserInfo from '../user/UserInfo';
import { activityService } from '../../services/activityService';
import { IMG_BASE_URL } from '../../config';
import type { Participant, RatingInput } from '../../types';

interface ActivityRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: () => void;
    activityId: number;
    currentUser: any;
    host: any;
}

const ActivityRatingModal: React.FC<ActivityRatingModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    activityId,
    currentUser,
    host
}) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && activityId) {
            fetchData();
        } else {
            // Reset state when closed
            setParticipants([]);
            setSelectedId(null);
            setRating(0);
            setComment('');
        }
    }, [isOpen, activityId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [partsData, ratingsData] = await Promise.all([
                activityService.getParticipants(activityId),
                activityService.getRatings(activityId)
            ]);

            const myRatings: RatingInput[] = ratingsData.given || [];
            const ratingLookup = new Map<number, RatingInput>(myRatings.map((r: RatingInput) => [r.targetId, r]));

            const list: Participant[] = [];

            // Helper to parse roles
            const parseRoles = (rolesData: any): string[] => {
                if (Array.isArray(rolesData)) return rolesData;
                if (typeof rolesData === 'string' && rolesData.trim().startsWith('[')) {
                    try { return JSON.parse(rolesData); } catch { return [rolesData]; }
                }
                return typeof rolesData === 'string' && rolesData ? [rolesData] : [];
            };

            const getAvatar = (url: string) => {
                if (!url) return '';
                if (url.startsWith('http')) return url;
                return `${IMG_BASE_URL}/${url}`;
            };

            // 1. Add Host (if not me)
            if (host && host.id !== currentUser?.id) {
                const existingRating = ratingLookup.get(host.id);
                list.push({
                    id: host.id,
                    name: host.username || host.name || 'Host',
                    avatar: getAvatar(host.profile?.avatarUrl || host.avatarUrl),
                    role: parseRoles(host.profile?.roles),
                    rating: host.averageRating || 0,
                    isLeader: true,
                    isRated: !!existingRating,
                    myRating: existingRating ? { score: existingRating.score, comment: existingRating.comment } : undefined
                });
            }

            // 2. Add Participants (if not me)
            partsData.forEach((p: any) => {
                if (p.status === 'accepted' && p.user?.id !== currentUser?.id) {
                    console.log(`DEBUG: Participant ${p.user.username} (ID: ${p.user.id}) averageRating from API:`, p.user.averageRating);
                    const existingRating = ratingLookup.get(p.user.id);
                    list.push({
                        id: p.user.id,
                        name: p.user.username,
                        avatar: getAvatar(p.user.profile?.avatarUrl),
                        role: parseRoles(p.user.profile?.roles),
                        rating: p.user.averageRating || 0,
                        isLeader: false,
                        isRated: !!existingRating,
                        myRating: existingRating ? { score: existingRating.score, comment: existingRating.comment } : undefined
                    });
                }
            });

            setParticipants(list);

            // Auto-select first unrated, or just first
            const firstUnrated = list.find(p => !p.isRated);
            if (firstUnrated) {
                setSelectedId(firstUnrated.id);
            } else if (list.length > 0) {
                setSelectedId(list[0].id);
            }

        } catch (error) {
            console.error('Failed to load rating data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedId || rating === 0) return;

        setIsSubmitting(true);
        try {
            await activityService.submitRating(activityId, {
                targetUserID: selectedId,
                rating: rating,
                comment: comment
            });

            // Mark as rated locally
            setParticipants(prev => prev.map(p =>
                p.id === selectedId ? {
                    ...p,
                    isRated: true,
                    myRating: { score: rating, comment: comment }
                } : p
            ));

            // Reset form
            setRating(0);
            setComment('');

            // Optional: Move to next unrated?
            const nextUnrated = participants.find(p => !p.isRated && p.id !== selectedId);
            if (nextUnrated) {
                setSelectedId(nextUnrated.id);
            } else {
                // All rated? Maybe close?
                if (onSubmit) onSubmit();
                else onClose();
            }

        } catch (error) {
            console.error('Submit rating failed:', error);
            alert('評價失敗，請稍後再試');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const selectedParticipant = participants.find(p => p.id === selectedId);

    // Determines if we are in read-only mode (viewing existing rating)
    const isReadOnly = selectedParticipant?.isRated && selectedParticipant?.myRating;
    const displayedRating = isReadOnly ? selectedParticipant.myRating!.score : rating;
    const displayedComment = isReadOnly ? selectedParticipant.myRating!.comment : comment;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-[16px] w-full max-w-[900px] h-[600px] flex overflow-hidden shadow-2xl relative" onClick={(e) => e.stopPropagation()}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                >
                    <X size={24} />
                </button>

                {/* Left Column: Participants */}
                <div className="w-[400px] flex flex-col border-r border-[#e6e6e6]">
                    <div className="p-4 flex items-center justify-center border-b border-[#e6e6e6]">
                        <h3 className="text-[18px] font-bold text-[#191919]">參加人員</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {isLoading ? (
                            <div className="flex justify-center p-4">Loading...</div>
                        ) : participants.length === 0 ? (
                            <div className="text-center text-gray-400 mt-10">沒有其他參加者可評價</div>
                        ) : (
                            <>
                                {/* Leader */}
                                {participants.some(p => p.isLeader) && (
                                    <div>
                                        <h4 className="text-sm font-bold text-[#191919] mb-3">團長</h4>
                                        {participants.filter(p => p.isLeader).map(participant => (
                                            <ParticipantRow
                                                key={participant.id}
                                                participant={participant}
                                                isSelected={selectedId === participant.id}
                                                onSelect={() => {
                                                    setSelectedId(participant.id);
                                                    setRating(0);
                                                    setComment('');
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Members */}
                                {participants.some(p => !p.isLeader) && (
                                    <div>
                                        <h4 className="text-sm font-bold text-[#191919] mb-3">團員</h4>
                                        <div className="space-y-4">
                                            {participants.filter(p => !p.isLeader).map(participant => (
                                                <ParticipantRow
                                                    key={participant.id}
                                                    participant={participant}
                                                    isSelected={selectedId === participant.id}
                                                    onSelect={() => {
                                                        setSelectedId(participant.id);
                                                        setRating(0);
                                                        setComment('');
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Right Column: Rating Form */}
                <div className="flex-1 flex flex-col items-center bg-gray-50/50">
                    <div className="w-full p-4 flex items-center justify-center border-b border-[#e6e6e6] bg-white">
                        <h3 className="text-[18px] font-bold text-[#191919]">
                            {selectedParticipant ? (isReadOnly ? `您對 ${selectedParticipant.name} 的評價` : `評價 ${selectedParticipant.name}`) : '評價'}
                        </h3>
                    </div>

                    {!selectedId ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            請選擇一位參加者進行評價
                        </div>
                    ) : (
                        <div className="flex-1 w-full p-8 flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center">
                                <h4 className="text-[16px] font-bold text-[#191919] mb-4">
                                    {isReadOnly ? '已送出的滿意度' : '活動表現滿意度'}
                                </h4>
                                <div className="flex gap-2 justify-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => !isReadOnly && setRating(star)}
                                            disabled={!!isReadOnly}
                                            className={`transition-transform ${!isReadOnly ? 'hover:scale-110 active:scale-95' : 'cursor-default'}`}
                                        >
                                            <Star
                                                size={32}
                                                className={`${star <= displayedRating
                                                    ? 'fill-[#FFAF3C] text-[#FFAF3C]'
                                                    : 'fill-transparent text-[#FFAF3C]'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full max-w-md relative">
                                <textarea
                                    value={displayedComment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder={isReadOnly ? '無留言' : `分享您對 ${selectedParticipant?.name} 的感想...`}
                                    maxLength={100}
                                    disabled={!!isReadOnly}
                                    className={`w-full h-40 p-4 bg-white border border-gray-200 rounded-lg resize-none focus:outline-none text-sm transition-all ${!isReadOnly ? 'focus:ring-2 focus:ring-[#FFAF3C]/20 focus:border-[#FFAF3C]' : 'bg-gray-50 text-gray-500'}`}
                                />
                                {!isReadOnly && (
                                    <span className="absolute bottom-3 right-3 text-xs text-gray-400">
                                        {comment.length} / 100
                                    </span>
                                )}
                            </div>

                            {!isReadOnly ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || rating === 0}
                                    className={`px-16 py-3 rounded-full text-white font-bold text-lg shadow-md transition-all transform active:scale-95 ${isSubmitting || rating === 0
                                        ? 'bg-gray-300 cursor-not-allowed transform-none'
                                        : 'hover:shadow-lg hover:opacity-95'
                                        }`}
                                    style={isSubmitting || rating === 0 ? {} : {
                                        background: "linear-gradient(90deg, #FDBB2D 0%, #22C1C3 100%)"
                                    }}
                                >
                                    {isSubmitting ? '送出中...' : '送出'}
                                </button>
                            ) : (
                                <div className="text-gray-400 text-sm italic">
                                    評價已送出，無法修改
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ParticipantRow = ({
    participant,
    isSelected,
    onSelect
}: {
    participant: Participant;
    isSelected: boolean;
    onSelect: () => void;
}) => (
    <div
        onClick={onSelect}
        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'
            }`}
    >
        <div className="flex-1 min-w-0 pr-4">
            <UserInfo
                avatar={participant.avatar}
                name={participant.name}
                role={participant.role}
                rating={participant.rating}
                size="md"
            />
        </div>
        {participant.isRated ? (
            <span className="px-3 py-1 rounded-[4px] bg-gray-100 text-[#B3B3B3] text-xs font-bold">
                已評價
            </span>
        ) : (
            <button className={`px-4 py-1 rounded-[4px] border text-xs font-bold transition-colors ${isSelected
                ? 'bg-[#009BCD] text-white border-[#009BCD]'
                : 'border-[#009BCD] text-[#009BCD] hover:bg-[#009BCD]/5'
                }`}>
                評價
            </button>
        )}
    </div>
);

export default ActivityRatingModal;
