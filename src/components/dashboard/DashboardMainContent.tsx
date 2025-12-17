import React from "react";
import { cn } from "../ui/utils";

interface DashboardMainContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * DashboardMainContent
 * 
 * The main content area wrapper for the dashboard.
 * Provides consistent spacing, scrolling behavior, and max-width constraints.
 */
export const DashboardMainContent = React.memo(
  ({ children, className }: DashboardMainContentProps) => {
    return (
      <main
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-background relative z-10",
          className
        )}
        id="dashboard-main"
      >
        <div className="w-full max-w-[1600px] mx-auto min-w-0">
          {children}
        </div>
      </main>
    );
  }
);

DashboardMainContent.displayName = "DashboardMainContent";
