import React from 'react';
import type { Activity } from '../../types';

interface ActivityCardProps {
    activity: Activity;
    onClick: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer group border border-gray-100"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-lg text-grey-black mb-3 line-clamp-1">{activity.title}</h3>

                <div className="space-y-1 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="w-16">地點</span>
                        <span className="text-grey-black">{activity.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="w-16">時間</span>
                        <span className="text-grey-black">{activity.date}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                        {activity.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 text-xs text-grey-1 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityCard;
