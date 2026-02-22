import React, { useState } from 'react';
import { formatRelativeTime } from '../../utils/dateUtils';
import { Heart, User } from 'lucide-react';
// import { DEFAULT_AVATAR } from '../layout/MainHeader'; // Removed unused import
import type { Comment } from '../../types';

interface WorkCommentsSectionProps {
    isLiked: boolean;
    likeCount?: number;
    comments: Comment[];
    onLikeToggle: (e: React.MouseEvent) => void;
    onPostComment: (content: string) => void;
    currentUserId?: number;
}

const WorkCommentsSection: React.FC<WorkCommentsSectionProps> = ({
    isLiked,
    likeCount = 0,
    comments = [],
    onLikeToggle,
    onPostComment
}) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onPostComment(newComment);
        setNewComment('');
    };

    const formatDate = (dateString: string) => {
        return formatRelativeTime(dateString);
    };

    const getAvatarUrl = (user: Comment['user']) => {
        const url = user.profile?.avatarUrl || user.avatarUrl;
        if (url && !url.startsWith('http') && !url.startsWith('data:')) {
            return `http://localhost:8080/${url}`;
        }
        if (url) return url;
        return null; // Return null to trigger default avatar
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-white">
            {/* Body: Comments (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {comments.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 text-sm">
                        尚無留言，成為第一個留言的人吧！
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 items-start">
                            <div
                                className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.location.href = `?view=profile&uid=${comment.userId}`}
                            >
                                {getAvatarUrl(comment.user) ? (
                                    <img
                                        src={getAvatarUrl(comment.user)!}
                                        alt={comment.user.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-1/2 h-1/2 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-sm text-[#191919]">
                                    <span
                                        className="font-bold mr-2 cursor-pointer hover:text-[#009bcd] transition-colors"
                                        onClick={() => window.location.href = `?view=profile&uid=${comment.userId}`}
                                    >
                                        {comment.user?.username || 'Unknown'}
                                    </span>
                                    <span>{comment.content}</span>
                                </div>
                                <div className="text-xs text-[#999999] mt-1">
                                    {formatDate(comment.createdAt)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer: Actions & Input */}
            <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
                {/* Action Icons */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onLikeToggle}
                            className="focus:outline-none transition-transform active:scale-95"
                        >
                            <Heart
                                size={24}
                                className={`transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-[#191919] hover:text-red-500'}`}
                            />
                        </button>
                    </div>
                    <div className="font-bold text-sm text-[#191919]">
                        {likeCount} likes
                    </div>
                </div>

                {/* Comment Input */}
                <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-gray-100 pt-4">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 text-sm outline-none placeholder-gray-400"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                        type="submit"
                        className={`text-[#009bcd] font-bold text-sm ${!newComment.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#0089b5]'}`}
                        disabled={!newComment.trim()}
                    >
                        Post
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WorkCommentsSection;
