import React from 'react';
import { Star } from 'lucide-react';

interface UserInfoProps {
    avatar: string;
    name: string;
    role: string | string[];
    rating?: number;
    size?: 'sm' | 'md' | 'lg';
    showRating?: boolean;
    onClick?: () => void;
    className?: string; // Allow checking custom classes
}

const UserInfo: React.FC<UserInfoProps> = ({
    avatar,
    name,
    role,
    rating,
    size = 'md',
    showRating = true,
    onClick,
    className = ''
}) => {
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
        } else {
            // Default navigation if no custom handler
            window.location.href = `?view=profile&uid=${name}`;
        }
    };

    return (
        <div
            className={`flex items-center gap-3 ${className} cursor-pointer`}
            onClick={handleClick}
        >
            <div className={`${currentSize.avatar} rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0`}>
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-[#191919] ${currentSize.name} truncate`}>{name}</h3>
                <div className={`flex items-center text-gray-500 gap-2 ${currentSize.role}`}>
                    <span className="truncate">{displayRole}</span>
                    {showRating && rating !== undefined && (
                        <div className="flex items-center gap-0.5">
                            <Star size={currentSize.ratingIcon} className="fill-[#FFAF3C] text-[#FFAF3C]" />
                            <span className="font-bold text-[#191919]">{rating}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserInfo;
