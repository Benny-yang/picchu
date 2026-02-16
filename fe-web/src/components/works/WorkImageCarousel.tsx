import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WorkImageCarouselProps {
    images: string[];
    currentIndex: number;
    onPrev: (e: React.MouseEvent) => void;
    onNext: (e: React.MouseEvent) => void;
}

const WorkImageCarousel: React.FC<WorkImageCarouselProps> = ({ images, currentIndex, onPrev, onNext }) => {
    return (
        <div className="w-full md:w-[60%] h-[40%] md:h-full bg-black relative flex items-center justify-center group">
            <img
                src={images[currentIndex]}
                alt={`Work Detail ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
            />

            {/* Left Arrow */}
            {currentIndex > 0 && (
                <button
                    onClick={onPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            {/* Right Arrow */}
            {currentIndex < images.length - 1 && (
                <button
                    onClick={onNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                >
                    <ChevronRight size={24} />
                </button>
            )}

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {images.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default WorkImageCarousel;
