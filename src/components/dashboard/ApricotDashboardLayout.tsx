import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import React from "react";
import { useRouter } from "../router";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardMainContent } from "./DashboardMainContent";

interface ApricotDashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * ApricotDashboardLayout
 *
 * Dedicated layout component for the Apricot dashboard with proper sidebar integration.
 * Implements a two-panel layout:
 * - Side Menu: Collapsible sidebar with navigation, search, and user profile
 * - Main Content: Header with breadcrumbs and content area
 *
 * Features:
 * - Responsive design (mobile drawer, desktop sidebar)
 * - Collapsible sidebar (icon mode on desktop)
 * - Persistent sidebar state (localStorage)
 * - Keyboard shortcuts (Cmd/Ctrl + B to toggle)
 */
export const ApricotDashboardLayout = React.memo(
  ({ children }: ApricotDashboardLayoutProps) => {
    const { getCurrentSubPath } = useRouter();

    // Derive current page from URL path
    const currentPage = getCurrentSubPath() || "home";

    return (
      <SidebarProvider>
        {/* Side Menu Panel */}
        <DashboardSidebar currentPage={currentPage} />
        {/* Main Content Panel */}
        <SidebarInset id="apricot-main-content">
          <DashboardHeader currentPage={currentPage} />
          <DashboardMainContent>
            {children}
          </DashboardMainContent>
        </SidebarInset>
      </SidebarProvider>
    );
  }
);

ApricotDashboardLayout.displayName = "ApricotDashboardLayout";