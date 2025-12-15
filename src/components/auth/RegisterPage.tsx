import React, { useEffect, useState } from 'react';
import { useRouter } from '../router';
import { useAuth } from '../../contexts/AuthContext';
import { Background3D } from '../Background3D';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const copy = {
  title: 'Create account',
  subtitle: 'Join WildOut! and connect with Indonesia\'s creative community.',
  passwordLabel: 'Password',
  confirmPasswordLabel: 'Confirm Password',
  emailLabel: 'Email address',
  submit: 'Create account',
  signIn: 'Already have an account? Sign in',
};

export const RegisterPage: React.FC = () => {
  const { signInWithOAuth, role, loading } = useAuth();
  const { navigate, getAdminPath } = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (role === 'admin') {
      navigate(getAdminPath());
    }
  }, [role, navigate, getAdminPath]);

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    setInfoMessage(null);

    // Registration is handled via OAuth only in the original code? 
    // The original code had logic for email/password but then said "Registration is handled via OAuth only" 
    // and set error = null and then a success message.
    // However, it also checked `if (error)` which was unreachable null.
    // I will preserve the simulated behavior but cleaner.

    // Simulating registration based on previous code logic
    // The previous code explicitly had `const error = null;` and `if (error) ...`
    // Effectively it just showed success message.

    // In a real app this would call signUpWithEmailPassword
    // For now, mirroring previous behavior:
    setInfoMessage('Account created successfully! Please check your email to verify your account, then sign in.');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="dark relative min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <Background3D />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent">
              {copy.title}
            </h1>
            <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-xs mx-auto">
              {copy.subtitle}
            </p>
          </div>

          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90">{copy.emailLabel}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@wildoutproject.com"
                        {...field}
                        className="rounded-2xl border border-white/10 bg-white/5 py-6 text-white placeholder:text-white/30 focus:border-[#E93370]/50 focus:ring-[#E93370]/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90">{copy.passwordLabel}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        {...field}
                        className="rounded-2xl border border-white/10 bg-white/5 py-6 text-white placeholder:text-white/30 focus:border-[#E93370]/50 focus:ring-[#E93370]/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90">{copy.confirmPasswordLabel}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        {...field}
                        className="rounded-2xl border border-white/10 bg-white/5 py-6 text-white placeholder:text-white/30 focus:border-[#E93370]/50 focus:ring-[#E93370]/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {formError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-300" />
                  <p className="text-sm text-red-300" role="alert">
                    {formError}
                  </p>
                </div>
              )}

              {infoMessage && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <p className="text-sm text-emerald-300" role="status">
                    {infoMessage}
                  </p>
                </div>
              )}

              <Button
                className="w-full rounded-2xl bg-[#E93370] hover:bg-[#E93370]/90 text-white h-auto py-4 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-xl"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  copy.submit
                )}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-white/5 px-3 text-white/60">or</span>
            </div>
          </div>

          <Button
            className="w-full rounded-2xl border-[#E93370]/30 bg-[#E93370]/5 hover:bg-[#E93370]/10 hover:border-[#E93370] text-white h-auto py-4 text-sm font-medium transition-all duration-300 backdrop-blur-xl"
            type="button"
            variant="outline"
            onClick={handleSignIn}
          >
            {copy.signIn}
          </Button>

          <div className="pt-6 text-center">
            <p className="text-xs font-light text-white/40 tracking-wider">
              WildOut! Community
            </p>
            <p className="text-[10px] text-white/30 mt-1 tracking-[0.2em] uppercase">
              Join the Creative Revolution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
