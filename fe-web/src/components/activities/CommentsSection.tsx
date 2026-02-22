import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import UserInfo from '../user/UserInfo';
import { activityService } from '../../services/activityService';
import { IMG_BASE_URL } from '../../config';

interface CommentsSectionProps {
    activityId: number;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ activityId }) => {
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    const fetchComments = async () => {
        if (!activityId) return;
        setIsLoading(true);
        try {
            const data = await activityService.getComments(activityId);
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [activityId]);

    const handlePostComment = async () => {
        if (!comment.trim()) return;

        setIsPosting(true);
        try {
            await activityService.postComment(activityId, comment);
            setComment("");
            await fetchComments(); // Refresh list
        } catch (error: any) {
            alert('留言失敗：' + (error.message || '未知錯誤'));
        } finally {
            setIsPosting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handlePostComment();
        }
    };

    const getAvatarUrl = (url: string) => {
        if (url) {
            if (url.startsWith('http')) return url;
            return `${IMG_BASE_URL}/${url.startsWith('/') ? url.slice(1) : url}`;
        }
        return ''; // Return empty string to trigger UserInfo's default avatar
    };

    // Helper to format time (e.g., "3天前" or Just date)
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes < 60) return `${Math.max(1, diffMinutes)}分鐘前`;
        if (diffHours < 24) return `${diffHours}小時前`;
        if (diffDays < 7) return `${diffDays}天前`;
        return date.toLocaleDateString();
    };

    return (
        <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="font-bold mb-4 text-[#191919]">留言板</h3>

            {/* Input Area */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8 flex flex-col gap-3">
                <textarea
                    className="w-full bg-transparent resize-none focus:outline-none text-sm text-[#191919] placeholder-gray-400"
                    placeholder="留下你的想法...... (按 Enter 送出)"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isPosting}
                />
                <div className="flex justify-end">
                    <button
                        onClick={handlePostComment}
                        disabled={isPosting || !comment.trim()}
                        className={`flex items-center gap-2 px-6 py-1.5 rounded-full text-sm font-bold transition-colors ${isPosting || !comment.trim()
                            ? 'bg-gray-300 text-white cursor-not-allowed'
                            : 'bg-[#009bcd] text-white hover:bg-[#0089b5]'
                            }`}
                    >
                        <Send size={14} className="fill-white" />
                        {isPosting ? '傳送中...' : '傳送'}
                    </button>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length === 0 && !isLoading ? (
                    <div className="text-center text-gray-400 text-sm py-4">目前還沒有留言，來搶頭香吧！</div>
                ) : (
                    comments.map((item, index) => {
                        const user = item.user;
                        const profile = user?.profile;
                        const avatarUrl = getAvatarUrl(profile?.avatarUrl || '');

                        // Parse roles
                        let roles = profile?.roles;
                        if (typeof roles === 'string' && roles.startsWith('[')) {
                            try { roles = JSON.parse(roles); } catch { }
                        }
                        // Default if empty
                        if (!roles || roles.length === 0) {
                            roles = [];
                            if (profile?.isPhotographer) roles.push('攝影師');
                            if (profile?.isModel) roles.push('模特兒');
                        }

                        return (
                            <div key={item.id || index} className="flex gap-4">
                                {/* Content */}
                                <div className="flex-1">
                                    <UserInfo
                                        avatar={avatarUrl}
                                        name={profile?.displayName || user?.username || 'Unknown'}
                                        userId={item.userId || user?.id}
                                        role={roles || []}
                                        rating={user?.averageRating || 0}
                                        size="sm"
                                        className="mb-1"
                                    />

                                    <p className="text-sm text-[#191919] mb-1 leading-relaxed whitespace-pre-line">{item.content}</p>
                                    <div className="text-xs text-gray-400">{formatTime(item.createdAt)}</div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CommentsSection;
