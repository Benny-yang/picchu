import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import UserInfo from '../user/UserInfo';
import { tokenManager } from '../../services/tokenManager';

interface WorkDetailHeaderProps {
    authorId?: number; // Added authorId
    authorAvatar?: string;
    authorName: string;
    showFollowButton: boolean;
    isFollowing: boolean;
    onFollowToggle?: () => void;
    onEdit: () => void;
    onDelete: () => void;
    authorRole?: string;
    authorRating?: number;
    allowEdit?: boolean;
}

const WorkDetailHeader: React.FC<WorkDetailHeaderProps> = ({
    authorId,
    authorAvatar,
    authorName,
    showFollowButton,
    isFollowing,
    onFollowToggle,
    onEdit,
    onDelete,
    authorRole = "",
    authorRating = 0,
    allowEdit = false
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isGuest = !tokenManager.getUser();

    return (
        <div className="h-[72px] px-6 flex items-center justify-between border-b border-[#E6E6E6] flex-shrink-0 relative">
            <div className="flex items-center gap-3 w-full">
                <UserInfo
                    userId={authorId}
                    avatar={authorAvatar || ""}
                    name={authorName}
                    role={authorRole}
                    rating={authorRating}
                    size="md"
                    className="flex-1"
                />
                {!isGuest && showFollowButton && (
                    <button
                        onClick={onFollowToggle}
                        className={`text-[12px] px-3 py-0.5 rounded-full transition-colors flex-shrink-0 ${isFollowing
                            ? 'border border-[#dbdbdb] text-[#262626] hover:bg-gray-50'
                            : 'bg-[#009bcd] text-white hover:opacity-90'
                            }`}
                    >
                        {isFollowing ? '取消追蹤' : '追蹤'}
                    </button>
                )}
            </div>

            {/* More Menu Button */}
            {allowEdit && (
                <div className="relative ml-2">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <MoreHorizontal size={20} className="text-[#191919]" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onEdit();
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-[#191919] hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Edit size={14} />
                                    編輯
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onDelete();
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 size={14} />
                                    刪除
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkDetailHeader;
