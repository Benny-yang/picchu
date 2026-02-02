import React from 'react';
import { X, Heart, ChevronLeft, ChevronRight, MoreHorizontal, Edit, Trash2, Check } from 'lucide-react';
import UserInfo from './UserInfo';

interface WorkDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    authorName?: string;
    authorAvatar?: string;
    showFollowButton?: boolean;
    isFollowing?: boolean;
    onFollowToggle?: () => void;
}

const WorkDetailModal: React.FC<WorkDetailModalProps> = ({
    isOpen,
    onClose,
    imageUrl,
    authorName = "Username",
    authorAvatar,
    showFollowButton = false,
    isFollowing = false,
    onFollowToggle
}) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isLiked, setIsLiked] = React.useState(false);

    // Edit/Delete State
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [description, setDescription] = React.useState('慵懶舒服的拍攝日 #夏 #summer');
    const [editDescription, setEditDescription] = React.useState(description);

    // Mock multiple images for demonstration
    const galleryImages = [
        imageUrl,
        "http://localhost:3845/assets/e3c63927ea078034299232019537fd5b47178779.png",
        "http://localhost:3845/assets/4c01dbd34faae81b60a4b022bf488aa86eb932ad.png",
        "http://localhost:3845/assets/5ea31b047065367c217a73d7bbce4fb97ce05047.png"
    ];

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? prev : prev - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? prev : prev + 1));
    };

    const handleDelete = () => {
        if (confirm('確定要刪除此作品嗎？此操作無法復原。')) {
            alert('作品已刪除');
            onClose();
        }
    };

    const handleSave = () => {
        setDescription(editDescription);
        setIsEditing(false);
    };

    // Reset index when modal opens with a new work
    React.useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setIsLiked(false);
            setIsMenuOpen(false);
            setIsEditing(false);
            // Reset description to default mock if needed, or keep persistent for demo
        }
    }, [imageUrl, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Close Button (Outer Overlay) */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-[70] text-white hover:text-gray-300 transition-colors p-2"
            >
                <X size={32} />
            </button>

            {/* Modal Container */}
            <div className="relative w-full max-w-[1200px] h-[80vh] md:h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Left: Image Section (Carousel) */}
                <div className="w-full md:w-[60%] h-[40%] md:h-full bg-black relative flex items-center justify-center group">
                    <img
                        src={galleryImages[currentIndex]}
                        alt={`Work Detail ${currentIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                    />

                    {/* Left Arrow */}
                    {currentIndex > 0 && (
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    {/* Right Arrow */}
                    {currentIndex < galleryImages.length - 1 && (
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                        {galleryImages.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Info Section */}
                <div className="w-full md:w-[40%] h-[60%] md:h-full flex flex-col bg-white">
                    {/* Header: Author & Menu */}
                    <div className="h-[72px] px-6 flex items-center justify-between border-b border-[#E6E6E6] flex-shrink-0 relative">
                        <div className="flex items-center gap-3 w-full">
                            <UserInfo
                                avatar={authorAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                name={authorName}
                                role="模特兒"
                                rating={4.8}
                                size="md"
                                className="flex-1"
                            />
                            {showFollowButton && (
                                <button
                                    onClick={onFollowToggle}
                                    className={`text-[12px] px-3 py-0.5 rounded-full transition-colors flex-shrink-0 ${isFollowing
                                        ? 'border border-[#dbdbdb] text-[#262626] hover:bg-gray-50'
                                        : 'bg-[#009bcd] text-white hover:opacity-90'
                                        }`}
                                >
                                    {isFollowing ? '取消追蹤' : '追蹤'}
                                </button>
                            )}
                        </div>

                        {/* More Menu Button */}
                        <div className="relative ml-2">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <MoreHorizontal size={20} className="text-[#191919]" />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                        <button
                                            onClick={() => {
                                                setIsEditing(true);
                                                setIsMenuOpen(false);
                                                setEditDescription(description);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-[#191919] hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <Edit size={14} />
                                            編輯
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                handleDelete();
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <Trash2 size={14} />
                                            刪除
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="px-6 py-3 border-b border-[#E6E6E6] flex-shrink-0 text-left">
                        {isEditing ? (
                            <div className="space-y-3">
                                <textarea
                                    className="w-full h-24 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-[#009bcd] focus:ring-1 focus:ring-[#009bcd]"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="輸入作品描述..."
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-3 py-1.5 text-xs font-medium text-white bg-[#009bcd] hover:bg-[#0089b5] rounded-md transition-colors flex items-center gap-1"
                                    >
                                        <Check size={12} />
                                        儲存
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-[#191919] leading-relaxed text-left whitespace-pre-wrap">
                                    {description}
                                </p>
                                <p className="text-xs text-[#999999] mt-2 text-left">3天前</p>
                            </>
                        )}
                    </div>

                    {/* Body: Comments (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        {/* Comment 1 */}
                        <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Annie" alt="User" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-sm text-[#191919]">
                                    <span className="font-bold mr-2">hihi_man</span>
                                    <span>好喜歡這次的作品!!</span>
                                </div>
                                <div className="text-xs text-[#999999] mt-1">3天前</div>
                            </div>
                        </div>

                        {/* Comment 2 */}
                        <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" alt="User" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-sm text-[#191919]">
                                    <span className="font-bold mr-2">chien_mi</span>
                                    <span>好美~~~~~~</span>
                                </div>
                                <div className="text-xs text-[#999999] mt-1">3天前</div>
                            </div>
                        </div>

                        {/* Comment 3 */}
                        <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Coco" alt="User" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-sm text-[#191919]">
                                    <span className="font-bold mr-2">twinkletwinkle</span>
                                    <span>太喜歡了~好有意境阿!!!!</span>
                                </div>
                                <div className="text-xs text-[#999999] mt-1">3天前</div>
                            </div>
                        </div>

                        {/* Comment 4 */}
                        <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=David" alt="User" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-sm text-[#191919]">
                                    <span className="font-bold mr-2">sia_xx</span>
                                    <span>想詢問地點在哪?</span>
                                </div>
                                <div className="text-xs text-[#999999] mt-1">3天前</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Actions & Input */}
                    <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
                        {/* Action Icons */}
                        {/* Action Icons & Likes */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsLiked(!isLiked);
                                    }}
                                    className="focus:outline-none transition-transform active:scale-95"
                                >
                                    <Heart
                                        size={24}
                                        className={`transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-[#191919] hover:text-red-500'}`}
                                    />
                                </button>
                            </div>
                            <div className="font-bold text-sm text-[#191919]">
                                {isLiked ? 1235 : 1234} likes
                            </div>
                        </div>



                        {/* Comment Input */}
                        <div className="flex items-center gap-3 border-t border-gray-100 pt-4">

                            <input
                                type="text"
                                placeholder="Add a comment..."
                                className="flex-1 text-sm outline-none placeholder-gray-400"
                            />
                            <button className="text-[#009bcd] font-bold text-sm disabled:opacity-50" disabled>
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkDetailModal;
