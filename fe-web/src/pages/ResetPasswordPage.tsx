import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface ResetPasswordPageProps {
    onNavigate: (view: any) => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
    const [token, setToken] = useState<string | null>(null);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = searchParams.get('token');

        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setStatus('error');
            setErrorMessage('無效的重設連結');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage('兩次密碼輸入不一致');
            return;
        }

        if (password.length < 6) {
            setErrorMessage('密碼長度至少需 6 個字元');
            return;
        }

        if (!token) return;

        setStatus('loading');
        setErrorMessage('');

        try {
            await authService.resetPassword(token, password);
            setStatus('success');
            setTimeout(() => {
                onNavigate('login'); // Redirect to login
            }, 3000);
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message || '重設失敗，連結可能已過期');
        }
    };

    if (!token && status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <XIcon />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">無效的連結</h2>
                    <p className="text-gray-500 mb-6">此重設連結無效或已過期，請重新申請。</p>
                    <button
                        onClick={() => onNavigate('selection')}
                        className="w-full h-12 rounded-full bg-[#009bcd] text-white font-bold hover:bg-[#0089b6] transition-colors"
                    >
                        返回首頁
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">

                {status === 'success' ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                            <CheckIcon />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">密碼重設成功</h2>
                        <p className="text-gray-500 mb-6">您的密碼已更新，正在跳轉至登入頁面...</p>
                        <button
                            onClick={() => onNavigate('login')}
                            className="w-full h-12 rounded-full bg-[#009bcd] text-white font-bold hover:bg-[#0089b6] transition-colors"
                        >
                            立即登入
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">設定新密碼</h2>
                            <p className="text-gray-500 text-sm">請輸入您的新密碼以完成重設。</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">新密碼</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 bg-gray-50 border border-gray-300 rounded-full px-10 text-gray-900 focus:outline-none focus:border-[#009bcd] transition-colors"
                                        placeholder="請輸入新密碼"
                                        required
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">確認新密碼</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full h-12 bg-gray-50 border border-gray-300 rounded-full px-10 text-gray-900 focus:outline-none focus:border-[#009bcd] transition-colors"
                                        placeholder="請再次輸入新密碼"
                                        required
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg text-center">
                                    {errorMessage}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="mt-4 w-full h-12 rounded-full bg-gradient-to-r from-[#F2994A] to-[#009bcd] text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                            >
                                {status === 'loading' ? '重設中...' : '確認重設'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default ResetPasswordPage;
