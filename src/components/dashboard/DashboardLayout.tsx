import React, { useEffect, useState } from 'react';
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
import { useRouter } from '../router';
import { Link } from '../router/Link';
import { cn } from '../ui/utils';
import { useStaticContent } from '../../contexts/StaticContentContext';
import { useAuth } from '../../contexts/AuthContext';
import logo from 'figma:asset/7f0e33eb82cb74c153a3d669c82ee10e38a7e638.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Navigation items are now loaded from Supabase via useContent

export const DashboardLayout = React.memo(
  ({ children }: DashboardLayoutProps) => {
    const { getCurrentSubPath, navigate, getAdminPath } = useRouter();
    const { adminSections, getSectionPermissions } = useStaticContent();
    const { user, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [viewportWidth, setViewportWidth] = useState<number>(
      typeof window !== 'undefined' ? window.innerWidth : 0
    );

    useEffect(() => {
      const handleResize = () => setViewportWidth(window.innerWidth);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = viewportWidth < 768;
    const isCompact = viewportWidth >= 768 && viewportWidth < 1280;
    const showLabels = isMobile || !isCompact;
    const sidebarWidth = isMobile ? 288 : isCompact ? 96 : 240;

    useEffect(() => {
      if (isMobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    }, [isMobile]);

    // Derive current page from URL path
    const currentPage = getCurrentSubPath() || 'home';

    const handleLogout = async () => {
      try {
        await signOut();
        navigate(getAdminPath('login'));
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

    const displayInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'A';
    const displayName = (user?.user_metadata && typeof user.user_metadata === 'object' && 'full_name' in user.user_metadata ? user.user_metadata.full_name : null) || (user?.email ? user.email.split('@')[0] : 'Admin User');
    const displayEmail = user?.email || 'admin@wildout.id';

    return (
      <div
        className="relative min-h-screen bg-[#0a0a0a] text-white"
        style={{ paddingLeft: isMobile ? 0 : sidebarWidth }}
      >
        {/* Mobile Sidebar Backdrop */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          role="navigation"
          aria-label="Admin sections"
          initial={false}
          animate={
            isMobile ? (sidebarOpen ? { x: 0 } : { x: -sidebarWidth - 24 }) : { x: 0 }
          }
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex flex-col bg-black/40 backdrop-blur-xl border-r border-white/10 transition-transform duration-300',
            isMobile ? (sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none') : 'pointer-events-auto'
          )}
          style={{ width: sidebarWidth }}
        >
          <div className="flex-1 flex flex-col">
            {/* Logo Section */}
            <div
              className="border-b border-white/10 flex items-center px-4 py-6 flex-shrink-0"
              style={{ justifyContent: 'center' }}
            >
              <img 
                src={logo} 
                alt="WildOut Logo" 
                className="w-12 h-12 rounded-lg object-contain flex-shrink-0" 
              />
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto">
              {adminSections
                .filter((section) => getSectionPermissions(section.slug).canView)
                .sort((a, b) => a.order_index - b.order_index)
                .map((section) => {
                  const iconMap: Record<string, any> = {
                    LayoutDashboard,
                    Sparkles,
                    Info,
                    Calendar,
                    Users,
                    Image,
                    Handshake,
                    Settings,
                  };
                  const Icon = iconMap[section.icon] || LayoutDashboard;
                  const isActive = currentPage === section.slug;

                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        navigate(getAdminPath(section.slug));
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className={cn(
                        'group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300',
                        showLabels ? 'justify-start' : 'justify-center',
                        isActive
                          ? 'bg-[#E93370]/20 text-[#E93370]'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {showLabels && <span className="truncate text-sm font-medium">{section.label}</span>}
                    </button>
                  );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-3 border-t border-white/10 space-y-2 flex-shrink-0">
              <button
                onClick={() => navigate('/')}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 text-white/70 hover:bg-white/10 hover:text-white',
                  showLabels ? 'justify-start' : 'justify-center'
                )}
              >
                <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                {showLabels && <span className="truncate text-sm font-medium">Back to Site</span>}
              </button>
              <button
                onClick={handleLogout}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 text-white/70 hover:bg-[#E93370]/10 hover:text-[#E93370]',
                  showLabels ? 'justify-start' : 'justify-center'
                )}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {showLabels && <span className="truncate text-sm font-medium">Logout</span>}
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="min-h-screen flex flex-col">
          {/* Top Bar */}
          <header className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className={cn('w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white', 
                    isMobile ? 'flex' : 'hidden'
                  )}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold">
                    {adminSections.find((item) => item.slug === currentPage)?.label || 'Dashboard'}
                  </h2>
                  <p className="text-xs text-white/60">Manage your content</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10',
                  isMobile ? 'hidden' : 'flex'
                )}>
                  <div className="w-8 h-8 rounded-full bg-[#E93370] flex items-center justify-center text-xs font-semibold">
                    {displayInitial}
                  </div>
                  <div className="text-sm">
                    <div className="text-white">{String(displayName)}</div>
                    <div className="text-white/60 text-xs">{displayEmail}</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    );
  }
);

DashboardLayout.displayName = 'DashboardLayout';
