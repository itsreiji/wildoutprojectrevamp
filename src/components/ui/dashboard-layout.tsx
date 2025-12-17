import React, { useState, useEffect } from 'react';
import * as RadixThemes from '@radix-ui/themes';
import { HamburgerMenuIcon, Cross2Icon, ChevronLeftIcon } from '@radix-ui/react-icons';
import { Button } from './button';
import { Separator } from './separator';
import { Avatar, AvatarFallback } from './avatar';
import { ScrollArea } from './scroll-area';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
  headerContent?: React.ReactNode;
  sidebarWidth?: string;
  collapsedSidebarWidth?: string;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  onLogout?: () => void;
  onBackToSite?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebarContent,
  headerContent,
  sidebarWidth = '250px',
  collapsedSidebarWidth = '64px',
  user,
  onLogout,
  onBackToSite,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Check for mobile on mount and window resize
  useEffect(() => {
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

  // Handle keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent, onClick: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const displayInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'A';
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Admin User');
  const displayEmail = user?.email || 'admin@example.com';

  return (
    <RadixThemes.Flex
      data-dashboard-wrapper
      className="relative h-screen w-full overflow-hidden"
      direction="row"
      id="dashboard-container"
    >
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-30 md:hidden"
        id="dashboard-mobile-overlay"
        style={{
          display: isMobileSidebarOpen ? 'block' : 'none',
          opacity: isMobileSidebarOpen ? 1 : 0,
          pointerEvents: isMobileSidebarOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease-in-out',
        }}
        onClick={() => setIsMobileSidebarOpen(false)}
        aria-hidden={!isMobileSidebarOpen}
      />

      {/* Sidebar - Fixed on desktop, positionable on mobile */}
      <RadixThemes.Box
        className="fixed top-0 left-0 h-full border-r border-border bg-background z-40 transition-all duration-300 ease-in-out md:block"
        id="dashboard-sidebar"
        style={{
          width: isMobile ? (isMobileSidebarOpen ? sidebarWidth : '0px') : isSidebarOpen ? sidebarWidth : collapsedSidebarWidth,
          transform: isMobile ? (isMobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
          ...(isMobile && isMobileSidebarOpen ? {
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          } : {}),
        }}
        role="navigation"
        aria-label="Dashboard navigation"
      >
        {/* Sidebar Header */}
        <RadixThemes.Flex
          className="h-16 border-b border-border items-center justify-center px-4"
          id="dashboard-sidebar-header"
        >
          <RadixThemes.Heading
            className="font-semibold truncate"
            id="dashboard-logo-text"
            size="4"
          >
            {isSidebarOpen ? 'Dashboard' : 'D'}
          </RadixThemes.Heading>
        </RadixThemes.Flex>

        {/* Sidebar Content - Scrollable */}
        <ScrollArea className="p-2" id="dashboard-sidebar-content">
          <RadixThemes.Box
            className="space-y-1"
            role="menubar"
            aria-label="Dashboard menu"
          >
            {sidebarContent}
          </RadixThemes.Box>
        </ScrollArea>

        {/* Sidebar Footer */}
        <RadixThemes.Box className="border-t border-border p-2 mt-auto bg-background" id="dashboard-sidebar-footer">
          <RadixThemes.Box className="space-y-2">
            {onBackToSite && (
              <Button
                id="sidebar-menu-item-back-to-site"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => {
                  onBackToSite();
                  if (isMobile) setIsMobileSidebarOpen(false);
                }}
                aria-label="Back to website"
                role="menuitem"
                onKeyDown={(e) => handleKeyDown(e, () => {
                  onBackToSite();
                  if (isMobile) setIsMobileSidebarOpen(false);
                })}
                tabIndex={0}
              >
                <ChevronLeftIcon className="h-4 w-4" id="back-to-site-icon" />
                <span className="text-sm" id="back-to-site-label" style={{ display: isSidebarOpen ? 'inline' : 'none' }}>
                  Back to Site
                </span>
              </Button>
            )}

            {onLogout && (
              <Button
                id="sidebar-menu-item-user-profile"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => onLogout()}
                aria-label="Log out"
                role="menuitem"
                onKeyDown={(e) => handleKeyDown(e, () => onLogout())}
                tabIndex={0}
              >
                <Cross2Icon className="h-4 w-4" id="logout-icon" />
                <span id="logout-label" style={{ display: isSidebarOpen ? 'inline' : 'none' }}>
                  Log out
                </span>
              </Button>
            )}
          </RadixThemes.Box>
        </RadixThemes.Box>
      </RadixThemes.Box>

      {/* Main Content Area - Responsive */}
      <RadixThemes.Flex
        flexGrow="1"
        direction="column"
        className="relative h-full min-w-0 transition-all duration-300 ease-in-out ml-0"
        style={{
          marginLeft: isMobile ? (isMobileSidebarOpen ? '0px' : '0px') : isSidebarOpen ? sidebarWidth : collapsedSidebarWidth,
          width: isMobile && !isMobileSidebarOpen ? '100%' : 'auto',
        }}
        id="dashboard-main-content"
      >
        {/* Header */}
        <RadixThemes.Flex
          className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20 w-full px-4 md:px-6"
          id="dashboard-header"
          align="center"
        >
          <RadixThemes.Flex align="center" gap="2" className="flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              aria-label={isMobileSidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileSidebarOpen}
              aria-controls="dashboard-sidebar"
            >
              {isMobileSidebarOpen ? <Cross2Icon className="h-5 w-5" /> : <HamburgerMenuIcon className="h-5 w-5" />}
            </Button>
            <Separator className="mr-2 h-4 bg-border" id="dashboard-header-separator" orientation="vertical" />
            <div className="flex flex-col">
              <RadixThemes.Heading
                className="text-sm font-medium leading-none text-foreground"
                id="dashboard-header-title"
                size="3"
              >
                {headerContent || 'Dashboard'}
              </RadixThemes.Heading>
            </div>
          </RadixThemes.Flex>
          
          <RadixThemes.Flex align="center" gap="4" className="ml-auto">
            <Avatar className="h-8 w-8 rounded-lg" id="dashboard-user-avatar">
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground" id="dashboard-user-avatar-fallback">
                {displayInitial}
              </AvatarFallback>
            </Avatar>
            <RadixThemes.Box className="max-w-[120px] truncate">
              <RadixThemes.Text
                className="truncate font-medium text-foreground text-sm"
                data-testid="user-name"
                id="dashboard-user-name"
              >
                {displayName}
              </RadixThemes.Text>
              <RadixThemes.Text
                className="truncate text-xs text-foreground/60"
                data-testid="user-email"
                id="dashboard-user-email"
              >
                {displayEmail}
              </RadixThemes.Text>
            </RadixThemes.Box>
          </RadixThemes.Flex>
        </RadixThemes.Flex>

        {/* Main Content - Scrollable */}
        <RadixThemes.ScrollArea
          className="flex-1 overflow-y-auto p-4 md:p-6 bg-background relative z-10"
          id="dashboard-main"
        >
          <RadixThemes.Box className="max-w-[1600px] mx-auto w-full">
            {children}
          </RadixThemes.Box>
        </RadixThemes.ScrollArea>

        {/* Toggle sidebar button for desktop */}
        {!isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 z-30"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ChevronLeftIcon className={`h-4 w-4 transition-transform duration-300 ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`} />
          </Button>
        )}
      </RadixThemes.Flex>
    </RadixThemes.Flex>
  );
};

export { DashboardLayout };