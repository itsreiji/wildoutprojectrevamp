import React, { useState, useEffect } from 'react';
import { Box, Flex, Text } from '@radix-ui/themes';
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
  PanelRightOpen,
  PanelRightClose
} from 'lucide-react';
import { useRouter } from '../router';
import { cn } from '../ui/utils';
import { useStaticContent } from '../../contexts/StaticContentContext';
import { useAuth } from '../../contexts/AuthContext';
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
import { Button } from '@/components/ui/button';

interface AdvancedDashboardLayoutProps {
  children: React.ReactNode;
  rightPanelContent?: React.ReactNode;
  showRightPanel?: boolean;
}

export const AdvancedDashboardLayout = React.memo(({
  children,
  rightPanelContent,
  showRightPanel = true
}: AdvancedDashboardLayoutProps) => {
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

  // State for right panel
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsRightPanelOpen(false);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Update right panel state based on prop
  useEffect(() => {
    if (!showRightPanel) {
      setIsRightPanelOpen(false);
    }
  }, [showRightPanel]);

  const toggleRightPanel = () => {
    setIsRightPanelOpen(!isRightPanelOpen);
  };

  return (
    <SidebarProvider>
      <Flex
        className="relative h-screen w-full overflow-hidden bg-background group/sidebar-wrapper"
        data-testid="advanced-dashboard-layout"
        id="advanced-dashboard-layout-container"
        direction="row"
        role="main"
        aria-label="Dashboard layout with left navigation and right contextual panel"
      >
        {/* Left Sidebar - Navigation Panel */}
        <Sidebar
          className="fixed top-0 left-0 h-full border-r border-sidebar-border bg-card z-40 transition-all duration-300 ease-in-out"
          collapsible="icon"
          id="dashboard-left-sidebar"
          side="left"
          style={{
            '--sidebar-width': '16rem',
            '--sidebar-width-icon': '3rem',
          } as React.CSSProperties}
          role="navigation"
          aria-label="Main navigation"
        >
          <SidebarHeader className="h-16 border-b border-sidebar-border flex items-center justify-center px-4" id="dashboard-left-sidebar-header">
            <div
              className="flex items-center gap-2 font-semibold text-lg overflow-hidden transition-all duration-300 group-data-[collapsible=icon]:p-0"
              data-testid="dashboard-logo"
              id="dashboard-logo"
              aria-label="WildOut Logo"
            >
              <div className="h-8 w-8 bg-sidebar-primary rounded-md flex items-center justify-center" aria-hidden="true">
                <Sparkles className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <span
                className="whitespace-nowrap transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0"
                data-testid="logo-text"
                id="logo-text"
                aria-hidden={true}
              >
                WildOut
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4 overflow-y-auto" id="dashboard-left-sidebar-content" aria-label="Navigation menu">
            <SidebarMenu id="dashboard-left-sidebar-menu">
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
                        aria-label={`${section.label} ${isActive ? '(current page)' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            className={cn("h-4 w-4 transition-colors duration-300", isActive && "text-sidebar-primary")}
                            data-testid={`nav-icon-${section.slug}`}
                            id={`nav-icon-${section.slug}`}
                            aria-hidden="true"
                          />
                          <span className="text-sm transition-colors duration-300" id={`nav-label-${section.slug}`}>{section.label}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-2 mt-auto" id="dashboard-left-sidebar-footer" aria-label="User profile and settings">
            <SidebarMenu id="dashboard-left-sidebar-footer-menu">
              <SidebarMenuItem id="left-sidebar-menu-item-back-to-site">
                <SidebarMenuButton
                  asChild={false}
                  data-testid="back-to-site-button"
                  id="sidebar-menu-button-back-to-site"
                  onClick={() => navigate('/')}
                  aria-label="Return to main site"
                >
                  <div className="flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" id="back-to-site-icon" aria-hidden="true" />
                    <span className="text-sm" id="back-to-site-label">Back to Site</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem id="left-sidebar-menu-item-user-profile">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      asChild={false}
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full"
                      data-testid="user-menu-button"
                      id="user-menu-trigger"
                      size="lg"
                      aria-label="User profile menu"
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
                      aria-label="Log out of your account"
                    >
                      <LogOut className="h-4 w-4" data-testid="logout-icon" id="logout-icon" aria-hidden="true" />
                      <span data-testid="logout-label" id="logout-label">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail id="dashboard-left-sidebar-rail" />
        </Sidebar>

        {/* Main Content Area */}
        <Flex
          className="relative flex-1 flex flex-col h-full min-w-0 transition-all duration-300 ease-in-out ml-[var(--sidebar-width)]"
          direction="column"
          id="dashboard-main-content"
          role="main"
          aria-label="Main dashboard content"
        >
          <Box className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-20 w-full px-4 md:px-6" id="dashboard-header" role="banner">
            <Flex align="center" gap="2">
              <SidebarTrigger className="-ml-1" id="sidebar-trigger" aria-label="Toggle sidebar" />
              <Separator className="mr-2 h-4 bg-border" id="dashboard-header-separator" orientation="vertical" />
              <Text as="div" className="text-sm font-medium leading-none text-foreground" id="dashboard-header-title">
                {adminSections.find((item) => item.slug === currentPage)?.label || 'Dashboard'}
              </Text>
            </Flex>

            {/* Right Panel Toggle Button for Mobile */}
            {isMobile && showRightPanel && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={toggleRightPanel}
                aria-label={isRightPanelOpen ? "Close right panel" : "Open right panel"}
              >
                {isRightPanelOpen ? <PanelRightClose className="h-4 w-4" aria-hidden="true" /> : <PanelRightOpen className="h-4 w-4" aria-hidden="true" />}
              </Button>
            )}
          </Box>

          <Flex
            className="flex-1 overflow-y-auto relative z-10"
            id="dashboard-content-wrapper"
            role="region"
            aria-label="Dashboard content area"
          >
            <Box
              className={cn(
                "w-full max-w-[1600px] mx-auto p-4 md:p-6 transition-all duration-300",
                showRightPanel && isRightPanelOpen && !isMobile ? "w-[calc(100%-20rem)]" : "w-full"
              )}
              id="dashboard-main"
              role="main"
              aria-label="Main dashboard content"
            >
              {children}
            </Box>

            {/* Right Panel - Contextual/Utility Panel */}
            {showRightPanel && (
              <Flex
                className={cn(
                  "h-full border-l border-sidebar-border bg-card z-30 transition-all duration-300 ease-in-out w-0 overflow-hidden",
                  isRightPanelOpen && !isMobile ? "w-80" : "",
                  isMobile ? "fixed top-16 right-0 bottom-0 z-50" : "relative"
                )}
                id="dashboard-right-panel-container"
                direction="column"
                role="complementary"
                aria-label="Contextual information panel"
              >
                {/* Right Panel Header */}
                <Flex
                  className="h-16 border-b border-sidebar-border items-center justify-between p-4 flex-shrink-0"
                  id="right-panel-header"
                >
                  <Text as="div" className="text-sm font-medium text-foreground" aria-label="Contextual panel header">
                    Contextual Panel
                  </Text>
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleRightPanel}
                      aria-label="Close right panel"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                </Flex>

                {/* Right Panel Content */}
                <Box
                  className="flex-1 overflow-y-auto p-4"
                  id="right-panel-content"
                  role="region"
                  aria-label="Contextual panel content"
                >
                  {rightPanelContent || (
                    <Flex direction="column" gap="4">
                      <Text as="div" className="font-medium text-foreground" aria-label="Contextual information header">
                        Contextual Information
                      </Text>
                      <Text as="p" className="text-sm text-foreground/70" aria-label="Description of contextual information">
                        This is the right panel that can contain contextual information, filters,
                        related details, or quick actions that support the main content.
                      </Text>
                    </Flex>
                  )}
                </Box>
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Mobile Overlay for Right Panel */}
        {showRightPanel && isMobile && isRightPanelOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            id="dashboard-right-panel-mobile-overlay"
            onClick={toggleRightPanel}
            aria-label="Close right panel overlay"
          />
        )}
      </Flex>
    </SidebarProvider>
  );
});

AdvancedDashboardLayout.displayName = 'AdvancedDashboardLayout';