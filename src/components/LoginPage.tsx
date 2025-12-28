import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, AlertCircle, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { supabase } from '../lib/supabase';
import { useRouter } from './Router';
import { toast } from 'sonner';
import logo from '../assets/logo.png';

export const LoginPage = React.memo(() => {
  const { navigateTo } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Logged in successfully');
      navigateTo('admin');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@wildoutproject.com');
    setPassword('password123');
    toast.info('Demo credentials filled');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E93370]/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E93370]/15 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.1
          }}
        >
          <img src={logo} alt="WildOut!" className="h-16 w-auto object-contain" />
        </motion.div>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 text-white shadow-2xl">
          <CardHeader className="space-y-2 text-center pb-2">
            <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-white/40 text-sm max-w-[250px] mx-auto">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6 pt-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-2 text-red-400 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email" className="text-white/70 text-xs font-medium uppercase tracking-wider">Email Address</Label>
                    <button
                      type="button"
                      onClick={fillDemoCredentials}
                      className="text-[10px] text-[#E93370] hover:text-[#D42B62] underline underline-offset-4 transition-colors uppercase tracking-widest font-bold"
                    >
                      Demo?
                    </button>
                  </div>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-[#E93370] transition-colors z-10" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@wildoutproject.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 h-12 bg-white/5 border-white/10 focus:border-[#E93370]/50 transition-all text-white placeholder:text-white/10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/70 text-xs font-medium uppercase tracking-wider">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-[#E93370] transition-colors z-10" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-12 h-12 bg-white/5 border-white/10 focus:border-[#E93370]/50 transition-all text-white placeholder:text-white/10 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E93370] hover:bg-[#D42B62] text-white h-12 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(233,51,112,0.2)] hover:shadow-[0_0_30px_rgba(233,51,112,0.4)]"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Login to Dashboard</span>
                  </div>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => navigateTo('landing')}
                className="w-full text-white/30 hover:text-white hover:bg-white/5 text-xs h-10"
              >
                <ChevronLeft className="mr-1 h-3 w-3" />
                Back to Landing Page
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center mt-8 text-white/20 text-xs uppercase tracking-widest font-medium">
          Secure Access • WildOut! Platform
        </p>
      </motion.div>
    </div>
  );
});

LoginPage.displayName = 'LoginPage';
