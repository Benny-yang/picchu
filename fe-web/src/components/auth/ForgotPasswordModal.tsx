import React, { useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';

interface ForgotPasswordModalProps {
    onClose: () => void;
    onBack?: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onBack }) => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = () => {
        // TODO: Implement actual password reset API call
        setIsSubmitted(true);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-[#191919] opacity-50" onClick={onClose} />

            {/* Modal Card */}
            <div className="relative w-[343px] md:w-[616px] bg-white rounded-[16px] flex flex-col items-center shadow-xl p-8 animate-in fade-in zoom-in duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#666666] hover:text-[#191919]"
                >
                    <X size={24} />
                </button>

                {/* Back Button (if provided) */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="absolute top-4 left-4 flex items-center text-[#666666] hover:text-[#191919] transition-colors gap-1"
                    >
                        <ChevronLeft size={24} />
                        <span className="text-[16px]">返回</span>
                    </button>
                )}

                {!isSubmitted ? (
                    <>
                        <h2 className="text-[24px] font-bold text-[#191919] mb-6 mt-4">忘記密碼</h2>
                        <p className="text-[14px] text-[#666666] mb-8 text-center max-w-[80%]">
                            請輸入您註冊的電子信箱，我們將寄送重設密碼連結給您。
                        </p>

                        <div className="w-full max-w-[320px] flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[16px] font-bold text-[#191919] text-left">信箱</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@mail.com"
                                    className="w-full h-[40px] bg-[#f7f7f7] border border-[#b3b3b3] rounded-full px-4 text-[#191919] placeholder-[#b3b3b3] focus:outline-none focus:border-[#009bcd] transition-colors"
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!email}
                                className="w-full h-[48px] rounded-full bg-[#009bcd] text-white font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed mt-4"
                            >
                                發送重設連結
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-[80px] h-[80px] rounded-full bg-[#34C759] flex items-center justify-center mb-6 mt-4">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h2 className="text-[24px] font-bold text-[#191919] mb-4">發送成功</h2>
                        <p className="text-[14px] text-[#666666] mb-8 text-center">
                            請前往您的電子信箱確認重設密碼信件。
                        </p>
                        <button
                            onClick={onClose}
                            className="w-[192px] h-[48px] rounded-full text-white font-bold text-[16px] flex items-center justify-center transition-all hover:opacity-90 shadow-md"
                            style={{ background: "linear-gradient(90deg, #FFAF3C 0%, #73AA8C 50%, #009BCD 100%)" }}
                        >
                            確定
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
