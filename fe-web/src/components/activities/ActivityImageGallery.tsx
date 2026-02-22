import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityImageGalleryProps {
    images: string[];
    isLoading: boolean;
}

const ActivityImageGallery: React.FC<ActivityImageGalleryProps> = ({ images, isLoading }) => {
    const [selectedImage, setSelectedImage] = useState(0);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImage((prev) => (prev === 0 ? prev : prev - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImage((prev) => (prev === images.length - 1 ? prev : prev + 1));
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            </div>
        );
    }

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 overflow-hidden relative">
                <div className="text-gray-500">尚無圖片</div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 overflow-hidden relative">
            <img
                src={images[selectedImage]}
                alt="Activity"
                className="w-full h-full object-contain"
            />

            {selectedImage > 0 && (
                <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            {selectedImage < images.length - 1 && (
                <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                >
                    <ChevronRight size={24} />
                </button>
            )}

            {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_: any, idx: number) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${selectedImage === idx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivityImageGallery;
