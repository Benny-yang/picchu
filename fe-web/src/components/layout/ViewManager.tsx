import React from 'react';
import LoginPopup from '../auth/LoginPopup';
import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';
import PhoneInputStep from '../auth/PhoneInputStep';
import SmsVerifyStep from '../auth/SmsVerifyStep';
import SmsSuccessStep from '../auth/SmsSuccessStep';
import SmsFailStep from '../auth/SmsFailStep';
import BasicInfoForm from '../user/BasicInfoForm';
import WorksWall from '../works/WorksWall';
import ActivitiesPage from '../../pages/ActivitiesPage';
import UserProfilePage from '../../pages/UserProfilePage';
import CreateActivityPage from '../../pages/CreateActivityPage';
import SettingsPage from '../../pages/SettingsPage';
import ActivityApplicationHistoryPage from '../../pages/ActivityApplicationHistoryPage';
import NotFoundPage from '../../pages/NotFoundPage';
import ResetPasswordPage from '../../pages/ResetPasswordPage';
import { authService } from '../../services/authService';

export type AuthView = 'selection' | 'login' | 'register' | 'phone-input' | 'sms-verify' | 'sms-success' | 'sms-fail' | 'basic-info' | 'works-wall' | 'activities' | 'create-activity' | 'profile' | 'edit-profile' | 'settings' | 'activity-application-history' | 'reset-password' | '404';

interface ViewManagerProps {
    view: AuthView;
    setView: (view: AuthView) => void;
    currentUser: any;
    setCurrentUser: (user: any) => void;
    tempPhone: string;
    setTempPhone: (phone: string) => void;
}

