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
import logo from 'figma:asset/7f0e33eb82cb74c153a3d669c82ee10e38a7e638.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
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
  ({ children }: DashboardLayoutProps) => {
    const { getCurrentSubPath } = useRouter();
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
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex h-20 items-center border-b border-white/10 px-4">
              <div className="relative flex w-full items-center justify-center">
                <img src={logo} alt="WildOut!" className="h-10 w-auto object-contain" />
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'absolute right-0 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:text-white',
                    !isMobile && 'hidden'
                  )}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close navigation</span>
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
              {NAVIGATION_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <Link
                    key={item.id}
                    to={`/admin/${item.id}`}
                    aria-label={item.label}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors duration-200',
                      isActive
                        ? 'bg-[#E93370] text-white shadow-lg shadow-[#E93370]/20'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
                      showLabels ? 'justify-start' : 'justify-center'
                    )}
                    onClick={() => {
                      if (isMobile) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <Icon aria-hidden className="h-5 w-5 flex-shrink-0" />
                    {showLabels && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>

            {/* Footer Actions */}
            <div className="mt-auto space-y-2 border-t border-white/10 px-3 py-4">
              <Link
                to="/"
                aria-label="Back to site"
                className={cn(
                  'inline-flex w-full items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white',
                  showLabels ? 'justify-start' : 'justify-center'
                )}
                onClick={() => {
                  if (isMobile) {
                    setSidebarOpen(false);
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                {showLabels && <span>Back to Site</span>}
              </Link>
              <Button
                variant="outline"
                className={cn(
                  'w-full border-[#E93370]/50 text-[#E93370] hover:bg-[#E93370]/10',
                  showLabels ? 'justify-start' : 'justify-center'
                )}
              >
                <LogOut className={cn('h-4 w-4', showLabels ? 'mr-2' : undefined)} />
                {showLabels && 'Logout'}
              </Button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex min-h-screen flex-1 flex-col bg-[#0a0a0a]">
          {/* Top Bar */}
          <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="flex h-20 items-center justify-between px-4 lg:px-8">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open navigation"
                  aria-expanded={sidebarOpen}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-colors hover:text-white',
                    !isMobile && 'hidden'
                  )}
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E93370]">
                    <span className="text-sm">A</span>
                  </div>
                  <div className="text-sm">
                    <div className="text-white">Admin User</div>
                    <div className="text-xs text-white/60">admin@wildout.id</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main
            className="flex-1 p-4 lg:overflow-y-auto lg:p-8"
            onClick={() => {
              if (isMobile && sidebarOpen) {
                setSidebarOpen(false);
              }
            }}
          >
            {children}
          </main>
        </div>
      </div>
    );
  }
);

DashboardLayout.displayName = 'DashboardLayout';
