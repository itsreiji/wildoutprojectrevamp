import React, { useEffect, useState } from 'react';
import { useRouter } from '../router';
import { useAuth } from '../../contexts/AuthContext';
import { Background3D } from '../Background3D';
import { Button } from '../../components/ui/button';
import { SiGoogle } from 'react-icons/si';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
  const { signInWithOAuth, signInWithEmailPassword, role, loading, isAuthenticated, error: authError } = useAuth();
  const { navigate } = useRouter();
  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get('redirect');
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [oauthLoading, setOAuthLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailPasswordError, setEmailPasswordError] = useState<string | null>(null);

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
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded border bg-gray-800 text-white"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded border bg-gray-800 text-white"
              placeholder="Enter your password"
            />
          </div>
          {emailPasswordError && (
            <div className="mb-4 p-2 bg-red-900/50 text-red-300 rounded flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>{emailPasswordError}</span>
            </div>
          )}
          <Button
            onClick={handleEmailPasswordSignIn}
            disabled={oauthLoading}
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
        </div>
      </div>
    </div>
  );
};

