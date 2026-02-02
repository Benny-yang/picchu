import React, { useState } from 'react';
import { X, Star, Users } from 'lucide-react';

interface ApplicationManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    activityId?: number;
}

interface Applicant {
    id: string;
    username: string;
    avatar: string;
    role: string;
    rating: number;
    status: 'pending' | 'accepted' | 'rejected';
    message: string;
}

const ApplicationManagementModal: React.FC<ApplicationManagementModalProps> = ({ isOpen, onClose }) => {
    // Mock Data
    const [applicants, setApplicants] = useState<Applicant[]>([
        {
            id: '1',
            username: 'kiki_one',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kiki',
            role: '模特兒',
            rating: 4.8,
            status: 'accepted',
            message: '對拍攝主題很有興趣，街頭攝影經驗兩年，希望可以入團一起拍攝一起交流經驗知識，互相分享～'
        },
        {
            id: '2',
            username: 'hellokitty239',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hello',
            role: '模特兒',
            rating: 4.8,
            status: 'rejected',
            message: '你好，我有興趣參加。'
        },
        {
            id: '3',
            username: 'sally_yoyo22',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sally',
            role: '模特兒',
            rating: 4.8,
            status: 'pending',
            message: '希望能有機會合作！我的風格與這次主題很搭。'
        },
        {
            id: '4',
            username: 'john_13579',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
            role: '攝影師',
            rating: 4.8,
            status: 'pending',
            message: '我是專職人像攝影師，作品集請參考我的個人頁面。'
        },
        {
            id: '5',
            username: 'nanami_misoto',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nanami',
            role: '攝影師',
            rating: 4.8,
            status: 'pending',
            message: '新手攝影師，希望能多練習。'
        }
    ]);

    const [selectedApplicantId, setSelectedApplicantId] = useState<string>('1');

    if (!isOpen) return null;

    const selectedApplicant = applicants.find(a => a.id === selectedApplicantId);

    const handleUpdateStatus = (id: string, newStatus: 'accepted' | 'rejected') => {
        setApplicants(prev => prev.map(app =>
            app.id === id ? { ...app, status: newStatus } : app
        ));
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-4xl h-[600px] overflow-hidden flex shadow-2xl relative">

                {/* Close Button Mobile - showing generally on top right of modal */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={24} className="text-gray-500" />
                </button>

                {/* Left: List */}
                <div className="w-1/3 border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-center text-[#191919]">審核名單</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {applicants.map(app => (
                            <div
                                key={app.id}
                                onClick={() => setSelectedApplicantId(app.id)}
                                className={`p-4 flex items-center justify-between cursor-pointer transition-colors border-b border-gray-100 ${selectedApplicantId === app.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                        <img src={app.avatar} alt={app.username} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-[#191919]">{app.username}</div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <span>{app.role}</span>
                                            <div className="flex items-center text-yellow-500">
                                                <Star size={10} fill="currentColor" />
                                                <span className="ml-[1px]">{app.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div>
                                    {app.status === 'accepted' && (
                                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">同意</span>
                                    )}
                                    {app.status === 'rejected' && (
                                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">不同意</span>
                                    )}
                                    {app.status === 'pending' && (
                                        <span className="px-3 py-1 rounded-full border border-red-400 text-red-500 text-xs font-medium">待審核</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Detail */}
                <div className="w-2/3 flex flex-col relative">
                    <div className="p-4 border-b border-gray-200 flex justify-center">
                        <h2 className="text-lg font-bold text-[#191919]">入團申請</h2>
                    </div>

                    {selectedApplicant ? (
                        <div className="flex-1 p-8 flex flex-col items-center">
                            {/* User Profile */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mb-3 ring-4 ring-gray-50">
                                    <img src={selectedApplicant.avatar} alt={selectedApplicant.username} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="text-xl font-bold text-[#191919] mb-1">{selectedApplicant.username}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>{selectedApplicant.role}</span>
                                    <div className="flex items-center text-yellow-500">
                                        <Star size={14} fill="currentColor" />
                                        <span className="ml-[1px] font-medium text-black">{selectedApplicant.rating}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="w-full max-w-md text-center mb-auto">
                                <p className="text-[#191919] text-base leading-relaxed">
                                    {selectedApplicant.message}
                                </p>
                            </div>

                            {/* Actions - Only show if pending (or maybe allow re-decision?) 
                                The design shows buttons even for accepted user in the Detail view? 
                                Actually, the screenshot shows "kiki_one" (Accepted) selected, BUT the buttons are "不同意" and "同意" at the bottom.
                                Wait, if kiki_one is ALREADY accepted, why show buttons?
                                Maybe the screenshot implies kiki_one is selected and the user is *viewing* it, 
                                possibly to change status or just the design mock shows the layout. 
                                Logic wise, if pending, show buttons. If decided, maybe show status or allow change. 
                                I'll assume for Pending: show buttons. For Accepted/Rejected: maybe show "Current Status" but allow change. 
                                Let's follow the screenshot which shows buttons.
                            */}
                            <div className="w-full max-w-md flex gap-4 mt-8">
                                <button
                                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'rejected')}
                                    className={`flex-1 py-2.5 rounded-full font-bold text-base transition-all border border-[#009bcd] text-[#009bcd] hover:bg-blue-50 ${selectedApplicant.status === 'rejected' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    不同意
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'accepted')}
                                    className={`flex-1 py-2.5 rounded-full font-bold text-base transition-all text-white bg-[#009bcd] hover:bg-[#0087b3] shadow-md hover:shadow-lg ${selectedApplicant.status === 'accepted' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    同意
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            請選擇一位申請者查看詳情
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicationManagementModal;