const ViewManager: React.FC<ViewManagerProps> = ({
    view,
    setView,
    currentUser,
    setCurrentUser,
    tempPhone,
    setTempPhone
}) => {

    const handleClose = () => {
        setView('selection');
        window.history.pushState({}, '', window.location.pathname);
    };

    const handleLoginSuccess = (response: any) => {
        // authService.login already saves token via tokenManager
        const userData = response.data?.user || response.data || response;
        setCurrentUser(userData);

        // Check if this is a first login after email verification
        const isFirstLogin = sessionStorage.getItem('first_login') === 'true';

        if (isFirstLogin) {
            sessionStorage.removeItem('first_login');
            window.history.replaceState({}, '', window.location.pathname);
            setView('edit-profile');
        } else {
            setView('works-wall');
        }

        // Fetch full profile (with avatarUrl) asynchronously to populate header avatar
        authService.getMe()
            .then((fullUser) => {
                if (fullUser && !fullUser.error) {
                    setCurrentUser(fullUser);
                }
            })
            .catch(() => { /* ignore, basic userData is still usable */ });
    };



    switch (view) {
        case 'selection':
            return (
                <LoginPopup
                    onClose={handleClose}
                    onLogin={() => setView('login')}
                    onRegister={() => setView('register')}
                    onGuest={() => {
                        setView('works-wall');
                        setCurrentUser(null); // Ensure guest state
                    }}
                />
            );
        case 'login':
            return (
                <LoginForm
                    onClose={handleClose}
                    onGenericClick={() => setView('selection')}
                    onSubmit={async (data) => {
                        const response = await authService.login(data.email, data.password, data.rememberMe);
                        handleLoginSuccess(response);
                    }}
                />
            );
        case 'register':
            return (
                <RegisterForm
                    onClose={handleClose}
                    onGenericClick={() => setView('selection')}
                    onSubmit={async (data) => {
                        if (data.password !== data.confirmPassword) {
                            throw new Error('密碼與確認密碼不符');
                        }
                        await authService.register(data.email, data.password);
                        // Registration successful — RegisterForm will show "check email" UI
                        // Do NOT try to login here, user must verify email first
                    }}
                />
            );
        case 'phone-input':
            return (
                <PhoneInputStep
                    onBack={() => setView('register')}
                    onNext={(phone) => {
                        setTempPhone(phone);
                        setView('sms-verify');
                    }}
                />
            );
        case 'sms-verify':
            return (
                <SmsVerifyStep
                    phoneNumber={tempPhone}
                    onBack={() => setView('phone-input')}
                    onNext={() => setView('sms-success')}
                />
            );
        case 'sms-success':
            return <SmsSuccessStep onNext={() => setView('basic-info')} />;
        case 'sms-fail':
            return <SmsFailStep onRetry={() => setView('phone-input')} />;
        case 'basic-info':
            return (
                <div className="w-full h-full overflow-auto max-h-screen">
                    <BasicInfoForm
                        initialData={{ phone: tempPhone }}
                        onSubmit={async (data) => {
                            try {
                                const payload = {
                                    username: data.id,
                                    gender: data.gender,
                                    phone: data.phone,
                                    bio: data.bio,
                                    isPhotographer: data.roles.includes('photographer'),
                                    isModel: data.roles.includes('model'),
                                    avatarBase64: data.avatarPreview ? data.avatarPreview.split(',')[1] : ""
                                };
                                const updatedUser = await authService.updateProfile(payload);
                                setCurrentUser(updatedUser);
                                alert('資料保存成功！');
                                setView('works-wall');
                            } catch (error: any) {
                                console.error('Update profile failed:', error);
                                alert('保存失敗：' + (error.message || '未知錯誤'));
                            }
                        }}
                    />
                </div>
            );
        case 'edit-profile':
            return (
                <div className="w-full h-full overflow-auto max-h-screen bg-white">
                    <div className="max-w-[800px] mx-auto pt-8">
                        <h2 className="text-2xl font-bold text-center mb-6 text-[#333]">編輯個人資料</h2>
                        <BasicInfoForm
                            initialData={{
                                id: currentUser?.username || '',
                                roles: [
                                    ...(currentUser?.isPhotographer ? ['photographer'] : []),
                                    ...(currentUser?.isModel ? ['model'] : []),
                                ],
                                gender: currentUser?.gender || '',
                                phone: currentUser?.phone || tempPhone || '',
                                bio: currentUser?.bio || '',
                                avatarUrl: currentUser?.avatarUrl || '',
                            }}
                            onSubmit={async (data) => {
                                try {
                                    const payload = {
                                        username: data.id,
                                        gender: data.gender,
                                        phone: data.phone,
                                        bio: data.bio,
                                        isPhotographer: data.roles.includes('photographer'),
                                        isModel: data.roles.includes('model'),
                                        avatarBase64: data.avatarPreview ? data.avatarPreview.split(',')[1] : ""
                                    };
                                    const updatedUser = await authService.updateProfile(payload);
                                    setCurrentUser(updatedUser);
                                    alert('資料更新成功！');
                                    window.location.href = '/profile';
                                } catch (error: any) {
                                    console.error('Update profile failed:', error);
                                    alert('保存失敗：' + (error.message || '未知錯誤'));
                                }
                            }}
                        />
                    </div>
                </div>
            );
        case 'works-wall': return <div className="w-full h-full"><WorksWall currentUser={currentUser} /></div>;
        case 'activities': return <div className="w-full h-full"><ActivitiesPage currentUser={currentUser} /></div>;
        case 'create-activity': return <div className="w-full h-full"><CreateActivityPage /></div>;
        case 'profile': return <div className="w-full h-full"><UserProfilePage currentUser={currentUser} /></div>;
        case 'settings': return <div className="w-full h-full"><SettingsPage setCurrentUser={setCurrentUser} /></div>;
        case 'activity-application-history': return <div className="w-full h-full"><ActivityApplicationHistoryPage currentUser={currentUser} /></div>;
        case 'reset-password': return <div className="w-full h-full"><ResetPasswordPage /></div>;
        case '404':
        default:
            return <NotFoundPage />;
    }
};

export default ViewManager;
