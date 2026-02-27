import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, Loader2 } from 'lucide-react';
import ActivityDetailModal from '../components/activities/ActivityDetailModal';
import { authService } from '../services/authService';
import { IMG_BASE_URL } from '../config';

interface ActivityApplicationHistoryPageProps {
    currentUser?: any;
}

const ActivityApplicationHistoryPage: React.FC<ActivityApplicationHistoryPageProps> = ({ currentUser }) => {
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState<any>(null);

    useEffect(() => {
        const fetchApplications = async () => {
            setIsLoading(true);
            try {
                const data = await authService.getMyApplications();
                setApplications(data);
            } catch (error) {
                console.error('Failed to fetch applications:', error);
                setApplications([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-gray-100 text-gray-500 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return '待審核';
            case 'accepted':
                return '已錄取';
            case 'rejected':
                return '未錄取';
            default:
                return status;
        }
    };

    const formatDateTime = (dateStr: string): string => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    const parseActivityImages = (images: string): string | undefined => {
        if (!images) return undefined;
        try {
            const parsed = JSON.parse(images);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : undefined;
        } catch {
            return images;
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col">
            <div className="max-w-[1000px] mx-auto w-full px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">活動申請紀錄</h1>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-gray-400" size={32} />
                        <span className="ml-3 text-gray-500">載入中...</span>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-lg">尚無活動申請紀錄</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => {
                            const activity = app.activity || {};
                            const parsedImg = parseActivityImages(activity.images);
                            let rawImage = parsedImg || activity.image || activity.coverUrl;
                            if (Array.isArray(rawImage) && rawImage.length > 0) {
                                rawImage = rawImage[0];
                            }
                            if (typeof rawImage !== 'string') {
                                rawImage = undefined;
                            }
                            const coverImage = rawImage
                                ? (rawImage.startsWith('http') || rawImage.startsWith('data:') ? rawImage : `${IMG_BASE_URL}/${rawImage}`)
                                : null;

                            return (
                                <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                                    {/* Image Section */}
                                    <div className="w-full md:w-48 h-32 md:h-auto relative shrink-0">
                                        {coverImage ? (
                                            <img
                                                src={coverImage}
                                                alt={activity.title}
                                                className="w-full h-full object-cover border-r border-gray-100 md:w-48 md:min-h-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                                無封面
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2 md:hidden">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(app.status)}`}>
                                                {getStatusText(app.status)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                                                    {activity.title || '未知活動'}
                                                </h3>
                                                <span className={`hidden md:inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(app.status)}`}>
                                                    {getStatusText(app.status)}
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    <span>活動時間: {formatDateTime(activity.eventTime)}</span>
                                                </div>
                                                {activity.location && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={16} />
                                                        <span>地點: {activity.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                <span>申請時間: {formatDateTime(app.appliedAt)}</span>
                                            </div>
                                            <button
                                                onClick={() => setSelectedActivity(activity)}
                                                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                            >
                                                查看詳情
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedActivity && (
                <ActivityDetailModal
                    activity={selectedActivity}
                    onClose={() => setSelectedActivity(null)}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
};

export default ActivityApplicationHistoryPage;
