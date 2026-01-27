import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import './Account.css';

const Account = () => {
  const navigate = useNavigate();
  const { signup, login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [currentLang, setCurrentLang] = useState('en');
  const [isLogin, setIsLogin] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('+965');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Forgot Password Modal State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: OTP & new password
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const countryCodes = [
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+962', country: 'Jordan', flag: '🇯🇴' },
    { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
    { code: '+1', country: 'USA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
  ];

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);
    const handleLangChange = (e) => setCurrentLang(e.detail);
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setShowCountryDropdown(false);
    if (showCountryDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showCountryDropdown]);

  // Clear error/success on form switch
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [isLogin]);

  const t = {
    en: {
      login: 'Log In',
      signup: 'Sign Up',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      phone: 'Phone Number',
      loginBtn: 'Sign In',
      registerBtn: 'Register',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      or: 'or',
      continueWithGoogle: 'Continue with Google',
      welcomeBack: 'Welcome Back',
      createAccount: 'Create Your Account',
      loginSubtext: 'Sign in with your email and password',
      signupSubtext: 'Join us for exclusive offers and faster checkout',
      registering: 'Creating account...',
      signingIn: 'Signing in...',
      passwordMismatch: 'Passwords do not match',
      passwordRequirements: 'Password must be 8+ chars with uppercase, lowercase, number & special character',
      signupSuccess: 'Account created successfully!',
      loginSuccess: 'Login successful!',
      forgotPassword: 'Forgot password?',
      rememberMe: 'Remember me',
      // Forgot Password Modal
      forgotPasswordTitle: 'Reset Password',
      forgotPasswordSubtext: 'Enter your email to receive a reset code',
      enterEmail: 'Enter your email address',
      sendCode: 'Send Reset Code',
      sendingCode: 'Sending...',
      enterOtp: 'Enter the 4-digit code sent to your email',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      resetPassword: 'Reset Password',
      resettingPassword: 'Resetting...',
      backToLogin: 'Back to Login',
      codeSent: 'Reset code sent to your email!',
      passwordResetSuccess: 'Password reset successful! You can now login.',
      resendCode: 'Resend Code',
    },
    ar: {
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      loginBtn: 'تسجيل الدخول',
      registerBtn: 'تسجيل',
      noAccount: 'ليس لديك حساب؟',
      haveAccount: 'لديك حساب بالفعل؟',
      or: 'أو',
      continueWithGoogle: 'المتابعة مع جوجل',
      welcomeBack: 'مرحباً بعودتك',
      createAccount: 'إنشاء حسابك',
      loginSubtext: 'سجل الدخول باستخدام بريدك الإلكتروني وكلمة المرور',
      signupSubtext: 'انضم إلينا للحصول على عروض حصرية وإتمام الشراء بشكل أسرع',
      registering: 'جارٍ إنشاء الحساب...',
      signingIn: 'جارٍ تسجيل الدخول...',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      passwordRequirements: 'يجب أن تكون كلمة المرور 8+ أحرف مع حرف كبير وصغير ورقم ورمز خاص',
      signupSuccess: 'تم إنشاء الحساب بنجاح!',
      loginSuccess: 'تم تسجيل الدخول بنجاح!',
      forgotPassword: 'نسيت كلمة المرور؟',
      rememberMe: 'تذكرني',
      // Forgot Password Modal
      forgotPasswordTitle: 'إعادة تعيين كلمة المرور',
      forgotPasswordSubtext: 'أدخل بريدك الإلكتروني لتلقي رمز إعادة التعيين',
      enterEmail: 'أدخل بريدك الإلكتروني',
      sendCode: 'إرسال رمز التعيين',
      sendingCode: 'جارٍ الإرسال...',
      enterOtp: 'أدخل الرمز المكون من 4 أرقام المرسل إلى بريدك الإلكتروني',
      newPassword: 'كلمة المرور الجديدة',
      confirmNewPassword: 'تأكيد كلمة المرور الجديدة',
      resetPassword: 'إعادة تعيين كلمة المرور',
      resettingPassword: 'جارٍ إعادة التعيين...',
      backToLogin: 'العودة لتسجيل الدخول',
      codeSent: 'تم إرسال رمز إعادة التعيين إلى بريدك الإلكتروني!',
      passwordResetSuccess: 'تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.',
      resendCode: 'إعادة إرسال الرمز',
    }
  };

  const text = t[currentLang];

  // Validate password
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login({
        email: loginData.email.trim().toLowerCase(),
        password: loginData.password
      });
      
      if (result.success) {
        setSuccess(text.loginSuccess);
        // Redirect to home - AuthContext will update isAuthenticated
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupInputChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setError(text.passwordMismatch);
      return;
    }

    // Validate password strength
    if (!validatePassword(signupData.password)) {
      setError(text.passwordRequirements);
      return;
    }

    setLoading(true);

    try {
      // Format phone number with country code
      const fullPhoneNumber = signupData.phoneNumber 
        ? `${selectedCountry}${signupData.phoneNumber.replace(/\D/g, '')}` 
        : null;

      const requestData = {
        name: signupData.name.trim(),
        email: signupData.email.trim().toLowerCase(),
        phoneNumber: fullPhoneNumber,
        password: signupData.password,
      };

      console.log('Signup request:', requestData);

      const result = await signup(requestData);
      console.log('Signup result:', result);

      if (result.success) {
        setSuccess(text.signupSuccess);
        
        // Redirect after short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Sign-In
  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (document.getElementById('google-identity-script')) return;
      
      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };
    
    loadGoogleScript();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check if Google Identity Services is loaded
      if (!window.google?.accounts?.oauth2) {
        // Fallback: Try loading the script again
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
        
        // Wait a bit for initialization
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Your Google Client ID - Replace with your actual Client ID from Google Cloud Console
      const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
      
      if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
        setError('Google Sign-In is not configured. Please contact support.');
        setLoading(false);
        return;
      }

      // Initialize Google OAuth2 client
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: async (response) => {
          if (response.error) {
            console.error('Google OAuth error:', response);
            setError('Google sign-in failed. Please try again.');
            setLoading(false);
            return;
          }

          try {
            // Get user info from Google
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            });
            
            const userInfo = await userInfoResponse.json();
            
            // Send to your backend for authentication/registration
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://www.flowerskw.com/api/v1';
            
            const backendResponse = await fetch(`${API_BASE_URL}/auth/google`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                googleId: userInfo.sub,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                accessToken: response.access_token
              })
            });
            
            const data = await backendResponse.json();
            
            if (data.success && data.data) {
              // Store tokens
              const { accessToken, refreshToken, user } = data.data;
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('adminToken', accessToken);
              if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
              }
              localStorage.setItem('user', JSON.stringify(user));
              
              setSuccess(text.loginSuccess);
              
              // Redirect to home
              setTimeout(() => {
                navigate('/');
                window.location.reload();
              }, 500);
            } else {
              setError(data.message || 'Google sign-in failed. Please try again.');
            }
          } catch (err) {
            console.error('Backend auth error:', err);
            setError('Failed to complete sign-in. Please try again.');
          } finally {
            setLoading(false);
          }
        },
      });

      // Trigger Google sign-in popup
      client.requestAccessToken();
      
    } catch (err) {
      console.error('Google login error:', err);
      setError('Failed to initialize Google sign-in. Please try again.');
      setLoading(false);
    }
  };

  const getSelectedCountryData = () => {
    return countryCodes.find(c => c.code === selectedCountry) || countryCodes[0];
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setForgotPasswordStep(1);
    setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmNewPassword: '' });
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep(1);
    setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmNewPassword: '' });
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setForgotPasswordError('');
    setForgotPasswordLoading(true);

    try {
      const response = await authService.forgotPassword(forgotPasswordData.email.trim().toLowerCase());
      
      if (response.success) {
        setForgotPasswordSuccess(text.codeSent);
        setForgotPasswordStep(2);
      } else {
        setForgotPasswordError(response.message || 'Failed to send reset code. Please try again.');
      }
    } catch (err) {
      setForgotPasswordError(err.message || 'Failed to send reset code. Please check your email and try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordError('');

    // Validate passwords match
    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmNewPassword) {
      setForgotPasswordError(text.passwordMismatch);
      return;
    }

    // Validate password strength
    if (!validatePassword(forgotPasswordData.newPassword)) {
      setForgotPasswordError(text.passwordRequirements);
      return;
    }

    setForgotPasswordLoading(true);

    try {
      const response = await authService.resetPassword({
        email: forgotPasswordData.email.trim().toLowerCase(),
        otp: forgotPasswordData.otp,
        newPassword: forgotPasswordData.newPassword
      });

      if (response.success) {
        setForgotPasswordSuccess(text.passwordResetSuccess);
        // Close modal after 2 seconds and show login form
        setTimeout(() => {
          handleCloseForgotPassword();
          setIsLogin(true);
        }, 2000);
      } else {
        setForgotPasswordError(response.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setForgotPasswordError(err.message || 'Failed to reset password. Please check your OTP and try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResendCode = async () => {
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setForgotPasswordLoading(true);

    try {
      const response = await authService.forgotPassword(forgotPasswordData.email.trim().toLowerCase());
      if (response.success) {
        setForgotPasswordSuccess(text.codeSent);
      }
    } catch (err) {
      setForgotPasswordError(err.message || 'Failed to resend code.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="account-page">
        <div className="auth-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`account-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      <div className="account-container">
        <div className="account-form-section">
          <div className="account-form-wrapper">
            <div className="account-tabs">
              <button 
                className={`account-tab ${isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              >
                {text.login}
              </button>
              <button 
                className={`account-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              >
                {text.signup}
              </button>
            </div>

            <div className="form-header">
              <h1>{isLogin ? text.welcomeBack : text.createAccount}</h1>
              <p>{isLogin ? text.loginSubtext : text.signupSubtext}</p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                {success}
              </div>
            )}

            {isLogin && (
              <>
                <form onSubmit={handleLogin} className="account-form">
                  <div className="form-group">
                    <label>{text.email}</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <input 
                        type="email" 
                        name="email"
                        placeholder={text.email}
                        value={loginData.email}
                        onChange={handleLoginInputChange}
                        required 
                        disabled={loading}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{text.password}</label>
                    <div className="input-wrapper password-wrapper">
                      <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <input 
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder={text.password}
                        value={loginData.password}
                        onChange={handleLoginInputChange}
                        required 
                        disabled={loading}
                        autoComplete="current-password"
                      />
                      <button 
                        type="button" 
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="form-options">
                    <button 
                      type="button" 
                      className="forgot-password-link"
                      onClick={handleForgotPassword}
                    >
                      {text.forgotPassword}
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    className="submit-btn login-btn" 
                    disabled={loading || !loginData.email || !loginData.password}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-small"></span>
                        {text.signingIn}
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                          <polyline points="10 17 15 12 10 7"/>
                          <line x1="15" y1="12" x2="3" y2="12"/>
                        </svg>
                        {text.loginBtn}
                      </>
                    )}
                  </button>
                </form>

                <div className="form-divider"><span>{text.or}</span></div>
                <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {text.continueWithGoogle}
                </button>
              </>
            )}

            {!isLogin && (
              <>
                <form onSubmit={handleRegister} className="account-form">
                  <div className="form-group">
                    <label>{text.fullName} *</label>
                    <input 
                      type="text" 
                      name="name"
                      placeholder={text.fullName} 
                      value={signupData.name}
                      onChange={handleSignupInputChange}
                      required 
                      disabled={loading}
                      minLength={2}
                      maxLength={100}
                    />
                  </div>

                  <div className="form-group">
                    <label>{text.phone}</label>
                    <div className="phone-input-group">
                      <div 
                        className="country-selector"
                        onClick={(e) => { e.stopPropagation(); setShowCountryDropdown(!showCountryDropdown); }}
                      >
                        <span className="country-flag">{getSelectedCountryData().flag}</span>
                        <span className="country-code">{selectedCountry}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                        
                        {showCountryDropdown && (
                          <div className="country-dropdown">
                            {countryCodes.map((country) => (
                              <div 
                                key={country.code}
                                className={`country-option ${selectedCountry === country.code ? 'selected' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCountry(country.code);
                                  setShowCountryDropdown(false);
                                }}
                              >
                                <span className="country-flag">{country.flag}</span>
                                <span className="country-name">{country.country}</span>
                                <span className="country-code">{country.code}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <input 
                        type="tel" 
                        name="phoneNumber"
                        placeholder="XXXX XXXX" 
                        value={signupData.phoneNumber}
                        onChange={(e) => setSignupData(prev => ({ 
                          ...prev, 
                          phoneNumber: e.target.value.replace(/\D/g, '') 
                        }))}
                        className="phone-input" 
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{text.email} *</label>
                    <input 
                      type="email" 
                      name="email"
                      placeholder={text.email} 
                      value={signupData.email}
                      onChange={handleSignupInputChange}
                      required 
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>{text.password} *</label>
                    <div className="input-wrapper password-wrapper">
                      <input 
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder={text.password} 
                        value={signupData.password}
                        onChange={handleSignupInputChange}
                        required 
                        disabled={loading}
                        minLength={8}
                      />
                      <button 
                        type="button" 
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    <small className="password-hint">
                      {text.passwordRequirements}
                    </small>
                  </div>

                  <div className="form-group">
                    <label>{text.confirmPassword} *</label>
                    <div className="input-wrapper password-wrapper">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder={text.confirmPassword} 
                        value={signupData.confirmPassword}
                        onChange={handleSignupInputChange}
                        required 
                        disabled={loading}
                        minLength={8}
                      />
                      <button 
                        type="button" 
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="submit-btn register-btn"
                    disabled={loading || !signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-small"></span>
                        {text.registering}
                      </>
                    ) : (
                      text.registerBtn
                    )}
                  </button>
                </form>

                <div className="form-divider"><span>{text.or}</span></div>
                <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {text.continueWithGoogle}
                </button>
              </>
            )}

            <p className="switch-form">
              {isLogin ? text.noAccount : text.haveAccount}{' '}
              <span onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}>
                {isLogin ? text.signup : text.login}
              </span>
            </p>
          </div>
        </div>

        <div className="account-decor-section">
          <div className="decor-content">
            <div className="decor-logo">
              <img src="/Holland-Logo.png" alt="Holland Flowers" />
            </div>
            <h2>{currentLang === 'ar' ? 'هولاند فلاورز' : 'Holland Flowers'}</h2>
            <p>{currentLang === 'ar' ? 'أجمل الزهور الطازجة في الكويت' : 'The finest fresh flowers in Kuwait'}</p>
            
            <div className="decor-features">
              <div className="feature-item">
                <span className="feature-icon">🚚</span>
                <span>{currentLang === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌸</span>
                <span>{currentLang === 'ar' ? 'زهور طازجة' : 'Fresh Flowers'}</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💯</span>
                <span>{currentLang === 'ar' ? 'ضمان الجودة' : 'Quality Guarantee'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={handleCloseForgotPassword}>
          <div className="modal-content forgot-password-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseForgotPassword}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="modal-header">
              <div className="modal-icon">🔐</div>
              <h2>{text.forgotPasswordTitle}</h2>
              <p>{forgotPasswordStep === 1 ? text.forgotPasswordSubtext : text.enterOtp}</p>
            </div>

            {forgotPasswordError && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {forgotPasswordError}
              </div>
            )}

            {forgotPasswordSuccess && (
              <div className="alert alert-success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                {forgotPasswordSuccess}
              </div>
            )}

            {forgotPasswordStep === 1 ? (
              /* Step 1: Enter Email */
              <form onSubmit={handleSendResetCode} className="forgot-password-form">
                <div className="form-group">
                  <label>{text.email}</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input
                      type="email"
                      placeholder={text.enterEmail}
                      value={forgotPasswordData.email}
                      onChange={(e) => setForgotPasswordData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={forgotPasswordLoading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={forgotPasswordLoading || !forgotPasswordData.email}
                >
                  {forgotPasswordLoading ? (
                    <>
                      <span className="spinner-small"></span>
                      {text.sendingCode}
                    </>
                  ) : (
                    text.sendCode
                  )}
                </button>

                <button
                  type="button"
                  className="back-to-login-btn"
                  onClick={handleCloseForgotPassword}
                >
                  {text.backToLogin}
                </button>
              </form>
            ) : (
              /* Step 2: Enter OTP and New Password */
              <form onSubmit={handleResetPassword} className="forgot-password-form">
                <div className="form-group">
                  <label>{currentLang === 'ar' ? 'رمز التحقق' : 'Verification Code'}</label>
                  <div className="otp-input-wrapper">
                    <input
                      type="text"
                      className="otp-input"
                      placeholder="0000"
                      value={forgotPasswordData.otp}
                      onChange={(e) => setForgotPasswordData(prev => ({ 
                        ...prev, 
                        otp: e.target.value.replace(/\D/g, '').slice(0, 4)
                      }))}
                      required
                      disabled={forgotPasswordLoading}
                      maxLength={4}
                      autoComplete="one-time-code"
                    />
                  </div>
                  <button
                    type="button"
                    className="resend-code-btn"
                    onClick={handleResendCode}
                    disabled={forgotPasswordLoading}
                  >
                    {text.resendCode}
                  </button>
                </div>

                <div className="form-group">
                  <label>{text.newPassword}</label>
                  <div className="input-wrapper password-wrapper">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={text.newPassword}
                      value={forgotPasswordData.newPassword}
                      onChange={(e) => setForgotPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                      disabled={forgotPasswordLoading}
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  <small className="password-hint">{text.passwordRequirements}</small>
                </div>

                <div className="form-group">
                  <label>{text.confirmNewPassword}</label>
                  <div className="input-wrapper password-wrapper">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={text.confirmNewPassword}
                      value={forgotPasswordData.confirmNewPassword}
                      onChange={(e) => setForgotPasswordData(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                      required
                      disabled={forgotPasswordLoading}
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={forgotPasswordLoading || !forgotPasswordData.otp || !forgotPasswordData.newPassword || !forgotPasswordData.confirmNewPassword}
                >
                  {forgotPasswordLoading ? (
                    <>
                      <span className="spinner-small"></span>
                      {text.resettingPassword}
                    </>
                  ) : (
                    text.resetPassword
                  )}
                </button>

                <button
                  type="button"
                  className="back-to-login-btn"
                  onClick={() => setForgotPasswordStep(1)}
                >
                  ← {currentLang === 'ar' ? 'رجوع' : 'Back'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;