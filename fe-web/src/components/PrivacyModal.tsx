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
                className="absolute inset-0 bg-[#191919] opacity-50"
                onClick={onClose}
            />

            {/* Close Button - Outer mask */}
            <button
                onClick={onClose}
                className="absolute right-8 top-8 z-[70] p-2 hover:opacity-80 transition-opacity"
            >
                <X size={32} color="white" />
            </button>

            {/* Modal Card */}
            <div className="relative w-[864px] h-[80vh] max-h-[800px] bg-white rounded-[16px] flex flex-col shadow-xl overflow-hidden z-[70]">
                {/* Header */}
                <div className="flex justify-center items-center px-8 py-6 border-b border-[#e6e6e6]">
                    <div className="text-[24px] font-bold text-[#191919]">隱私權條款</div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-10 py-8 bg-[#f7f7f7]">


                    <PrivacyContent />
                </div>
            </div>
        </div>
    );
};

export default PrivacyModal;
