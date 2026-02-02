import React from 'react';
import { Copy, Heart, MessageCircle } from 'lucide-react';

export interface Work {
    id?: number | string;
    url?: string;
    image?: string; // Support both url (WorksWall) and image (UserProfile) property names if possible, or normalize. 
    // Let's normalize to `image` as the primary prop, but I'll handle extracting it in the component or expect the caller to pass the image URL string directly.
    // Better yet, let's keep it simple: accept `imageUrl` and `multiple` (boolean) or `imageCount` (number).
    multiple?: boolean;
    imageCount?: number;
    likes?: number; // Optional for now
    comments?: number; // Optional for now
}

interface WorkCardProps {
    imageUrl: string;
    isMultiple?: boolean; // Derived from multiple or imageCount > 1
    onClick?: () => void;
    showStatsOnHover?: boolean; // Option to toggle hover stats (WorksWall has them, Profile currently has simple hover)
    stats?: {
        likes: number;
        comments: number;
    }
}

const WorkCard: React.FC<WorkCardProps> = ({ imageUrl, isMultiple = false, onClick, showStatsOnHover = true, stats }) => {
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
                            <Heart className="fill-white" size={24} />
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
