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
    <div id="admin-login-page" className="login-page dark relative min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <Background3D />
      <div className="login-container relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div id="admin-login-card" className={`login-card w-full space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl ${isMobile ? 'max-w-xs' : 'max-w-sm'}`}>
          <div id="admin-login-header" className="text-center">
            <h1 id="admin-login-title" className="text-3xl font-bold bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent">
              {copy.title}
            </h1>
            <p id="admin-login-subtitle" className="mt-3 text-sm text-white/60 leading-relaxed max-w-xs mx-auto">
              {copy.subtitle}
            </p>
          </div>

          {/* Enhanced error display with icons */}
          {formError && (
            <div id="admin-login-error-message" className="error-message rounded-lg border border-red-500/20 bg-red-500/10 p-3 flex items-center gap-2">
              <AlertTriangle id="admin-login-error-icon" className="h-4 w-4 text-red-300 flex-shrink-0" />
              <p id="admin-login-error-text" className="text-sm text-red-300" role="alert">
                {formError}
              </p>
            </div>
          )}

          {/* Enhanced success display with icons */}
          {infoMessage && (
            <div id="admin-login-success-message" className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-center gap-2">
              <CheckCircle2 id="admin-login-success-icon" className="h-4 w-4 text-emerald-300 flex-shrink-0" />
              <p id="admin-login-success-text" className="text-sm text-emerald-300" role="status">
                {infoMessage}
              </p>
            </div>
          )}

          {/* Email/Password Form */}
          <Form {...form}>
            <form id="admin-login-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem id="admin-login-email-field">
                    <FormLabel id="admin-login-email-label" className="flex items-center gap-2 text-white/80">
                      <Mail id="admin-login-email-icon" className="h-4 w-4" /> Email
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
                          <div id="admin-login-email-valid-indicator" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <CheckCircle2 id="admin-login-email-valid-icon" className="h-5 w-5 text-green-400" />
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
                    <FormLabel id="admin-login-password-label" className="flex items-center gap-2 text-white/80">
                      <Lock id="admin-login-password-icon" className="h-4 w-4" /> Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="admin-login-password-input"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          {...field}
                          className="bg-gray-800 border-white/20 text-white focus:ring-2 focus:ring-[#E93370]/50"
                        />
                        <button
                          id="admin-login-password-toggle"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff id="admin-login-password-hide-icon" className="h-5 w-5" /> : <Eye id="admin-login-password-show-icon" className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage id="admin-login-password-error-message" />

                    {/* Password Strength Indicator */}
                    {field.value && (
                      <div id="admin-login-password-strength-indicator" className="mt-3" data-testid="password-strength">
                        <div id="admin-login-password-strength-header" className="flex items-center justify-between text-xs text-gray-400 mb-2">
                          <span id="admin-login-password-strength-label">Password Strength</span>
                          <span id="admin-login-password-strength-value" className={`font-medium ${passwordStrength.score >= 3 ? 'text-green-400' :
                            passwordStrength.score >= 2 ? 'text-yellow-400' :
                              passwordStrength.score >= 1 ? 'text-orange-400' : 'text-red-400'
                            }`}>
                            {getStrengthText(passwordStrength.score)}
                          </span>
                        </div>
                        <div id="admin-login-password-strength-bar-wrapper" className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            id="admin-login-password-strength-bar"
                            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                            style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                          />
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <ul id="admin-login-password-strength-feedback" className="mt-2 text-xs text-gray-400 space-y-1">
                            {passwordStrength.feedback.map((item, index) => (
                              <li key={`password-feedback-${index}`} className="flex items-center">
                                <AlertTriangle id={`admin-login-password-feedback-icon-${index}`} className="h-3 w-3 mr-2 text-yellow-400" />
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
                <div id="admin-login-rate-limit-warning" className="p-3 bg-orange-900/50 text-orange-300 rounded-lg flex items-center gap-2">
                  <Clock id="admin-login-rate-limit-icon" className="h-4 w-4" />
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
                  <FormItem id="admin-login-remember-me-field" className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        id="admin-login-remember-me-checkbox"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-pink-500 data-[state=checked]:bg-pink-500"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel id="admin-login-remember-me-label" className="text-gray-300">
                        Remember me
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                id="admin-login-submit-button"
                type="submit"
                disabled={oauthLoading || rateLimitInfo.isBlocked}
                className="w-full bg-[#E93370] hover:bg-[#E93370]/80 text-white"
              >
                {oauthLoading ? (
                  <>
                    <Loader2 id="admin-login-submit-spinner" className="mr-2 h-4 w-4 animate-spin" />
                    <span id="admin-login-submit-text">Signing in...</span>
                  </>
                ) : (
                  'Sign in with Email'
                )}
              </Button>
            </form>
          </Form>

          <div id="admin-login-oauth-section" className="mt-6">
            <Button
              id="admin-login-google-button"
              variant="outline"
              className="google-button w-full flex items-center justify-center gap-2 border-white/10 bg-white/5 hover:bg-white/10 h-12 text-base transition-all-smooth text-white"
              onClick={handleOAuthSignIn}
              disabled={oauthLoading || loading}
            >
              {oauthLoading ? (
                <>
                  <Loader2 id="admin-login-google-spinner" className="h-4 w-4 animate-spin" />
                  <span id="admin-login-google-text">Authenticating...</span>
                </>
              ) : (
                <>
                  <SiGoogle id="admin-login-google-icon" className="h-5 w-5 text-[#EA4335]" />
                  <span id="admin-login-google-label" className="font-medium">{copy.oauthProviders.google}</span>
                </>
              )}
            </Button>
          </div>

          <div id="admin-login-terms-section" className="mt-8 text-center">
            <button
              id="admin-login-terms-toggle"
              onClick={() => setShowTerms(!showTerms)}
              className="terms-toggle mobile-terms text-xs text-white/40 hover:text-white/60 transition-colors duration-200 flex items-center justify-center gap-1 mx-auto"
            >
              <span id="admin-login-terms-toggle-text">{showTerms ? 'Hide' : 'Show'} Terms & Conditions</span>
              <span id="admin-login-terms-toggle-icon" className={`transform transition-transform ${showTerms ? 'rotate-180' : 'rotate-0'}`}>
                ▼
              </span>
            </button>

            {showTerms && (
              <div id="admin-login-terms-content" className="mobile-terms mt-4 text-xs text-white/50 space-y-2">
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
