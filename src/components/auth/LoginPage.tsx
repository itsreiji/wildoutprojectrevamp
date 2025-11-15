import React, { FormEvent, useEffect, useState } from 'react';
import { useRouter } from '../router';
import { useAuth } from '../../contexts/AuthContext';

const copy = {
  title: 'Admin access',
  subtitle: 'Sign in with your WildOut! administrator account to manage landing page content.',
  passwordLabel: 'Password',
  emailLabel: 'Email address',
  submit: 'Sign in',
  magicLink: 'Send magic link',
};

export const LoginPage: React.FC = () => {
  const { signInWithEmail, sendMagicLink, role, loading } = useAuth();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    if (!email || !password) {
      setFormError('Please provide both email and password.');
      return;
    }

    const error = await signInWithEmail(email.trim(), password);
    if (error) {
      setFormError(error.message);
      return;
    }

    setInfoMessage('Signed in successfully. Redirecting to admin dashboard…');
  };

  const handleMagicLink = async () => {
    if (!email) {
      setFormError('Enter your email to receive a magic link.');
      return;
    }
    setFormError(null);
    const error = await sendMagicLink(email.trim());
    if (error) {
      setFormError(error.message);
      return;
    }
    setInfoMessage('Magic link sent! Please check your inbox and follow the instructions.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#040404] px-4 py-12 text-white">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-semibold">{copy.title}</h1>
          <p className="mt-2 text-sm text-white/70">{copy.subtitle}</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-xs uppercase tracking-widest text-white/60">
            {copy.emailLabel}
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/60 focus:outline-none"
              placeholder="you@wildout.id"
            />
          </label>

          <label className="block text-xs uppercase tracking-widest text-white/60">
            {copy.passwordLabel}
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/60 focus:outline-none"
              placeholder="••••••••"
            />
          </label>

          {formError && (
            <p className="text-sm text-red-400" role="alert">
              {formError}
            </p>
          )}

          {infoMessage && (
            <p className="text-sm text-emerald-300" role="status">
              {infoMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? 'Working…' : copy.submit}
          </button>
        </form>

        <button
          type="button"
          onClick={handleMagicLink}
          className="w-full rounded-2xl border border-white/20 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white transition hover:border-white/60"
        >
          {loading ? 'Sending…' : copy.magicLink}
        </button>

        <p className="text-center text-[11px] uppercase tracking-[0.3em] text-white/30">
          WildOut! admin vault
        </p>
      </div>
    </div>
  );
};

