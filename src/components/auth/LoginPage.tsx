import React, { useEffect, useState } from 'react';
import { useRouter } from '../router';
import { useAuth } from '../../contexts/AuthContext';
import { Background3D } from '../Background3D';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { SiGoogle } from 'react-icons/si';
import { Loader2, AlertTriangle, CheckCircle2, Eye, EyeOff, Mail, Lock, Clock } from 'lucide-react';
import { validatePasswordStrength, checkLoginRateLimit } from '../../utils/authValidation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

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
  }
};

export const LoginPage: React.FC = () => {
  const { signInWithOAuth, signInWithEmailPassword, role, loading, isAuthenticated, error: authError, getRememberedEmail } = useAuth();
  const { navigate } = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [oauthLoading, setOAuthLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ strength: string; score: number; feedback: string[]; suggestions: string[] }>({ strength: 'weak', score: 0, feedback: [], suggestions: [] });
  const [rateLimitInfo, setRateLimitInfo] = useState<{ isBlocked: boolean; timeRemaining?: number }>({ isBlocked: false });

  // Initial values
  const rememberedEmail = getRememberedEmail();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any, // Cast to any to resolve strict type mismatch with RHF Resolver
    defaultValues: {
      email: rememberedEmail || '',
      password: '',
      rememberMe: !!rememberedEmail,
    },
  });

  const { watch } = form;
  const email = watch('email');
  const password = watch('password');

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

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    setInfoMessage(null);
    setOAuthLoading(true);

    try {
      const error = await signInWithEmailPassword(values.email, values.password);
      if (error) {
        if (error.message.includes('invalid_credentials')) {
          setFormError('Invalid email or password. Please try again.')
        } else if (error.message.includes('user_not_found')) {
          setFormError('No account found with this email.')
        } else if (error.message.includes('too_many_requests')) {
          setFormError('Too many login attempts. Please try again later.')
        } else {
          setFormError(error.message || 'Authentication failed. Please try again.')
        }
      } else {
        setInfoMessage(copy.successMessages.redirecting);
      }
    } catch (error) {
      console.error('Email/password sign-in error:', error);
      setFormError(copy.errorMessages.unexpected);
    } finally {
      setOAuthLoading(false);
    }
  };

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
    <div className="login-page relative min-h-screen bg-background text-foreground overflow-x-hidden" id="admin-login-page">
      <Background3D />
      <div className="login-container relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className={`login-card w-full space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl ${isMobile ? 'max-w-xs' : 'max-w-sm'}`} id="admin-login-card">
          <div className="text-center" id="admin-login-header">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent" id="admin-login-title">
              {copy.title}
            </h1>
            <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-xs mx-auto" id="admin-login-subtitle">
              {copy.subtitle}
            </p>
          </div>

          {/* Enhanced error display with icons */}
          {formError && (
            <div className="error-message rounded-lg border border-red-500/20 bg-red-500/10 p-3 flex items-center gap-2" id="admin-login-error-message">
              <AlertTriangle className="h-4 w-4 text-red-300 flex-shrink-0" id="admin-login-error-icon" />
              <p className="text-sm text-red-300" id="admin-login-error-text" role="alert">
                {formError}
              </p>
            </div>
          )}

          {/* Enhanced success display with icons */}
          {infoMessage && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-center gap-2" id="admin-login-success-message">
              <CheckCircle2 className="h-4 w-4 text-emerald-300 flex-shrink-0" id="admin-login-success-icon" />
              <p className="text-sm text-emerald-300" id="admin-login-success-text" role="status">
                {infoMessage}
              </p>
            </div>
          )}

          {/* Email/Password Form */}
          <Form {...form}>
            <form className="space-y-6" id="admin-login-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem id="admin-login-email-field">
                    <FormLabel className="flex items-center gap-2 text-white/80" id="admin-login-email-label">
                      <Mail className="h-4 w-4" id="admin-login-email-icon" /> Email
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="admin-login-email-input"
                          placeholder="Enter your email"
                          {...field}
                          className="bg-gray-800 border-white/20 text-white focus:ring-2 focus:ring-[#E93370]/50"
                        />
                        {field.value && !form.formState.errors.email && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2" id="admin-login-email-valid-indicator">
                            <CheckCircle2 className="h-5 w-5 text-green-400" id="admin-login-email-valid-icon" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage id="admin-login-email-error-message" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem id="admin-login-password-field">
                    <FormLabel className="flex items-center gap-2 text-white/80" id="admin-login-password-label">
                      <Lock className="h-4 w-4" id="admin-login-password-icon" /> Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="admin-login-password-input"
                          placeholder="Enter your password"
                          type={showPassword ? 'text' : 'password'}
                          {...field}
                          className="bg-gray-800 border-white/20 text-white focus:ring-2 focus:ring-[#E93370]/50"
                        />
                        <button
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          id="admin-login-password-toggle"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" id="admin-login-password-hide-icon" /> : <Eye className="h-5 w-5" id="admin-login-password-show-icon" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage id="admin-login-password-error-message" />

                    {/* Password Strength Indicator */}
                    {field.value && (
                      <div className="mt-3" data-testid="password-strength" id="admin-login-password-strength-indicator">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2" id="admin-login-password-strength-header">
                          <span id="admin-login-password-strength-label">Password Strength</span>
                          <span className={`font-medium ${passwordStrength.score >= 3 ? 'text-green-400' :
                            passwordStrength.score >= 2 ? 'text-yellow-400' :
                              passwordStrength.score >= 1 ? 'text-orange-400' : 'text-red-400'
                            }`} id="admin-login-password-strength-value">
                            {getStrengthText(passwordStrength.score)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2" id="admin-login-password-strength-bar-wrapper">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                            id="admin-login-password-strength-bar"
                            style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                          />
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <ul className="mt-2 text-xs text-gray-400 space-y-1" id="admin-login-password-strength-feedback">
                            {passwordStrength.feedback.map((item, index) => (
                              <li key={`password-feedback-${index}`} className="flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-2 text-yellow-400" id={`admin-login-password-feedback-icon-${index}`} />
                                <span id={`admin-login-password-feedback-text-${index}`}>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Rate Limit Warning */}
              {rateLimitInfo.isBlocked && (
                <div className="p-3 bg-orange-900/50 text-orange-300 rounded-lg flex items-center gap-2" id="admin-login-rate-limit-warning">
                  <Clock className="h-4 w-4" id="admin-login-rate-limit-icon" />
                  <span id="admin-login-rate-limit-text">
                    Account temporarily locked. Try again in{' '}
                    {Math.ceil((rateLimitInfo.timeRemaining || 0) / 60000)} min.
                  </span>
                </div>
              )}

              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0" id="admin-login-remember-me-field">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        className="border-pink-500 data-[state=checked]:bg-pink-500"
                        id="admin-login-remember-me-checkbox"
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-gray-300" id="admin-login-remember-me-label">
                        Remember me
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                className="w-full bg-[#E93370] hover:bg-[#E93370]/80 text-white"
                disabled={oauthLoading || rateLimitInfo.isBlocked}
                id="admin-login-submit-button"
                type="submit"
              >
                {oauthLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" id="admin-login-submit-spinner" />
                    <span id="admin-login-submit-text">Signing in...</span>
                  </>
                ) : (
                  'Sign in with Email'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6" id="admin-login-oauth-section">
            <Button
              className="google-button w-full flex items-center justify-center gap-2 border-white/10 bg-white/5 hover:bg-white/10 h-12 text-base transition-all-smooth text-white"
              disabled={oauthLoading || loading}
              id="admin-login-google-button"
              variant="outline"
              onClick={handleOAuthSignIn}
            >
              {oauthLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" id="admin-login-google-spinner" />
                  <span id="admin-login-google-text">Authenticating...</span>
                </>
              ) : (
                <>
                  <SiGoogle className="h-5 w-5 text-[#EA4335]" id="admin-login-google-icon" />
                  <span className="font-medium" id="admin-login-google-label">{copy.oauthProviders.google}</span>
                </>
              )}
            </Button>
          </div>

          <div className="mt-8 text-center" id="admin-login-terms-section">
            <button
              className="terms-toggle mobile-terms text-xs text-white/40 hover:text-white/60 transition-colors duration-200 flex items-center justify-center gap-1 mx-auto"
              id="admin-login-terms-toggle"
              onClick={() => setShowTerms(!showTerms)}
            >
              <span id="admin-login-terms-toggle-text">{showTerms ? 'Hide' : 'Show'} Terms & Conditions</span>
              <span className={`transform transition-transform ${showTerms ? 'rotate-180' : 'rotate-0'}`} id="admin-login-terms-toggle-icon">
                ▼
              </span>
            </button>

            {showTerms && (
              <div className="mobile-terms mt-4 text-xs text-white/50 space-y-2" id="admin-login-terms-content">
                <p id="admin-login-terms-text-1">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
                <p id="admin-login-terms-text-2">We use Google OAuth for secure authentication.</p>
                <p id="admin-login-terms-text-3">Your data is protected and only used for authentication purposes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
