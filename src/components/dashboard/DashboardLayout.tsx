import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { useRouter } from "../router";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardMainContent } from "./DashboardMainContent";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * DashboardLayout
 * 
 * Main layout component for the dashboard application.
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
export const DashboardLayout = React.memo(
  ({ children }: DashboardLayoutProps) => {
    const { getCurrentSubPath } = useRouter();
    
    // Derive current page from URL path
    const currentPage = getCurrentSubPath() || "home";

    return (
      <SidebarProvider>
        {/* Side Menu Panel */}
        <DashboardSidebar currentPage={currentPage} />

        {/* Main Content Panel */}
        <SidebarInset id="dashboard-main-content">
          <DashboardHeader currentPage={currentPage} />
          <DashboardMainContent>{children}</DashboardMainContent>
        </SidebarInset>
      </SidebarProvider>
    );
  }
);

DashboardLayout.displayName = "DashboardLayout";
