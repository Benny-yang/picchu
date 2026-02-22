import React, { useState } from 'react';
import { Star, User } from 'lucide-react';
import ReviewHistoryModal from './ReviewHistoryModal';

interface UserInfoProps {
    avatar: string;
    name: string;
    userId?: number; // Added userId
    role: string | string[];
    rating?: number;
    size?: 'sm' | 'md' | 'lg';
    showRating?: boolean;
    onClick?: () => void;
    onRatingClick?: (e: React.MouseEvent) => void;
    className?: string; // Allow checking custom classes
}

const UserInfo: React.FC<UserInfoProps> = ({
    avatar,
    name,
    userId,
    role,
    rating,
    size = 'md',
    showRating = true,
    onClick,
    onRatingClick,
    className = ''
}) => {
    // Internal state for Review Modal
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    // Size maps
    const sizeClasses = {
        sm: {
            avatar: 'w-8 h-8',
            name: 'text-xs',
            role: 'text-[10px]',
            ratingIcon: 10
        },
        md: {
            avatar: 'w-10 h-10',
            name: 'text-sm',
            role: 'text-xs',
            ratingIcon: 10
        },
        lg: {
            avatar: 'w-12 h-12',
            name: 'text-sm', // Keeping name size consistent for lg based on designs seen
            role: 'text-xs',
            ratingIcon: 12
        }
    };

    const currentSize = sizeClasses[size];

    // Helper to format role
    const displayRole = Array.isArray(role) ? role.join(' / ') : role;

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (userId) {
            window.location.href = `?view=profile&uid=${userId}`;
        } else {
            console.warn("UserInfo: userId missing, cannot navigate to profile");
        }
    };

    const handleRatingClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (onRatingClick) {
            onRatingClick(e);
        } else {
            // Default behavior: Open Review History Modal
            setIsReviewModalOpen(true);
        }
    };

    return (
        <>
            <div
                className={`flex items-center gap-3 ${className} cursor-pointer`}
                onClick={handleClick}
            >
                <div className={`${currentSize.avatar} rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0 flex items-center justify-center`}>
                    {avatar ? (
                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-1/2 h-1/2 text-gray-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-[#191919] ${currentSize.name} truncate`}>{name}</h3>
                    <div className={`flex items-center text-gray-500 gap-2 ${currentSize.role}`}>
                        <span className="truncate">{displayRole}</span>
                        {showRating && rating !== undefined && (
                            <div
                                className="flex items-center gap-0.5 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={handleRatingClick}
                                title="查看評價紀錄"
                            >
                                <Star size={currentSize.ratingIcon} className="fill-[#FFAF3C] text-[#FFAF3C]" />
                                <span className="font-bold text-[#191919]">{rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Internal Review History Modal */}
            <ReviewHistoryModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                username={name}
                userId={userId}
                totalRating={rating?.toFixed(1) || "0.0"}
            />
        </>
    );
};

export default UserInfo;
