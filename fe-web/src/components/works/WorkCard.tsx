import React from 'react';
import { Copy, Heart, MessageCircle } from 'lucide-react';

interface WorkCardProps {
    imageUrl: string;
    isMultiple?: boolean; // Derived from multiple or imageCount > 1
    onClick?: () => void;
    showStatsOnHover?: boolean; // Option to toggle hover stats (WorksWall has them, Profile currently has simple hover)
    stats?: {
        likes: number;
        comments: number;
    };
    isLiked?: boolean;
}

const WorkCard: React.FC<WorkCardProps> = ({ imageUrl, isMultiple = false, onClick, showStatsOnHover = true, stats, isLiked = false }) => {
    return (
        <div
            className="relative aspect-[4/5] group cursor-pointer overflow-hidden"
            onClick={onClick}
        >
            <img
                src={imageUrl}
                alt="Work"
                className="w-full h-full object-cover block"
            />

            {/* Multiple Images Icon */}
            {isMultiple && (
                <div className="absolute top-2 right-2 text-white drop-shadow-md z-10">
                    <Copy size={16} strokeWidth={2.5} className="scale-x-[-1]" />
                </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {showStatsOnHover && (
                    <>
                        <div className="flex items-center gap-2 text-white">
                            {/* Use a generic like icon for now, or stats if provided */}
                            <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'fill-white text-white'}`} />
                            <span className="font-bold text-xl">{stats?.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <MessageCircle className="fill-white" size={24} />
                            <span className="font-bold text-xl">{stats?.comments || 0}</span>
                        </div>
                    </>
                )}
                {/* 
                   Note: UserProfilePage had a slightly different hover with specific SVG icons and hardcoded stats (450 likes, 12 comments).
                   If we want to unify, we should probably stick to the Lucide icons which are cleaner, or allow passing children for custom overlay content.
                   For this refactor, I will standardise on the Lucide icons (Heart/MessageCircle) used in WorksWall, as they are cleaner. 
                   I will default to 0 or provided stats. 
                */}
            </div>
        </div>
    );
};

export default WorkCard;
