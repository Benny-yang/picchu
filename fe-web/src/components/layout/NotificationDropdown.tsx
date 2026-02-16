import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { User } from 'lucide-react'; // Import User icon

interface Notification {
    id: number;
    type: string;
    content: string; // Activity Title or other content snapshot
    referenceId: string;
    time: string;
    isRead: boolean;
    actor?: {
        id: number;
        username: string;
        profile?: {
            avatarUrl: string;
        }
    };
}

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    onNotificationClick?: (notification: Notification) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, onNotificationClick }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await notificationService.list();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            // Mark each notification as read
            const unreadNotifications = notifications.filter(n => !n.isRead);
            await Promise.all(unreadNotifications.map(n => notificationService.markAsRead(n.id)));
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleNotificationClick = async (item: Notification) => {
        if (!item.isRead) {
            try {
                await notificationService.markAsRead(item.id);
                setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }

        if (item.type === 'invitation') {
            window.location.href = `?view=activities&id=${item.referenceId}`;
        } else if (onNotificationClick) {
            onNotificationClick(item);
        }
        onClose();
    };

    const getNotificationMessage = (item: Notification): string => {
        switch (item.type) {
            case 'follow': return '開始追蹤了你';
            case 'like': return '對你的作品按讚';
            case 'join_request': return `申請加入 ${item.content || '活動'}`;
            case 'accepted': return `你的申請已被接受 ${item.content || ''}`;
            case 'rejected': return `你的申請未通過 ${item.content || ''}`;
            case 'invitation': return item.content || '邀請你參加活動';
            default: return item.content || '';
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />

            <div className="absolute top-16 right-20 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">通知</h3>
                    <button
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                        onClick={handleMarkAllRead}
                    >
                        全部已讀
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#009bcd]" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            尚無新通知
                        </div>
                    ) : (
                        notifications.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleNotificationClick(item)}
                                className={`p-4 hover:bg-gray-50 cursor-pointer flex gap-3 ${item.isRead ? 'opacity-70' : 'bg-blue-50/10'}`}
                            >
                                {item.actor?.profile?.avatarUrl ? (
                                    <img
                                        src={
                                            item.actor.profile.avatarUrl.startsWith('http')
                                                ? item.actor.profile.avatarUrl
                                                : `http://localhost:8080/${item.actor.profile.avatarUrl}`
                                        }
                                        alt={item.actor?.username || 'User'}
                                        className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (item.actor?.id) {
                                                window.location.href = `?view=profile&uid=${item.actor.id}`;
                                            }
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (item.actor?.id) {
                                                window.location.href = `?view=profile&uid=${item.actor.id}`;
                                            }
                                        }}
                                    >
                                        <User className="w-5 h-5 text-gray-500" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800">
                                        <span
                                            className="font-semibold cursor-pointer hover:underline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (item.actor?.id) {
                                                    window.location.href = `?view=profile&uid=${item.actor.id}`;
                                                }
                                            }}
                                        >
                                            {item.actor?.username || '未知用戶'}
                                        </span>
                                        {' '}{getNotificationMessage(item)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                                </div>
                                {!item.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationDropdown;
