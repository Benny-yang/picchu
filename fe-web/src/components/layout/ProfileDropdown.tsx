import React from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { authService } from '../../services/authService';

interface ProfileDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            <div className="absolute top-16 right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="py-1">
                    <button
                        onClick={() => window.location.href = '?view=profile'}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <User size={16} />
                        我的主頁
                    </button>
                    <button
                        onClick={() => window.location.href = '?view=settings'}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Settings size={16} />
                        設定
                    </button>
                    <button
                        onClick={() => window.location.href = '?view=activity-application-history'}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <User size={16} />
                        活動申請紀錄
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                        onClick={() => {
                            authService.logout();
                            alert('登出成功');
                            window.location.href = '?view=selection';
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <LogOut size={16} />
                        登出
                    </button>
                </div>
            </div>
        </>
    );
};

export default ProfileDropdown;
