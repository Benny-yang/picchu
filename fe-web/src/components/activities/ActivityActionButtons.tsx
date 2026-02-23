import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Star } from 'lucide-react';

interface ActivityActionButtonsProps {
    status: 'idle' | 'applied' | 'joined' | 'isHost' | 'rejected';
    isEnded: boolean;
    isActivityNotFound?: boolean;
    displayData: any;
    activityId: string | number;
    onShowManagementModal: () => void;
    onShowRatingModal: () => void;
    onShowApplicationModal: () => void;
    onDeleteActivity: () => void;
    onCancelApplication: () => void;
    currentUser?: any;
}

const ActivityActionButtons: React.FC<ActivityActionButtonsProps> = ({
    status,
    isEnded,
    isActivityNotFound = false,
    displayData,
    activityId,
    onShowManagementModal,
    onShowRatingModal,
    onShowApplicationModal,
    onDeleteActivity,
    onCancelApplication,
    currentUser,
}) => {
    const navigate = useNavigate();
    if (status === 'isHost') {
        if (isEnded) {
            return (
                <div className="flex justify-center pt-6 gap-3 mt-6">
                    <button
                        onClick={onShowManagementModal}
                        className="px-5 py-2 rounded-full text-white font-medium text-sm shadow-md bg-[#191919] hover:bg-[#333] transition-all transform active:scale-95 flex items-center gap-2"
                    >
                        <Users size={16} />
                        管理報名
                    </button>
                    <button
                        onClick={onShowRatingModal}
                        className="px-8 py-2.5 rounded-full text-white font-bold text-base shadow-md hover:shadow-lg hover:opacity-95 transition-all transform active:scale-95 flex items-center gap-2"
                        style={{ backgroundColor: "#FFAF3C" }}
                    >
                        <Star className="fill-white" size={20} />
                        <span>評價</span>
                    </button>
                </div>
            );
        }

        return (
            <div className="flex justify-center pt-6 gap-3 mt-6">
                <button
                    onClick={onShowManagementModal}
                    className="px-5 py-2 rounded-full text-white font-medium text-sm shadow-md bg-[#191919] hover:bg-[#333] transition-all transform active:scale-95 flex items-center gap-2"
                >
                    <Users size={16} />
                    管理報名
                </button>
                <button
                    onClick={() => {
                        navigate(`/activities/create?mode=edit&id=${activityId}`);
                    }}
                    className="px-5 py-2 rounded-full text-[#191919] font-medium text-sm shadow-sm border border-gray-200 hover:bg-gray-50 transition-all transform active:scale-95 flex items-center gap-2"
                >
                    編輯
                </button>
                <button
                    onClick={onDeleteActivity}
                    className="px-5 py-2 rounded-full text-red-500 font-medium text-sm shadow-sm border border-red-100 hover:bg-red-50 transition-all transform active:scale-95 flex items-center gap-2"
                >
                    取消
                </button>
            </div>
        );
    }

    if (status !== 'joined' || (status === 'joined' && isEnded)) {
        return (
            <div className={`flex justify-center pt-8 gap-4 ${status === 'idle' ? 'mt-auto' : 'mt-8'}`}>
                {status === 'idle' ? (
                    (displayData.maxParticipants > 0 && displayData.currentParticipants >= displayData.maxParticipants) ? (
                        <button
                            disabled
                            className="px-12 py-2.5 rounded-full bg-gray-300 text-white font-bold text-base cursor-not-allowed"
                        >
                            人數已額滿
                        </button>
                    ) : (
                        currentUser ? (
                            isActivityNotFound ? (
                                <button
                                    disabled
                                    className="px-12 py-2.5 rounded-full bg-gray-300 text-white font-bold text-base cursor-not-allowed"
                                >
                                    活動已不存在
                                </button>
                            ) : (
                                <button
                                    onClick={onShowApplicationModal}
                                    className="px-12 py-2.5 rounded-full text-white font-bold text-base shadow-md hover:shadow-lg hover:opacity-95 transition-all transform active:scale-95"
                                    style={{ background: "linear-gradient(90deg, #FDBB2D 0%, #22C1C3 100%)" }}
                                >
                                    申請加入
                                </button>
                            )
                        ) : (
                            <button
                                disabled
                                className="px-12 py-2.5 rounded-full bg-gray-300 text-white font-bold text-base cursor-not-allowed"
                            >
                                登入後即可申請
                            </button>
                        )
                    )
                ) : status === 'applied' ? (
                    <>
                        <button
                            onClick={onCancelApplication}
                            className="px-8 py-2.5 rounded-full border-2 border-red-500 text-red-500 font-bold text-base hover:bg-red-50 transition-colors"
                        >
                            取消申請
                        </button>
                        <div className="px-12 py-2.5 rounded-full bg-[#B3B3B3] text-white font-bold text-base cursor-default flex items-center justify-center">
                            已申請
                        </div>
                    </>
                ) : status === 'rejected' ? (
                    <button
                        disabled
                        className="px-12 py-2.5 rounded-full bg-red-400 text-white font-bold text-base cursor-not-allowed"
                    >
                        申請被婉拒
                    </button>
                ) : (
                    <button
                        onClick={onShowRatingModal}
                        className="px-12 py-2.5 rounded-full text-white font-bold text-base shadow-md hover:shadow-lg hover:opacity-95 transition-all transform active:scale-95 flex items-center gap-2"
                        style={{ backgroundColor: "#FFAF3C" }}
                    >
                        <Star className="fill-white" size={20} />
                        <span>評價</span>
                    </button>
                )}
            </div>
        );
    }

    return null;
};

export default ActivityActionButtons;
