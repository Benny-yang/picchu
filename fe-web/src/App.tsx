import { useState, useEffect } from 'react';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { tokenManager } from './services/tokenManager';
import { authService } from './services/authService';
import { UserContext } from './context/UserContext';
import type { User } from './types';
import './App.css';

// Pages
import WorksWall from './components/works/WorksWall';
import ActivitiesPage from './pages/ActivitiesPage';
import UserProfilePage from './pages/UserProfilePage';
import CreateActivityPage from './pages/CreateActivityPage';
import SettingsPage from './pages/SettingsPage';
import ActivityApplicationHistoryPage from './pages/ActivityApplicationHistoryPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

// Auth views (modal-style flows handled inline)
import LoginPopup from './components/auth/LoginPopup';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import BasicInfoForm from './components/user/BasicInfoForm';

// ────────────────────────────────────────────
// Auth-gating wrapper: redirects to /login if not logged in
// ────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactElement }) {
  if (!tokenManager.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ────────────────────────────────────────────
// Auth flow pages
// ────────────────────────────────────────────
function LoginPage({ onLoginSuccess }: { onLoginSuccess: (user: User) => void }) {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab') || 'selection';

  // Store first_login parameter if present in URL
  useEffect(() => {
    if (params.get('first_login') === 'true') {
      sessionStorage.setItem('first_login', 'true');
    }
  }, [params]);

  const [view, setView] = useState<'selection' | 'login' | 'register'>(
    tab === 'login' ? 'login' : tab === 'register' ? 'register' : 'selection'
  );

  const handleLoginSuccess = async (response: any) => {
    const userData = response.data?.user || response.data || response;
    onLoginSuccess(userData);
    try {
      const fullUser = await authService.getMe();
      if (fullUser && !fullUser.error) onLoginSuccess(fullUser);
    } catch { /* ignore */ }
    const isFirstLogin = sessionStorage.getItem('first_login') === 'true';
    if (isFirstLogin) {
      sessionStorage.removeItem('first_login');
      navigate('/edit-profile');
    } else {
      navigate('/');
    }
  };

  if (view === 'selection') {
    return (
      <LoginPopup
        onClose={() => navigate('/')}
        onLogin={() => setView('login')}
        onRegister={() => setView('register')}
        onGuest={() => navigate('/')}
      />
    );
  }
  if (view === 'login') {
    return (
      <LoginForm
        onClose={() => navigate('/')}
        onGenericClick={() => setView('selection')}
        onSubmit={async (data) => {
          const response = await authService.login(data.email, data.password, data.rememberMe);
          await handleLoginSuccess(response);
        }}
      />
    );
  }
  return (
    <RegisterForm
      onClose={() => navigate('/')}
      onGenericClick={() => setView('selection')}
      onSubmit={async (data) => {
        if (data.password !== data.confirmPassword) throw new Error('密碼與確認密碼不符');
        await authService.register(data.email, data.password);
      }}
    />
  );
}

function EditProfilePage({ onUserUpdate }: { onUserUpdate: (u: User) => void }) {
  const navigate = useNavigate();
  const currentUser = tokenManager.getUser();

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
            phone: currentUser?.phone || '',
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
                avatarBase64: data.avatarPreview ? data.avatarPreview.split(',')[1] : '',
              };
              const updatedUser = await authService.updateProfile(payload);
              onUserUpdate(updatedUser);
              alert('資料更新成功！');
              navigate('/profile');
            } catch (error: any) {
              console.error('Update profile failed:', error);
              alert('保存失敗：' + (error.message || '未知錯誤'));
            }
          }}
        />
      </div>
    </div>
  );
}

function BasicInfoPage({ onUserUpdate }: { onUserUpdate: (u: User) => void }) {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full overflow-auto max-h-screen">
      <BasicInfoForm
        initialData={{ phone: '' }}
        onSubmit={async (data) => {
          try {
            const payload = {
              username: data.id,
              gender: data.gender,
              phone: data.phone,
              bio: data.bio,
              isPhotographer: data.roles.includes('photographer'),
              isModel: data.roles.includes('model'),
              avatarBase64: data.avatarPreview ? data.avatarPreview.split(',')[1] : '',
            };
            const updatedUser = await authService.updateProfile(payload);
            onUserUpdate(updatedUser);
            alert('資料保存成功！');
            navigate('/');
          } catch (error: any) {
            console.error('Update profile failed:', error);
            alert('保存失敗：' + (error.message || '未知錯誤'));
          }
        }}
      />
    </div>
  );
}

// ────────────────────────────────────────────
// Root Application
// ────────────────────────────────────────────
function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => tokenManager.getUser());

  useEffect(() => {
    // Save to tokenManager whenever currentUser changes
    if (currentUser) {
      tokenManager.saveUser(currentUser);
    }
  }, [currentUser]);

  // Validate session on app mount
  useEffect(() => {
    let isMounted = true;
    if (tokenManager.isLoggedIn()) {
      authService.getMe()
        .then((user) => {
          if (isMounted) {
            if (!user || user.error) {
              tokenManager.clearAll();
              setCurrentUser(null);
            } else {
              setCurrentUser(user);
            }
          }
        })
        .catch(() => {
          if (isMounted) {
            tokenManager.clearAll();
            setCurrentUser(null);
          }
        });
    }
    return () => { isMounted = false; };
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      <div className="min-h-screen bg-gray-100">
        <BrowserRouter>
          <Routes>
            {/* Auth */}
            <Route path="/login" element={<LoginPage onLoginSuccess={setCurrentUser} />} />
            <Route path="/basic-info" element={<RequireAuth><BasicInfoPage onUserUpdate={setCurrentUser} /></RequireAuth>} />
            <Route path="/edit-profile" element={<RequireAuth><EditProfilePage onUserUpdate={setCurrentUser} /></RequireAuth>} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Main App */}
            <Route path="/" element={<WorksWall currentUser={currentUser} />} />
            <Route path="/activities" element={<ActivitiesPage currentUser={currentUser} />} />
            <Route path="/activities/create" element={<RequireAuth><CreateActivityPage currentUser={currentUser} /></RequireAuth>} />
            <Route path="/profile" element={<UserProfilePage currentUser={currentUser} />} />
            <Route path="/profile/:uid" element={<UserProfilePage currentUser={currentUser} />} />
            <Route path="/settings" element={<RequireAuth><SettingsPage currentUser={currentUser} setCurrentUser={setCurrentUser} /></RequireAuth>} />
            <Route path="/applications" element={<RequireAuth><ActivityApplicationHistoryPage currentUser={currentUser} /></RequireAuth>} />

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </UserContext.Provider>
  );
}

export default App;
