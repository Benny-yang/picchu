import React from 'react';

interface Notification {
    id: number;
    type: 'follow' | 'join_request' | 'like';
    user: {
        name: string;
        avatar: string;
    };
    content?: string; // e.g., "Activity Name" or "Work Title"
    time: string;
    isRead: boolean;
}

const NOTIFICATIONS: Notification[] = [
    {
        id: 1,
        type: 'join_request',
        user: { name: 'Alice Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
        content: '都市霓虹*越夜越美麗*',
        time: '2分鐘前',
        isRead: false,
    },
    {
        id: 2,
        type: 'follow',
        user: { name: 'Bob Lin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
        time: '1小時前',
        isRead: false,
    },
    {
        id: 3,
        type: 'like',
        user: { name: 'Carol Wu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol' },
        time: '3小時前',
        isRead: true,
    },
];

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    onNotificationClick?: (notification: Notification) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, onNotificationClick }) => {
    if (!isOpen) return null;

    const handleNotificationClick = (item: Notification) => {
        if (onNotificationClick) {
            onNotificationClick(item);
        }
        onClose();
    };

    return (
        <>
            {/* Backdrop for explicit close on click outside, though often handled by parent or a useClickOutside hook. 
                For simplicity with the header z-index structure, a transparent fixed inset can work. */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            <div className="absolute top-16 right-20 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">通知</h3>
                    <button className="text-xs text-blue-500 hover:text-blue-600 font-medium">全部已讀</button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto">
                    {NOTIFICATIONS.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            尚無新通知
                        </div>
                    ) : (
                        NOTIFICATIONS.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleNotificationClick(item)}
                                className={`p-4 hover:bg-gray-50 cursor-pointer flex gap-3 ${item.isRead ? 'opacity-70' : 'bg-blue-50/10'}`}
                            >
                                <img src={item.user.avatar} alt={item.user.name} className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800">
                                        <span className="font-semibold">{item.user.name}</span>
                                        {item.type === 'follow' && ' 開始追蹤了你'}
                                        {item.type === 'like' && ' 對你的作品按讚'}
                                        {item.type === 'join_request' && (
                                            <> 申請加入 <span className="font-medium text-blue-600">{item.content}</span></>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{item.time}</p>

                                    {/* Action Buttons */}
                                    {item.type === 'join_request' && (
                                        <div className="flex gap-2 mt-2">
                                            <button className="px-3 py-1 bg-black text-white text-xs rounded-full hover:bg-gray-800 transition-colors">接受</button>
                                            <button className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors">婉拒</button>
                                        </div>
                                    )}
                                    {item.type === 'follow' && (
                                        <button className="mt-2 px-3 py-1 border border-gray-200 text-gray-600 text-xs rounded-full hover:bg-gray-50 transition-colors">
                                            回追蹤
                                        </button>
                                    )}
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
