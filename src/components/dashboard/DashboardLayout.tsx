import React, { useState } from 'react';
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
  SidebarInset,
  SidebarSeparator,
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
        className="relative flex h-screen w-full overflow-hidden bg-background group/sidebar-wrapper" 
        data-sidebar-wrapper
        data-testid="dashboard-layout"
      >
        {/* Overlay for mobile when sidebar is open */}
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => {
            const sidebar = document.querySelector('[data-slot="sidebar"]');
            if (sidebar?.getAttribute('data-state') === 'expanded') {
              const trigger = document.querySelector('[data-sidebar="trigger"]') as HTMLElement;
              trigger?.click();
            }
          }}
          style={{
            display: isMobile ? 'block' : 'none',
            opacity: isMobile ? 1 : 0,
            pointerEvents: isMobile ? 'auto' : 'none',
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
        <Sidebar 
          collapsible="icon" 
          className="fixed top-0 left-0 h-full border-r border-sidebar-border bg-card z-40 transition-all duration-300 ease-in-out" 
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
          <SidebarHeader className="h-16 border-b border-sidebar-border flex items-center justify-center px-4">
            <div 
              className="flex items-center gap-2 font-semibold text-lg overflow-hidden transition-all duration-300 group-data-[collapsible=icon]:p-0"
              data-testid="dashboard-logo"
            >
              <img
                src={logo}
                alt="WildOut Logo"
                className="h-8 w-8 object-contain"
                data-testid="logo-image"
              />
              <span 
                className="whitespace-nowrap transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0"
                data-testid="logo-text"
              >
                WildOut
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4 overflow-y-auto">
            <SidebarMenu>
              {adminSections
                .filter((section) => getSectionPermissions(section.slug).canView)
                .sort((a, b) => a.order_index - b.order_index)
                .map((section) => {
                  const Icon = iconMap[section.icon] || LayoutDashboard;
                  const isActive = currentPage === section.slug;

                  return (
                    <SidebarMenuItem key={section.id}>
                      <SidebarMenuButton
                        asChild={false}
                        isActive={isActive}
                        onClick={() => navigate(getAdminPath(section.slug))}
                        data-testid={`nav-${section.slug}`}
                        data-active={isActive}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-4 w-4 transition-colors duration-300", isActive && "text-sidebar-primary")} data-testid={`nav-icon-${section.slug}`} />
                          <span className="text-sm transition-colors duration-300">{section.label}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-2 mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild={false}
                  onClick={() => navigate('/')}
                  data-testid="back-to-site-button"
                >
                  <div className="flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-sm">Back to Site</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      asChild={false}
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full"
                      data-testid="user-menu-button"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-8 w-8 rounded-lg" data-testid="user-avatar">
                          <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground" data-testid="user-avatar-fallback">
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
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-sidebar border-sidebar-border text-sidebar-foreground"
                    side="top"
                    align="start"
                    sideOffset={4}
                  >
                    <div className="flex items-center gap-4 px-4" data-testid="user-profile">
                      <Avatar className="h-8 w-8" data-testid="user-avatar">
                        <AvatarFallback data-testid="user-avatar-fallback">{displayInitial}</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium text-sidebar-foreground" data-testid="user-name">{displayName}</span>
                        <span className="truncate text-xs text-sidebar-foreground/60" data-testid="user-email">{displayEmail}</span>
                      </div>
                    </div>
                    <Separator className="bg-sidebar-border my-1" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
                      data-testid="logout-button"
                    >
                      <LogOut className="h-4 w-4" data-testid="logout-icon" />
                      <span data-testid="logout-label">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
          <SidebarRail />
        </Sidebar>

        <div 
          className="relative flex-1 flex flex-col h-full min-w-0 transition-all duration-300 ease-in-out ml-0 md:ml-[var(--sidebar-width)] group-data-[collapsible=icon]/sidebar-wrapper:ml-0 md:group-data-[collapsible=icon]/sidebar-wrapper:ml-[var(--sidebar-width-icon)]"
          style={{
            marginLeft: isMobile ? 0 : undefined,
            width: isMobile ? '100%' : undefined,
          }}
        >
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-20 w-full px-4 md:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-border" />
              <div className="flex flex-col">
                <h1 className="text-sm font-medium leading-none text-foreground">
                  {adminSections.find((item) => item.slug === currentPage)?.label || 'Dashboard'}
                </h1>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background relative z-10">
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
