import React, { useState, useEffect } from 'react';
import MainHeader from './MainHeader';
import { authService } from '../services/authService';



import { User, KeyRound, ChevronRight, Upload, Check, ChevronDown, FileText, Shield } from 'lucide-react';
import TermsContent from './TermsContent';
import PrivacyContent from './PrivacyContent';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'account' | 'profile' | 'terms' | 'privacy'>('account');
    const [isLoading, setIsLoading] = useState(false);

    // Check URL params for initial tab
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'profile') {
            setActiveTab('profile');
        }
    }, []);

    // Account Data (Mock)
    const [accountData, setAccountData] = useState({
        username: "emma_stone2",
        email: "emma@example.com",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Profile Data (Migrated from BasicInfoForm)
    const [profileData, setProfileData] = useState({
        id: "emma_stone2", // Display ID/Username
        roles: ["model"] as string[],
        gender: "female",
        phone: "0912345678",
        bio: "凱渥專任簽約模特兒\n2021 Vogue 內頁p87 材質亞周年慶包的展示模特兒，左邊數來第3位"
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>("https://api.dicebear.com/7.x/avataaars/svg?seed=emma");

    const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAccountData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRoleToggle = (role: string) => {
        setProfileData(prev => {
            const roles = prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role];
            return { ...prev, roles };
        });
    };

    const handleGenderSelect = (gender: string) => {
        setProfileData(prev => ({ ...prev, gender }));
    };

    const handleSaveAccount = () => {
        alert('帳號設定已儲存 (模擬)');
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            // Mock API call structure
            // In a real app, we'd get the current user ID properly
            const payload = {
                username: profileData.id,
                // city: profileData.location, // Removed
                gender: profileData.gender,
                phone: profileData.phone,
                bio: profileData.bio,
                isPhotographer: profileData.roles.includes('photographer'),
                isModel: profileData.roles.includes('model'),
                avatarBase64: avatarPreview && avatarPreview.startsWith('data:') ? avatarPreview.split(',')[1] : undefined
            };

            console.log('Saving profile:', payload);

            // await authService.updateProfile(currentUserId, payload);
            await new Promise(resolve => setTimeout(resolve, 800)); // Mock delay

            alert('個人資料已更新');
            // Optional: Redirect to profile or stay
            // window.location.href = '?view=profile';
        } catch (error) {
            console.error(error);
            alert('儲存失敗');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <MainHeader activePage="profile" />

            <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">設定</h1>
                    <nav className="flex flex-col space-y-1">
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`px-4 py-3 text-left rounded-lg text-sm font-medium transition-colors ${activeTab === 'account'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:bg-white hover:text-gray-900'
                                }`}
                        >
                            帳號管理
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-4 py-3 text-left rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:bg-white hover:text-gray-900'
                                }`}
                        >
                            個人資料
                        </button>
                        <button
                            onClick={() => setActiveTab('terms')}
                            className={`px-4 py-3 text-left rounded-lg text-sm font-medium transition-colors ${activeTab === 'terms'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:bg-white hover:text-gray-900'
                                }`}
                        >
                            服務條款
                        </button>
                        <button
                            onClick={() => setActiveTab('privacy')}
                            className={`px-4 py-3 text-left rounded-lg text-sm font-medium transition-colors ${activeTab === 'privacy'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:bg-white hover:text-gray-900'
                                }`}
                        >
                            隱私權條款
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">

                    {/* ACCOUNT TAB */}
                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 border-b pb-4">帳號管理</h2>

                            <div className="grid gap-6 max-w-md">
                                { /* Username removed as it duplicates Profile ID */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
                                    <input
                                        type="email"
                                        value={accountData.email}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">更改密碼</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">目前密碼</label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={accountData.currentPassword}
                                                onChange={handleAccountChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">新密碼</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={accountData.newPassword}
                                                onChange={handleAccountChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">確認新密碼</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={accountData.confirmPassword}
                                                onChange={handleAccountChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        className="px-6 py-2 rounded-full bg-[#009bcd] text-white hover:bg-[#0089b6] transition-colors font-medium shadow-sm"
                                        onClick={handleSaveAccount}
                                    >
                                        儲存帳號設定
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8">
                            <h2 className="text-xl font-bold text-gray-900 border-b pb-4">個人資料</h2>

                            {/* Avatar */}
                            <div className="flex flex-col items-center">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                </div>
                                <label className="cursor-pointer mt-3">
                                    <span className="text-[#009bcd] text-sm font-medium hover:underline">更換大頭貼</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>

                            <div className="grid gap-6 max-w-lg mx-auto">
                                {/* Roles */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">角色</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <div
                                                className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-colors ${profileData.roles.includes('photographer') ? 'border-[#009bcd] bg-white' : 'border-[#b3b3b3]'}`}
                                                onClick={() => handleRoleToggle('photographer')}
                                            >
                                                {profileData.roles.includes('photographer') && <div className="w-3 h-3 bg-[#009bcd]" />}
                                            </div>
                                            <span className="text-base text-gray-800">攝影師</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <div
                                                className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-colors ${profileData.roles.includes('model') ? 'border-[#009bcd] bg-white' : 'border-[#b3b3b3]'}`}
                                                onClick={() => handleRoleToggle('model')}
                                            >
                                                {profileData.roles.includes('model') && <div className="w-3 h-3 bg-[#009bcd]" />}
                                            </div>
                                            <span className="text-base text-gray-800">模特兒</span>
                                        </label>
                                    </div>
                                </div>

                                {/* ID */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ID (顯示名稱)</label>
                                    <input
                                        type="text"
                                        name="id"
                                        value={profileData.id}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border-b border-[#009bcd] focus:outline-none bg-transparent"
                                        placeholder="輸入您的顯示名稱"
                                    />
                                </div>



                                {/* Gender */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">性別</label>
                                    <div className="flex gap-6">
                                        {['male', 'female', 'other'].map(g => (
                                            <label key={g} className="flex items-center gap-2 cursor-pointer">
                                                <div
                                                    className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${profileData.gender === g ? 'border-[#009bcd] bg-white' : 'border-[#b3b3b3]'}`}
                                                    onClick={() => handleGenderSelect(g)}
                                                >
                                                    {profileData.gender === g && <div className="w-3 h-3 bg-[#009bcd] rounded-full" />}
                                                </div>
                                                <span className="text-base text-gray-800">
                                                    {g === 'male' ? '男' : g === 'female' ? '女' : '其他'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">手機號碼</label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profileData.phone}
                                            readOnly
                                            disabled
                                            className="w-full px-4 py-2 border-b border-[#009bcd] focus:outline-none bg-transparent cursor-not-allowed text-gray-900"
                                            placeholder="09xx-xxx-xxx"
                                        />
                                        <span className="absolute right-2 text-[#009bcd] text-xs font-medium whitespace-nowrap">已驗證</span>
                                    </div>
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">簡介</label>
                                    <div className="relative">
                                        <textarea
                                            name="bio"
                                            value={profileData.bio}
                                            onChange={handleProfileChange}
                                            maxLength={200}
                                            className="w-full h-32 border border-[#009bcd] rounded-lg p-3 focus:outline-none resize-none"
                                            placeholder="介紹一下你自己..."
                                        />
                                        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                            {profileData.bio.length} / 200
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="pt-4 flex justify-center w-full">
                                    <button
                                        className="w-40 py-2.5 rounded-full bg-gradient-to-r from-[#F2994A] to-[#009bcd] text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center shadow-lg disabled:opacity-70"
                                        onClick={handleSaveProfile}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? '儲存中...' : '儲存個人資料'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'terms' && (
                        <div className="space-y-8">
                            <h2 className="text-xl font-bold text-gray-900 border-b pb-4">服務條款</h2>
                            <TermsContent />
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="space-y-8">
                            <h2 className="text-xl font-bold text-gray-900 border-b pb-4">隱私權條款</h2>
                            <PrivacyContent />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
