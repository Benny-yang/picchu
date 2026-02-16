import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { activityService } from '../../services/activityService';

interface ApplicationManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    activityId?: number;
}

interface Applicant {
    id: string; // This is UserId, but for UI mapping we might want ParticipantID for updates? 
    // Actually updateApplicantStatus takes (activityId, userId, status). 
    // So distinct IDs needed: userId for API, and maybe participantId for key?
    // Let's keep it simple: id is userId.
    userId: number;
    username: string;
    avatar: string;
    role: string;
    rating: number;
    status: 'pending' | 'accepted' | 'rejected';
    message: string;
}

const ApplicationManagementModal: React.FC<ApplicationManagementModalProps> = ({ isOpen, onClose, activityId }) => {
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [selectedApplicantId, setSelectedApplicantId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchApplicants = async () => {
            if (isOpen && activityId) {
                setIsLoading(true);
                try {
                    const data = await activityService.listApplicants(activityId);
                    // Map API data to UI format
                    const mapped: Applicant[] = data.map((item: any) => {
                        const profile = item.user?.profile;
                        // Role logic
                        let roles = [];
                        try {
                            if (profile?.roles) {
                                if (Array.isArray(profile.roles)) roles = profile.roles;
                                else if (typeof profile.roles === 'string' && profile.roles.startsWith('[')) {
                                    roles = JSON.parse(profile.roles);
                                } else if (profile.roles) {
                                    roles = [profile.roles];
                                }
                            }
                        } catch { }
                        if (roles.length === 0) {
                            if (profile?.isPhotographer) roles.push('攝影師');
                            if (profile?.isModel) roles.push('模特兒');
                        }

                        const displayRole = roles.length > 0 ? roles.join(' / ') : '一般會員';

                        return {
                            id: String(item.user?.id),
                            userId: item.user?.id,
                            username: item.user?.username || 'Unknown',
                            avatar: profile?.avatarUrl ? (profile.avatarUrl.startsWith('http') ? profile.avatarUrl : `http://localhost:8080/${profile.avatarUrl}`) : '',
                            role: displayRole,
                            rating: item.user?.averageRating || 0,
                            status: item.status,
                            message: item.message || ''
                        };
                    });
                    setApplicants(mapped);
                    if (mapped.length > 0) {
                        setSelectedApplicantId(mapped[0].id);
                    }
                } catch (error) {
                    console.error('Failed to list applicants:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchApplicants();
    }, [isOpen, activityId]);

    const selectedApplicant = applicants.find(a => a.id === selectedApplicantId);

    const handleUpdateStatus = async (userId: number, newStatus: 'accepted' | 'rejected') => {
        if (!activityId) return;
        try {
            await activityService.updateApplicantStatus(activityId, userId, newStatus);
            setApplicants(prev => prev.map(app =>
                app.userId === userId ? { ...app, status: newStatus } : app
            ));
        } catch (error) {
            alert('更新失敗');
            console.error(error);
        }
    };

    if (!isOpen) return null;

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
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009bcd]" />
                            </div>
                        ) : applicants.length > 0 ? (
                            applicants.map(app => (
                                <div
                                    key={app.id}
                                    onClick={() => setSelectedApplicantId(app.id)}
                                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors border-b border-gray-100 ${selectedApplicantId === app.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                            {app.avatar ? (
                                                <img src={app.avatar} alt={app.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">
                                                    {app.username[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-grey-black">{app.username}</div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <span className="truncate max-w-[80px]">{app.role}</span>
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
                                            <span className="px-3 py-1 rounded-full border border-alert-default text-alert-default text-xs font-medium">待審核</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                尚未有申請者
                            </div>
                        )}
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
                                    {selectedApplicant.avatar ? (
                                        <img src={selectedApplicant.avatar} alt={selectedApplicant.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-3xl text-gray-500">
                                            {selectedApplicant.username[0]}
                                        </div>
                                    )}
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
                                    {selectedApplicant.message || '無留言'}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="w-full max-w-md flex gap-4 mt-8">
                                <button
                                    onClick={() => handleUpdateStatus(selectedApplicant.userId, 'rejected')}
                                    className={`flex-1 py-2.5 rounded-full font-bold text-base transition-all border border-[#009bcd] text-[#009bcd] hover:bg-blue-50 ${selectedApplicant.status === 'rejected' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={selectedApplicant.status === 'rejected'}
                                >
                                    不同意
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedApplicant.userId, 'accepted')}
                                    className={`flex-1 py-2.5 rounded-full font-bold text-base transition-all text-white bg-[#009bcd] hover:bg-[#0087b3] shadow-md hover:shadow-lg ${selectedApplicant.status === 'accepted' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={selectedApplicant.status === 'accepted'}
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
