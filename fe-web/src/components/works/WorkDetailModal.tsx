import React from 'react';
import { X } from 'lucide-react';
import WorkImageCarousel from './WorkImageCarousel';
import WorkDetailHeader from './WorkDetailHeader';
import WorkDescriptionSection from './WorkDescriptionSection';
import WorkCommentsSection from './WorkCommentsSection';
import { workService } from '../../services/workService';
import { tokenManager } from '../../services/tokenManager';
import { IMG_BASE_URL } from '../../config';


interface WorkDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    workId: number;
    // Optional initial data for smooth transition
    initialData?: {
        imageUrl?: string;
        authorName?: string;
        authorAvatar?: string;
    };
    allowEdit?: boolean;
}

const WorkDetailModal: React.FC<WorkDetailModalProps> = ({
    isOpen,
    onClose,
    workId,
    initialData,
    allowEdit = false
}) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [work, setWork] = React.useState<any>(null);
    const [comments, setComments] = React.useState<any[]>([]);
    const [isLiked, setIsLiked] = React.useState(false);
    const [likeCount, setLikeCount] = React.useState(0);

    // Edit state
    const [isEditing, setIsEditing] = React.useState(false);
    const [description, setDescription] = React.useState('');

    // Fetch Data
    React.useEffect(() => {
        if (isOpen && workId) {
            const fetchData = async () => {
                try {
                    const [workData, commentsData] = await Promise.all([
                        workService.getById(workId),
                        workService.getComments(workId)
                    ]);

                    setWork(workData);
                    setComments(commentsData);
                    setIsLiked(workData.isLiked);
                    setLikeCount(workData.likeCount);
                    setDescription(workData.description || '');

                    // Check follow status (if not self)
                    // This requires extra API or info in workData.user
                    // For now, simpler to assume false or need "isFollowing" in Work response?
                    // UserProfilePage handles "isFollowing" via external fetch.
                    // Doing it here is complex. I'll omit follow button logic update for now or default false.

                } catch (error) {
                    console.error("Failed to fetch work details:", error);
                }
            };
            fetchData();
        } else {
            setWork(null);
            setComments([]);
        }
    }, [isOpen, workId]);

    const handleLikeToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!work) return;

        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

        try {
            if (newIsLiked) {
                await workService.like(workId);
            } else {
                await workService.unlike(workId);
            }
        } catch (error) {
            // Revert on error
            setIsLiked(!newIsLiked);
            setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1);
            console.error("Like failed", error);
        }
    };

    const handlePostComment = async (content: string) => {
        try {
            const newComment = await workService.postComment(workId, content);
            setComments([...comments, newComment]);
            // Reload comments to be safe or just append
            // workService.getComments(workId).then(setComments);
        } catch (error) {
            alert("留言失敗");
        }
    };

    const handleDelete = async () => {
        if (confirm('確定要刪除此作品嗎？此操作無法復原。')) {
            try {
                await workService.remove(workId);
                alert('作品已刪除');
                onClose();
                // Trigger refresh in parent? Parent should listen to close?
                // window.location.reload(); // Simple brute force
            } catch (err) {
                alert("刪除失敗");
            }
        }
    };

    const handleSaveDescription = async (newDescription: string) => {
        try {
            await workService.update(workId, { description: newDescription });
            setDescription(newDescription);
            setIsEditing(false);
        } catch (err) {
            alert("更新失敗");
        }
    };

    // Derived values
    const author = work?.author || work?.user || {}; // backend returns "author" in Post struct? Yes step 1064 line 19.
    // wait work key in json is "author"

    const images = (work?.images && work.images.length > 0)
        ? work.images
        : (work?.imageUrl ? [work.imageUrl] : (initialData?.imageUrl ? [initialData.imageUrl] : []));


    // Handle relative URLs for images
    const processedImages = images.map((img: string) => {
        if (img && !img.startsWith('http') && !img.startsWith('data:')) {
            return `${IMG_BASE_URL}/${img}`;
        }
        return img;
    });

    const authorAvatar = author.profile?.avatarUrl || author.avatarUrl || initialData?.authorAvatar;
    const authorName = author.username || initialData?.authorName || 'User';

    // Calculate Role
    const roles = [];
    if (author.profile?.isPhotographer) roles.push('攝影師');
    if (author.profile?.isModel) roles.push('模特兒');
    const authorRole = roles.join(' / ');

    const authorRating = author.averageRating || 0;

    // Process Avatar URL
    const processedAvatar = (authorAvatar && !authorAvatar.startsWith('http') && !authorAvatar.startsWith('data:'))
        ? `${IMG_BASE_URL}/${authorAvatar}`
        : authorAvatar;

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
                <WorkImageCarousel
                    images={processedImages}
                    currentIndex={currentIndex}
                    onPrev={(e) => { e.stopPropagation(); setCurrentIndex(prev => prev === 0 ? prev : prev - 1); }}
                    onNext={(e) => { e.stopPropagation(); setCurrentIndex(prev => prev === processedImages.length - 1 ? prev : prev + 1); }}
                />

                {/* Right: Info Section */}
                <div className="w-full md:w-[40%] h-[60%] md:h-full flex flex-col bg-white">
                    <WorkDetailHeader
                        authorId={author.id} // Pass authorId
                        authorName={authorName}
                        authorAvatar={processedAvatar}
                        showFollowButton={false} // Complex logic omitted
                        isFollowing={false}
                        onFollowToggle={() => { }}
                        onEdit={() => setIsEditing(true)}
                        onDelete={handleDelete}
                        authorRole={authorRole}
                        authorRating={authorRating}
                        allowEdit={allowEdit}
                    />

                    <WorkDescriptionSection
                        description={description}
                        createdAt={work?.createdAt || ''}
                        isEditing={isEditing}
                        onSave={handleSaveDescription}
                        onCancelEdit={() => setIsEditing(false)}
                    />

                    <WorkCommentsSection
                        isLiked={isLiked}
                        likeCount={likeCount}
                        comments={comments}
                        onLikeToggle={handleLikeToggle}
                        onPostComment={handlePostComment}
                        currentUserId={tokenManager.getUser()?.id}
                    />
                </div>
            </div>
        </div>
    );
};

export default WorkDetailModal;
