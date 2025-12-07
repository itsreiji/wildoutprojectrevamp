import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from '../router';
import { useAuth } from '../../contexts/AuthContext';
import { Background3D } from '../Background3D';
import { Button } from '../../components/ui/button';
import { SiGoogle } from 'react-icons/si';
import { Loader2, AlertTriangle, CheckCircle2, Eye, EyeOff, Shield, Clock, User, Mail, Lock } from 'lucide-react';
import { validateEmail, validatePasswordStrength, checkLoginRateLimit } from '../../utils/authValidation';
import { checkRateLimit } from '../../utils/security';
import { WCAGComplianceChecker } from './WCAGComplianceChecker';

const copy = {
  title: 'Admin access',
  subtitle: 'Sign in with your WildOut! administrator account to manage landing page content.',
  oauthProviders: {
    google: 'Continue with Google'
  },
  errorMessages: {
    authFailed: 'Authentication failed. Please try again.',
    unexpected: 'An unexpected error occurred. Please try again.',
    network: 'Network error. Please check your connection and try again.',
    popupBlocked: 'Popup blocked. Please allow popups for this site and try again.'
  },
  successMessages: {
    redirecting: 'Authentication successful. Redirecting...',
    welcomeBack: 'Welcome back!'
  }
};

export const LoginPage: React.FC = () => {
  const { signInWithOAuth, signInWithEmailPassword, role, loading, isAuthenticated, error: authError, getRememberedEmail } = useAuth();
  const { navigate } = useRouter();
  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get('redirect');
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [oauthLoading, setOAuthLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [email, setEmail] = useState(getRememberedEmail() || '');
  const [password, setPassword] = useState('');
  const [emailPasswordError, setEmailPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!getRememberedEmail());
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });
  const [passwordStrength, setPasswordStrength] = useState<{ strength: string; score: number; feedback: string[]; suggestions: string[] }>({ strength: 'weak', score: 0, feedback: [], suggestions: [] });
  const [rateLimitInfo, setRateLimitInfo] = useState<{ isBlocked: boolean; timeRemaining?: number }>({ isBlocked: false });

  // Enhanced error handling for OAuth
  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (isAuthenticated) {
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect');
      if (redirectTo) {
        navigate(redirectTo);
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, role, navigate]);

  const handleOAuthSignIn = async () => {
    setFormError(null);
    setInfoMessage(null);
    setOAuthLoading(true);

    try {
      // Check if popups are blocked
      const popupCheck = window.open('', '_blank');
      if (!popupCheck) {
        setFormError(copy.errorMessages.popupBlocked);
        setOAuthLoading(false);
        return;
      }
      popupCheck.close();

      const error = await signInWithOAuth('google');
      if (error) {
        // Enhanced error handling
        if (error.message.includes('network')) {
          setFormError(copy.errorMessages.network);
        } else {
          setFormError(error.message || copy.errorMessages.authFailed);
        }
      } else {
        setInfoMessage(copy.successMessages.redirecting);
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      if (error instanceof Error && error.message.includes('network')) {
        setFormError(copy.errorMessages.network);
      } else {
        setFormError(copy.errorMessages.unexpected);
      }
    } finally {
      setOAuthLoading(false);
    }
  };

  const handleEmailPasswordSignIn = async () => {
    setEmailPasswordError(null);
    setInfoMessage(null);
    setOAuthLoading(true);

    try {
      const error = await signInWithEmailPassword(email, password);
      if (error) {
        if (error.message.includes('invalid_credentials')) {
          setEmailPasswordError('Invalid email or password. Please try again.')
        } else if (error.message.includes('user_not_found')) {
          setEmailPasswordError('No account found with this email.')
        } else if (error.message.includes('too_many_requests')) {
          setEmailPasswordError('Too many login attempts. Please try again later.')
        } else {
          setEmailPasswordError(error.message || 'Authentication failed. Please try again.')
        }
      } else {
        setInfoMessage(copy.successMessages.redirecting);
      }
    } catch (error) {
      console.error('Email/password sign-in error:', error);
      setEmailPasswordError(copy.errorMessages.unexpected);
    } finally {
      setOAuthLoading(false);
    }
  };

  // Real-time email validation
  useEffect(() => {
    if (email) {
      const validation = validateEmail(email);
      setEmailValidation(validation);
    } else {
      setEmailValidation({ isValid: true, errors: [] });
    }
  }, [email]);

  // Real-time password strength check
  useEffect(() => {
    if (password) {
      const strength = validatePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ strength: 'weak', score: 0, feedback: [], suggestions: [] });
    }
  }, [password]);

  // Check rate limiting on email change
  useEffect(() => {
    if (email) {
      const rateLimit = checkLoginRateLimit(email);
      setRateLimitInfo(rateLimit);
    }
  }, [email]);

  // Password strength color mapping
  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-orange-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  // Password strength text
  const getStrengthText = (score: number) => {
    switch (score) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return 'Unknown';
    }
  };

  // Mobile responsiveness - adjust layout for smaller screens
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <div className="login-page dark relative min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <Background3D />
      <div className="login-container relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className={`login-card w-full space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl ${isMobile ? 'max-w-xs' : 'max-w-sm'}`}>
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent">
              {copy.title}
            </h1>
            <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-xs mx-auto">
              {copy.subtitle}
            </p>
          </div>

          {/* Enhanced error display with icons */}
          {formError && (
            <div className="error-message rounded-lg border border-red-500/20 bg-red-500/10 p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-300 flex-shrink-0" />
              <p className="text-sm text-red-300" role="alert">
                {formError}
              </p>
            </div>
          )}

          {/* Enhanced success display with icons */}
          {infoMessage && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300 flex-shrink-0" />
              <p className="text-sm text-emerald-300" role="status">
                {infoMessage}
              </p>
            </div>
          )}

          {/* Email/Password Form */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-3 rounded border bg-gray-800 text-white focus:outline-none focus:ring-2 transition-all ${emailValidation.isValid && email ? 'border-green-500 focus:ring-green-500/20' :
                  email && !emailValidation.isValid ? 'border-red-500 focus:ring-red-500/20' :
                    'border-white/20 focus:ring-white/20'
                  }`}
                placeholder="Enter your email"
                aria-describedby="email-validation"
                aria-invalid={!emailValidation.isValid && email.length > 0}
              />
              {email && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {emailValidation.isValid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  )}
                </div>
              )}
            </div>
            {!emailValidation.isValid && email.length > 0 && (
              <p id="email-validation" className="mt-2 text-sm text-red-400 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {emailValidation.errors[0]}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-3 rounded border bg-gray-800 text-white focus:outline-none focus:ring-2 transition-all ${passwordStrength.score >= 2 && password ? 'border-green-500 focus:ring-green-500/20' :
                  passwordStrength.score >= 1 && password ? 'border-yellow-500 focus:ring-yellow-500/20' :
                    password && passwordStrength.score === 0 ? 'border-red-500 focus:ring-red-500/20' :
                      'border-white/20 focus:ring-white/20'
                  }`}
                placeholder="Enter your password"
                aria-describedby="password-strength"
                aria-invalid={passwordStrength.score < 2 && password.length > 0}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-3" data-testid="password-strength">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Password Strength</span>
                  <span className={`font-medium ${passwordStrength.score >= 3 ? 'text-green-400' :
                    passwordStrength.score >= 2 ? 'text-yellow-400' :
                      passwordStrength.score >= 1 ? 'text-orange-400' : 'text-red-400'
                    }`}>
                    {getStrengthText(passwordStrength.score)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  />
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-400 space-y-1">
                    {passwordStrength.feedback.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-2 text-yellow-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {passwordStrength.suggestions.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-400 space-y-1">
                    {passwordStrength.suggestions.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-2 text-green-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          {emailPasswordError && (
            <div className="mb-4 p-2 bg-red-900/50 text-red-300 rounded flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>{emailPasswordError}</span>
            </div>
          )}

          {/* Rate Limit Warning */}
          {rateLimitInfo.isBlocked && (
            <div className="mb-4 p-3 bg-orange-900/50 text-orange-300 rounded-lg flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Account temporarily locked due to too many failed attempts. Please try again in{' '}
                {Math.ceil((rateLimitInfo.timeRemaining || 0) / 60000)} minute(s).
              </span>
            </div>
          )}

          {/* Remember Me and Password Toggle */}
          <div className="flex items-center justify-between mb-4 text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="form-checkbox h-4 w-4 text-pink-500 transition duration-150 ease-in-out"
              />
              <span className="text-gray-300">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-pink-400 hover:text-pink-300 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
          </div>

          <Button
            onClick={handleEmailPasswordSignIn}
            disabled={oauthLoading || rateLimitInfo.isBlocked || !emailValidation.isValid}
            className="w-full mb-4"
          >
            {oauthLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in with Email'
            )}
          </Button>

          <div className="mt-6">
            <Button
              variant="outline"
              className="google-button w-full flex items-center justify-center gap-2 border-white/10 bg-white/5 hover:bg-white/10 h-12 text-base transition-all-smooth"
              onClick={handleOAuthSignIn}
              disabled={oauthLoading || loading}
              aria-label="Sign in with Google"
            >
              {oauthLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating with Google...</span>
                </>
              ) : (
                <>
                  <SiGoogle className="h-5 w-5 text-[#EA4335]" />
                  <span className="font-medium">{copy.oauthProviders.google}</span>
                </>
              )}
            </Button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setShowTerms(!showTerms)}
              className="terms-toggle mobile-terms text-xs text-white/40 hover:text-white/60 transition-colors duration-200 flex items-center justify-center gap-1 mx-auto"
              aria-label="Toggle terms and conditions"
            >
              {showTerms ? 'Hide' : 'Show'} Terms & Conditions
              <span className={`transform transition-transform ${showTerms ? 'rotate-180' : 'rotate-0'}`}>
                ▼
              </span>
            </button>

            {showTerms && (
              <div className="mobile-terms mt-4 text-xs text-white/50 space-y-2">
                <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
                <p>We use Google OAuth for secure authentication.</p>
                <p>Your data is protected and only used for authentication purposes.</p>
              </div>
            )}
          </div>

          {/* WCAG Compliance Checker */}
          <WCAGComplianceChecker
            email={email}
            password={password}
            emailValidation={emailValidation}
            passwordStrength={passwordStrength}
            rateLimitInfo={rateLimitInfo}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        </div>
      </div>
    </div>
  );
};
