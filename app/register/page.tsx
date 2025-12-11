'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/auth-provider';


export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  // If user is already logged in, redirect to dashboard
  if (user?.id) {
    router.push('/sadmin');
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the terms and conditions');
      setLoading(false);
      return;
    }

    // In a real application, you would call a registration function
    // For now, we'll just simulate the registration process
    try {
      // This is a placeholder - implement actual registration
      console.log('Registering user:', { email, password, fullName });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For now, redirect to login after "registration"
      router.push('/login?registered=true');
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Sign up to get started</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                required
                id="full-name"
                placeholder="John Doe"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                required
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                checked={acceptTerms}
                id="accept-terms"
                onCheckedChange={(checked) => setAcceptTerms(!!checked)}
              />
              <Label htmlFor="accept-terms">
                I agree to the <Link className="text-blue-600 hover:underline" href="/terms">Terms of Service</Link> and <Link className="text-blue-600 hover:underline" href="/privacy">Privacy Policy</Link>
              </Label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button
              className="w-full"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <Link className="text-blue-600 hover:underline" href="/login">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
