/**
 * OAuth Callback Component - Holland Flowers
 * Handles the redirect from OAuth2 provider (Google)
 * 
 * This component processes the tokens returned from the backend
 * after successful OAuth authentication
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TokenManager } from '../services/api';
import './OAuthCallback.css';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuth();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get tokens from URL parameters (sent by backend after OAuth)
        const accessToken = searchParams.get('token') || searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const errorParam = searchParams.get('error');

        // Check for error from OAuth provider
        if (errorParam) {
          setStatus('error');
          setError(decodeURIComponent(errorParam) || 'Authentication failed');
          setTimeout(() => navigate('/account'), 3000);
          return;
        }

        // If we have a token, process it
        if (accessToken) {
          // Store tokens
          TokenManager.setTokens(accessToken, refreshToken);

          // Try to get user info from token or fetch from backend
          try {
            // Decode JWT to get user info (basic decode, not verification)
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            const user = {
              id: payload.sub || payload.userId,
              email: payload.email,
              name: payload.name,
              roleName: payload.role || 'USER',
            };
            TokenManager.setUser(user);
            
            // Update auth context
            if (updateUser) {
              updateUser(user);
            }
          } catch (decodeError) {
            console.warn('Could not decode token, user info might be incomplete');
          }

          setStatus('success');
          
          // Redirect to stored path or home
          const redirectPath = sessionStorage.getItem('oauth_redirect') || '/';
          sessionStorage.removeItem('oauth_redirect');
          
          setTimeout(() => {
            navigate(redirectPath);
            // Force page reload to ensure auth state is updated
            window.location.reload();
          }, 1500);
        } else {
          // No token received - check if this is a direct callback from Google
          // The backend should redirect here with tokens
          setStatus('error');
          setError('No authentication token received. Please try again.');
          setTimeout(() => navigate('/account'), 3000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setError('Failed to complete authentication. Please try again.');
        setTimeout(() => navigate('/account'), 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, updateUser]);

  return (
    <div className="oauth-callback-container">
      <div className="oauth-callback-card">
        {status === 'processing' && (
          <>
            <div className="oauth-spinner"></div>
            <h2>Completing Sign In...</h2>
            <p>Please wait while we complete your Google sign-in.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="oauth-success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2>Success!</h2>
            <p>You have been signed in successfully. Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="oauth-error-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h2>Authentication Failed</h2>
            <p>{error}</p>
            <p className="redirect-notice">Redirecting to login page...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;