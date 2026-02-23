import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import { activityService } from '../../services/activityService';
import { authService } from '../../services/authService';

interface InviteActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUser: {
        id: number;
        name: string;
        avatar?: string;
    };
}

const InviteActivityModal: React.FC<InviteActivityModalProps> = ({ isOpen, onClose, targetUser }) => {
    const [myActivities, setMyActivities] = useState<any[]>([]);
    const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMyActivities();
        }
    }, [isOpen]);

    const fetchMyActivities = async () => {
        setIsLoading(true);
        try {
            // Fetch activities hosted by current user
            // We can use getUserActivities with "me" or current user ID
            // Assuming authService.getUserActivities returns list of activities
            const currentUser = await authService.getMe();
            if (currentUser) {
                const activities = await authService.getUserActivities(currentUser.id || currentUser.ID);
                // Filter for "open" activities where I am the host
                const hostedActivities = activities.filter((a: any) =>
                    (a.hostId === currentUser.id || a.host?.id === currentUser.id) &&
                    a.status === 'open'
                );
                setMyActivities(hostedActivities);
            }
        } catch (error) {
            console.error("Failed to fetch activities", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!selectedActivityId) return;

        setIsSending(true);
        try {
            await activityService.inviteUser(selectedActivityId, targetUser.id, message);
            alert("邀請已送出！");
            onClose();
        } catch (error: any) {
            alert("邀請失敗：" + (error.message || "未知錯誤"));
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-[#191919]">邀請 {targetUser.name} 參加活動</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009bcd]" />
                        </div>
                    ) : myActivities.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            您目前沒有正在舉辦的活動。
                            <br />
                            <Link to="/activities/create" className="text-[#009bcd] font-bold mt-2 inline-block">
                                立即舉辦活動
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 font-bold">選擇一個活動：</p>
                            <div className="space-y-2">
                                {myActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        onClick={() => setSelectedActivityId(activity.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${selectedActivityId === activity.id
                                            ? 'border-[#009bcd] bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                                {activity.coverUrl || activity.images?.[0] ? (
                                                    <img
                                                        src={activity.coverUrl || activity.images?.[0]}
                                                        alt={activity.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-300" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-[#191919] truncate">{activity.title}</div>
                                                <div className="text-xs text-gray-500">
                                                    {activity.eventTime
                                                        ? new Date(activity.eventTime).toLocaleDateString()
                                                        : '未定日期'}
                                                </div>
                                            </div>
                                        </div>
                                        {selectedActivityId === activity.id && (
                                            <div className="w-5 h-5 bg-[#009bcd] rounded-full flex items-center justify-center">
                                                <Check size={12} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <label className="text-sm text-gray-500 font-bold mb-2 block">邀請訊息 (選填)：</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="想對他說什麼..."
                                    className="w-full p-3 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#009bcd] resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-full text-gray-600 font-bold text-sm hover:bg-gray-100 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleInvite}
                        disabled={!selectedActivityId || isSending}
                        className={`px-5 py-2 rounded-full text-white font-bold text-sm transition-all ${!selectedActivityId || isSending
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-[#009bcd] hover:bg-[#0089b5] shadow-md'
                            }`}
                    >
                        {isSending ? '發送中...' : '發送邀請'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteActivityModal;
