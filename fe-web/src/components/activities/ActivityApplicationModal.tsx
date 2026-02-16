import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ActivityApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (message: string) => void;
    activityTitle: string;
    activityTime: string;
    currentParticipants: number;
    maxParticipants: number;
}

const ActivityApplicationModal: React.FC<ActivityApplicationModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    activityTitle,
    activityTime,
    currentParticipants,
    maxParticipants
}) => {
    const [reason, setReason] = useState("");
    const maxLength = 100;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-lg p-8 relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Title */}
                {/* Title */}
                <h2 className="text-xl font-bold text-center mb-8 text-[#191919]">參加活動申請</h2>

                {/* Info Fields */}
                <div className="space-y-4 mb-8">
                    <div className="flex text-lg text-[#666666]">
                        <span className="w-24 flex-shrink-0">活動名稱:</span>
                        <span className="text-[#191919] font-bold">{activityTitle}</span>
                    </div>
                    <div className="flex text-lg text-[#666666]">
                        <span className="w-24 flex-shrink-0">活動時間:</span>
                        <span className="text-[#191919] tracking-wider">{activityTime}</span>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-6 text-lg text-[#666666] mt-2">
                        <div>
                            已參加: <span className="text-[#191919] font-bold">{currentParticipants}</span>
                        </div>
                        <div>
                            人數上限: <span className="text-[#191919] font-bold">{maxParticipants}</span>
                        </div>
                    </div>
                </div>

                {/* Textarea */}
                <div className="relative mb-8">
                    <textarea
                        className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-[#009bcd] text-[#191919] placeholder-gray-300"
                        placeholder="輸入您申請的原因"
                        value={reason}
                        onChange={(e) => setReason(e.target.value.slice(0, maxLength))}
                    />
                    <div className="absolute bottom-3 right-3 text-gray-400 text-sm">
                        {reason.length} / {maxLength}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        className="w-40 py-2.5 rounded-full text-white font-bold text-lg shadow-md hover:shadow-lg hover:opacity-95 transition-all transform active:scale-95"
                        style={{ background: "linear-gradient(90deg, #FDBB2D 0%, #22C1C3 100%)" }}
                        onClick={() => {
                            onSubmit(reason);
                            onClose();
                        }}
                    >
                        送出
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ActivityApplicationModal;
