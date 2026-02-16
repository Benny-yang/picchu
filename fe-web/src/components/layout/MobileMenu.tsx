import React from 'react';
import { X, User, Settings, LogOut, Grid, Activity, PlusCircle } from 'lucide-react';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    activePage: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, activePage }) => {
    // Prevent scrolling when menu is open is handled by this effect or parent, 
    // but for simplicity we'll just handle the overlay click.

    if (!isOpen) return null;

    const navItems = [
        { id: 'works-wall', label: '作品牆', icon: Grid, path: '?view=works-wall' },
        { id: 'activities', label: '揪團活動', icon: Activity, path: '?view=activities' },
        { id: 'create-activity', label: '我要開團', icon: PlusCircle, path: '?view=create-activity' },
        { id: 'profile', label: '我的主頁', icon: User, path: '?view=profile' },
        { id: 'settings', label: '設定', icon: Settings, path: '?view=settings' },
    ];

    return (
        <div className="fixed inset-0 z-[60] md:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Menu Content */}
            <div className="absolute top-0 right-0 w-[280px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-4 flex justify-between items-center border-b border-gray-100">
                    <span className="font-bold text-lg text-gray-900">選單</span>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Nav Items */}
                <div className="flex-1 py-4 overflow-y-auto">
                    <div className="px-3 space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => window.location.href = item.path}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activePage === item.id
                                        ? 'bg-blue-50 text-[#009bcd]'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon size={20} className={activePage === item.id ? 'stroke-[2.5px]' : ''} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        onClick={() => {
                            alert('登出成功');
                            window.location.href = '?view=login';
                        }}
                    >
                        <LogOut size={20} />
                        <span className="font-medium">登出</span>
                    </button>
                    <div className="mt-4 text-center text-xs text-gray-400">
                        VibeCoding App v1.0.0
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileMenu;
