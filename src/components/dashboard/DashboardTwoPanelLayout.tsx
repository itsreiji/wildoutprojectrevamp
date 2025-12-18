import React from "react";
import { cn } from "../ui/utils";

interface DashboardTwoPanelLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * DashboardTwoPanelLayout
 * 
 * A layout wrapper that facilitates a two-column panel system.
 * It uses flexbox to arrange its children (usually DashboardLeftPanel and DashboardRightPanel).
 * On smaller screens, it stacks them vertically.
 */
export const DashboardTwoPanelLayout = ({
  children,
  className,
}: DashboardTwoPanelLayoutProps) => {
  return (
    <div className={cn("flex flex-col xl:flex-row gap-8 w-full min-w-0 items-start", className)}>
      {children}
    </div>
  );
};

DashboardTwoPanelLayout.displayName = "DashboardTwoPanelLayout";
