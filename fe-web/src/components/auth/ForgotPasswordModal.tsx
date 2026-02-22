import React, { useState } from 'react';
import { X } from 'lucide-react';
import { authService } from '../../services/authService';

interface ForgotPasswordModalProps {
    onClose: () => void;
    onBack: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onBack }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        setErrorMessage('');

        try {
            await authService.forgotPassword(email);
            setStatus('success');
        } catch (error: any) {
            console.error('Error sending password reset email:', error);
            setStatus('error');
            // Assuming the API returns a message in the error object constructed by handleApiError
            // Ideally authService throws a ServiceError with a message
            setErrorMessage(error.message || '發送失敗，請稍後再試');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center font-sans">
            {/* Background Overlay */}
            <div
                className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-[500px] bg-white rounded-[16px] flex flex-col items-center shadow-2xl p-8 animate-fade-in-up">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-[#191919] mb-2">忘記密碼</h2>
                <p className="text-gray-500 mb-8 text-center text-sm">
                    請輸入您的註冊信箱，我們將發送重設密碼連結給您。
                </p>

                {status === 'success' ? (
                    <div className="flex flex-col items-center w-full">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#191919] mb-2">信件已發送</h3>
                        <p className="text-gray-500 text-center mb-6">
                            請前往您的信箱收信，並依照指示重設密碼。
                        </p>
                        <button
                            onClick={onBack}
                            className="w-full h-[48px] rounded-full bg-[#009bcd] text-white font-bold hover:bg-[#0089b6] transition-colors"
                        >
                            返回登入
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-[#191919] ml-1">信箱</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full h-[48px] bg-[#f7f7f7] border border-[#b3b3b3] rounded-full px-6 text-[#191919] placeholder-gray-400 focus:outline-none focus:border-[#009bcd] transition-all"
                                required
                            />
                        </div>

                        {status === 'error' && (
                            <p className="text-red-500 text-sm text-center">{errorMessage}</p>
                        )}

                        <div className="flex gap-4 mt-4">
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex-1 h-[48px] rounded-full border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="flex-1 h-[48px] rounded-full bg-gradient-to-r from-[#F2994A] to-[#009bcd] text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? '發送中...' : '發送重設信'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
