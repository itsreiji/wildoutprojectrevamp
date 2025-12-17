import React from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import { useRouter } from '../router';
import { cn } from '../ui/utils';
import { useStaticContent } from '../../contexts/StaticContentContext';
import { useAuth } from '../../contexts/AuthContext';
import logo from 'figma:asset/7f0e33eb82cb74c153a3d669c82ee10e38a7e638.png';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface AdminDashboardProps {
  children: React.ReactNode;
}

/**
 * AdminDashboard component - Main container for admin dashboard
 * Features:
 * - Fixed left sidebar with admin navigation
 * - Scrollable right content area
 * - Mobile responsive with overlay
 * - Accessibility with ARIA attributes
 * - Keyboard navigation support
 */
export const AdminDashboard = React.memo(({ children }: AdminDashboardProps) => {
  const { getCurrentSubPath, navigate, getAdminPath } = useRouter();
  const { adminSections, getSectionPermissions } = useStaticContent();
  const { user, signOut } = useAuth();

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
  const displayName = 
    (user?.user_metadata && typeof user.user_metadata === 'object' && 'full_name' in user.user_metadata 
      ? user.user_metadata.full_name 
      : null) ||
    (user?.email ? user.email.split('@')[0] : 'Admin User');
  const displayEmail = user?.email || 'admin@wildoutproject.com';

  const iconMap: Record<string, any> = {
    LayoutDashboard,
    Shield,
    Users,
    Settings,
  };

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Check for mobile on mount and window resize
  React.useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close mobile sidebar when clicking overlay
  const handleOverlayClick = () => {
    setIsMobileSidebarOpen(false);
  };

  // Handle keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent, onClick: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      data-admin-dashboard-wrapper
      className="relative flex h-screen w-full overflow-hidden bg-background group/admin-wrapper"
      data-testid="admin-dashboard-layout"
      id="admin-dashboard-container"
    >
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-30 md:hidden"
        id="admin-mobile-overlay"
        style={
          {
            display: isMobileSidebarOpen ? 'block' : 'none',
            opacity: isMobileSidebarOpen ? 1 : 0,
            pointerEvents: isMobileSidebarOpen ? 'auto' : 'none',
            transition: 'opacity 0.3s ease-in-out',
          }
        }
        onClick={handleOverlayClick}
        aria-hidden={!isMobileSidebarOpen}
      />

      {/* Sidebar - Fixed on desktop, positionable on mobile */}
      <div
        className="fixed top-0 left-0 h-full border-r border-border bg-background z-40 transition-all duration-300 ease-in-out md:block"
        id="admin-sidebar"
        style={
          {
            width: isMobile ? '16rem' : '16rem',
            transform: isMobile ? (isMobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            ...(isMobile && isMobileSidebarOpen ? {
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            } : {}),
          } as React.CSSProperties
        }
        role="navigation"
        aria-label="Admin navigation"
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b border-border flex items-center justify-center px-4" id="admin-sidebar-header">
          <div
            className="flex items-center gap-2 font-semibold text-lg overflow-hidden transition-all duration-300"
            data-testid="admin-logo"
            id="admin-logo"
          >
            <img
              alt="WildOut Admin Logo"
              className="h-8 w-8 object-contain"
              data-testid="logo-image"
              id="admin-logo-image"
              src={logo}
            />
            <span
              className="whitespace-nowrap"
              data-testid="logo-text"
              id="admin-logo-text"
            >
              Admin Panel
            </span>
          </div>
        </div>

        {/* Sidebar Content - Scrollable */}
        <div className="px-2 py-4 overflow-y-auto" id="admin-sidebar-content">
          <div className="space-y-1" role="menubar" aria-label="Admin menu">
            {adminSections
              .filter((section) => getSectionPermissions(section.slug).canView)
              .sort((a, b) => a.order_index - b.order_index)
              .map((section) => {
                const Icon = iconMap[section.icon] || LayoutDashboard;
                const isActive = currentPage === section.slug;

                return (
                  <button
                    key={section.id}
                    id={`sidebar-menu-item-${section.slug}`}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300',
                      isActive 
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                    onClick={() => {
                      navigate(getAdminPath(section.slug));
                      if (isMobile) setIsMobileSidebarOpen(false);
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    role="menuitem"
                    onKeyDown={(e) => handleKeyDown(e, () => {
                      navigate(getAdminPath(section.slug));
                      if (isMobile) setIsMobileSidebarOpen(false);
                    })}
                    tabIndex={0}
                  >
                    <Icon
                      className={cn('h-4 w-4', isActive && 'text-primary')}
                      data-testid={`nav-icon-${section.slug}`}
                      id={`admin-nav-icon-${section.slug}`}
                    />
                    <span className="truncate" id={`admin-nav-label-${section.slug}`}>{section.label}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-2 mt-auto bg-background" id="admin-sidebar-footer">
          <div className="space-y-1">
            <button
              id="sidebar-menu-item-back-to-site"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => {
                navigate('/');
                if (isMobile) setIsMobileSidebarOpen(false);
              }}
              aria-label="Back to website"
              role="menuitem"
              onKeyDown={(e) => handleKeyDown(e, () => {
                navigate('/');
                if (isMobile) setIsMobileSidebarOpen(false);
              })}
              tabIndex={0}
            >
              <ChevronLeft className="h-4 w-4" id="back-to-site-icon" />
              <span className="text-sm" id="back-to-site-label">Back to Site</span>
            </button>

            <button
              id="sidebar-menu-item-user-profile"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => handleLogout()}
              aria-label="Log out"
              role="menuitem"
              onKeyDown={(e) => handleKeyDown(e, () => handleLogout())}
              tabIndex={0}
            >
              <LogOut className="h-4 w-4" data-testid="logout-icon" id="admin-logout-icon" />
              <span data-testid="logout-label" id="admin-logout-label">Log out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div
        className="relative flex-1 flex flex-col h-full min-w-0 transition-all duration-300 ease-in-out ml-0 md:ml-[16rem]"
        id="admin-main-content"
        style={
          {
            marginLeft: isMobile && !isMobileSidebarOpen ? 0 : undefined,
            width: isMobile && !isMobileSidebarOpen ? '100%' : undefined,
          }
        }
      >
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20 w-full px-4 md:px-6" id="admin-header">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              aria-label={isMobileSidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileSidebarOpen}
              aria-controls="admin-sidebar"
            >
              {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Separator className="mr-2 h-4 bg-border" id="admin-header-separator" orientation="vertical" />
            <div className="flex flex-col">
              <h1 className="text-sm font-medium leading-none text-foreground" id="admin-header-title">
                {adminSections.find((item) => item.slug === currentPage)?.label || 'Admin Dashboard'}
              </h1>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Avatar className="h-8 w-8 rounded-lg" data-testid="user-avatar" id="admin-user-avatar">
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground" data-testid="user-avatar-fallback" id="admin-user-avatar-fallback">
                {displayInitial}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight max-w-[120px] truncate">
              <span className="truncate font-medium text-foreground" data-testid="user-name" id="admin-user-name">{displayName}</span>
              <span className="truncate text-xs text-foreground/60" data-testid="user-email" id="admin-user-email">{displayEmail}</span>
            </div>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background relative z-10" id="admin-main">
          <div className="w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
});

AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard;