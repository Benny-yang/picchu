import React from 'react';
import MainHeader from './MainHeader';


// Mock data based on Figma design
const ACTIVITIES = [
    {
        id: 1,
        title: "哈利奎茵-Cosplay",
        location: "高雄市",
        date: "2026/08/06 14:00",
        timeLeft: "剩餘99天23時",
        tags: ["模特兒", "攝影師"],
        image: "http://localhost:3845/assets/3662c031838380acd9e417d68ab1701563e98631.png",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1"
    },
    {
        id: 2,
        title: "都市霓虹*越夜越美麗*",
        location: "臺北市",
        date: "2026/08/10 19:30",
        timeLeft: "剩餘99天23時",
        tags: ["模特兒", "攝影師"],
        image: "http://localhost:3845/assets/246052ad512b4f1dde9691a7918409b23288327f.png",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2"
    },
    {
        id: 3,
        title: "抓住夏天尾巴-比基尼外拍",
        location: "高雄市",
        date: "2026/08/06 10:00",
        timeLeft: "剩餘99天23時",
        tags: ["模特兒"],
        image: "http://localhost:3845/assets/de42dd4666592ebe04be738ffaadcbc99ed73b23.png",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3"
    },
    {
        id: 4,
        title: "奧萬大外拍",
        location: "高雄市",
        date: "2026/08/06 13:00",
        timeLeft: "剩餘99天23時",
        tags: ["攝影師"],
        image: "http://localhost:3845/assets/101252d876579d58561eb895c3e51c0240405889.png",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4"
    },
    {
        id: 5,
        title: "與寵物有約-奧萬大外拍",
        location: "高雄市",
        date: "2026/08/06 15:30",
        timeLeft: "剩餘99天23時",
        tags: ["模特兒", "攝影師"],
        image: "http://localhost:3845/assets/34259f5aa16a9f49ba0bfcaf0b876eafb6e0c8b3.png",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5"
    },
    {
        id: 6,
        title: "與寵物有約-奧萬大外拍",
        location: "高雄市",
        date: "2026/08/06 09:00",
        timeLeft: "剩餘99天23時",
        tags: ["模特兒", "攝影師"],
        image: "http://localhost:3845/assets/34259f5aa16a9f49ba0bfcaf0b876eafb6e0c8b3.png",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=6"
    }
];

import ActivityDetailModal from './ActivityDetailModal';
import ActivityCard from './ActivityCard';

const ActivitiesPage: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState("熱門");
    const [selectedActivity, setSelectedActivity] = React.useState<any>(null);
    const categories = ["熱門", "我的"];

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col">
            <MainHeader activePage="activities" />

            <div className="max-w-[1200px] mx-auto w-full px-4 pt-8">
                {/* Categories Tabs */}
                <div className="flex justify-center border-b border-gray-200 mb-8">
                    {categories.map((cat) => (
                        <div
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-8 py-4 text-sm font-bold cursor-pointer relative ${activeTab === cat ? 'text-[#009bcd]' : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {cat}
                            {activeTab === cat && (
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#009bcd]" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                    {ACTIVITIES.map((activity) => (
                        <ActivityCard
                            key={activity.id}
                            activity={activity}
                            onClick={() => setSelectedActivity(activity)}
                        />
                    ))}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedActivity && (
                <ActivityDetailModal
                    activity={selectedActivity}
                    onClose={() => setSelectedActivity(null)}
                />
            )}
        </div>
    );
};

export default ActivitiesPage;
