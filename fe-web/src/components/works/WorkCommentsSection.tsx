import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/dateUtils';
import { IMG_BASE_URL } from '../../config';
import { Heart, User, Star } from 'lucide-react';
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
    onPostComment,
    currentUserId
}) => {
    const navigate = useNavigate();
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
            return `${IMG_BASE_URL}/${url.startsWith('/') ? url.slice(1) : url}`;
        }
        if (url) return url;
        return null; // Return null to trigger default avatar
    };

    return (
        <div className="flex flex-col flex-none md:flex-1 min-h-0 bg-white">
            {/* Body: Comments (Scrollable) */}
            <div className="flex-none md:flex-1 overflow-visible md:overflow-y-auto p-4 space-y-5">
                {comments.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 text-sm">
                        尚無留言，成為第一個留言的人吧！
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 items-start">
                            <div
                                className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => navigate(`/profile/${comment.userId}`)}
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
                                <div className="flex items-center gap-1 flex-wrap mb-0.5">
                                    <span
                                        className="font-bold text-sm text-[#191919] cursor-pointer hover:text-[#009bcd] transition-colors"
                                        onClick={() => navigate(`/profile/${comment.userId}`)}
                                    >
                                        {comment.user?.username || 'Unknown'}
                                    </span>
                                    {(() => {
                                        const profile = comment.user?.profile;
                                        if (!profile) return null;
                                        const roles: string[] = [];
                                        // Prefer boolean flags over JSON string as they are more reliable
                                        if (profile.isPhotographer) roles.push('攝影師');
                                        if (profile.isModel) roles.push('模特兒');
                                        // Fallback to JSON roles string if booleans not set
                                        if (roles.length === 0 && profile.roles) {
                                            try {
                                                const parsed: string[] = JSON.parse(profile.roles);
                                                const labels: Record<string, string> = { photographer: '攝影師', model: '模特兒' };
                                                parsed.forEach(r => roles.push(labels[r] || r));
                                            } catch { /* ignore */ }
                                        }
                                        if (roles.length === 0) return null;
                                        return roles.map((r, i) => (
                                            <React.Fragment key={r}>
                                                {i > 0 && <span className="text-xs text-gray-400">/</span>}
                                                <span className="text-xs text-gray-500">{r}</span>
                                            </React.Fragment>
                                        ));
                                    })()}
                                    {comment.user?.averageRating != null && comment.user.averageRating > 0 && (
                                        <span className="flex items-center gap-0.5 text-xs text-[#FFAF3C] ml-1">
                                            <Star size={10} className="fill-[#FFAF3C]" />
                                            {comment.user.averageRating.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-[#191919]">
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
                        {currentUserId ? (
                            <button
                                onClick={onLikeToggle}
                                className="focus:outline-none transition-transform active:scale-95"
                            >
                                <Heart
                                    size={24}
                                    className={`transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-[#191919] hover:text-red-500'}`}
                                />
                            </button>
                        ) : (
                            <Heart
                                size={24}
                                className="text-gray-300 cursor-not-allowed"
                            />
                        )}
                    </div>
                    <div className="font-bold text-sm text-[#191919]">
                        {likeCount} likes
                    </div>
                </div>

                {/* Comment Input */}
                {currentUserId ? (
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
                ) : (
                    <div className="flex items-center justify-center gap-3 border-t border-gray-100 pt-4">
                        <span className="text-sm text-gray-500">登入後即可留言與按讚</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkCommentsSection;
