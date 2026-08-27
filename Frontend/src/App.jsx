import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ServiceRequests from './pages/ServiceRequests';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('app_user');
    const token = localStorage.getItem('app_token');
    return saved && token ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState(() => {
    const token = localStorage.getItem('app_token');
    return token ? 'dashboard' : 'login';
  });

  // Handle unauthorized event dispatched by Axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      handleLogout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const handleLoginSuccess = (authData) => {
    if (authData.token) {
      localStorage.setItem('app_token', authData.token);
    }
    const userObj = {
      id: authData.id,
      name: authData.name,
      email: authData.email,
    };
    localStorage.setItem('app_user', JSON.stringify(userObj));
    setCurrentUser(userObj);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('app_token');
    localStorage.removeItem('app_user');
    setCurrentUser(null);
    setCurrentView('login');
  };

  return (
    <div className="app-container">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {currentView === 'register' && (
          <Register onNavigateToLogin={() => setCurrentView('login')} />
        )}

        {currentView === 'login' && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentView('register')}
          />
        )}

        {currentView === 'dashboard' &&
          (currentUser ? (
            <Dashboard
              currentUser={currentUser}
              onNavigateToRequests={() => setCurrentView('requests')}
              onLogout={handleLogout}
            />
          ) : (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onNavigateToRegister={() => setCurrentView('register')}
            />
          ))}

        {currentView === 'requests' &&
          (currentUser ? (
            <ServiceRequests currentUser={currentUser} />
          ) : (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onNavigateToRegister={() => setCurrentView('register')}
            />
          ))}
      </main>
    </div>
  );
}
