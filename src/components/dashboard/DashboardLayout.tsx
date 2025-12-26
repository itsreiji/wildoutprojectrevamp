import React, { useState } from 'react';
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
  ChevronLeft,
  Sparkles,
  Info,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from '../Router';
import logo from 'figma:asset/7f0e33eb82cb74c153a3d669c82ee10e38a7e638.png';

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

    // Detect screen size
    React.useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 1024);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Mobile Sidebar Backdrop */}
        <AnimatePresence>
          {sidebarOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
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
          className="fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-[#1a0a14] to-[#0a0a0a] backdrop-blur-xl border-r border-[#E93370]/20 z-50 lg:translate-x-0"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-[#E93370]/20">
              <div className="flex items-center justify-between">
                <img src={logo} alt="WildOut!" className="h-12 w-auto object-contain" />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {NAVIGATION_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-[#E93370] text-white shadow-lg shadow-[#E93370]/20'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 space-y-2">
              <Button
                variant="outline"
                className="w-full border-white/10 text-white/70 hover:bg-white/5 hover:text-white rounded-xl"
                onClick={() => navigateTo('landing')}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Site
              </Button>
              <Button
                variant="outline"
                className="w-full border-[#E93370]/50 text-[#E93370] hover:bg-[#E93370]/10 rounded-xl"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="lg:ml-80 min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 bg-black/40 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center justify-between px-4 lg:px-8 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-xl">
                    {NAVIGATION_ITEMS.find((item) => item.id === currentPage)?.label}
                  </h2>
                  <p className="text-sm text-white/60">Manage your content</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-[#E93370] flex items-center justify-center">
                    <span className="text-sm">A</span>
                  </div>
                  <div className="text-sm">
                    <div className="text-white">Admin User</div>
                    <div className="text-white/60 text-xs">admin@wildout.id</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    );
  }
);

DashboardLayout.displayName = 'DashboardLayout';