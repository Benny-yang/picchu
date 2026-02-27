import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, User, type LucideIcon } from 'lucide-react';

interface BottomNavigationProps {
    currentUser?: { id?: number; ID?: number } | null;
    isLoggedIn: boolean;
}

interface NavItem {
    id: string;
    label: string;
    path: string;
    activeImage?: string;
    inactiveImage?: string;
    activeIcon?: LucideIcon;
    inactiveIcon?: LucideIcon;
}

/** Paths where the bottom navigation should be hidden. */
const HIDDEN_PATHS = ['/login', '/register', '/reset-password'];

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentUser, isLoggedIn }) => {
    const navigate = useNavigate();
    const location = useLocation();

    if (HIDDEN_PATHS.includes(location.pathname)) {
        return null;
    }

    const navItems: NavItem[] = [
        {
            id: 'works-wall',
            label: '',
            activeImage: '/assets/gallery_icon.png',
            inactiveImage: '/assets/gallery_gray_icon.png',
            path: '/'
        },
        {
            id: 'activities',
            label: '',
            activeImage: '/assets/gradient_wave_icon.png',
            inactiveImage: '/assets/wave_icon.png',
            path: '/activities'
        },
        ...(isLoggedIn ? [
            {
                id: 'create-activity',
                label: '',
                activeImage: '/assets/gradient_plus_icon.png',
                inactiveIcon: PlusCircle,
                path: '/activities/create'
            },
            {
                id: 'profile',
                label: '',
                activeIcon: User,
                inactiveIcon: User,
                path: (currentUser?.id || currentUser?.ID) ? `/profile/${currentUser!.id || currentUser!.ID}` : '/profile'
            },
        ] : []),
    ];

    const isItemActive = (path: string): boolean => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    /** Render the correct icon/image for a nav item, avoiding double rendering. */
    const renderNavIcon = (item: NavItem, isActive: boolean): React.ReactNode => {
        if (isActive) {
            if (item.activeImage) return <img src={item.activeImage} alt={item.label} className="w-6 h-6 object-contain" />;
            if (item.activeIcon) return <item.activeIcon size={24} className="stroke-[2.5px]" />;
        } else {
            if (item.inactiveImage) return <img src={item.inactiveImage} alt={item.label} className="w-6 h-6 object-contain" />;
            if (item.inactiveIcon) return <item.inactiveIcon size={24} className="stroke-[1.5px]" />;
        }
        return null;
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[60]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            <div className="flex justify-around items-center h-[60px]">
                {navItems.map((item) => {
                    const active = isItemActive(item.path);
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 ${active ? 'text-[#009bcd]' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {renderNavIcon(item, active)}
                            <span className={`text-[10px] leading-tight ${active ? 'font-semibold' : 'font-normal'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNavigation;
