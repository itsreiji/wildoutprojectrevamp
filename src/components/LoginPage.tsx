import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, AlertCircle, ChevronLeft, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#E93370] selection:text-white">
      {/* Background Noise & Decor */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#E93370]/10 blur-[120px] rounded-full animate-pulse duration-[4s]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse duration-[5s]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] relative z-10"
      >
        <motion.div
          className="flex flex-col items-center justify-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div className="relative w-20 h-20 mb-6 group">
             <div className="absolute inset-0 bg-[#E93370] rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
             <div className="relative w-full h-full bg-[#0A0A0A] border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#E93370]/20 to-transparent" />
                <img src={logo} alt="WildOut!" className="h-12 w-auto object-contain relative z-10" />
             </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">WILDOUT<span className="text-[#E93370]">ADMIN</span></h1>
          <p className="text-white/40 text-sm font-mono tracking-widest uppercase">:: SYSTEM ACCESS ::</p>
        </motion.div>

        <Card className="bg-black/40 backdrop-blur-2xl border-white/10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <CardHeader className="space-y-2 text-center pb-2 relative z-10">
            <CardTitle className="text-xl font-medium text-white/90">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-white/40 text-xs font-mono">
              ENTER CREDENTIALS TO CONTINUE
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin} className="relative z-10">
            <CardContent className="space-y-6 pt-4">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center space-x-3 text-red-400 text-xs font-mono"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email" className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Email Address</Label>
                    <button
                      type="button"
                      onClick={fillDemoCredentials}
                      className="text-[10px] text-[#E93370] hover:text-white transition-colors font-mono cursor-pointer"
                    >
                      [LOAD DEMO]
                    </button>
                  </div>
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/20 group-focus-within/input:text-[#E93370] transition-colors z-10">
                       <Mail className="w-4 h-4" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@wildoutproject.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-11 h-12 bg-white/5 border-white/10 focus:border-[#E93370]/50 focus:ring-[#E93370]/20 transition-all text-white placeholder:text-white/10 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Password</Label>
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/20 group-focus-within/input:text-[#E93370] transition-colors z-10">
                       <Lock className="w-4 h-4" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-11 h-12 bg-white/5 border-white/10 focus:border-[#E93370]/50 focus:ring-[#E93370]/20 transition-all text-white placeholder:text-white/10 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E93370] hover:bg-[#D42B62] text-white h-12 rounded-xl text-sm font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(233,51,112,0.2)] hover:shadow-[0_0_30px_rgba(233,51,112,0.4)] relative overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                {isLoading ? (
                  <div className="flex items-center space-x-2 relative z-10">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 relative z-10">
                    <LogIn className="h-4 w-4" />
                    <span>ACCESS DASHBOARD</span>
                  </div>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => navigateTo('landing')}
                className="w-full text-white/30 hover:text-white hover:bg-white/5 text-xs h-10 font-mono"
              >
                <ChevronLeft className="mr-1 h-3 w-3" />
                RETURN TO SITE
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
           <p className="text-[10px] font-mono text-white/60">SECURED BY WILDOUT SYSTEMS</p>
        </div>
      </motion.div>
    </div>
  );
});

LoginPage.displayName = 'LoginPage';
