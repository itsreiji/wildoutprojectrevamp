import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Image,
  Handshake,
  Settings,
  LogOut,
  ChevronLeft,
  Sparkles,
  Info,
} from 'lucide-react';
import { useRouter } from '../router';
import { cn } from '../ui/utils';
import { useStaticContent } from '../../contexts/StaticContentContext';
import { useAuth } from '../../contexts/AuthContext';
import logo from 'figma:asset/7f0e33eb82cb74c153a3d669c82ee10e38a7e638.png';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = React.memo(({ children }: DashboardLayoutProps) => {
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
  const displayName = (user?.user_metadata && typeof user.user_metadata === 'object' && 'full_name' in user.user_metadata ? user.user_metadata.full_name : null) || (user?.email ? user.email.split('@')[0] : 'Admin User');
  const displayEmail = user?.email || 'admin@wildoutproject.com';

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

  // Close sidebar by default on mobile
  const [isMobile, setIsMobile] = React.useState(false);

  // Check for mobile on mount and window resize
  React.useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint is 768px
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div
        data-sidebar-wrapper
        className="relative flex h-screen w-full overflow-hidden bg-background group/sidebar-wrapper"
        data-testid="dashboard-layout"
        id="dashboard-layout-container"
      >
        {/* Overlay for mobile when sidebar is open */}
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          id="dashboard-mobile-overlay"
          style={{
            display: isMobile ? 'block' : 'none',
            opacity: isMobile ? 1 : 0,
            pointerEvents: isMobile ? 'auto' : 'none',
            transition: 'opacity 0.3s ease-in-out'
          }}
          onClick={() => {
            const sidebar = document.querySelector('[data-slot="sidebar"]');
            if (sidebar?.getAttribute('data-state') === 'expanded') {
              const trigger = document.querySelector('[data-sidebar="trigger"]') as HTMLElement;
              trigger?.click();
            }
          }}
        />
        <Sidebar
          className="fixed top-0 left-0 h-full border-r border-sidebar-border bg-card z-40 transition-all duration-300 ease-in-out"
          collapsible="icon"
          id="dashboard-sidebar"
          side="left"
          style={{
            '--sidebar-width': isMobile ? '16rem' : '16rem',
            '--sidebar-width-icon': '3rem',
            transform: isMobile ? 'translateX(-100%)' : 'translateX(0)',
            ...(isMobile ? {
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
            } : {})
          } as React.CSSProperties}
        >
          <SidebarHeader className="h-16 border-b border-sidebar-border flex items-center justify-center px-4" id="dashboard-sidebar-header">
            <div
              className="flex items-center gap-2 font-semibold text-lg overflow-hidden transition-all duration-300 group-data-[collapsible=icon]:p-0"
              data-testid="dashboard-logo"
              id="dashboard-logo"
            >
              <img
                alt="WildOut Logo"
                className="h-8 w-8 object-contain"
                data-testid="logo-image"
                id="logo-image"
                src={logo}
              />
              <span
                className="whitespace-nowrap transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0"
                data-testid="logo-text"
                id="logo-text"
              >
                WildOut
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4 overflow-y-auto" id="dashboard-sidebar-content">
            <SidebarMenu id="dashboard-sidebar-menu">
              {adminSections
                .filter((section) => getSectionPermissions(section.slug).canView)
                .sort((a, b) => a.order_index - b.order_index)
                .map((section) => {
                  const Icon = iconMap[section.icon] || LayoutDashboard;
                  const isActive = currentPage === section.slug;

                  return (
                    <SidebarMenuItem key={section.id} id={`sidebar-menu-item-${section.slug}`}>
                      <SidebarMenuButton
                        asChild={false}
                        data-active={isActive}
                        data-testid={`nav-${section.slug}`}
                        id={`sidebar-menu-button-${section.slug}`}
                        isActive={isActive}
                        onClick={() => navigate(getAdminPath(section.slug))}
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            className={cn("h-4 w-4 transition-colors duration-300", isActive && "text-sidebar-primary")}
                            data-testid={`nav-icon-${section.slug}`}
                            id={`nav-icon-${section.slug}`}
                          />
                          <span className="text-sm transition-colors duration-300" id={`nav-label-${section.slug}`}>{section.label}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-2 mt-auto" id="dashboard-sidebar-footer">
            <SidebarMenu id="dashboard-sidebar-footer-menu">
              <SidebarMenuItem id="sidebar-menu-item-back-to-site">
                <SidebarMenuButton
                  asChild={false}
                  data-testid="back-to-site-button"
                  id="sidebar-menu-button-back-to-site"
                  onClick={() => navigate('/')}
                >
                  <div className="flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" id="back-to-site-icon" />
                    <span className="text-sm" id="back-to-site-label">Back to Site</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem id="sidebar-menu-item-user-profile">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      asChild={false}
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full"
                      data-testid="user-menu-button"
                      id="user-menu-trigger"
                      size="lg"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-8 w-8 rounded-lg" data-testid="user-avatar" id="user-avatar">
                          <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground" data-testid="user-avatar-fallback" id="user-avatar-fallback">
                            {displayInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium text-sidebar-foreground" data-testid="user-name">{displayName}</span>
                          <span className="truncate text-xs text-sidebar-foreground/60" data-testid="user-email">{displayEmail}</span>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-sidebar border-sidebar-border text-sidebar-foreground"
                    id="user-menu-content"
                    side="top"
                    sideOffset={4}
                  >
                    <div className="flex items-center gap-4 px-4" data-testid="user-profile" id="user-profile-content">
                      <Avatar className="h-8 w-8" data-testid="user-avatar" id="user-profile-avatar">
                        <AvatarFallback data-testid="user-avatar-fallback" id="user-profile-avatar-fallback">{displayInitial}</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium text-sidebar-foreground" data-testid="user-name" id="user-profile-name">{displayName}</span>
                        <span className="truncate text-xs text-sidebar-foreground/60" data-testid="user-email" id="user-profile-email">{displayEmail}</span>
                      </div>
                    </div>
                    <Separator className="bg-sidebar-border my-1" id="user-menu-separator" />
                    <DropdownMenuItem
                      className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
                      data-testid="logout-button"
                      id="logout-menu-item"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" data-testid="logout-icon" id="logout-icon" />
                      <span data-testid="logout-label" id="logout-label">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail id="dashboard-sidebar-rail-left" />
          <SidebarRail id="dashboard-sidebar-rail-right" />
        </Sidebar>

        <div
          className="relative flex-1 flex flex-col h-full min-w-0 transition-all duration-300 ease-in-out ml-0 md:ml-[var(--sidebar-width)] group-data-[collapsible=icon]/sidebar-wrapper:ml-0 md:group-data-[collapsible=icon]/sidebar-wrapper:ml-[var(--sidebar-width-icon)]"
          id="dashboard-main-content"
          style={{
            marginLeft: isMobile ? 0 : undefined,
            width: isMobile ? '100%' : undefined,
          }}
        >
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-20 w-full px-4 md:px-6" id="dashboard-header">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" id="sidebar-trigger" />
              <Separator className="mr-2 h-4 bg-border" id="dashboard-header-separator" orientation="vertical" />
              <div className="flex flex-col">
                <h1 className="text-sm font-medium leading-none text-foreground" id="dashboard-header-title">
                  {adminSections.find((item) => item.slug === currentPage)?.label || 'Dashboard'}
                </h1>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background relative z-10" id="dashboard-main">
            <div className="w-full max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
});

DashboardLayout.displayName = 'DashboardLayout';
