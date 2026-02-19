import React, { useState } from 'react';
import './AdminLogin.css';

// ⚠️ IMPORTANT: This MUST match the API_BASE_URL in api.js exactly.
// Both files must point to the same backend server so the token issued at
// login is valid when used for uploads and other API calls.
const API_URL = process.env.REACT_APP_API_URL || 'https://www.flowerskw.com/api/v1';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Direct API call to login
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      const data = await response.json();
      
      console.log('Login response:', data); // Debug

      if (data.success && data.data) {
        const { user, accessToken, refreshToken } = data.data;
        
        // Check if user is admin (roleId 2 or 3, or roleName ADMIN/SUPER_ADMIN)
        const isAdmin = 
          user.roleName === 'ADMIN' || 
          user.roleName === 'SUPER_ADMIN' ||
          user.roleId === 2 || 
          user.roleId === 3;

        if (isAdmin) {
          // Store tokens - save under BOTH keys for compatibility with api.js
          localStorage.setItem('adminToken', accessToken);
          localStorage.setItem('accessToken', accessToken);  // ← also store as accessToken
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('adminUser', JSON.stringify(user));
          
          // Call onLogin callback
          onLogin(user);
        } else {
          setError('Access denied. Admin privileges required.');
        }
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-background">
        <div className="bg-gradient"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-wrapper">
              <img 
                src="/Holland-Logo.png" 
                alt="Holland Flowers" 
                className="admin-logo"
              />
            </div>
            <h1 className="login-title">Admin Portal</h1>
            <p className="login-subtitle">Holland Flowers Management System</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`login-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>© 2024 Holland Flowers. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;