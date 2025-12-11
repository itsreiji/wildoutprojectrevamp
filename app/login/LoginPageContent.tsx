'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/auth-provider';


export const LoginPageContent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signInWithEmailPassword, signInWithOAuth, error: authError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for errors from the URL (e.g., from auth callback)
  const urlError = searchParams.get('error');
  const urlErrorDescription = searchParams.get('error_description');

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signInWithEmailPassword(email, password, rememberMe);
      if (result === null) {
        // Successful login
        router.push('/sadmin'); // Redirect to admin dashboard
        router.refresh(); // Refresh to update UI based on auth state
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth login
  const handleGoogleLogin = async () => {
    try {
      await signInWithOAuth('google');
      // signInWithOAuth redirects automatically, so no need for further action here
    } catch (err) {
      setError('Google login failed. Please try again.');
      console.error('Google login error:', err);
    }
  };

  // Combine URL errors and auth context errors
  const combinedError = urlError
    ? urlErrorDescription
      ? `${urlError}: ${urlErrorDescription}`
      : urlError
    : authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {combinedError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {combinedError}
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                required
                id="email"
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                required
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={rememberMe}
                  id="remember-me"
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <Label htmlFor="remember-me">Remember me</Label>
              </div>

              <Link
                className="text-sm text-blue-600 hover:underline"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button
              className="w-full"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="relative my-4 w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              disabled={loading}
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
            >
              Sign in with Google
            </Button>

            <div className="text-center text-sm text-gray-600 mt-4">
              Don't have an account?{' '}
              <Link className="text-blue-600 hover:underline" href="/register">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
