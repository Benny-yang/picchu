import React from 'react';

const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md mx-auto">
                <div className="relative mb-8">
                    <h1 className="text-[120px] font-bold text-[#e0e0e0] leading-none select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-[#191919] bg-[#f8f9fa] px-4">找不到頁面</span>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-[#191919] mb-4">Ooops! 您迷路了嗎？</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    您所尋找的頁面似乎已經被移除、更名或暫時無法使用。
                </p>

                <button
                    onClick={() => window.location.href = '?view=works-wall'}
                    className="px-8 py-3 bg-[#191919] text-white rounded-full font-bold hover:bg-[#333] transition-transform transform hover:scale-105 active:scale-95 shadow-lg"
                >
                    返回首頁
                </button>
            </div>
        </div>
    );
};

export default NotFoundPage;
