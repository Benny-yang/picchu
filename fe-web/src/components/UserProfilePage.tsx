import React, { useState } from 'react';
import MainHeader from './MainHeader';
import WorkDetailModal from './WorkDetailModal';
import ActivityDetailModal from './ActivityDetailModal';
import UploadWorkModal from './UploadWorkModal';
import { X, MapPin, Users, Star, ChevronLeft, ChevronRight, Image, Calendar, Plus } from 'lucide-react';
import ActivityCard from './ActivityCard';
import WorkCard from './WorkCard';

const UserProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'works' | 'records'>('works');
    const [selectedWork, setSelectedWork] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // --- Public Profile & Routing Logic ---
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid');
    // Assume current user ID is "me" or derived from auth context
    const isOwnProfile = !uid || uid === 'me';

    const [isFollowing, setIsFollowing] = useState(false);

    // Mock Data - Default (My Profile)
    let user = {
        username: "emma_stone2",
        displayName: "艾瑪",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
        stats: {
            fans: "8.5k",
            following: "998",
            rating: "5.0"
        },
        role: "模特兒",
        bio: "凱渥專任簽約模特兒\n2021 Vogue 內頁p87 材質亞周年慶包的展示模特兒，左邊數來第3位",
    };

    // Mock Data - Other User (Public Profile)
    if (!isOwnProfile) {
        // Just mocking a different user if looking at someone else
        user = {
            username: "nanami_misoto",
            displayName: "七海",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nanami",
            stats: {
                fans: "1.2k",
                following: "150",
                rating: "4.8"
            },
            role: "攝影師",
            bio: "專注於人像攝影，喜歡捕捉自然光影。\n歡迎互惠合作！",
        };
    }

    const [works, setWorks] = useState(Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        image: `https://picsum.photos/seed/${i + (isOwnProfile ? 100 : 500)}/400/400`, // Different seed for different user
        imageCount: i % 3 === 0 ? 3 : 1, // Simulating multiple images for every 3rd item
    })));

    const handleUploadSuccess = (newWork: any) => {
        setWorks([newWork, ...works]);
        alert('作品上傳成功！');
    };

    // --------------------------------------

    const [selectedActivity, setSelectedActivity] = useState<any>(null);

    const activities = [
        {
            id: 1,
            title: "哈利奎茵-Cosplay",
            location: "高雄市",
            date: "2026/08/06 14:00",
            timeLeft: "剩餘99天23時",
            tags: ["模特兒", "攝影師"],
            image: "http://localhost:3845/assets/3662c031838380acd9e417d68ab1701563e98631.png",
            userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1"
        },
        {
            id: 2,
            title: "都市霓虹*越夜越美麗*",
            location: "臺北市",
            date: "2026/08/10 19:30",
            timeLeft: "剩餘99天23時",
            tags: ["模特兒", "攝影師"],
            image: "http://localhost:3845/assets/246052ad512b4f1dde9691a7918409b23288327f.png",
            userAvatar: user.avatar // Simulating an activity hosted by the user
        },
        {
            id: 3,
            title: "抓住夏天尾巴-比基尼外拍",
            location: "高雄市",
            date: "2026/08/06 10:00",
            timeLeft: "剩餘99天23時",
            tags: ["模特兒"],
            image: "http://localhost:3845/assets/de42dd4666592ebe04be738ffaadcbc99ed73b23.png",
            userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3"
        }
    ];

    return (
        <div className="w-full min-h-screen bg-white flex flex-col">
            <MainHeader activePage="profile" />

            <div className="max-w-[935px] mx-auto w-full px-4 pt-8 md:pt-14">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mb-12">
                    {/* Avatar */}
                    <div className="w-[150px] h-[150px] rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
                            <h1 className="text-[28px] text-[#262626] font-light">{user.username}</h1>
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
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsFollowing(!isFollowing)}
                                            className={`px-6 py-1.5 rounded-[4px] text-sm font-semibold transition-colors ${isFollowing
                                                ? 'border border-[#dbdbdb] text-[#262626] hover:bg-gray-50'
                                                : 'bg-[#009bcd] text-white hover:bg-[#0087b3]'
                                                }`}
                                        >
                                            {isFollowing ? '取消追蹤' : '追蹤'}
                                        </button>
                                        <button className="px-4 py-1.5 border border-[#dbdbdb] rounded-[4px] text-sm font-semibold text-[#262626] hover:bg-gray-50 transition-colors">
                                            傳送訊息
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-10 mb-5 text-[16px]">
                            <div className="flex gap-1">
                                <span className="font-semibold text-[#262626]">{user.stats.fans}</span>
                                <span className="text-[#262626]">粉絲</span>
                            </div>
                            <div className="flex gap-1">
                                <span className="font-semibold text-[#262626]">{user.stats.following}</span>
                                <span className="text-[#262626]">追蹤</span>
                            </div>
                            <div className="flex gap-1">
                                <span className="font-semibold text-[#262626]">{user.stats.rating}</span>
                                <span className="text-[#262626]">評價</span>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="text-[14px]">
                            <div className="font-semibold text-[#262626] mb-1">{user.displayName}</div>
                            <div className="text-[#8e8e8e] mb-2">{user.role}</div>
                            <div className="text-[#262626] whitespace-pre-line leading-normal">
                                {user.bio}
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
                            {works.map((work) => (
                                <WorkCard
                                    key={work.id}
                                    imageUrl={work.image}
                                    isMultiple={work.imageCount > 1}
                                    onClick={() => setSelectedWork(work.image)}
                                    showStatsOnHover={true}
                                    stats={{ likes: 450, comments: 12 }}
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
                            {activities.map((activity) => (
                                <ActivityCard
                                    key={activity.id}
                                    activity={activity}
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
                imageUrl={selectedWork || ""}
                authorName={user.username}
                authorAvatar={user.avatar}
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
                    onClose={() => setSelectedActivity(null)}
                />
            )}


        </div>
    );
};

export default UserProfilePage;
