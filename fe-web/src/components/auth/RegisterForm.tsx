import React, { useState } from 'react';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';

interface RegisterFormProps {
    onGenericClick?: () => void; // For "Back" functionality
    onClose?: () => void;
    onSubmit?: (data: any) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onGenericClick, onSubmit, onClose }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isResending, setIsResending] = useState(false);

    const handleResend = async () => {
        setIsResending(true);
        try {
            await authService.resendVerification(formData.email);
            alert('驗證信已重新發送！');
        } catch (error: any) {
            const message = error?.message || '發送失敗，請稍後再試';
            alert(message);
        } finally {
            setIsResending(false);
        }
    };

    const handleSubmit = async () => {
        if (!onSubmit) return;
        setErrorMessage('');
        try {
            await onSubmit(formData);
            setIsSuccess(true);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || '註冊失敗';
            setErrorMessage(message);
        }
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
                <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
                <div className="relative w-full max-w-[600px] bg-white rounded-[32px] flex flex-col items-center shadow-2xl p-12 mx-4 animate-fade-in-up min-h-[400px] justify-center text-center">
                    <h2 className="text-2xl font-bold text-[#191919] mb-4">註冊成功！</h2>
                    <p className="text-gray-600 mb-8">驗證信已發送至 {formData.email}<br />請前往信箱點擊連結以啟用帳號。</p>
                    <div className="flex flex-col gap-3 items-center">
                        <button
                            onClick={onClose}
                            className="w-[140px] h-[50px] rounded-full bg-[#009bcd] text-white font-bold text-lg hover:bg-[#0089b6] transition-colors"
                        >
                            我知道了
                        </button>
                        <button
                            onClick={handleResend}
                            disabled={isResending}
                            className={`text-[#009bcd] text-sm underline hover:text-[#0089b6] transition-colors ${isResending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isResending ? '發送中...' : '沒收到驗證信？重新發送'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
            {/* Background Overlay */}
            <div
                className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-[600px] bg-white rounded-[32px] flex flex-col items-center shadow-2xl p-12 mx-4 animate-fade-in-up min-h-[600px]">

                {/* Header: Back Button */}
                <div className="absolute top-8 left-8">
                    <button
                        onClick={onGenericClick}
                        className="flex items-center text-gray-500 hover:text-[#191919] transition-colors gap-1"
                    >
                        <ChevronLeft size={24} />
                        <span className="text-base font-medium">返回</span>
                    </button>
                </div>

                {/* Logo Section */}
                <div className="flex flex-col items-center mt-6 mb-8">
                    {/* Authentic Figma Logo for Register Page */}
                    <div className="w-[64px] h-[77px] flex items-center justify-center mb-4">
                        <svg width="100%" height="100%" viewBox="0 0 64 77" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                            <path id="img_Logo" d="M63.7138 33.9795C63.9052 32.5245 64.0008 31.0588 64 29.5917C64 9.27038 48.7072 0 34.4968 0H18.8086C13.8405 0 9.07588 1.93512 5.56291 5.37965C2.04994 8.82419 0.0763719 13.496 0.0763719 18.3673V29.0407C-0.0254573 29.3735 -0.0254573 29.7283 0.0763719 30.0611V64.5151C0.0535001 66.1531 0.364107 67.7791 0.990006 69.2979C1.6159 70.8167 2.54452 72.1978 3.72149 73.3604C4.89847 74.523 6.30015 75.4437 7.84448 76.0686C9.38881 76.6935 11.0448 77.0101 12.7154 76.9998C19.8232 76.9998 24.9798 71.7498 24.9798 64.5151V58.4437H34.4968C42.0157 58.4437 49.3837 55.7753 54.7067 51.1223C59.4607 46.9643 62.5886 41.3121 63.5525 35.1376C63.7346 34.7795 63.7913 34.3724 63.7138 33.9795V33.9795ZM18.8086 3.67346H34.4968C52.1883 3.67346 60.2692 17.1122 60.2692 29.5917C60.2692 29.8264 60.2692 30.056 60.2692 30.2907C57.2876 27.9081 52.308 24.8316 46.22 24.4846C40.4443 24.1581 34.9547 26.3009 29.871 30.8928C25.0787 35.1785 20.3071 37.0815 15.7021 36.505C9.4841 35.7703 5.10285 30.7346 3.82281 29.0815V18.3673C3.82694 14.4715 5.40712 10.7364 8.2166 7.98166C11.0261 5.22691 14.8354 3.67751 18.8086 3.67346V3.67346ZM34.4968 54.7702H23.1274C22.8823 54.7702 22.6397 54.8176 22.4133 54.9098C22.187 55.0019 21.9814 55.1369 21.8083 55.307C21.6353 55.4772 21.4982 55.6791 21.4049 55.9013C21.3116 56.1235 21.2639 56.3616 21.2646 56.6019V64.5151C21.2646 69.709 17.7523 73.3416 12.731 73.3416C7.15298 73.3416 3.82281 68.8518 3.82281 64.5151V34.5305C6.39849 36.8927 10.2698 39.5662 15.213 40.1529C15.9036 40.2357 16.5986 40.2783 17.2944 40.2805C22.3521 40.2805 27.4202 38.0305 32.3842 33.5713C36.6874 29.7091 41.23 27.8724 45.913 28.1377C52.6306 28.505 57.9485 33.0509 59.7644 34.806C57.3917 47.9335 45.8766 54.7702 34.4968 54.7702Z" fill="url(#paint0_linear_3728_4659_reg)" />
                            <defs>
                                <linearGradient id="paint0_linear_3728_4659_reg" x1="5.69087" y1="59.2146" x2="61.1343" y2="29.0529" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#FFAF3C" />
                                    <stop offset="0.5" stopColor="#73AA8C" />
                                    <stop offset="1" stopColor="#009BCD" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                {/* Form Section */}
                <div className="w-full max-w-[320px] flex flex-col gap-5">
                    {/* Error Message */}
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">
                            {errorMessage}
                        </div>
                    )}
                    {/* Email Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-bold text-[#191919] ml-1">註冊信箱</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@mail.com"
                            className="w-full h-[48px] bg-[#f7f7f7] border border-[#b3b3b3] rounded-full px-6 text-[#191919] placeholder-gray-400 focus:outline-none focus:border-[#009bcd] transition-all"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-bold text-[#191919] ml-1">密碼</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="6-12碼大小寫英數"
                                className="w-full h-[48px] bg-[#f7f7f7] border border-[#b3b3b3] rounded-full px-6 pr-12 text-[#191919] placeholder-gray-400 focus:outline-none focus:border-[#009bcd] transition-all"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-bold text-[#191919] ml-1">再次輸入密碼</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="請再次輸入密碼"
                                className="w-full h-[48px] bg-[#f7f7f7] border border-[#b3b3b3] rounded-full px-6 pr-12 text-[#191919] placeholder-gray-400 focus:outline-none focus:border-[#009bcd] transition-all"
                            />
                            <button
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 w-full max-w-[320px] flex justify-center">
                    <button
                        onClick={handleSubmit}
                        className="w-[140px] h-[50px] rounded-full bg-[#009bcd] text-white font-bold text-lg hover:bg-[#0089b6] transition-colors shadow-lg shadow-blue-500/20"
                    >
                        送出
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RegisterForm;
