import React from 'react';
import { Check } from 'lucide-react';

interface SmsSuccessStepProps {
    onNext: () => void;
}

const SmsSuccessStep: React.FC<SmsSuccessStepProps> = ({ onNext }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-[#191919] opacity-50" />

            {/* Modal Card */}
            <div className="relative w-[343px] md:w-[616px] h-[536px] bg-white rounded-[16px] flex flex-col items-center justify-center shadow-xl overflow-hidden px-4">

                {/* Success Icon */}
                <div className="relative w-[120px] h-[120px] mb-8 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[3px] border-[#34C759] opacity-20"></div>
                    <div className="w-[80px] h-[80px] rounded-full bg-[#34C759] flex items-center justify-center">
                        <Check size={48} color="white" strokeWidth={3} />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-[18px] font-bold text-[#666666] mb-8 font-['Noto_Sans']">
                    下一步，設定基本資料
                </h2>

                {/* Confirm Button */}
                <button
                    onClick={onNext}
                    className="w-[192px] h-[48px] rounded-full text-white font-bold text-[16px] flex items-center justify-center transition-all hover:opacity-90 shadow-md"
                    style={{ background: "linear-gradient(90deg, #FFAF3C 0%, #73AA8C 50%, #009BCD 100%)" }}
                >
                    確定
                </button>
            </div>
        </div>
    );
};

export default SmsSuccessStep;
