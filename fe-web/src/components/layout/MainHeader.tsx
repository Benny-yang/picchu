import React, { useState, useEffect, useRef } from 'react';
import { notificationService } from '../../services/notificationService';
import { Heart, Menu, User, PlusCircle } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import ApplicationManagementModal from '../activities/ApplicationManagementModal';
import MobileMenu from './MobileMenu';
import ProfileDropdown from './ProfileDropdown';
import { IMG_BASE_URL } from '../../config';


interface MainHeaderProps {
    activePage?: 'works-wall' | 'activities' | 'create-activity' | 'profile';
    currentUser?: any;
}

const MainHeader: React.FC<MainHeaderProps> = ({ activePage, currentUser }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [reviewActivityId, setReviewActivityId] = useState<number | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentUser) {
            const fetchUnreadCount = async () => {
                try {
                    const count = await notificationService.getUnreadCount();
                    setUnreadCount(count);
                } catch (error) {
                    console.error('Failed to fetch unread notifications:', error);
                }
            };
            fetchUnreadCount();

            // Poll every 60 seconds
            const interval = setInterval(fetchUnreadCount, 60000);
            return () => clearInterval(interval);
        }
    }, [currentUser]);

    const handleNotificationClick = (notification: any) => {
        if (notification.type === 'join_request') {
            // notification.referenceId is the activity ID
            setReviewActivityId(Number(notification.referenceId));
            setShowNotifications(false);
        }
    };

    const handleCreateClick = () => {
        if (!currentUser) {
            if (confirm("請先登入才能舉辦活動")) {
                window.location.href = '?view=selection';
            }
            return;
        }
        window.location.href = '?view=create-activity';
    };

    let avatarSrc = currentUser?.profile?.avatarUrl || currentUser?.avatarUrl;
    if (avatarSrc && !avatarSrc.startsWith('http') && !avatarSrc.startsWith('data:')) {
        const cleanPath = avatarSrc.startsWith('/') ? avatarSrc.slice(1) : avatarSrc;
        avatarSrc = `${IMG_BASE_URL}/${cleanPath}`;
    }

    useEffect(() => {
        setAvatarError(false);
    }, [avatarSrc]);

    return (
        <div className="w-full h-[60px] bg-[#f7f7f7] shadow-[0px_1px_4px_0px_rgba(25,25,25,0.15)] relative z-50">
            <div className="w-full h-full px-4 md:px-8 flex items-center justify-between">

                {/* Left Section: Logo */}
                <div
                    className="flex items-center mr-8 cursor-pointer text-grey-black"
                    onClick={() => window.location.href = '?view=works-wall'}
                >
                    <svg width="101" height="16" viewBox="0 0 101 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="Group">
                            <path id="Vector" d="M6.6202 0.188802H1.65209C0.630871 0.188802 0 1.05625 0 1.86061V13.9654C0 15.0143 0.839846 15.6412 1.65209 15.6412C2.59051 15.6412 3.21744 14.9669 3.21744 13.9654V11.3197H6.61625C10.3975 11.3197 12.1167 8.47686 12.1167 5.83904C12.1206 3.11841 10.4015 0.188802 6.6202 0.188802ZM9.00962 5.83904C9.00962 7.12444 7.89377 8.24817 6.6202 8.24817H3.22138V3.28007H6.6202C7.93714 3.28007 9.00962 4.42746 9.00962 5.83904Z" fill="currentColor" />
                            <path id="Vector_2" d="M20.0972 0.327691C19.2889 0.327691 18.4688 0.856045 18.4688 1.86544V14.1438C18.4688 15.2044 19.2968 15.6894 20.0656 15.6894C20.8739 15.6894 21.6901 15.1571 21.6901 14.1438V1.8615C21.6901 0.80873 20.8621 0.327691 20.0972 0.327691Z" fill="currentColor" />
                            <path id="Vector_3" d="M40.3993 11.1901C39.9735 11.1309 39.5555 11.2413 39.2165 11.5055C38.2268 12.3848 37.1425 12.8343 35.9872 12.8343C32.5095 12.8343 31.2754 10.1807 31.2754 7.9056C31.2754 5.70149 32.5095 3.1307 35.9872 3.1307C37.0676 3.1307 37.9705 3.31996 38.8616 4.25838C39.4649 4.86165 40.4703 4.89319 41.113 4.32146C41.4206 4.00209 41.5822 3.58413 41.5704 3.13858C41.5586 2.69303 41.3654 2.26325 41.0342 1.95964C39.4412 0.587498 37.9311 0 35.9872 0C30.6406 0 28.2511 3.97449 28.2511 7.90954C28.2511 13.7254 32.2493 15.7994 35.9872 15.7994C37.5525 15.7994 39.5634 15.6022 41.2195 14.0645C42.0317 13.2522 41.8858 12.3611 41.4758 11.7933C41.2352 11.474 40.8331 11.2492 40.3993 11.1901Z" fill="currentColor" />
                            <path id="Vector_4" d="M59.8381 11.1901C59.4123 11.1309 58.9944 11.2413 58.6553 11.5055C57.6656 12.3848 56.5813 12.8343 55.426 12.8343C51.9483 12.8343 50.7142 10.1807 50.7142 7.9056C50.7142 5.70149 51.9483 3.1307 55.426 3.1307C56.5064 3.1307 57.4093 3.31996 58.3004 4.25838C58.9037 4.86165 59.9091 4.89319 60.5518 4.32146C60.8594 4.00209 61.021 3.58413 61.0092 3.13858C60.9974 2.69303 60.8042 2.26325 60.473 1.95964C58.88 0.587498 57.3699 0 55.426 0C50.0794 0 47.6899 3.97449 47.6899 7.90954C47.6899 13.7254 51.6881 15.7994 55.426 15.7994C56.9913 15.7994 59.0022 15.6022 60.6583 14.0645C61.4705 13.2522 61.3246 12.3611 60.9146 11.7933C60.674 11.474 60.2719 11.2492 59.8381 11.1901Z" fill="currentColor" />
                            <path id="Vector_5" d="M79.1822 0.382849C78.2714 0.382849 77.5301 1.06498 77.5301 1.90877V6.40372H70.902V1.90482C70.902 1.03738 70.2554 0.378906 69.3997 0.378906C68.3706 0.378906 67.6806 0.990062 67.6806 1.90482V14.1161C67.6806 15.0269 68.3706 15.642 69.3997 15.642C70.2554 15.642 70.902 14.9875 70.902 14.1161V9.60144H77.5301V14.1201C77.5301 14.9599 78.2714 15.646 79.1822 15.646C80.0378 15.646 80.7041 14.9757 80.7041 14.1201V1.90482C80.7081 1.03738 80.0536 0.382849 79.1822 0.382849Z" fill="currentColor" />
                            <path id="Vector_6" d="M100.454 0.729187C100.174 0.457124 99.7919 0.307292 99.3779 0.307292C98.5815 0.307292 97.7377 0.898733 97.7377 1.99093V9.77429C97.7377 10.7403 97.3749 11.5407 96.6928 12.0927C96.0816 12.5856 95.2497 12.8577 94.3428 12.8577C92.5764 12.8577 90.7863 11.797 90.7863 9.77429V1.99093C90.7863 1.4744 90.6167 1.04068 90.2934 0.737073C90.0095 0.46501 89.6231 0.319121 89.2091 0.319121C88.4047 0.319121 87.5885 0.89479 87.5885 1.99487V9.77824C87.5885 12.7749 89.6783 16.0002 94.2639 16.0002C98.8496 16.0002 100.939 12.7749 100.939 9.77824V1.99093C100.939 1.47046 100.774 1.03279 100.454 0.729187Z" fill="currentColor" />
                        </g>
                    </svg>
                </div>

                {/* Right Section: Menu Items (Desktop) */}
                <div className="hidden md:flex items-center gap-6">
                    {/* Gallery (Works Wall) */}
                    <button
                        className="hover:opacity-70 transition-opacity"
                        onClick={() => window.location.href = '?view=works-wall'}
                    >
                        <img
                            src={activePage === 'works-wall' ? "/assets/gallery_icon.png" : "/assets/gallery_gray_icon.png"}
                            alt="Gallery"
                            className="w-6 h-6 object-contain"
                        />
                    </button>

                    {/* Wave (Activities) */}
                    <button
                        className="hover:opacity-70 transition-opacity"
                        onClick={() => window.location.href = '?view=activities'}
                    >
                        <img
                            src={activePage === 'activities' ? "/assets/gradient_wave_icon.png" : "/assets/wave_icon.png"}
                            alt="Activity"
                            className="w-6 h-6 object-contain"
                        />
                    </button>

                    {/* Creation (Plus Circle) */}
                    <button
                        className="hover:opacity-70 transition-opacity"
                        onClick={handleCreateClick}
                    >
                        {activePage === 'create-activity' ? (
                            <img
                                src="/assets/gradient_plus_icon.png"
                                alt="Create"
                                className="w-6 h-6 object-contain"
                            />
                        ) : (
                            <PlusCircle className="w-6 h-6 text-grey-1" />
                        )}
                    </button>

                    {currentUser ? (
                        <>
                            {/* Notifications (Heart) */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    className="hover:opacity-70 transition-opacity flex items-center justify-center"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                >
                                    {showNotifications ? (
                                        <img
                                            src="/assets/gradient_heart_icon.png"
                                            alt="Notifications"
                                            className="w-6 h-6 object-contain"
                                            width={24}
                                            height={24}
                                        />
                                    ) : (
                                        <Heart className="w-6 h-6 text-grey-1" />
                                    )}
                                    {/* Notification Dot */}
                                    {unreadCount > 0 && (
                                        <div className="absolute top-0 right-0 w-2 h-2 bg-alert-default rounded-full border border-white"></div>
                                    )}
                                </button>

                                <NotificationDropdown
                                    isOpen={showNotifications}
                                    onClose={() => setShowNotifications(false)}
                                    onNotificationClick={handleNotificationClick}
                                />
                            </div>

                            {/* Avatar */}
                            <div className="relative">
                                <button
                                    className={`w-8 h-8 rounded-full overflow-hidden border cursor-pointer hover:opacity-80 transition-all ${activePage === 'profile' ? 'border-secondary-blue ring-2 ring-secondary-blue/20' : 'border-gray-200'}`}
                                    onClick={() => {
                                        setShowProfileDropdown(!showProfileDropdown);
                                        setAvatarError(false);
                                    }}
                                >
                                    {avatarSrc && !avatarError ? (
                                        <img
                                            src={avatarSrc}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                            onError={() => setAvatarError(true)}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                    )}
                                </button>

                                <ProfileDropdown
                                    isOpen={showProfileDropdown}
                                    onClose={() => setShowProfileDropdown(false)}
                                />
                            </div>
                        </>
                    ) : (
                        /* Login/Register Button for Guests */
                        <button
                            onClick={() => window.location.href = '?view=selection'}
                            className="px-6 py-2 rounded-full bg-gradient-to-r from-[#F2994A] to-[#009bcd] text-white font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                            登入 / 註冊
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden items-center gap-4">
                    {/* Notifications (Heart) - Visible on Mobile too, just icon */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            className="hover:opacity-70 transition-opacity flex items-center justify-center"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            {showNotifications ? (
                                <img
                                    src="/assets/gradient_heart_icon.png"
                                    alt="Notifications"
                                    className="w-6 h-6 object-contain"
                                    width={24}
                                    height={24}
                                />
                            ) : (
                                <Heart className="w-6 h-6 text-grey-1" />
                            )}
                            {/* Notification Dot */}
                            {unreadCount > 0 && (
                                <div className="absolute top-0 right-0 w-2 h-2 bg-alert-default rounded-full border border-white"></div>
                            )}
                        </button>
                        <NotificationDropdown
                            isOpen={showNotifications}
                            onClose={() => setShowNotifications(false)}
                            onNotificationClick={handleNotificationClick}
                        />
                    </div>

                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="text-[#666666] hover:text-black transition-colors"
                    >
                        <Menu className="w-7 h-7" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                activePage={activePage || ''}
            />

            {/* Application Management Modal */}
            {reviewActivityId && (
                <ApplicationManagementModal
                    isOpen={!!reviewActivityId}
                    onClose={() => setReviewActivityId(null)}
                    activityId={reviewActivityId}
                />
            )}
        </div>
    );
};

export default MainHeader;
