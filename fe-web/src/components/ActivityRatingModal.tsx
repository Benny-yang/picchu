import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import UserInfo from './UserInfo';

interface ActivityRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

const MOCK_PARTICIPANTS = [
    {
        id: '1',
        name: 'nanami_misoto',
        role: ['攝影師', '模特兒'],
        rating: 4.8,
        avatar: 'http://localhost:3845/assets/267ad1258bb3d96ddeb6f672046977adb61e7b64.png',
        isLeader: true,
        isRated: true,
    },
    {
        id: '2',
        name: 'kiki_one',
        role: '新北市 模特兒',
        rating: 4.8,
        avatar: 'http://localhost:3845/assets/795833fee423d3c15332f6da701564c87b15fffc.png',
        isLeader: false,
        isRated: false,
    },
    {
        id: '3',
        name: 'hellokitty239',
        role: '新北市 模特兒',
        rating: 4.8,
        avatar: 'http://localhost:3845/assets/c7a3b4589b4441c3a22f05d326463b5d50ff8a43.png',
        isLeader: false,
        isRated: false,
    },
    {
        id: '4',
        name: 'sally_yoyo22',
        role: '模特兒',
        rating: 4.8,
        avatar: 'http://localhost:3845/assets/38d7290ab0ad59977c60530b9bc19e4271f64a01.png',
        isLeader: false,
        isRated: false,
    },
];

const ActivityRatingModal: React.FC<ActivityRatingModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[16px] w-full max-w-[900px] h-[600px] flex overflow-hidden shadow-2xl relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                >
                    <X size={24} />
                </button>

                {/* Left Column: Participants */}
                <div className="w-[400px] flex flex-col border-r border-[#e6e6e6]">
                    <div className="p-4 flex items-center justify-center border-b border-[#e6e6e6]">
                        <h3 className="text-[18px] font-bold text-[#191919]">參加人員</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Leader */}
                        <div>
                            <h4 className="text-sm font-bold text-[#191919] mb-3">團長</h4>
                            {MOCK_PARTICIPANTS.filter(p => p.isLeader).map(participant => (
                                <ParticipantRow key={participant.id} participant={participant} />
                            ))}
                        </div>

                        {/* Members */}
                        <div>
                            <h4 className="text-sm font-bold text-[#191919] mb-3">團員</h4>
                            <div className="space-y-4">
                                {MOCK_PARTICIPANTS.filter(p => !p.isLeader).map(participant => (
                                    <ParticipantRow key={participant.id} participant={participant} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Rating Form */}
                <div className="flex-1 flex flex-col items-center">
                    <div className="w-full p-4 flex items-center justify-center border-b border-[#e6e6e6]">
                        <h3 className="text-[18px] font-bold text-[#191919]">評價</h3>
                    </div>

                    <div className="flex-1 w-full p-8 flex flex-col items-center justify-center space-y-8">

                        <div className="text-center">
                            <h4 className="text-[16px] font-bold text-[#191919] mb-4">活動表現滿意度</h4>
                            <div className="flex gap-2 justify-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <Star
                                            size={32}
                                            className={`${star <= rating
                                                ? 'fill-[#FFAF3C] text-[#FFAF3C]'
                                                : 'fill-transparent text-[#FFAF3C]'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-full max-w-md relative">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="分享您對團員的感想"
                                maxLength={100}
                                className="w-full h-40 p-4 bg-[#F7F7F7] rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm"
                            />
                            <span className="absolute bottom-3 right-3 text-xs text-gray-400">
                                {comment.length} / 100
                            </span>
                        </div>

                        <button
                            onClick={onSubmit}
                            className="px-16 py-3 rounded-full text-white font-bold text-lg shadow-md hover:shadow-lg hover:opacity-95 transition-all transform active:scale-95"
                            style={{
                                background: "linear-gradient(90deg, #FDBB2D 0%, #22C1C3 100%)"
                            }}
                        >
                            送出
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

const ParticipantRow = ({ participant }: { participant: any }) => (
    <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-4">
            <UserInfo
                avatar={participant.avatar}
                name={participant.name}
                role={participant.role}
                rating={participant.rating}
                size="md"
            />
        </div>
        {participant.isRated ? (
            <button className="px-4 py-1 rounded-[4px] border border-[#CCCCCC] text-[#B3B3B3] text-xs font-bold cursor-default">
                已評價
            </button>
        ) : (
            <button className="px-4 py-1 rounded-[4px] border border-[#009BCD] text-[#009BCD] text-xs font-bold hover:bg-[#009BCD]/5 transition-colors">
                評價
            </button>
        )}
    </div>
);

export default ActivityRatingModal;
