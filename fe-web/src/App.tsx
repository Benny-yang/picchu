import { useState, useEffect } from 'react'
import ViewManager from './components/layout/ViewManager';
import { tokenManager } from './services/tokenManager';
import './App.css'

export type AuthView = 'selection' | 'login' | 'register' | 'phone-input' | 'sms-verify' | 'sms-success' | 'sms-fail' | 'basic-info' | 'works-wall' | 'activities' | 'create-activity' | 'profile' | 'edit-profile' | 'settings' | 'activity-application-history' | 'reset-password' | '404';

function App() {
  const [authView, setAuthView] = useState<AuthView>(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') as AuthView;
    const validViews = ['selection', 'login', 'register', 'phone-input', 'sms-verify', 'sms-success', 'sms-fail', 'basic-info', 'works-wall', 'activities', 'create-activity', 'profile', 'edit-profile', 'settings', 'activity-application-history', 'reset-password'];

    // Persist first_login flag so it survives through the login flow
    if (params.get('first_login') === 'true') {
      sessionStorage.setItem('first_login', 'true');
    }

    if (params.has('view')) {
      return validViews.includes(view) ? view : '404';
    }

    // If user is already logged in (has token), go directly to works-wall
    if (tokenManager.isLoggedIn()) {
      return 'works-wall';
    }

    return 'selection';
  });

  const [currentUser, setCurrentUser] = useState<any>(() => {
    // Restore user from localStorage on mount
    return tokenManager.getUser();
  });
  const [tempPhone, setTempPhone] = useState("");

  // Keep localStorage in sync when currentUser changes
  useEffect(() => {
    if (currentUser) {
      tokenManager.saveUser(currentUser);
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-100">
      <ViewManager
        view={authView}
        setView={setAuthView}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        tempPhone={tempPhone}
        setTempPhone={setTempPhone}
      />
    </div>
  )
}

export default App
