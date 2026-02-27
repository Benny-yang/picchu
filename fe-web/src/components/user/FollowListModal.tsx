import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { followService } from '../../services/followService';
import { IMG_BASE_URL } from '../../config';
import UserInfo from './UserInfo';
import { parseRoles, formatRoles } from '../../utils/roleUtils';

interface FollowListModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    initialTab: 'followers' | 'following';
}

const FollowListModal: React.FC<FollowListModalProps> = ({ isOpen, onClose, userId, initialTab }) => {
    const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    useEffect(() => {
        if (!isOpen) return;

        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                let data = [];
                if (activeTab === 'followers') {
                    data = await followService.getFollowers(userId);
                } else {
                    data = await followService.getFollowing(userId);
                }
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch follow list", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [isOpen, userId, activeTab]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex-1 text-center font-bold text-lg text-[#262626]">
                        {/* Title could be dynamic or just tabs */}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors absolute right-4 top-4"
                    >
                        <X size={24} className="text-[#262626]" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${activeTab === 'followers' ? 'border-b-2 border-[#262626] text-[#262626]' : 'text-gray-500 hover:text-[#262626]'}`}
                        onClick={() => setActiveTab('followers')}
                    >
                        粉絲
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${activeTab === 'following' ? 'border-b-2 border-[#262626] text-[#262626]' : 'text-gray-500 hover:text-[#262626]'}`}
                        onClick={() => setActiveTab('following')}
                    >
                        追蹤中
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009bcd]" />
                        </div>
                    ) : users.length > 0 ? (
                        <div className="space-y-4">
                            {users.map((user) => {
                                const roles = parseRoles(user.profile);
                                const displayRole = roles.length > 0 ? formatRoles(roles) : '一般會員';

                                return (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <UserInfo
                                            userId={user.id}
                                            avatar={
                                                user.profile?.avatarUrl
                                                    ? (user.profile.avatarUrl.startsWith('http') || user.profile.avatarUrl.startsWith('data:')
                                                        ? user.profile.avatarUrl
                                                        : `${IMG_BASE_URL}/${user.profile.avatarUrl}`)
                                                    : ""
                                            }
                                            name={user.username}
                                            role={displayRole}
                                            size="sm"
                                            className="flex-1"
                                            onClick={onClose}
                                        />
                                        {/* Follow button could go here */}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <p>沒有{activeTab === 'followers' ? '粉絲' : '追蹤中'}的使用者</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowListModal;
