import React, { FormEvent, useEffect, useState } from 'react';
import { useRouter } from '../router';
import { useAuth } from '../../contexts/AuthContext';
import { Background3D } from '../Background3D';

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
  const { signUpWithEmail, signInWithEmail, role, loading } = useAuth();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const { getAdminPath } = useRouter();

  useEffect(() => {
    if (role === 'admin') {
      navigate(getAdminPath());
    }
  }, [role, navigate, getAdminPath]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setInfoMessage(null);

    if (!email || !password || !confirmPassword) {
      setFormError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    const error = await signUpWithEmail(email.trim(), password);
    if (error) {
      setFormError(error.message);
      return;
    }

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

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/90">
              {copy.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-[#E93370]/50 focus:outline-none focus:ring-2 focus:ring-[#E93370]/20 transition-all duration-300"
              placeholder="you@wildout.id"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/90">
              {copy.passwordLabel}
            </label>
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-[#E93370]/50 focus:outline-none focus:ring-2 focus:ring-[#E93370]/20 transition-all duration-300"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/90">
              {copy.confirmPasswordLabel}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-[#E93370]/50 focus:outline-none focus:ring-2 focus:ring-[#E93370]/20 transition-all duration-300"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {formError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-sm text-red-300" role="alert">
                {formError}
              </p>
            </div>
          )}

          {infoMessage && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
              <p className="text-sm text-emerald-300" role="status">
                {infoMessage}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#E93370] hover:bg-[#E93370]/90 text-white px-6 py-4 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-wait disabled:opacity-60 backdrop-blur-xl"
          >
            {loading ? 'Creating account…' : copy.submit}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-white/5 px-3 text-white/60">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignIn}
          className="w-full rounded-2xl border border-[#E93370]/30 bg-[#E93370]/5 hover:bg-[#E93370]/10 hover:border-[#E93370] text-white px-6 py-4 text-sm font-medium transition-all duration-300 backdrop-blur-xl"
        >
          {copy.signIn}
        </button>

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
