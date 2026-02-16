import React, { useState, useEffect } from 'react';
import MainHeader from '../components/layout/MainHeader';
import WorkDetailModal from '../components/works/WorkDetailModal';
import ActivityDetailModal from '../components/activities/ActivityDetailModal';
import UploadWorkModal from '../components/works/UploadWorkModal';
import ReviewHistoryModal from '../components/user/ReviewHistoryModal';
import InviteActivityModal from '../components/activities/InviteActivityModal';
import FollowListModal from '../components/user/FollowListModal';
import { Image, Calendar, Plus, User } from 'lucide-react';
import ActivityCard from '../components/activities/ActivityCard';
import WorkCard from '../components/works/WorkCard';
import { authService } from '../services/authService';
import { followService } from '../services/followService';
import { tokenManager } from '../services/tokenManager';
import { ratingService } from '../services/ratingService';


interface UserProfilePageProps {
    currentUser?: any;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ currentUser: propUser }) => {
    const [activeTab, setActiveTab] = useState<'works' | 'records'>('works');
    const [selectedWork, setSelectedWork] = useState<any>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [followListType, setFollowListType] = useState<'followers' | 'following' | null>(null);

    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid');
    // Use prop if available, otherwise fallback to tokenManager (e.g. on direct load if not passed yet?)
    // But ViewManager should pass it.
    const currentUser = propUser || tokenManager.getUser();
    const isOwnProfile = !uid || uid === 'me' || uid === String(currentUser?.id);

    const [isFollowing, setIsFollowing] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [works, setWorks] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                let profileUser: any;
                if (isOwnProfile) {
                    profileUser = await authService.getMe();
                } else {
                    profileUser = await authService.getPublicProfile(Number(uid));
                }
                setUser(profileUser);

                const userId = profileUser.id || profileUser.ID;
                const [userWorks, userActivities] = await Promise.all([
                    authService.getUserWorks(userId),
                    authService.getUserActivities(userId),
                ]);
                setWorks(userWorks);
                setActivities(userActivities);

                // Fetch reviews
                try {
                    const userReviews = await ratingService.getUserReviews(Number(userId));
                    setReviews(userReviews);
                } catch (err) {
                    console.error("Failed to fetch reviews", err);
                }

                // Check follow status if not own profile
                if (!isOwnProfile && currentUser) {
                    try {
                        // We need a specific endpoint to check if I follow this user.
                        // Alternatively, we can use the 'isFollowing' field if the public profile API returns it.
                        // But standard practice is a separate check or included in profile.
                        // Let's assume we need to add/use checkFollowStatus in followService.
                        // Wait, followService has 'isFollowing' in backend, but frontend service doesn't have it exposed yet?
                        // Let's check followService.ts again.
                        // It has 'follow' and 'unfollow'. We need 'checkStatus'.
                    } catch (e) {
                        console.error("Failed to check follow status", e);
                    }
                }

            } catch (error) {
                console.error('Failed to load profile:', error);

            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [uid, isOwnProfile, currentUser?.id]);

    // Create a separate effect to check follow status when user or currentUser changes
    useEffect(() => {
        const checkFollow = async () => {
            if (!isOwnProfile && user && currentUser) {
                try {
                    const targetId = user.id || user.ID;
                    const status = await followService.checkStatus(targetId);
                    setIsFollowing(status);
                } catch (error) {
                    console.error("Failed to check follow status", error);
                }
            }
        };
        checkFollow();
    }, [isOwnProfile, user, currentUser]);

    const handleFollow = async () => {
        if (!user) return;
        const userId = user.id || user.ID;
        try {
            if (isFollowing) {
                await followService.unfollow(userId);
            } else {
                await followService.follow(userId);
            }
            setIsFollowing(!isFollowing);
        } catch (error: any) {
            alert('操作失敗：' + (error.message || '未知錯誤'));
            // Revert status if failed? (Optional but good UX)
        }
    };

    const handleUploadSuccess = (newWork: any) => {
        setWorks([newWork, ...works]);
        alert('作品上傳成功！');
    };

    const [selectedActivity, setSelectedActivity] = useState<any>(null);

    if (isLoading || !user) {
        return (
            <div className="w-full min-h-screen bg-white flex flex-col">
                <MainHeader activePage="profile" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009bcd]" />
                </div>
            </div>
        );
    }

    const profile = user.profile || {};
    const username = user.username || user.email?.split('@')[0] || '';
    const displayName = profile.displayName || user.username || '';
    const rawAvatar = profile.avatarUrl;
    const avatar = (rawAvatar && !rawAvatar.startsWith('http') && !rawAvatar.startsWith('data:'))
        ? `http://localhost:8080/${rawAvatar}`
        : rawAvatar;
    const isPhotographer = profile.isPhotographer;
    const isModel = profile.isModel;
    const role = isPhotographer && isModel ? '攝影師 / 模特兒'
        : isPhotographer ? '攝影師'
            : isModel ? '模特兒'
                : '';
    const stats = {
        fans: user.followerCount ?? 0,
        following: user.followingCount ?? 0,
        rating: user.averageRating?.toFixed(1) ?? '0.0',
    };
    const bio = profile.bio || '';

    return (
        <div className="w-full min-h-screen bg-white flex flex-col">
            <MainHeader activePage="profile" currentUser={currentUser} />

            <div className="max-w-[935px] mx-auto w-full px-4 pt-8 md:pt-14">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mb-12">
                    {/* Avatar */}
                    <div className="w-[150px] h-[150px] rounded-full overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center bg-gray-100">
                        {avatar ? (
                            <img src={avatar} alt={username} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-1/2 h-1/2 text-gray-400" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
                            <h1 className="text-[28px] text-[#262626] font-light">{username}</h1>
                            <div className="flex gap-2">
                                {isOwnProfile ? (
                                    <>
                                        <button
                                            onClick={() => setIsUploadModalOpen(true)}
                                            className="px-5 py-2 bg-gradient-to-r from-[#009bcd] to-[#007da6] text-white rounded-full text-sm font-bold shadow-md hover:shadow-xl hover:translate-y-[-1px] transition-all duration-300 flex items-center gap-2 active:scale-95"
                                        >
                                            <Plus size={16} strokeWidth={3} />
                                            新增
                                        </button>
                                        <button
                                            onClick={() => window.location.href = '?view=settings&tab=profile'}
                                            className="px-5 py-2 border border-[#dbdbdb] rounded-full text-sm font-bold text-[#262626] hover:bg-gray-50 transition-colors flex items-center gap-2"
                                        >
                                            編輯個人檔案
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleFollow}
                                            className={`px-6 py-1.5 rounded-[4px] text-sm font-semibold transition-colors ${isFollowing
                                                ? 'border border-[#dbdbdb] text-[#262626] hover:bg-gray-50'
                                                : 'bg-[#009bcd] text-white hover:bg-[#0087b3]'
                                                }`}
                                        >
                                            {isFollowing ? '取消追蹤' : '追蹤'}
                                        </button>
                                        <button
                                            onClick={() => setIsInviteModalOpen(true)}
                                            className="px-4 py-1.5 border border-[#dbdbdb] rounded-[4px] text-sm font-semibold text-[#262626] hover:bg-gray-50 transition-colors"
                                        >
                                            邀請參加
                                        </button>

                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-10 mb-5 text-[16px]">
                            <div
                                className="flex gap-1 cursor-pointer hover:opacity-70 transition-opacity"
                                onClick={() => setFollowListType('followers')}
                            >
                                <span className="font-semibold text-[#262626]">{stats.fans}</span>
                                <span className="text-[#262626]">粉絲</span>
                            </div>
                            <div
                                className="flex gap-1 cursor-pointer hover:opacity-70 transition-opacity"
                                onClick={() => setFollowListType('following')}
                            >
                                <span className="font-semibold text-[#262626]">{stats.following}</span>
                                <span className="text-[#262626]">追蹤</span>
                            </div>
                            <div
                                className="flex gap-1 cursor-pointer hover:opacity-70 transition-opacity"
                                onClick={() => setIsReviewModalOpen(true)}
                            >
                                <span className="font-semibold text-[#262626]">{stats.rating}</span>
                                <span className="text-[#262626]">評價</span>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="text-[14px]">
                            <div className="font-semibold text-[#262626] mb-1">{displayName}</div>
                            <div className="text-[#8e8e8e] mb-2">{role}</div>
                            <div className="text-[#262626] whitespace-pre-line leading-normal">
                                {bio}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-t border-[#dbdbdb] flex justify-center gap-16 mb-4">
                    <button
                        onClick={() => setActiveTab('works')}
                        className={`pt-4 text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5 ${activeTab === 'works'
                            ? 'text-[#262626] border-t top-[-1px] relative border-[#262626] '
                            : 'text-[#8e8e8e]'
                            }`}
                    >
                        <svg aria-label="" className={`w-6 h-6 ${activeTab === 'works' ? 'fill-[#262626]' : 'fill-[#8e8e8e]'}`} role="img" viewBox="0 0 24 24">
                            <rect fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="18" x="3" y="3"></rect>
                            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="9.015" x2="9.015" y1="3" y2="21"></line>
                            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="14.985" x2="14.985" y1="3" y2="21"></line>
                            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="9.015" y2="9.015"></line>
                            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="14.985" y2="14.985"></line>
                        </svg>

                    </button>
                    <button
                        onClick={() => setActiveTab('records')}
                        className={`pt-4 text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5 ${activeTab === 'records'
                            ? 'text-[#262626] border-t top-[-1px] relative border-[#262626]'
                            : 'text-[#8e8e8e]'
                            }`}
                    >
                        <svg aria-label="" className={`w-6 h-6 ${activeTab === 'records' ? 'fill-[#262626]' : 'fill-[#8e8e8e]'}`} role="img" viewBox="0 0 24 24">
                            <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                        </svg>

                    </button>
                </div>

                {/* Grid */}
                {activeTab === 'works' ? (
                    works.length > 0 ? (
                        <div className="grid grid-cols-3 gap-0 mb-12">
                            {works.map((work: any) => (
                                <WorkCard
                                    key={work.id}
                                    imageUrl={work.coverUrl || work.images?.[0] || ''}
                                    isMultiple={(work.images?.length || 0) > 1}
                                    onClick={() => setSelectedWork(work)}
                                    stats={{ likes: work.likeCount || 0, comments: work.commentCount || 0 }}
                                    isLiked={work.isLiked}
                                    showStatsOnHover={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-full border-2 border-[#191919] flex items-center justify-center mb-4">
                                <Image size={32} strokeWidth={1.5} className="text-[#191919]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#191919] mb-2">尚未上傳任何作品</h3>
                            <p className="text-gray-500 mb-6 max-w-xs">{isOwnProfile ? "展現您的攝影作品，讓更多人看見您的才華。" : "這位使用者尚未上傳任何作品。"}</p>
                            {isOwnProfile && (
                                <button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="text-[#009bcd] font-bold text-sm hover:underline"
                                >
                                    立即上傳第一張照片
                                </button>
                            )}
                        </div>
                    )
                ) : (
                    activities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {activities.map((activity: any) => (
                                <ActivityCard
                                    key={activity.id || activity.ID}
                                    activity={{
                                        ...activity,
                                        image: activity.coverUrl || activity.images?.[0] || '',
                                        userAvatar: activity.host?.avatarUrl || '',
                                        tags: activity.tags ? (typeof activity.tags === 'string' ? activity.tags.split(',') : activity.tags) : [],
                                        date: activity.eventTime ? new Date(activity.eventTime).toLocaleString('zh-TW', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '',
                                    }}
                                    onClick={() => setSelectedActivity(activity)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-full border-2 border-[#191919] flex items-center justify-center mb-4">
                                <Calendar size={32} strokeWidth={1.5} className="text-[#191919]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#191919] mb-2">目前沒有參加或主辦的活動</h3>
                            <p className="text-gray-500 mb-6 max-w-xs">{isOwnProfile ? "尋找感興趣的攝影活動，或自己舉辦一場吧！" : "這位使用者尚未參加任何活動。"}</p>
                            {isOwnProfile && (
                                <button
                                    onClick={() => window.location.href = '?view=activities'}
                                    className="text-[#009bcd] font-bold text-sm hover:underline"
                                >
                                    去尋找活動
                                </button>
                            )}
                        </div>
                    )
                )}
            </div>

            {/* Work Detail Modal */}
            <WorkDetailModal
                isOpen={!!selectedWork}
                onClose={() => setSelectedWork(null)}
                workId={selectedWork?.id || selectedWork?.ID || 0}
                initialData={{
                    imageUrl: selectedWork?.coverUrl || selectedWork?.images?.[0] || '',
                    authorName: username,
                    authorAvatar: avatar
                }}
                allowEdit={isOwnProfile}
            />

            {/* Upload Work Modal */}
            <UploadWorkModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />

            {/* Activity Detail Modal */}
            {selectedActivity && (
                <ActivityDetailModal
                    activity={selectedActivity}
                    currentUser={currentUser}
                    onClose={() => setSelectedActivity(null)}
                />
            )}

            {/* Invite Activity Modal */}
            <InviteActivityModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                targetUser={{
                    id: user.id || user.ID,
                    name: displayName || username,
                    avatar: avatar
                }}
            />

            {/* Review History Modal */}
            <ReviewHistoryModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                username={username}
                totalRating={stats.rating}
                reviews={reviews.map(r => ({
                    id: r.id,
                    reviewerName: r.rater?.username || r.rater?.email || 'Unknown',
                    reviewerAvatar: r.rater?.profile?.avatarUrl
                        ? (r.rater.profile.avatarUrl.startsWith('http') ? r.rater.profile.avatarUrl : `http://localhost:8080/${r.rater.profile.avatarUrl}`)
                        : '',
                    rating: r.score,
                    comment: r.comment,
                    date: new Date(r.createdAt).toLocaleDateString(),
                    activityTitle: r.activity?.title || 'Unknown Activity'
                }))}
            />

            {/* Follow List Modal */}
            <FollowListModal
                isOpen={!!followListType}
                onClose={() => setFollowListType(null)}
                userId={user.id || user.ID}
                initialTab={followListType || 'followers'}
            />

        </div>
    );
};

export default UserProfilePage;
