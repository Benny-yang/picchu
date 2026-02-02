import React, { useState } from 'react';
import ActivityApplicationModal from './ActivityApplicationModal';
import ActivityRatingModal from './ActivityRatingModal';
import CommentsSection from './CommentsSection';
import { X, MapPin, Users, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import UserInfo from './UserInfo';
import ApplicationManagementModal from './ApplicationManagementModal';

interface ActivityDetailModalProps {
    activity: any;
    onClose: () => void;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ activity, onClose }) => {
    // Mock additional details not present in the list view data
    const details = {
        hostName: "nanami_misoto",
        hostAvatar: activity.userAvatar,
        rating: 4.8,
        participants: "998 / 999",
        location: "臺北市 東區忠孝東路一段109號",
        description: "在繁華的大街小巷，無處看不見五光十色的霓虹燈招牌。霓虹招牌承載著七、八十年代人美好的回憶。\n互相交流霓虹招牌的拍攝技巧~模特兒自帶妝，服裝休閒輕辣即可!",
        requirements: ["模特兒", "攝影師"],
        styles: ["都市", "時尚", "大尺度"],
        images: [
            activity.image, // Main image
            activity.image, // Duplicate for thumbnail demo
            activity.image,
            activity.image
        ]
    };

    // Derived from date string or mock
    const dateTime = "2026/2/1 8:00 AM";

    const [selectedImage, setSelectedImage] = useState(0);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [showManagementModal, setShowManagementModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    // Status: 'idle' | 'applied' | 'joined' | 'isHost'
    // Default to 'isHost' for demo to show management buttons
    const [status, setStatus] = useState<'idle' | 'applied' | 'joined' | 'isHost'>('isHost');
    const [isEnded, setIsEnded] = useState(false);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImage((prev) => (prev === 0 ? prev : prev - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImage((prev) => (prev === details.images.length - 1 ? prev : prev + 1));
    };

    const handleSubmitApplication = () => {
        setStatus('applied');
    };

    const handleCancelApplication = () => {
        setStatus('idle');
    };

    // DEBUG: Function to toggle joined state for verification
    const toggleJoined = () => {
        setStatus(prev => prev === 'joined' ? 'idle' : 'joined');
    };

    // DEBUG: Function to toggle ended state
    const toggleEnded = () => {
        setIsEnded(prev => !prev);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Close Button (Outer) */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
            >
                <X size={32} />
            </button>

            <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] max-h-[800px] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">

                {/* Left: Images */}
                <div className="w-full md:w-1/2 bg-black flex flex-col relative group">
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 overflow-hidden relative">
                        <img
                            src={details.images[selectedImage]}
                            alt="Main"
                            className="w-full h-full object-contain"
                        />

                        {/* Left Arrow */}
                        {selectedImage > 0 && (
                            <button
                                onClick={handlePrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        {/* Right Arrow */}
                        {selectedImage < details.images.length - 1 && (
                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ChevronRight size={24} />
                            </button>
                        )}

                        {/* Dots */}
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                            {details.images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${selectedImage === idx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Info */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto flex flex-col relative">


                    {/* Header: User Info */}
                    <div className="flex items-center justify-between mb-6">
                        <UserInfo
                            avatar={details.hostAvatar}
                            name={details.hostName}
                            role={['攝影師', '模特兒']}
                            rating={details.rating}
                            size="lg"
                            className="cursor-pointer"
                            onClick={toggleJoined}
                        />

                    </div>

                    {/* Title & Date */}
                    <h1 className="text-2xl font-bold text-[#191919] mb-2">{activity.title}</h1>
                    <div className="flex items-center justify-between mb-6">
                        <span
                            className="text-gray-500 font-bold tracking-wider cursor-pointer hover:text-blue-500 transition-colors"
                            onClick={toggleEnded}
                            title="Debug: Toggle Ended Status"
                        >
                            {dateTime} {isEnded && "(Ended)"}
                        </span>

                    </div>

                    {/* Stats & Location */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm">
                            <Users size={18} className="text-gray-500" />
                            <span className="text-[#009bcd] font-bold">{details.participants}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin size={18} className="text-gray-500" />
                            <span className="text-gray-600">{details.location}</span>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-[#191919] w-16">需要人員</span>
                            <div className="flex gap-2">
                                {details.requirements.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-[#191919] w-16">拍攝風格</span>
                            <div className="flex gap-2">
                                {details.styles.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h4 className="font-bold text-[#191919] mb-2">簡介</h4>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                            {details.description}
                        </p>
                    </div>

                    {/* Footer Button (Visible when NOT joined, OR when joined AND ended) */}
                    {status === 'isHost' ? (
                        <div className="flex justify-center pt-6 gap-3 mt-6">
                            <button
                                onClick={() => setShowManagementModal(true)}
                                className="px-5 py-2 rounded-full text-white font-medium text-sm shadow-md bg-[#191919] hover:bg-[#333] transition-all transform active:scale-95 flex items-center gap-2"
                            >
                                <Users size={16} />
                                管理報名
                            </button>
                            <button
                                onClick={() => {
                                    window.location.href = `?view=create-activity&mode=edit&id=${activity.id}`;
                                }}
                                className="px-5 py-2 rounded-full text-[#191919] font-medium text-sm shadow-sm border border-gray-200 hover:bg-gray-50 transition-all transform active:scale-95 flex items-center gap-2"
                            >
                                <div className="w-4 h-4"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></div>
                                編輯
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('確定要取消此活動嗎？此操作無法復原。')) {
                                        alert('活動已取消');
                                        onClose();
                                    }
                                }}
                                className="px-5 py-2 rounded-full text-red-500 font-medium text-sm shadow-sm border border-red-100 hover:bg-red-50 transition-all transform active:scale-95 flex items-center gap-2"
                            >
                                <div className="w-4 h-4"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></div>
                                取消
                            </button>
                        </div>
                    ) : (status !== 'joined' || (status === 'joined' && isEnded)) && (
                        <div className={`flex justify-center pt-8 gap-4 ${status === 'idle' ? 'mt-auto' : 'mt-8'}`}>
                            {status === 'idle' ? (
                                <button
                                    onClick={() => setShowApplicationModal(true)}
                                    className="px-12 py-2.5 rounded-full text-white font-bold text-base shadow-md hover:shadow-lg hover:opacity-95 transition-all transform active:scale-95"
                                    style={{ background: "linear-gradient(90deg, #FDBB2D 0%, #22C1C3 100%)" }}
                                >
                                    申請加入
                                </button>
                            ) : status === 'applied' ? (
                                <>
                                    <button
                                        onClick={handleCancelApplication}
                                        className="px-8 py-2.5 rounded-full border-2 border-red-500 text-red-500 font-bold text-base hover:bg-red-50 transition-colors"
                                    >
                                        取消申請
                                    </button>
                                    <div className="px-12 py-2.5 rounded-full bg-[#B3B3B3] text-white font-bold text-base cursor-default flex items-center justify-center">
                                        已申請
                                    </div>
                                </>
                            ) : (
                                /* Rate Button for Joined & Ended */
                                <button
                                    onClick={() => setShowRatingModal(true)}
                                    className="px-12 py-2.5 rounded-full text-white font-bold text-base shadow-md hover:shadow-lg hover:opacity-95 transition-all transform active:scale-95 flex items-center gap-2"
                                    style={{ backgroundColor: "#FFAF3C" }}
                                >
                                    <Star className="fill-white" size={20} />
                                    <span>評價</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Message Board (Only visible when joined or Host) */}
                    {(status === 'joined' || status === 'isHost') && <CommentsSection />}

                </div>
            </div>

            {/* Application Modal */}
            <ActivityApplicationModal
                isOpen={showApplicationModal}
                onClose={() => setShowApplicationModal(false)}
                onSubmit={handleSubmitApplication}
                activityTitle={activity.title}
                activityTime={dateTime}
            />

            {/* Rating Modal */}
            <ActivityRatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onSubmit={() => {
                    setShowRatingModal(false);
                    // Could show success toast here
                }}
            />

            {/* Application Management Modal */}
            <ApplicationManagementModal
                isOpen={showManagementModal}
                onClose={() => setShowManagementModal(false)}
                activityId={activity.id}
            />
        </div>
    );
};



export default ActivityDetailModal;
