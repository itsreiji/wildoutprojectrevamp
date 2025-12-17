import React, { useState } from 'react';
import * as RadixThemes from '@radix-ui/themes';
import { HamburgerMenuIcon, Cross2Icon, ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';

const ResponsiveDashboardLayout: React.FC<{
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
  showRightPanel?: boolean;
  rightPanelContent?: React.ReactNode;
  rightPanelWidth?: string;
}> = ({
  children,
  sidebarContent,
  headerContent,
  sidebarWidth = '250px',
  collapsedSidebarWidth = '64px',
  user,
  onLogout,
  onBackToSite,
  showRightPanel = false,
  rightPanelContent,
  rightPanelWidth = '300px',
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isMobileRightPanelOpen, setIsMobileRightPanelOpen] = useState(false);

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
      direction={{ initial: 'column', md: 'row' }}
      id="dashboard-container"
    >
      {/* Mobile overlay for sidebar */}
      {isMobile && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          id="dashboard-mobile-sidebar-overlay"
          style={{
            opacity: isMobileSidebarOpen ? 1 : 0,
            pointerEvents: isMobileSidebarOpen ? 'auto' : 'none',
            transition: 'opacity 0.3s ease-in-out',
          }}
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden={!isMobileSidebarOpen}
        />
      )}

      {/* Mobile overlay for right panel */}
      {isMobile && isMobileRightPanelOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          id="dashboard-mobile-right-panel-overlay"
          style={{
            opacity: isMobileRightPanelOpen ? 1 : 0,
            pointerEvents: isMobileRightPanelOpen ? 'auto' : 'none',
            transition: 'opacity 0.3s ease-in-out',
          }}
          onClick={() => setIsMobileRightPanelOpen(false)}
          aria-hidden={!isMobileRightPanelOpen}
        />
      )}

      {/* Sidebar - Fixed on desktop, positionable on mobile */}
      <RadixThemes.Box
        className="fixed md:static top-0 left-0 h-full border-r border-border bg-background z-40 transition-all duration-300 ease-in-out md:block"
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
        className="relative h-full min-w-0 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isMobile ? '0px' : isSidebarOpen ? sidebarWidth : collapsedSidebarWidth,
          width: isMobile ? '100%' : 'auto',
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

        {/* Main Content and Right Panel Container */}
        <RadixThemes.Flex
          flexGrow="1"
          className="overflow-hidden"
          direction={{ initial: 'column', lg: 'row' }}
        >
          {/* Main Content - Scrollable */}
          <RadixThemes.Flex
            flexGrow="1"
            className="overflow-y-auto p-4 md:p-6 bg-background relative z-10"
            style={{
              width: isMobile ? '100%' : showRightPanel && isRightPanelOpen ? `calc(100% - ${isMobile ? '0px' : rightPanelWidth})` : '100%',
            }}
          >
            <RadixThemes.Box className="max-w-[1600px] mx-auto w-full">
              {children}
            </RadixThemes.Box>
          </RadixThemes.Flex>

          {/* Right Panel (Optional Contextual/Details Panel) */}
          {showRightPanel && (
            <RadixThemes.Box
              className="border-l border-border bg-background z-30 transition-all duration-300 ease-in-out"
              id="dashboard-right-panel"
              style={{
                width: isMobile ? (isMobileRightPanelOpen ? rightPanelWidth : '0px') : isRightPanelOpen ? rightPanelWidth : '0px',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <RadixThemes.Flex
                className="h-full flex-col"
                direction="column"
              >
                {/* Right Panel Header */}
                <RadixThemes.Flex
                  className="h-16 border-b border-border items-center justify-between px-4"
                  align="center"
                >
                  <RadixThemes.Heading
                    className="font-semibold"
                    size="3"
                  >
                    Details
                  </RadixThemes.Heading>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (isMobile) {
                        setIsMobileRightPanelOpen(!isMobileRightPanelOpen);
                      } else {
                        setIsRightPanelOpen(!isRightPanelOpen);
                      }
                    }}
                    aria-label={isRightPanelOpen ? 'Collapse details panel' : 'Expand details panel'}
                  >
                    {isMobile ? (
                      <Cross2Icon className="h-4 w-4" />
                    ) : isRightPanelOpen ? (
                      <ChevronRightIcon className="h-4 w-4" />
                    ) : (
                      <ChevronLeftIcon className="h-4 w-4" />
                    )}
                  </Button>
                </RadixThemes.Flex>

                {/* Right Panel Content */}
                <ScrollArea className="flex-1 p-4">
                  {rightPanelContent}
                </ScrollArea>
              </RadixThemes.Flex>
            </RadixThemes.Box>
          )}
        </RadixThemes.Flex>

        {/* Toggle sidebar button for desktop */}
        {!isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-20 right-4 z-30"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ChevronLeftIcon className={`h-4 w-4 transition-transform duration-300 ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`} />
          </Button>
        )}

        {/* Toggle right panel button for desktop */}
        {showRightPanel && !isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-32 right-4 z-30"
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            aria-label={isRightPanelOpen ? 'Collapse details panel' : 'Expand details panel'}
          >
            <ChevronRightIcon className={`h-4 w-4 transition-transform duration-300 ${isRightPanelOpen ? 'rotate-0' : 'rotate-180'}`} />
          </Button>
        )}

        {/* Mobile toggle button for right panel */}
        {showRightPanel && isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4 z-30"
            onClick={() => setIsMobileRightPanelOpen(!isMobileRightPanelOpen)}
            aria-label="Toggle details panel"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        )}
      </RadixThemes.Flex>
    </RadixThemes.Flex>
  );
};

export { ResponsiveDashboardLayout };