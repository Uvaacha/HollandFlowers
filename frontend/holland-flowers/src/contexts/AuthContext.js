/**
 * Authentication Context - Holland Flowers
 * Provides authentication state and methods across the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import { TokenManager } from '../services/api';

// Create context
const AuthContext = createContext(null);

// Helper to dispatch auth events for CartContext sync
const dispatchAuthEvent = (type, data = {}) => {
  window.dispatchEvent(new CustomEvent('authChange', { 
    detail: { type, ...data } 
  }));
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = TokenManager.getAccessToken();
        const cachedUser = TokenManager.getUser();
        
        if (token && cachedUser) {
          setUser(cachedUser);
          setIsAuthenticated(true);
          
          // Dispatch login event for cart sync on page reload when already logged in
          dispatchAuthEvent('login', { user: cachedUser });
          
          // Optionally refresh user data from server
          try {
            const response = await userService.getProfile();
            if (response.success && response.data) {
              setUser(response.data);
            }
          } catch (err) {
            // If profile fetch fails, still use cached data
            console.warn('Failed to refresh user profile:', err);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Listen for auth errors (e.g., token expired)
  useEffect(() => {
    const handleAuthError = (event) => {
      console.warn('Auth error:', event.detail);
      handleLogout();
    };

    const handleLogoutEvent = () => {
      handleLogout();
    };

    window.addEventListener('authError', handleAuthError);
    window.addEventListener('logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('authError', handleAuthError);
      window.removeEventListener('logout', handleLogoutEvent);
    };
  }, []);

  // Login handler
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Dispatch login event for cart sync
        dispatchAuthEvent('login', { user: response.data.user });
        
        return { success: true, user: response.data.user };
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      setError(err.message || 'Login failed');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Signup handler
  const signup = useCallback(async (signupData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.signup(signupData);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Dispatch login event for cart sync
        dispatchAuthEvent('login', { user: response.data.user });
        
        return { success: true, user: response.data.user };
      }
      
      throw new Error(response.message || 'Signup failed');
    } catch (err) {
      setError(err.message || 'Signup failed');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // OTP Login handlers
  const requestOtp = useCallback(async (emailOrPhone) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.requestOtp(emailOrPhone);
      return { success: true, message: response.message };
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (emailOrPhone, otp) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.verifyOtp({ emailOrPhone, otp });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Dispatch login event for cart sync
        dispatchAuthEvent('login', { user: response.data.user });
        
        return { success: true, user: response.data.user };
      }
      
      throw new Error(response.message || 'OTP verification failed');
    } catch (err) {
      setError(err.message || 'OTP verification failed');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout handler
  const handleLogout = useCallback(() => {
    // Dispatch logout event BEFORE clearing state for cart sync
    dispatchAuthEvent('logout');
    
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  // Update user data
  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    TokenManager.setUser({ ...user, ...userData });
  }, [user]);

  // Password reset handlers
  const forgotPassword = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.forgotPassword(email);
      return { success: true, message: response.message };
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (resetData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.resetPassword(resetData);
      return { success: true, message: response.message };
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return user && (user.roleName === 'ADMIN' || user.roleName === 'SUPER_ADMIN');
  }, [user]);

  // Context value
  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Auth methods
    login,
    signup,
    logout: handleLogout,
    
    // OTP methods
    requestOtp,
    verifyOtp,
    
    // Password methods
    forgotPassword,
    resetPassword,
    
    // User methods
    updateUser,
    
    // Utility methods
    isAdmin,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Higher-order component for protected routes
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return (
        <div className="auth-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      // Redirect to login or show message
      window.location.href = '/account';
      return null;
    }
    
    return <Component {...props} />;
  };
};

// Higher-order component for admin routes
export const withAdmin = (Component) => {
  return function AdminComponent(props) {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();
    
    if (isLoading) {
      return (
        <div className="auth-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }
    
    if (!isAuthenticated || !isAdmin()) {
      // Redirect to home or show unauthorized message
      window.location.href = '/';
      return null;
    }
    
    return <Component {...props} />;
  };
};

export default AuthContext;