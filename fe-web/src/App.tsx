import { useState } from 'react'
import LoginPopup from './components/LoginPopup';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import PhoneInputStep from './components/PhoneInputStep';
import SmsVerifyStep from './components/SmsVerifyStep';
import SmsSuccessStep from './components/SmsSuccessStep';
import SmsFailStep from './components/SmsFailStep';
import BasicInfoForm from './components/BasicInfoForm';
import WorksWall from './components/WorksWall';
import ActivitiesPage from './components/ActivitiesPage';
import UserProfilePage from './components/UserProfilePage';
import CreateActivityPage from './components/CreateActivityPage';
import SettingsPage from './components/SettingsPage';
import ActivityApplicationHistoryPage from './components/ActivityApplicationHistoryPage';
import NotFoundPage from './components/NotFoundPage';
import { authService } from './services/authService';
import './App.css'

type AuthView = 'selection' | 'login' | 'register' | 'phone-input' | 'sms-verify' | 'sms-success' | 'sms-fail' | 'basic-info' | 'works-wall' | 'activities' | 'create-activity' | 'profile' | 'edit-profile' | 'settings' | 'activity-application-history' | '404';

function App() {
  const [authView, setAuthView] = useState<AuthView>(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') as AuthView;
    const validViews = ['selection', 'login', 'register', 'phone-input', 'sms-verify', 'sms-success', 'sms-fail', 'basic-info', 'works-wall', 'activities', 'create-activity', 'profile', 'edit-profile', 'settings', 'activity-application-history'];

    if (params.has('view')) {
      return validViews.includes(view) ? view : '404';
    }
    return 'selection';
  }); // Closure was missing in the original file view, assuming it ends here for the useState callback

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tempPhone, setTempPhone] = useState("");

  const handleClose = () => {
    setAuthView('selection');
    // Optional: Clear the query param
    window.history.pushState({}, '', window.location.pathname);
  }

  return (
    <div className="min-h-screen bg-gray-100">


      {authView === 'selection' && (
        <LoginPopup
          onClose={handleClose}
          onLogin={() => setAuthView('login')}
          onRegister={() => setAuthView('register')}
        />
      )}

      {authView === 'login' && (
        <LoginForm
          onClose={handleClose}
          onGenericClick={() => setAuthView('selection')}
          onSubmit={async (data) => {
            try {
              const response = await authService.login(data.email, data.password);
              console.log('Login success:', response);
              setCurrentUser(response.data || response); // Handle potential response wrapping
              alert('登入成功');
              setAuthView('works-wall'); // Redirect to Works Wall
            } catch (error: any) {
              console.error(error);
              alert('登入失敗');
            }
          }}
        />
      )}

      {authView === 'register' && (
        <RegisterForm
          onClose={handleClose}
          onGenericClick={() => setAuthView('selection')}
          onSubmit={async (data) => {
            try {
              if (data.password !== data.confirmPassword) {
                alert('密碼與確認密碼不符');
                return;
              }
              // 1. Register
              await authService.register(data.email, data.password);

              // 2. Auto Login
              const loginResponse = await authService.login(data.email, data.password);
              setCurrentUser(loginResponse.data || loginResponse);

              alert('註冊並登入成功！請進行手機驗證');
              setAuthView('phone-input');

            } catch (error: any) {
              console.error('Registration/Login failed:', error);
              alert('註冊失敗');
            }
          }}
        />
      )}

      {authView === 'phone-input' && (
        <PhoneInputStep
          onBack={() => setAuthView('register')}
          onNext={(phone) => {
            setTempPhone(phone);
            setAuthView('sms-verify');
          }}
        />
      )}

      {authView === 'sms-verify' && (
        <SmsVerifyStep
          phoneNumber={tempPhone}
          onBack={() => setAuthView('phone-input')}
          onNext={() => {
            // Mock verification success
            setAuthView('sms-success');
          }}
        />
      )}

      {authView === 'sms-success' && (
        <SmsSuccessStep
          onNext={() => setAuthView('basic-info')}
        />
      )}

      {authView === 'sms-fail' && (
        <SmsFailStep
          onRetry={() => setAuthView('phone-input')}
        />
      )}

      {authView === 'basic-info' && (
        <div className="w-full h-full overflow-auto max-h-screen">
          <BasicInfoForm
            initialData={{
              phone: tempPhone
            }}
            onSubmit={async (data) => {
              console.log('Basic Info Submitted:', data);
              if (!currentUser || !currentUser.id) {
                alert('錯誤：無法取得使用者資訊，請重新登入');
                return;
              }

              try {
                // Map form data to API payload
                const payload = {
                  username: data.id,
                  // city: data.location, // Removed per request
                  gender: data.gender,
                  phone: data.phone,
                  bio: data.bio,
                  isPhotographer: data.roles.includes('photographer'),
                  isModel: data.roles.includes('model'),
                  avatarBase64: data.avatarPreview ? data.avatarPreview.split(',')[1] : "" // Strip header
                };

                await authService.updateProfile(currentUser.id, payload);
                alert('資料保存成功！进入系统');
                setAuthView('works-wall'); // Redirect to Works Wall
              } catch (error: any) {
                console.error('Update profile failed:', error);
                alert('保存失敗：' + (error.response?.data?.message || '未知錯誤'));
              }
            }}
          />
        </div>
      )}

      {authView === 'edit-profile' && (
        <div className="w-full h-full overflow-auto max-h-screen bg-white">
          <div className="max-w-[800px] mx-auto pt-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-[#333]">編輯個人資料</h2>
            <BasicInfoForm
              initialData={{
                id: "emma_stone2",
                // location: "臺北市", // Removed
                roles: ["model"],
                gender: "female",
                phone: tempPhone || "0912345678",
                bio: "凱渥專任簽約模特兒\n2021 Vogue 內頁p87 材質亞周年慶包的展示模特兒，左邊數來第3位",
                avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma"
              }}
              onSubmit={async (data) => {
                console.log('Updated Profile Data:', data);
                alert('資料更新成功！(模擬)');
                window.location.href = '?view=profile';
              }}
            />
          </div>
        </div>
      )}

      {authView === 'works-wall' && (
        <div className="w-full h-full">
          <WorksWall />
        </div>
      )}

      {authView === 'activities' && (
        <div className="w-full h-full">
          <ActivitiesPage />
        </div>
      )}

      {authView === 'create-activity' && (
        <div className="w-full h-full">
          <CreateActivityPage />
        </div>
      )}

      {authView === 'profile' && (
        <div className="w-full h-full">
          <UserProfilePage />
        </div>
      )}

      {authView === 'settings' && (
        <div className="w-full h-full">
          <SettingsPage />
        </div>
      )}

      {authView === 'activity-application-history' && (
        <div className="w-full h-full">
          <ActivityApplicationHistoryPage />
        </div>
      )}

      {authView === '404' && (
        <NotFoundPage />
      )}
    </div>
  )
}

export default App
