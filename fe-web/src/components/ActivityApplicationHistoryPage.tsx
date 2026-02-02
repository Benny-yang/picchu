import React, { useState } from 'react';
import MainHeader from './MainHeader';
import { Calendar, MapPin, Clock } from 'lucide-react';
import ActivityDetailModal from './ActivityDetailModal';

const MOCK_APPLICATIONS = [
    {
        id: 1,
        title: "哈利奎茵-Cosplay",
        status: "pending", // pending, accepted, rejected
        appliedAt: "2026/02/01 14:30",
        eventDate: "2026/08/06 14:00",
        location: "高雄市",
        image: "http://localhost:3845/assets/3662c031838380acd9e417d68ab1701563e98631.png"
    },
    {
        id: 2,
        title: "都市霓虹*越夜越美麗*",
        status: "accepted",
        appliedAt: "2026/01/28 09:15",
        eventDate: "2026/08/10 19:30",
        location: "臺北市",
        image: "http://localhost:3845/assets/246052ad512b4f1dde9691a7918409b23288327f.png"
    },
    {
        id: 3,
        title: "抓住夏天尾巴-比基尼外拍",
        status: "rejected",
        appliedAt: "2026/01/25 18:20",
        eventDate: "2026/08/06 10:00",
        location: "高雄市",
        image: "http://localhost:3845/assets/de42dd4666592ebe04be738ffaadcbc99ed73b23.png"
    }
];

const ActivityApplicationHistoryPage: React.FC = () => {
    const [selectedActivity, setSelectedActivity] = useState<any>(null);

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

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col">
            <MainHeader activePage="profile" />

            <div className="max-w-[1000px] mx-auto w-full px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">活動申請紀錄</h1>

                <div className="space-y-4">
                    {MOCK_APPLICATIONS.map((app) => (
                        <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                            {/* Image Section */}
                            <div className="w-full md:w-48 h-32 md:h-auto relative shrink-0">
                                <img
                                    src={app.image}
                                    alt={app.title}
                                    className="w-full h-full object-cover"
                                />
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
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{app.title}</h3>
                                        <span className={`hidden md:inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(app.status)}`}>
                                            {getStatusText(app.status)}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span>活動時間: {app.eventDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} />
                                            <span>地點: {app.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} />
                                        <span>申請時間: {app.appliedAt}</span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedActivity(app)}
                                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                    >
                                        查看詳情
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedActivity && (
                <ActivityDetailModal
                    activity={{
                        ...selectedActivity,
                        // Ensure required fields for modal are present
                        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + selectedActivity.id,
                        requirements: ["模特兒", "攝影師"],
                        styles: ["都市", "時尚"],
                        description: "這是活動的詳細說明..."
                    }}
                    onClose={() => setSelectedActivity(null)}
                />
            )}
        </div>
    );
};

export default ActivityApplicationHistoryPage;
