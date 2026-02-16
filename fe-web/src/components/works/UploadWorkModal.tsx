import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import { workService } from '../../services/workService';

interface UploadWorkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: (newWork: any) => void;
}

const UploadWorkModal: React.FC<UploadWorkModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
    const [description, setDescription] = useState('');
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFiles = (files: FileList | null) => {
        if (!files) return;

        const newImages: string[] = [];
        const fileList = Array.from(files);

        // Limit total images to 5
        const remainingSlots = 5 - selectedImages.length;
        const filesToProcess = fileList.slice(0, remainingSlots);

        if (fileList.length > remainingSlots) {
            alert(`最多只能上傳 5 張照片，已略過 ${fileList.length - remainingSlots} 張`);
        }

        let processedCount = 0;
        filesToProcess.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newImages.push(reader.result as string);
                    processedCount++;
                    if (processedCount === filesToProcess.length) {
                        setSelectedImages(prev => [...prev, ...newImages]);
                    }
                };
                reader.readAsDataURL(file);
            } else {
                processedCount++;
            }
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const setAsCover = (index: number) => {
        if (index === 0) return;
        setSelectedImages(prev => {
            const newImages = [...prev];
            const selected = newImages[index];
            newImages.splice(index, 1);
            newImages.unshift(selected);
            return newImages;
        });
    };

    const handleSubmit = async () => {
        if (selectedImages.length === 0) return;

        setIsUploading(true);
        try {
            // Send base64 images to backend
            const imageDataList = selectedImages.map(img => {
                // Extract base64 data if it's a data URL
                if (img.startsWith('data:')) {
                    return img.split(',')[1];
                }
                return img;
            });

            const newWork = await workService.create({
                description: description,
                images: imageDataList,
            });

            onUploadSuccess(newWork);
            resetForm();
            onClose();
        } catch (error: any) {
            alert('上傳失敗：' + (error.message || '未知錯誤'));
        } finally {
            setIsUploading(false);
        }
    };

    const resetForm = () => {
        setDescription('');
        setSelectedImages([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-[600px] bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-lg font-bold text-[#191919]">上傳新作品</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Image Upload Area */}
                    <div>
                        <label className="block text-sm font-semibold text-[#191919] mb-2">
                            作品照片 (最多5張)
                        </label>

                        {selectedImages.length === 0 ? (
                            <div
                                className={`
                                    border-2 border-dashed rounded-xl aspect-[4/3] flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden
                                    ${isDragging ? 'border-[#009bcd] bg-[#effaff]' : 'border-gray-200 hover:border-[#009bcd] hover:bg-gray-50'}
                                `}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
                                    <ImageIcon size={32} />
                                </div>
                                <p className="text-sm font-semibold text-[#191919] mb-1">點擊或拖曳圖片至此</p>
                                <p className="text-xs text-gray-400">支援 JPG, PNG (建議尺寸 1080x1350)</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <div className="grid grid-cols-3 gap-3">
                                    {selectedImages.map((img, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                            <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />

                                            {/* Cover Badge or Set Cover Button */}
                                            {index === 0 ? (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-1 text-center backdrop-blur-sm">
                                                    封面照片
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setAsCover(index)}
                                                    className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-1 text-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#009bcd]/80"
                                                >
                                                    設為封面
                                                </button>
                                            )}

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage(index);
                                                }}
                                                className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-black/30 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add More Button */}
                                    {selectedImages.length < 5 && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-[#009bcd] hover:bg-[#effaff] text-gray-400 hover:text-[#009bcd] transition-all"
                                        >
                                            <Plus size={24} />
                                            <span className="text-xs mt-1 font-medium">新增</span>
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 text-right">已選擇 {selectedImages.length}/5 張</p>
                            </div>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                        />
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="block text-sm font-semibold text-[#191919] mb-2">作品描述</label>
                        <textarea
                            className="w-full h-24 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-[#009bcd] focus:ring-1 focus:ring-[#009bcd] placeholder-gray-400"
                            placeholder="寫下關於這張作品的故事... #標籤"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={selectedImages.length === 0 || isUploading}
                        className={`
                            px-6 py-2 text-sm font-semibold text-white rounded-lg transition-all flex items-center gap-2
                            ${selectedImages.length === 0 || isUploading
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-[#009bcd] hover:bg-[#0089b5] active:scale-95 shadow-sm hover:shadow'
                            }
                        `}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                上傳中...
                            </>
                        ) : (
                            <>
                                <Upload size={16} />
                                發布作品
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadWorkModal;
