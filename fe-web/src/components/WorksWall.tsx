import React from 'react';
// Copy, Heart, MessageCircle removed as they are now used in WorkCard
// import { Heart, MessageCircle, Copy } from 'lucide-react';

// Dummy data from Figma assets
const WORKS = [
    { url: "http://localhost:3845/assets/26934429a1fb9f9f3250f24561b5be23ab224dd4.png", multiple: true },
    { url: "http://localhost:3845/assets/e3c63927ea078034299232019537fd5b47178779.png", multiple: false },
    { url: "http://localhost:3845/assets/4c01dbd34faae81b60a4b022bf488aa86eb932ad.png", multiple: true },
    { url: "http://localhost:3845/assets/5ea31b047065367c217a73d7bbce4fb97ce05047.png", multiple: false },
    { url: "http://localhost:3845/assets/03fe1aa97cb25e63aa60413a2b2d3aec5911c495.png", multiple: false },
    { url: "http://localhost:3845/assets/e65b65fb85d9eb55dac21d96cfcb5c9595b3f393.png", multiple: true },
    { url: "http://localhost:3845/assets/4e80d16386d1752cfda721d7370bc321e5156226.png", multiple: false },
    { url: "http://localhost:3845/assets/88d0a4eef25d14d8cb4db33e30238cac07929ee0.png", multiple: false },
    { url: "http://localhost:3845/assets/a627f0f017ebe673d2796170a39f2b0fc08901a5.png", multiple: true },
    { url: "http://localhost:3845/assets/583455ec793d08c3ad6a49f636598683cebf4b6d.png", multiple: false },
    { url: "http://localhost:3845/assets/2a6d7122b11e027b194231b9a12ab630f9aedd8a.png", multiple: false },
    { url: "http://localhost:3845/assets/af4f3f51b1e465d2b0291d540fd00a862185cede.png", multiple: true },
    { url: "http://localhost:3845/assets/8a22c3a600f46980599b34ab4cfc80843fbb9b68.png", multiple: false },
];

import WorkDetailModal from './WorkDetailModal';
import MainHeader from './MainHeader';
import WorkCard from './WorkCard';

const WorksWall: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState<'hot' | 'following'>('hot');
    const [selectedWork, setSelectedWork] = React.useState<string | null>(null);

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <MainHeader activePage="works-wall" />

            {/* Main Content */}
            <div className="w-full px-8 mt-8">
                {/* Tabs */}
                <div className="flex justify-center border-b border-gray-200 mb-8">
                    {/* Hot Tab */}
                    <div
                        className={`px-8 py-4 text-sm font-bold cursor-pointer relative ${activeTab === 'hot' ? 'text-[#009bcd]' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        onClick={() => setActiveTab('hot')}
                    >
                        熱門
                        {activeTab === 'hot' && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#009bcd]" />
                        )}
                    </div>

                    {/* Following Tab */}
                    <div
                        className={`px-8 py-4 text-sm font-bold cursor-pointer relative ${activeTab === 'following' ? 'text-[#009bcd]' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        onClick={() => setActiveTab('following')}
                    >
                        追蹤
                        {activeTab === 'following' && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#009bcd]" />
                        )}
                    </div>
                </div>

                {/* Content: Grid */}
                {(activeTab === 'hot' || activeTab === 'following') && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-0 bg-white">
                        {WORKS.sort(() => Math.random() - 0.5).map((work, index) => (
                            <WorkCard
                                key={index}
                                imageUrl={work.url}
                                isMultiple={work.multiple}
                                onClick={() => setSelectedWork(work.url)}
                                stats={{ likes: 57, comments: 3 }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Work Detail Modal */}
            <WorkDetailModal
                isOpen={!!selectedWork}
                onClose={() => setSelectedWork(null)}
                imageUrl={selectedWork || ""}
            />
        </div>
    );
};

export default WorksWall;
