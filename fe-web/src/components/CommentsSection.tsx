import React, { useState } from 'react';
import { Send, Star } from 'lucide-react';
import UserInfo from './UserInfo';

const CommentsSection: React.FC = () => {
    const [comment, setComment] = useState("");

    const comments = [
        {
            name: "hihi_man",
            role: "模特兒",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
            rating: 5.0,
            content: "希望參與活動的大家可以互相交流幫助，大家一起產出好作品，開心拍攝，保持禮貌^^缺打光板、攝影器材....等",
            time: "3天前"
        },
        {
            name: "chien_mi",
            role: "攝影師",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
            rating: 4.2,
            content: "我可以帶打光板！！！",
            time: "3天前"
        },
        {
            name: "twinkletwinkle",
            role: "模特兒",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
            rating: 4.8,
            content: "確定出席，不見不散~",
            time: "3天前"
        }
    ];

    return (
        <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="font-bold mb-4 text-[#191919]">留言板</h3>

            {/* Input Area */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8 flex flex-col gap-3">
                <textarea
                    className="w-full bg-transparent resize-none focus:outline-none text-sm text-[#191919] placeholder-gray-400"
                    placeholder="留下你的想法......"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex justify-end">
                    <button className="flex items-center gap-2 px-6 py-1.5 bg-[#009bcd] text-white rounded-full text-sm font-bold hover:bg-[#0089b5] transition-colors">
                        <Send size={14} className="fill-white" />
                        傳送
                    </button>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.map((item, index) => (
                    <div key={index} className="flex gap-4">
                        {/* Content */}
                        <div className="flex-1">
                            <UserInfo
                                avatar={item.avatar}
                                name={item.name}
                                role={item.role}
                                rating={item.rating}
                                size="sm"
                                className="mb-1"
                            />

                            <p className="text-sm text-[#191919] mb-1 leading-relaxed">{item.content}</p>
                            <div className="text-xs text-gray-400">{item.time}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentsSection;
