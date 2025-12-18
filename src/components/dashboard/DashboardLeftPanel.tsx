import React from "react";
import { cn } from "../ui/utils";

interface DashboardLeftPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

/**
 * DashboardLeftPanel
 * 
 * A reusable component for the left column of a two-panel dashboard layout.
 * Typically used for lists, tables, or main content summaries.
 */
export const DashboardLeftPanel = ({
  children,
  className,
  title,
  description,
}: DashboardLeftPanelProps) => {
  return (
    <div className={cn("flex-1 space-y-6 min-w-0 overflow-hidden", className)}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h1 className="text-2xl font-black text-gray-900 tracking-tight italic uppercase">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

DashboardLeftPanel.displayName = "DashboardLeftPanel";
