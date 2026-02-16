import React from 'react';
import { X } from 'lucide-react';
import PrivacyContent from './PrivacyContent';

interface PrivacyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-grey-black opacity-50"
                onClick={onClose}
            />

            {/* Close Button - Outer mask */}
            <button
                onClick={onClose}
                className="absolute right-8 top-8 z-[70] p-2 hover:opacity-80 transition-opacity duration-200"
            >
                <X size={32} color="white" />
            </button>

            {/* Modal Card */}
            <div className="relative w-[864px] h-[80vh] max-h-[800px] bg-white rounded-[16px] flex flex-col shadow-xl overflow-hidden z-[70]">
                {/* Header */}
                <div className="flex justify-center items-center px-8 py-6 border-b border-gray-200">
                    <div className="text-[24px] font-bold text-grey-black">隱私權政策</div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-10 py-8 bg-[#f7f7f7]">
                    <p className="text-grey-1 text-[16px] mb-8 font-normal leading-[1.5]">
                        本隱私權政策自 2019 年 9 月 1 日起生效。
                    </p>

                    <div className="text-grey-1 text-[16px] font-normal leading-[1.8] space-y-4 whitespace-pre-wrap">
                        <PrivacyContent />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyModal;
