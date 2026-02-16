import React, { useState } from 'react';
import { X } from 'lucide-react';
import UserInfo from '../user/UserInfo';

interface Applicant {
    id: number;
    name: string;
    avatar: string;
    role: string;
    rating: number;
    status: 'pending' | 'approved' | 'rejected';
    message: string;
}

const APPLICANTS: Applicant[] = [
    {
        id: 1,
        name: 'kiki_one',
        avatar: '',

        role: '模特兒',
        rating: 4.8,
        status: 'approved',
        message: '對拍攝主題很有興趣，街頭攝影經驗兩年，希望可以入團一起拍攝一起交流經驗知識，互相分享～'
    },
    {
        id: 2,
        name: 'hellokitty239',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kitty',

        role: '模特兒',
        rating: 4.8,
        status: 'rejected',
        message: '希望能有機會合作！'
    },
    {
        id: 3,
        name: 'sally_yoyo22',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sally',

        role: '模特兒',
        rating: 4.8,
        status: 'pending',
        message: '你好，我是Sally，有豐富的外拍經驗，希望能加入這次的活動！'
    },
    {
        id: 4,
        name: 'john_13579',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',

        role: '攝影師',
        rating: 4.8,
        status: 'pending',
        message: '攝影新手，想來學習！'
    },
    {
        id: 5,
        name: 'nanami_misoto',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nanami',

        role: '攝影師',
        rating: 4.8,
        status: 'pending',
        message: '對拍攝主題很有興趣，街頭攝影經驗兩年，希望可以入團一起拍攝一起交流經驗知識，互相分享～'
    }
];

interface ApplicationReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    // initialApplicantId?: number; // Could be used to pre-select
}

const ApplicationReviewModal: React.FC<ApplicationReviewModalProps> = ({ isOpen, onClose }) => {
    const [selectedApplicantId, setSelectedApplicantId] = useState<number>(APPLICANTS[0].id);
    const selectedApplicant = APPLICANTS.find(a => a.id === selectedApplicantId) || APPLICANTS[0];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-5xl h-[600px] flex overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Left Column: List */}
                <div className="w-[400px] border-r border-gray-200 flex flex-col bg-white">
                    <div className="p-4 border-b border-gray-200 text-center">
                        <h3 className="font-bold text-lg text-grey-black">審核名單</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {APPLICANTS.map((applicant) => (
                            <div
                                key={applicant.id}
                                onClick={() => setSelectedApplicantId(applicant.id)}
                                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${selectedApplicantId === applicant.id ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="flex-1 min-w-0">
                                    <UserInfo
                                        avatar={applicant.avatar}
                                        name={applicant.name}
                                        role={applicant.role}
                                        rating={applicant.rating}
                                        size="sm"
                                    />
                                </div>
                                <div>
                                    {applicant.status === 'approved' && (
                                        <span className="px-3 py-1 border border-gray-200 text-gray-400 rounded-full text-xs">同意</span>
                                    )}
                                    {applicant.status === 'rejected' && (
                                        <span className="px-3 py-1 border border-gray-200 text-gray-400 rounded-full text-xs">不同意</span>
                                    )}
                                    {applicant.status === 'pending' && (
                                        <span className="px-3 py-1 border border-alert-default text-alert-default rounded-full text-xs">待審核</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Detail */}
                <div className="flex-1 flex flex-col bg-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 z-10"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>

                    <div className="p-4 border-b border-gray-200 text-center">
                        <h3 className="font-bold text-lg text-grey-black">入團申請</h3>
                    </div>

                    <div className="flex-1 p-8 flex flex-col items-center overflow-y-auto">
                        {/* Profile Info */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="flex flex-col items-center mb-8">
                                <UserInfo
                                    avatar={selectedApplicant.avatar}
                                    name={selectedApplicant.name}
                                    role={selectedApplicant.role}
                                    rating={selectedApplicant.rating}
                                    size="lg"
                                    showRating={true}
                                    className="flex-col !gap-2 text-center"
                                />
                            </div>
                        </div>

                        {/* Message */}
                        <div className="w-full max-w-lg mb-12">
                            <p className="text-gray-600 leading-relaxed text-center">
                                {selectedApplicant.message}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 w-full max-w-sm mt-auto pb-8">
                            <button className="flex-1 py-3 px-6 rounded-full border border-secondary-blue text-secondary-blue font-bold hover:bg-blue-50 transition-colors duration-200">
                                不同意
                            </button>
                            <button className="flex-1 py-3 px-6 rounded-full bg-secondary-blue text-white font-bold hover:bg-secondary-blue-dark transition-colors duration-200 shadow-md hover:shadow-lg">
                                同意
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationReviewModal;
