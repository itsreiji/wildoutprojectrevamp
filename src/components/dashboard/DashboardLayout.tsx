import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Image,
  Handshake,
  Settings,
  Menu,
  X,
  LogOut,
  Sparkles,
  Info,
  Zap,
} from 'lucide-react';
import { useRouter } from '../Router';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import type { User } from '@supabase/auth-js';
import logo from '../../assets/logo.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const NAVIGATION_ITEMS = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'hero', label: 'Hero Section', icon: Sparkles },
  { id: 'about', label: 'About Us', icon: Info },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'partners', label: 'Partners', icon: Handshake },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const DashboardLayout = React.memo(
  ({ children, currentPage, onNavigate }: DashboardLayoutProps) => {
    const { navigateTo } = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
        setUser(user);
      });
    }, []);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 1024);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLogout = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Error signing out');
      } else {
        toast.success('Signed out successfully');
        navigateTo('login');
      }
    };

    return (
      <div className="dark min-h-screen bg-[#050505] text-white selection:bg-[#E93370] selection:text-white overflow-hidden font-sans">
        {/* Ambient Background Noise/Gradient */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#E93370]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>

        {/* Mobile Sidebar Backdrop */}
        <AnimatePresence>
          {sidebarOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            x: isMobile ? (sidebarOpen ? 0 : -320) : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 h-full w-72 bg-black/40 backdrop-blur-2xl border-r border-white/5 z-50 lg:translate-x-0 flex flex-col"
        >
          {/* Header */}
          <div className="h-24 px-8 flex items-center justify-between border-b border-white/5">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer flex items-center gap-3"
              onClick={() => navigateTo('landing')}
            >
              <img src={logo} alt="WildOut!" className="h-10 w-auto object-contain" />
            </motion.div>
            {isMobile && (
               <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white">
                  <X size={24} />
               </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? 'bg-white/10 text-white shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-[#E93370]/20 to-transparent opacity-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                  <item.icon
                    size={20}
                    className={`relative z-10 transition-colors duration-300 ${
                      isActive ? 'text-[#E93370]' : 'text-current group-hover:text-[#E93370]'
                    }`}
                  />
                  <span className="font-medium tracking-wide relative z-10">{item.label}</span>
                  
                  {isActive && (
                     <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#E93370] shadow-[0_0_10px_#E93370]" />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* User Profile / Logout */}
          <div className="p-8 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E93370] to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg">
                  {user?.email?.[0].toUpperCase() || 'A'}
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white">{user?.email}</p>
                  <p className="text-xs text-white/40">Administrator</p>
               </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-500/20 hover:border-red-500"
            >
              <LogOut size={18} />
              <span className="font-medium text-sm">Sign Out</span>
            </motion.button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main
          className={`relative min-h-screen transition-all duration-300 lg:ml-72 flex flex-col z-10`}
        >
          {/* Mobile Header */}
          <div className="lg:hidden h-20 px-8 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-30">
            <div className="flex items-center gap-3">
               <img src={logo} alt="WildOut!" className="h-8 w-auto object-contain" />
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-white/70 hover:text-white bg-white/5 rounded-lg"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex-1 p-6 lg:p-10 overflow-x-hidden">
            <motion.div
               key={currentPage}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4, ease: "easeOut" }}
               className="max-w-7xl mx-auto"
            >
               {children}
            </motion.div>
          </div>
        </main>
      </div>
    );
  }
);

DashboardLayout.displayName = 'DashboardLayout';
