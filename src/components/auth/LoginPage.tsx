import React, { useEffect, useState } from 'react';
import { useRouter } from "../router/RouterContext";
import { useAuth } from '../../contexts/AuthContext';
import { Background3D } from '../Background3D';
import { motion, AnimatePresence } from 'motion/react';
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
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const messageVariants = {
  hidden: { opacity: 0, height: 0, y: -10 },
  visible: { opacity: 1, height: 'auto', y: 0 },
  exit: { opacity: 0, height: 0, y: -10 }
};

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
  const { signInWithOAuth, signInWithEmailPassword, role, loading: authLoading, isAuthenticated, error: authError, getRememberedEmail } = useAuth();
  const { navigate } = useRouter();
  const [localError, setLocalError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ strength: string; score: number; feedback: string[]; suggestions: string[] }>({ strength: 'weak', score: 0, feedback: [], suggestions: [] });
  const [rateLimitInfo, setRateLimitInfo] = useState<{ isBlocked: boolean; timeRemaining?: number }>({ isBlocked: false });

  // Effective error message
  const displayError = localError || authError;
  const isLoading = isSubmitting || authLoading;

  // Initial values
  const rememberedEmail = getRememberedEmail();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: rememberedEmail || '',
      password: '',
      rememberMe: !!rememberedEmail,
    },
  });

  const { watch } = form;
  const email = watch('email');
  const password = watch('password');

  // Clear local error when auth error changes
  useEffect(() => {
    if (authError) {
      setLocalError(null);
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
    setLocalError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      // Check if popups are blocked
      const popupCheck = window.open('', '_blank');
      if (!popupCheck) {
        setLocalError(copy.errorMessages.popupBlocked);
        setIsSubmitting(false);
        return;
      }
      popupCheck.close();

      const error = await signInWithOAuth('google');
      if (error) {
        // We let AuthContext handle most errors, but we can set local ones if needed
        if (error.message.includes('network')) {
          setLocalError(copy.errorMessages.network);
        }
      } else {
        setInfoMessage(copy.successMessages.redirecting);
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      setLocalError(copy.errorMessages.unexpected);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setLocalError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      const error = await signInWithEmailPassword(values.email, values.password);
      if (error) {
        if (error.message.includes('invalid_credentials')) {
          setLocalError('Invalid email or password. Please try again.')
        } else if (error.message.includes('user_not_found')) {
          setLocalError('No account found with this email.')
        } else if (error.message.includes('too_many_requests')) {
          setLocalError('Too many login attempts. Please try again later.')
        }
      } else {
        setInfoMessage(copy.successMessages.redirecting);
      }
    } catch (error) {
      console.error('Email/password sign-in error:', error);
      setLocalError(copy.errorMessages.unexpected);
    } finally {
      setIsSubmitting(false);
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

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  const inputClasses = "h-10 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus:ring-1 focus:ring-brand-pink/50 focus:border-brand-pink/50 transition-all rounded-xl px-4 text-sm";
  const labelClasses = "flex items-center gap-2 text-xs font-semibold text-white/60 mb-1.5";
  const brandPink = "brand-pink";

  return (
    <div className="login-page relative min-h-screen bg-black text-foreground overflow-x-hidden flex items-center justify-center p-4" id="admin-login-page">
      <Background3D />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="login-container relative z-10 w-full max-w-[340px]"
        data-animated="true"
      >
        <div className="login-card space-y-4 rounded-3xl border border-white/10 bg-[#0a0a0a]/80 p-6 shadow-2xl backdrop-blur-3xl" id="admin-login-card">
          <div className="text-center mb-6" id="admin-login-header">
            <h1 className="text-2xl font-black tracking-tight text-white" id="admin-login-title">
              Admin <span className="text-brand-pink">access</span>
            </h1>
            <p className="mt-2 text-xs text-white/40 leading-relaxed max-w-[240px] mx-auto" id="admin-login-subtitle">
              {copy.subtitle}
            </p>
          </div>

          {/* Enhanced error and success displays with AnimatePresence */}
          <AnimatePresence mode="wait">
            {displayError && (
              <motion.div
                key="error"
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 flex items-center gap-2 animate-shake overflow-hidden"
                id="admin-login-error-message"
              >
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" id="admin-login-error-icon" />
                <p className="text-sm text-red-400" id="admin-login-error-text" role="alert">
                  {displayError}
                </p>
              </motion.div>
            )}

            {infoMessage && (
              <motion.div
                key="success"
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 flex items-center gap-2 overflow-hidden"
                id="admin-login-success-message"
              >
                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" id="admin-login-success-icon" />
                <p className="text-sm text-green-400" id="admin-login-success-text" role="status">
                  {infoMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Overlay */}
          {isLoading && (
            <div 
              data-testid="loading-overlay"
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-3xl transition-all"
            >
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
                <span className="text-sm font-bold text-white/80 tracking-widest uppercase">Processing</span>
              </div>
            </div>
          )}

          {/* Email/Password Form */}
          <Form {...form}>
            <form 
              className="space-y-4" 
              id="admin-login-form" 
              onSubmit={form.handleSubmit(onSubmit)}
              aria-busy={isLoading ? "true" : "false"}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem id="admin-login-email-field">
                    <FormLabel className={labelClasses} id="admin-login-email-label">
                      <Mail className="h-3.5 w-3.5 text-brand-pink" id="admin-login-email-icon" aria-hidden="true" />
                      <span>Email</span>
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          id="admin-login-email-input"
                          placeholder="Enter your email"
                          {...field}
                          className={inputClasses}
                          aria-labelledby="admin-login-email-label"
                          autoComplete="email"
                        />
                      </FormControl>
                      {field.value && !form.formState.errors.email && (
                        <div 
                          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center" 
                          id="admin-login-email-valid-indicator"
                          role="status"
                          aria-label="Email is valid"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        </div>
                      )}
                    </div>
                    <FormMessage id="admin-login-email-error-message" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem id="admin-login-password-field">
                    <FormLabel className={labelClasses} id="admin-login-password-label">
                      <Lock className="h-3.5 w-3.5 text-brand-pink" id="admin-login-password-icon" aria-hidden="true" />
                      <span>Password</span>
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          id="admin-login-password-input"
                          placeholder="Enter your password"
                          type={showPassword ? 'text' : 'password'}
                          {...field}
                          className={inputClasses}
                          aria-labelledby="admin-login-password-label"
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors p-1 flex items-center justify-center focus-visible:ring-1 focus-visible:ring-brand-pink rounded-md"
                        id="admin-login-password-toggle"
                        data-testid="admin-login-password-toggle"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    </div>
                    <FormMessage id="admin-login-password-error-message" />

                    {/* Password Strength Indicator */}
                    {field.value && (
                      <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5" data-testid="password-strength" id="admin-login-password-strength-indicator">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40 mb-2" id="admin-login-password-strength-header">
                          <span id="admin-login-password-strength-label">Strength</span>
                          <span className={`font-bold ${passwordStrength.score >= 3 ? 'text-green-400' :
                            passwordStrength.score >= 2 ? 'text-yellow-400' :
                              passwordStrength.score >= 1 ? 'text-orange-400' : 'text-red-400'
                            }`} id="admin-login-password-strength-value">
                            {getStrengthText(passwordStrength.score)}
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1" id="admin-login-password-strength-bar-wrapper">
                          <div
                            className={`h-1 rounded-full transition-all duration-500 ${getStrengthColor(passwordStrength.score)}`}
                            id="admin-login-password-strength-bar"
                            style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                          />
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <ul className="mt-2 text-[10px] text-white/30 space-y-1" id="admin-login-password-strength-feedback">
                            {passwordStrength.feedback.map((item, index) => (
                              <li key={`password-feedback-${index}`} className="flex items-center">
                                <div className="h-1 w-1 rounded-full mr-2 bg-brand-pink" />
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
                <div className="p-3 bg-orange-900/50 text-orange-300 rounded-xl flex items-center gap-2" id="admin-login-rate-limit-warning">
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
                  <FormItem className="flex items-center space-x-2.5 space-y-0 py-1" id="admin-login-remember-me-field">
                    <FormControl>
                      <Checkbox
                        id="admin-login-remember-me-checkbox"
                        checked={field.value}
                        className="h-4 w-4 border-white/20 data-[state=checked]:bg-brand-pink data-[state=checked]:border-brand-pink transition-all"
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel 
                      className="text-xs font-medium text-white/40 cursor-pointer select-none py-1" 
                      id="admin-login-remember-me-label"
                      htmlFor="admin-login-remember-me-checkbox"
                    >
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Button
                className="w-full h-10 bg-brand-pink hover:bg-brand-pink/90 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] text-sm"
                disabled={isLoading || rateLimitInfo.isBlocked}
                id="admin-login-submit-button"
                type="submit"
              >
                {isLoading ? (
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
            <div className="flex items-center gap-4 mb-4" id="admin-login-separator">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/10 whitespace-nowrap">or</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/20 to-transparent" />
            </div>

            <Button
              className="google-button w-full flex items-center justify-center gap-3 border-white/10 bg-white/[0.05] hover:bg-white/[0.1] h-10 text-xs font-semibold transition-all rounded-xl text-white group"
              disabled={isLoading}
              id="admin-login-google-button"
              variant="outline"
              onClick={handleOAuthSignIn}
              aria-label="Sign in with Google"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <SiGoogle className={`h-4 w-4 text-[#EA4335] group-hover:scale-110 transition-transform duration-300`} aria-hidden="true" />
                  <span id="admin-login-google-label">{copy.oauthProviders.google}</span>
                </div>
              )}
            </Button>
          </div>

          <div className="mt-6 text-center" id="admin-login-terms-section">
            <button
              className="terms-toggle text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 hover:text-white/40 transition-all flex items-center justify-center gap-2 mx-auto"
              id="admin-login-terms-toggle"
              onClick={() => setShowTerms(!showTerms)}
            >
              <span id="admin-login-terms-toggle-text">{showTerms ? 'Hide' : 'Show'} Terms & Conditions</span>
              <span className={`text-[8px] transition-transform duration-300 ${showTerms ? 'rotate-180' : 'rotate-0'} flex items-center justify-center`} id="admin-login-terms-toggle-icon">
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
      </motion.div>
    </div>
  );
};
