import React, { useState, useEffect } from 'react';
import { workService } from '../../services/workService';
import WorkDetailModal from './WorkDetailModal';
import MainHeader from '../layout/MainHeader';
import WorkCard from './WorkCard';

interface WorksWallProps {
    currentUser?: any;
}

const WorksWall: React.FC<WorksWallProps> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<'hot' | 'following'>('hot');
    const [selectedWork, setSelectedWork] = useState<any>(null);
    const [works, setWorks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchWorks = async (type: 'hot' | 'following') => {
        setIsLoading(true);
        try {
            const result = await workService.getWall({
                type: type === 'hot' ? 'trending' : 'following',
            });
            setWorks(result.data);
        } catch (error) {
            console.error('Failed to fetch works:', error);
            setWorks([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorks(activeTab);
    }, [activeTab]);

    // Auto-open work by URL param (e.g., from notification click)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const workId = params.get('workId');
        if (!workId) return;

        workService.getById(Number(workId))
            .then((work) => {
                if (work) setSelectedWork(work);
            })
            .catch(() => { /* work not found, ignore */ });
    }, []);

    const handleTabChange = (tab: 'hot' | 'following') => {
        setActiveTab(tab);
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <MainHeader activePage="works-wall" currentUser={currentUser} />

            {/* Main Content */}
            <div className="w-full px-8 mt-8">
                {/* Tabs */}
                <div className="flex justify-center border-b border-gray-200 mb-8">
                    {/* Hot Tab */}
                    <div
                        className={`px-8 py-4 text-sm font-bold cursor-pointer relative ${activeTab === 'hot' ? 'text-[#009bcd]' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        onClick={() => handleTabChange('hot')}
                    >
                        熱門
                        {activeTab === 'hot' && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#009bcd]" />
                        )}
                    </div>

                    {/* Following Tab */}
                    {currentUser && (
                        <div
                            className={`px-8 py-4 text-sm font-bold cursor-pointer relative ${activeTab === 'following' ? 'text-[#009bcd]' : 'text-gray-500 hover:text-gray-800'
                                }`}
                            onClick={() => handleTabChange('following')}
                        >
                            追蹤
                            {activeTab === 'following' && (
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#009bcd]" />
                            )}
                        </div>
                    )}
                </div>

                {/* Content: Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009bcd]" />
                    </div>
                ) : works.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <p className="text-lg">尚無作品</p>
                        <p className="text-sm mt-2">目前還沒有作品，敬請期待！</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-0 bg-white">
                        {works.map((work) => (
                            <WorkCard
                                key={work.id}
                                imageUrl={work.coverUrl || work.images?.[0]}
                                isMultiple={work.images?.length > 1}
                                stats={{
                                    likes: work.likeCount,
                                    comments: work.commentCount
                                }}
                                isLiked={work.isLiked}
                                onClick={() => setSelectedWork(work)}
                            />))}
                    </div>
                )}
            </div>

            {/* Work Detail Modal */}
            <WorkDetailModal
                isOpen={!!selectedWork}
                onClose={() => setSelectedWork(null)}
                workId={selectedWork?.id || selectedWork?.ID || 0}
                initialData={{
                    imageUrl: selectedWork?.coverUrl || selectedWork?.images?.[0] || '',
                    authorName: selectedWork?.user?.username,
                    authorAvatar: selectedWork?.user?.avatarUrl
                }}
            />
        </div>
    );
};

export default WorksWall;
