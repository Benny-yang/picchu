import React, { useState, useEffect } from 'react';
import ActivityApplicationModal from './ActivityApplicationModal';
import ActivityRatingModal from './ActivityRatingModal';
import CommentsSection from './CommentsSection';
import { X, MapPin, Users } from 'lucide-react';
import UserInfo from '../user/UserInfo';
import ApplicationManagementModal from './ApplicationManagementModal';
import { activityService } from '../../services/activityService';
import { IMG_BASE_URL } from '../../config';
import ActivityImageGallery from './ActivityImageGallery';
import ActivityActionButtons from './ActivityActionButtons';


interface ActivityDetailModalProps {
    activity: any;
    onClose: () => void;
    currentUser?: any;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ activity, onClose, currentUser }) => {
    const [details, setDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [showManagementModal, setShowManagementModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    // Status: 'idle' | 'applied' | 'joined' | 'isHost' | 'rejected'
    const [status, setStatus] = useState<'idle' | 'applied' | 'joined' | 'isHost' | 'rejected'>('idle');
    const [isEnded, setIsEnded] = useState(false);

    const activityId = activity?.id || activity?.ID;

    useEffect(() => {
        const fetchActivityDetails = async () => {
            if (!activityId) return;
            setIsLoading(true);
            try {
                const data = await activityService.getById(activityId);
                setDetails(data);
                setIsEnded(data.status === 'ended' || data.status === 'cancelled');

                // Determine user status
                if (currentUser && currentUser.id) {
                    // Check ownership with robust fallback
                    // API returns 'hostId' (lowercase d), check all possible cases but ensure values exist
                    const isHost = (data.hostId && data.hostId === currentUser.id) ||
                        (data.hostID && data.hostID === currentUser.id) ||
                        (data.host?.id && data.host.id === currentUser.id);

                    if (isHost) {
                        setStatus('isHost');
                    } else {
                        try {
                            const userStatus = await activityService.getStatus(activityId);
                            if (userStatus === 'accepted') {
                                setStatus('joined');
                            } else if (userStatus === 'pending') {
                                setStatus('applied');
                            } else if (userStatus === 'rejected') {
                                setStatus('rejected');
                            } else {
                                setStatus('idle');
                            }
                        } catch {
                            setStatus('idle');
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load activity details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivityDetails();
    }, [activityId]);

    const images = details?.images?.length > 0
        ? details.images
        : (activity.image ? [activity.image] : [activity.coverUrl || '']);

    const handleSubmitApplication = async (message?: string) => {
        try {
            await activityService.apply(activityId, message);
            setStatus('applied');
        } catch (error: any) {
            alert('申請失敗：' + (error.message || '未知錯誤'));
        }
    };

    const handleCancelApplication = async () => {
        try {
            await activityService.cancelApplication(activityId);
            setStatus('idle');
        } catch (error: any) {
            alert('取消申請失敗：' + (error.message || '未知錯誤'));
        }
    };

    const handleDeleteActivity = async () => {
        // Show cancellation reason modal
        setShowCancelModal(true);
    };

    const handleConfirmCancel = async () => {
        if (!cancelReason.trim()) {
            alert('請輸入取消原因');
            return;
        }

        try {
            await activityService.cancelActivity(activityId, cancelReason);
            alert('活動已取消');
            setShowCancelModal(false);
            onClose();
        } catch (error: any) {
            alert('取消失敗：' + (error.message || '未知錯誤'));
        }
    };


    const getAvatarUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${IMG_BASE_URL}/${url}`;
    };

    const displayData = details || activity;
    const hostName = displayData.host?.username || displayData.hostName || 'Host';
    const hostAvatar = getAvatarUrl(displayData.host?.profile?.avatarUrl || displayData.host?.avatarUrl || displayData.userAvatar || '');
    const participants = displayData.currentParticipants !== undefined
        ? `${displayData.currentParticipants} / ${displayData.maxParticipants}`
        : displayData.participants || '0';
    const location = displayData.location || '';
    const description = displayData.description || '';
    const dateTime = displayData.eventTime
        ? new Date(displayData.eventTime).toLocaleString('zh-TW', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        : (displayData.date || displayData.eventDate || '');
    const tags = displayData.tags ? (typeof displayData.tags === 'string' ? displayData.tags.split(',') : displayData.tags) : [];

    const hostRoles = (() => {
        try {
            const profile = displayData.host?.profile;
            const rolesData = profile?.roles;

            // Priority 1: Parsed roles from JSON string or array
            let parsedRoles: string[] = [];
            if (Array.isArray(rolesData)) {
                parsedRoles = rolesData;
            } else if (typeof rolesData === 'string' && rolesData.trim() !== '') {
                if (rolesData.startsWith('[')) {
                    parsedRoles = JSON.parse(rolesData);
                } else {
                    parsedRoles = [rolesData];
                }
            }

            if (parsedRoles.length > 0) return parsedRoles;

            // Priority 2: Legacy boolean flags
            const legacyRoles = [];
            if (profile?.isPhotographer) legacyRoles.push('攝影師');
            if (profile?.isModel) legacyRoles.push('模特兒');

            return legacyRoles;
        } catch {
            return [];
        }
    })();

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            {/* Close Button (Outer) */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
            >
                <X size={32} />
            </button>

            <div
                className="bg-white rounded-xl w-full max-w-5xl h-[85vh] max-h-[800px] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Left: Images */}
                <div className="w-full md:w-1/2 bg-black flex flex-col relative group">
                    <ActivityImageGallery images={images} isLoading={isLoading} />
                </div>

                {/* Right: Info */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto flex flex-col relative">

                    {/* Header: User Info */}
                    <div className="flex items-center justify-between mb-6">
                        <UserInfo
                            avatar={hostAvatar}
                            name={hostName}
                            userId={displayData.host?.id || displayData.host?.ID}
                            role={hostRoles.slice(0, 2)}
                            rating={displayData.host?.averageRating || 0}
                            size="lg"
                            className="cursor-pointer"
                        />
                    </div>

                    {/* Title & Date */}
                    <h1 className="text-2xl font-bold text-[#191919] mb-2">{displayData.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                            {dateTime} {isEnded && "(Ended)"}
                        </div>
                    </div>

                    {/* Stats & Location */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm">
                            <Users size={18} className="text-gray-500" />
                            <span className="text-[#009bcd] font-bold">{participants}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin size={18} className="text-gray-500" />
                            <span className="text-gray-600">{location}</span>
                        </div>
                    </div>

                    {/* Required Roles */}
                    {displayData.roles && displayData.roles.length > 0 && (
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-[#191919]">需求角色</span>
                                <div className="flex gap-2">
                                    {displayData.roles.map((role: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">
                                            {role === 'photographer' ? '攝影師' : role === 'model' ? '模特兒' : role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-[#191919]">拍攝風格</span>
                                <div className="flex gap-2">
                                    {tags.map((tag: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="mb-8">
                        <h4 className="font-bold text-[#191919] mb-2">簡介</h4>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                            {description}
                        </p>
                    </div>

                    {/* Footer Button */}
                    <ActivityActionButtons
                        status={status}
                        isEnded={isEnded}
                        displayData={displayData}
                        activityId={activityId}
                        onShowManagementModal={() => setShowManagementModal(true)}
                        onShowRatingModal={() => setShowRatingModal(true)}
                        onShowApplicationModal={() => setShowApplicationModal(true)}
                        onDeleteActivity={handleDeleteActivity}
                        onCancelApplication={handleCancelApplication}
                        currentUser={currentUser}
                    />

                    {/* Message Board */}
                    {(status === 'joined' || status === 'isHost') && <CommentsSection activityId={Number(activityId)} />}

                </div>
            </div>

            {/* Application Modal */}
            <ActivityApplicationModal
                isOpen={showApplicationModal}
                onClose={() => setShowApplicationModal(false)}
                onSubmit={(message) => handleSubmitApplication(message)}
                activityTitle={displayData.title}
                activityTime={dateTime}
                currentParticipants={displayData.currentParticipants || 0}
                maxParticipants={displayData.maxParticipants || 0}
            />

            {/* Rating Modal */}
            <ActivityRatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                activityId={Number(activityId)}
                currentUser={currentUser}
                host={displayData.host}
                onSubmit={() => {
                    setShowRatingModal(false);
                }}
            />

            {/* Application Management Modal */}
            <ApplicationManagementModal
                isOpen={showManagementModal}
                onClose={() => setShowManagementModal(false)}
                activityId={activityId}
            />

            {/* Cancellation Reason Modal */}
            {
                showCancelModal && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowCancelModal(false)}>
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-xl font-bold text-[#191919] mb-4">取消活動</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                請輸入取消原因，這將會通知所有已報名的參加者。
                            </p>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="例如：因天候不佳取消..."
                                className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#191919] mb-6"
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="px-5 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                                >
                                    返回
                                </button>
                                <button
                                    onClick={handleConfirmCancel}
                                    className="px-5 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                                >
                                    確認取消
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ActivityDetailModal;
