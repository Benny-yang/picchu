import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainHeader from '../components/layout/MainHeader';
import ActivityDetailModal from '../components/activities/ActivityDetailModal';
import ActivityCard from '../components/activities/ActivityCard';
import EmptyState from '../components/common/EmptyState';
import { activityService } from '../services/activityService';
import { authService } from '../services/authService';

interface ActivitiesPageProps {
    currentUser?: any;
}

const ActivitiesPage: React.FC<ActivitiesPageProps> = ({ currentUser }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState("熱門");
    const [selectedActivity, setSelectedActivity] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const categories = currentUser ? ["熱門", "我的"] : ["熱門"];

    const fetchActivities = async () => {
        setIsLoading(true);
        try {
            if (activeTab === '我的') {
                if (currentUser) {
                    const userId = currentUser.id || currentUser.ID;
                    const result = await authService.getUserActivities(userId);
                    setActivities(result);
                } else {
                    setActivities([]);
                }
            } else {
                const result = await activityService.list({
                    dateFrom: new Date().toISOString()
                });
                // Filter out ended and cancelled activities
                const activeActivities = (result.data || []).filter((a: any) =>
                    a.status !== 'ended' && a.status !== 'cancelled'
                );
                setActivities(activeActivities);
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error);
            setActivities([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [activeTab]);

    // Check for URL param 'id' to open specific activity
    useEffect(() => {
        const activityId = searchParams.get('id');
        if (activityId) {
            activityService.getById(Number(activityId)).then(data => {
                if (data) {
                    setSelectedActivity(data);
                }
            }).catch(err => console.error("Failed to load activity from URL", err));
        }
    }, [searchParams]);

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col">
            <MainHeader activePage="activities" currentUser={currentUser} />

            <div className="max-w-[1200px] mx-auto w-full px-4 pt-8 md:pb-0 pb-[80px]">
                {/* Categories Tabs */}
                <div className="flex justify-center border-b border-gray-200 mb-8">
                    {categories.map((cat) => (
                        <div
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-8 py-4 text-sm font-bold cursor-pointer relative ${activeTab === cat ? 'text-[#009bcd]' : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {cat}
                            {activeTab === cat && (
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#009bcd]" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009bcd]" />
                    </div>
                ) : activities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                        {activities.map((activity) => (
                            <ActivityCard
                                key={activity.id || activity.ID}
                                activity={{
                                    ...activity,
                                    image: activity.coverUrl || activity.images?.[0] || '',
                                    userAvatar: activity.host?.avatarUrl || '',
                                    tags: activity.tags?.split(',') || [],
                                    date: activity.eventTime
                                        ? new Date(activity.eventTime).toLocaleString('zh-TW', {
                                            hour12: false,
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })
                                        : '',
                                }}
                                onClick={() => setSelectedActivity(activity)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        message="目前沒有活動"
                        description={currentUser ? "目前還沒有任何活動，您可以成為第一個舉辦活動的人！" : "目前還沒有任何活動"}
                        actionLabel={currentUser ? "舉辦活動" : undefined}
                        onAction={currentUser ? () => navigate('/activities/create') : undefined}
                    />
                )}
            </div>

            {/* Detail Modal */}
            {selectedActivity && (
                <ActivityDetailModal
                    activity={selectedActivity}
                    currentUser={currentUser}
                    onClose={() => setSelectedActivity(null)}
                />
            )}
        </div>
    );
};

export default ActivitiesPage;
