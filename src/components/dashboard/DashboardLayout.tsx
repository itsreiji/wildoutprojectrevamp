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

    // Lock body scroll to ensure internal container scrolling works correctly
    React.useEffect(() => {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      return () => {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      };
    }, []);

    return (
      <SidebarProvider
        className="w-full bg-background"
        style={{ height: "100dvh", overflow: "hidden" }}
        data-testid="admin-dashboard-layout"
      >
        {/* Side Menu Panel */}
        <DashboardSidebar currentPage={currentPage} />
        {/* Main Content Panel */}
        <SidebarInset
          id="dashboard-main-content"
          className="flex flex-col min-h-0"
          style={{ height: "100dvh", overflowY: "auto", overflowX: "hidden" }}
          data-testid="admin-main-content"
        >
          <DashboardHeader currentPage={currentPage} />
          <DashboardMainContent>{children}</DashboardMainContent>
        </SidebarInset>
      </SidebarProvider>
    );
  }
);

DashboardLayout.displayName = "DashboardLayout";
