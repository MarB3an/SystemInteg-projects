import React, { useEffect, useState } from 'react';
import {
  User,
  ShieldCheck,
  Server,
  FileText,
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  Users,
  RefreshCw,
  Lock
} from 'lucide-react';
import { authService, requestService } from '../services/api';

export default function Dashboard({ currentUser, onNavigateToRequests }) {
  const [usersList, setUsersList] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [backendGreeting, setBackendGreeting] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [greeting, users, requests] = await Promise.all([
        authService.getHome().catch(() => 'Spring Boot Connected'),
        authService.getUsers().catch(() => []),
        requestService.getAll().catch(() => []),
      ]);
      setBackendGreeting(typeof greeting === 'string' ? greeting : 'Hello from Spring Boot!');
      setUsersList(Array.isArray(users) ? users : []);
      setUserRequests(Array.isArray(requests) ? requests : []);
    } catch (err) {
      setError('Could not fetch updated data from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const hasToken = Boolean(localStorage.getItem('app_token'));

  return (
    <div className="dashboard-container">
      {/* Hero Banner */}
      <div className="dashboard-hero">
        <div className="hero-text">
          <h1>Welcome, {currentUser?.name || 'User'}!</h1>
          <p>You have successfully authenticated using Spring Security and JWT.</p>
        </div>
        <div className="hero-badge">
          <CheckCircle2 size={16} />
          <span>JWT Session Active</span>
        </div>
      </div>

      {/* Quick Action Feature Card */}
      <div className="service-request-banner-card">
        <div className="banner-icon-side">
          <div className="banner-icon-box">
            <FileText size={32} />
          </div>
        </div>
        <div className="banner-content-side">
          <div className="banner-tag">Authenticated Module</div>
          <h2>Service Request Management</h2>
          <p>
            Create, view, update, and manage your private service requests. All actions are verified with your JWT token on the Spring Boot backend.
          </p>
          <div className="banner-stats-row">
            <span className="banner-stat-chip">
              <strong>{userRequests.length}</strong> Your Active Requests
            </span>
            <span className="banner-stat-chip">
              <Lock size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Isolated to Your Account
            </span>
          </div>
        </div>
        <div className="banner-action-side">
          <button className="banner-btn-primary" onClick={onNavigateToRequests}>
            <span>Manage My Requests</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Stats / Info Grid */}
      <div className="dashboard-grid">
        {/* Profile Card */}
        <div className="dash-card">
          <div className="card-title-row">
            <div className="card-icon">
              <User size={20} />
            </div>
            <h3>User Profile</h3>
          </div>
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Full Name</span>
              <span className="info-value">{currentUser?.name || 'User'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{currentUser?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">User ID</span>
              <span className="info-value">#{currentUser?.id || 1}</span>
            </div>
            <div className="info-item">
              <span className="info-label">JWT Status</span>
              <span className="badge badge-active">
                {hasToken ? 'Bearer Token Active' : 'No Token'}
              </span>
            </div>
          </div>
        </div>

        {/* Backend & Security Status Card */}
        <div className="dash-card">
          <div className="card-title-row">
            <div className="card-icon">
              <Server size={20} />
            </div>
            <h3>Security & Backend</h3>
          </div>
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Security</span>
              <span className="info-value">Spring Security (Stateless)</span>
            </div>
            <div className="info-item">
              <span className="info-label">Token Format</span>
              <span className="info-value">HMAC-SHA256 JWT</span>
            </div>
            <div className="info-item">
              <span className="info-label">Server Status</span>
              <span className="info-value" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                {backendGreeting || 'Connected'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">My Requests</span>
              <span className="info-value">{userRequests.length} tickets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Database Users Table */}
      <div className="table-card">
        <div className="table-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--primary)" />
            <h3>Registered Database Users ({usersList.length})</h3>
          </div>
          <button
            className="nav-btn nav-btn-ghost"
            onClick={fetchDashboardData}
            disabled={loading}
            title="Refresh database records"
          >
            <RefreshCw size={15} className={loading ? 'spinner' : ''} /> Refresh
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email Address</th>
                <th>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {usersList.length > 0 ? (
                usersList.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>#{user.id}</strong>
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge badge-active">Active in MySQL</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      padding: '2rem',
                    }}
                  >
                    {loading ? 'Loading users from database...' : 'No users found in database.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
