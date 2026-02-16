import React, { useState } from 'react';


interface SmsVerifyStepProps {
    onBack?: () => void;
    onNext: () => void;
    phoneNumber: string;
}

const SmsVerifyStep: React.FC<SmsVerifyStepProps> = ({ onBack, onNext, phoneNumber }) => {
    const [code, setCode] = useState("");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
            {/* Overlay */}
            <div className="absolute inset-0 bg-[#191919] opacity-50" />

            {/* Modal Card - 616x536 */}
            <div className="relative w-[616px] h-[536px] bg-white rounded-[16px] flex flex-col items-center shadow-xl overflow-hidden animate-fade-in-up">

                {/* Back Button - Top Left */}
                <button
                    onClick={onBack}
                    className="absolute top-6 left-6 flex items-center text-[#666666] hover:text-[#191919] transition-colors gap-2"
                >
                    <div className="w-[8.8px] h-[16px]">
                        <svg width="100%" height="100%" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path id="Vector" d="M7.88124 16C7.7601 16.0001 7.64014 15.9758 7.52828 15.9286C7.41641 15.8814 7.31485 15.8122 7.22945 15.725L0.270816 8.65866C0.184903 8.57194 0.116744 8.46876 0.0702641 8.35516C0.0237842 8.24157 -9.57002e-05 8.11971 2.88232e-07 7.9967C0.00102517 7.74986 0.0984165 7.51354 0.270816 7.33952L7.22945 0.273229C7.31474 0.186615 7.41599 0.117885 7.52744 0.07101C7.63888 0.0241348 7.75832 2.32855e-08 7.87894 0C7.99957 -2.32854e-08 8.11901 0.0241348 8.23045 0.07101C8.34189 0.117885 8.44316 0.186615 8.52845 0.273229C8.61374 0.359843 8.68141 0.462651 8.72757 0.575818C8.77373 0.688985 8.79748 0.810312 8.79748 0.932802C8.79748 1.05529 8.77372 1.17651 8.72756 1.28967C8.6814 1.40284 8.61374 1.50565 8.52845 1.59226L2.21703 7.9967L8.52845 14.4058C8.65764 14.5359 8.74583 14.7021 8.78184 14.8832C8.81785 15.0643 8.80005 15.2522 8.7307 15.423C8.66135 15.5939 8.54357 15.7399 8.39233 15.8426C8.24109 15.9453 8.06319 16.0001 7.88124 16V16Z" fill="#666666" />
                        </svg>
                    </div>
                    <span className="text-[16px]">返回</span>
                </button>

                {/* Content */}
                <div className="flex flex-col items-center mt-[50px]">
                    {/* Logo Section */}
                    <div className="w-[64px] h-[77px] flex items-center justify-center mb-6">
                        <svg width="100%" height="100%" viewBox="0 0 64 77" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                            <path id="img_Logo" d="M63.7138 33.9795C63.9052 32.5245 64.0008 31.0588 64 29.5917C64 9.27038 48.7072 0 34.4968 0H18.8086C13.8405 0 9.07588 1.93512 5.56291 5.37965C2.04994 8.82419 0.0763719 13.496 0.0763719 18.3673V29.0407C-0.0254573 29.3735 -0.0254573 29.7283 0.0763719 30.0611V64.5151C0.0535001 66.1531 0.364107 67.7791 0.990006 69.2979C1.6159 70.8167 2.54452 72.1978 3.72149 73.3604C4.89847 74.523 6.30015 75.4437 7.84448 76.0686C9.38881 76.6935 11.0448 77.0101 12.7154 76.9998C19.8232 76.9998 24.9798 71.7498 24.9798 64.5151V58.4437H34.4968C42.0157 58.4437 49.3837 55.7753 54.7067 51.1223C59.4607 46.9643 62.5886 41.3121 63.5525 35.1376C63.7346 34.7795 63.7913 34.3724 63.7138 33.9795V33.9795ZM18.8086 3.67346H34.4968C52.1883 3.67346 60.2692 17.1122 60.2692 29.5917C60.2692 29.8264 60.2692 30.056 60.2692 30.2907C57.2876 27.9081 52.308 24.8316 46.22 24.4846C40.4443 24.1581 34.9547 26.3009 29.871 30.8928C25.0787 35.1785 20.3071 37.0815 15.7021 36.505C9.4841 35.7703 5.10285 30.7346 3.82281 29.0815V18.3673C3.82694 14.4715 5.40712 10.7364 8.2166 7.98166C11.0261 5.22691 14.8354 3.67751 18.8086 3.67346V3.67346ZM34.4968 54.7702H23.1274C22.8823 54.7702 22.6397 54.8176 22.4133 54.9098C22.187 55.0019 21.9814 55.1369 21.8083 55.307C21.6353 55.4772 21.4982 55.6791 21.4049 55.9013C21.3116 56.1235 21.2639 56.3616 21.2646 56.6019V64.5151C21.2646 69.709 17.7523 73.3416 12.731 73.3416C7.15298 73.3416 3.82281 68.8518 3.82281 64.5151V34.5305C6.39849 36.8927 10.2698 39.5662 15.213 40.1529C15.9036 40.2357 16.5986 40.2783 17.2944 40.2805C22.3521 40.2805 27.4202 38.0305 32.3842 33.5713C36.6874 29.7091 41.23 27.8724 45.913 28.1377C52.6306 28.505 57.9485 33.0509 59.7644 34.806C57.3917 47.9335 45.8766 54.7702 34.4968 54.7702Z" fill="url(#paint0_linear_logo_sms)" />
                            <defs>
                                <linearGradient id="paint0_linear_logo_sms" x1="5.69087" y1="59.2146" x2="61.1343" y2="29.0529" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#FFAF3C" />
                                    <stop offset="0.5" stopColor="#73AA8C" />
                                    <stop offset="1" stopColor="#009BCD" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <h2 className="text-[16px] font-bold text-[#191919] mb-2">輸入驗證碼</h2>
                    <p className="text-[#666666] text-[14px] mb-6 font-normal">
                        已發送至 +886 {phoneNumber}
                    </p>

                    {/* Input Field */}
                    <div className="flex gap-3 mb-6">
                        <input
                            type="text"
                            maxLength={6}
                            value={code}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setCode(val);
                            }}
                            className="w-[200px] h-[48px] bg-[#f7f7f7] border border-[#b3b3b3] rounded-full px-4 text-center text-[24px] tracking-[0.5em] text-[#191919] outline-none focus:border-[#009bcd] font-medium"
                            placeholder="------"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="mt-[30px]">
                        <button
                            onClick={onNext}
                            disabled={code.length < 4}
                            className="w-[192px] h-[48px] rounded-[50px] text-white font-bold text-[16px] flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md bg-gradient-to-r from-[#FFAF3C] via-[#73AA8C] to-[#009BCD]"
                        >
                            確定
                        </button>
                    </div>

                    {/* Footer Text */}
                    <div className="mt-[40px] flex flex-col items-center gap-1">
                        <p className="text-[#666666] text-[14px]">
                            等待 <span className="text-[#e52e2e]">0秒</span> 後，即可重新傳送驗證碼
                        </p>
                        <button className="text-[#009bcd] text-[16px] hover:underline font-normal">
                            重新傳送
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmsVerifyStep;
