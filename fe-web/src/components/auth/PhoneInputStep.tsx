import React, { useState } from 'react';
// import { ChevronLeft } from 'lucide-react'; // Removing ChevronLeft as Figma uses a Close button

interface PhoneInputStepProps {
    onBack?: () => void; // Keeping prop name for compatibility, but it acts as Close
    onNext: (phone: string) => void;
}

const PhoneInputStep: React.FC<PhoneInputStepProps> = ({ onBack, onNext }) => {
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");

    const validatePhone = (value: string) => {
        const regex = /^09\d{8}$/;
        return regex.test(value);
    };

    const handleNext = () => {
        if (validatePhone(phone)) {
            setError("");
            onNext(phone);
        } else {
            setError("請輸入有效的手機號碼 (格式: 09xxxxxxxx)");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
            {/* Overlay */}
            <div className="absolute inset-0 bg-[#191919] opacity-50" onClick={onBack} />

            {/* Modal Card - 616x536 */}
            <div className="relative w-[616px] h-[536px] bg-white rounded-[16px] flex flex-col items-center shadow-xl overflow-hidden animate-fade-in-up">

                {/* Close Button - Top Right (Node 197:1738 calls for a close icon, likely acting as 'Back' or 'Close') */}
                <button
                    onClick={onBack}
                    className="absolute top-6 right-6 flex items-center justify-center text-[#666666] hover:text-[#191919] transition-colors"
                >
                    {/* Authentic Close Icon SVG from Figma */}
                    <div className="w-6 h-6">
                        <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path id="Subtract" fillRule="evenodd" clipRule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4.53553 4.53553C4.92606 4.145 5.55922 4.145 5.94975 4.53553L8.07107 6.65685L10.1924 4.53553C10.5829 4.145 11.2161 4.145 11.6066 4.53553C11.9971 4.92605 11.9971 5.55922 11.6066 5.94974L9.48528 8.07106L11.6066 10.1924C11.9971 10.5829 11.9971 11.2161 11.6066 11.6066C11.2161 11.9971 10.5829 11.9971 10.1924 11.6066L8.07107 9.48527L5.94975 11.6066C5.55922 11.9971 4.92606 11.9971 4.53553 11.6066C4.14501 11.2161 4.14501 10.5829 4.53553 10.1924L6.65685 8.07106L4.53553 5.94974C4.14501 5.55922 4.14501 4.92605 4.53553 4.53553Z" fill="#666666" />
                        </svg>
                    </div>
                </button>

                {/* Content */}
                <div className="flex flex-col items-center mt-[50px]">
                    {/* Logo Section */}
                    <div className="w-[64px] h-[77px] flex items-center justify-center mb-6">
                        <svg width="100%" height="100%" viewBox="0 0 64 77" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                            <path id="img_Logo" d="M63.7138 33.9795C63.9052 32.5245 64.0008 31.0588 64 29.5917C64 9.27038 48.7072 0 34.4968 0H18.8086C13.8405 0 9.07588 1.93512 5.56291 5.37965C2.04994 8.82419 0.0763719 13.496 0.0763719 18.3673V29.0407C-0.0254573 29.3735 -0.0254573 29.7283 0.0763719 30.0611V64.5151C0.0535001 66.1531 0.364107 67.7791 0.990006 69.2979C1.6159 70.8167 2.54452 72.1978 3.72149 73.3604C4.89847 74.523 6.30015 75.4437 7.84448 76.0686C9.38881 76.6935 11.0448 77.0101 12.7154 76.9998C19.8232 76.9998 24.9798 71.7498 24.9798 64.5151V58.4437H34.4968C42.0157 58.4437 49.3837 55.7753 54.7067 51.1223C59.4607 46.9643 62.5886 41.3121 63.5525 35.1376C63.7346 34.7795 63.7913 34.3724 63.7138 33.9795V33.9795ZM18.8086 3.67346H34.4968C52.1883 3.67346 60.2692 17.1122 60.2692 29.5917C60.2692 29.8264 60.2692 30.056 60.2692 30.2907C57.2876 27.9081 52.308 24.8316 46.22 24.4846C40.4443 24.1581 34.9547 26.3009 29.871 30.8928C25.0787 35.1785 20.3071 37.0815 15.7021 36.505C9.4841 35.7703 5.10285 30.7346 3.82281 29.0815V18.3673C3.82694 14.4715 5.40712 10.7364 8.2166 7.98166C11.0261 5.22691 14.8354 3.67751 18.8086 3.67346V3.67346ZM34.4968 54.7702H23.1274C22.8823 54.7702 22.6397 54.8176 22.4133 54.9098C22.187 55.0019 21.9814 55.1369 21.8083 55.307C21.6353 55.4772 21.4982 55.6791 21.4049 55.9013C21.3116 56.1235 21.2639 56.3616 21.2646 56.6019V64.5151C21.2646 69.709 17.7523 73.3416 12.731 73.3416C7.15298 73.3416 3.82281 68.8518 3.82281 64.5151V34.5305C6.39849 36.8927 10.2698 39.5662 15.213 40.1529C15.9036 40.2357 16.5986 40.2783 17.2944 40.2805C22.3521 40.2805 27.4202 38.0305 32.3842 33.5713C36.6874 29.7091 41.23 27.8724 45.913 28.1377C52.6306 28.505 57.9485 33.0509 59.7644 34.806C57.3917 47.9335 45.8766 54.7702 34.4968 54.7702Z" fill="url(#paint0_linear_logo_phone)" />
                            <defs>
                                <linearGradient id="paint0_linear_logo_phone" x1="5.69087" y1="59.2146" x2="61.1343" y2="29.0529" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#FFAF3C" />
                                    <stop offset="0.5" stopColor="#73AA8C" />
                                    <stop offset="1" stopColor="#009BCD" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <h2 className="text-[16px] font-bold text-[#191919] mb-10">請輸入手機號碼</h2>

                    {/* Input Field - 280px width */}
                    <div className={`w-[280px] bg-[#f7f7f7] border ${error ? 'border-red-500' : 'border-[#009bcd]'} rounded-full px-4 py-2 flex items-center gap-2 mb-6 h-[48px]`}>
                        <span className="text-[#191919] text-[16px] font-bold border-r border-[#b3b3b3] pr-2">+886</span>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, ''); // Only allow numbers
                                setPhone(val);
                                if (error) setError("");
                            }}
                            className="bg-transparent border-none outline-none text-[16px] text-[#191919] flex-1 placeholder-gray-400"
                            placeholder="0912345678"
                            maxLength={10}
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs mb-4 text-center w-[280px]">{error}</p>}

                    {/* Submit Button */}
                    <div className="mt-[40px]">
                        <button
                            onClick={handleNext}
                            disabled={!phone}
                            className="px-[56px] py-[9px] rounded-[50px] text-white font-bold text-[16px] flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md bg-gradient-to-r from-[#FFAF3C] via-[#73AA8C] to-[#009BCD]"
                        >
                            傳送驗證碼
                        </button>
                    </div>

                    <p className="text-[#666666] text-[14px] mt-[24px] text-center">
                        您將會收到 SMS 認證碼簡訊，請於五分鐘內輸入完畢。
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PhoneInputStep;
