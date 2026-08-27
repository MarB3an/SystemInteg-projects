import React from 'react';
import { UserCheck, LogIn, UserPlus, LogOut, LayoutDashboard, FileText, User } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, currentUser, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-content">
        <div
          className="nav-brand"
          onClick={() => setCurrentView(currentUser ? 'dashboard' : 'login')}
        >
          <UserCheck size={26} />
          <span>AppPortal</span>
        </div>

        <nav className="nav-links">
          {!currentUser ? (
            <>
              <button
                className={`nav-btn nav-btn-ghost ${currentView === 'login' ? 'active' : ''}`}
                onClick={() => setCurrentView('login')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <LogIn size={16} /> Login
                </span>
              </button>
              <button
                className={`nav-btn ${currentView === 'register' ? 'nav-btn-primary' : 'nav-btn-ghost'}`}
                onClick={() => setCurrentView('register')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <UserPlus size={16} /> Register
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                className={`nav-btn nav-btn-ghost ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('dashboard')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <LayoutDashboard size={16} /> Dashboard
                </span>
              </button>

              <button
                className={`nav-btn nav-btn-ghost ${currentView === 'requests' ? 'active' : ''}`}
                onClick={() => setCurrentView('requests')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> My Service Requests
                </span>
              </button>

              <div className="nav-user-badge" title={currentUser?.email}>
                <div className="nav-user-avatar">
                  <User size={14} />
                </div>
                <span className="nav-user-name">
                  {currentUser?.name || currentUser?.email?.split('@')[0] || 'Account'}
                </span>
              </div>

              <button className="nav-btn nav-btn-logout" onClick={onLogout}>
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
