import React from "react";
import { cn } from "./utils";

/**
 * Badge Component
 * Enhanced badge variants for notifications, status indicators, and labels
 */

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "count" | "status" | "new" | "pill";
  color?: "blue" | "green" | "red" | "purple" | "yellow" | "gray";
  children: React.ReactNode;
}

export const Badge = React.memo(
  ({ variant = "count", color = "blue", className, children, ...props }: BadgeProps) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors";
    
    const variantStyles = {
      count: "text-xs px-2 py-0.5 rounded-full",
      status: "text-xs px-2 py-1 rounded-full",
      new: "text-xs font-bold px-2 py-0.5 rounded-full uppercase",
      pill: "text-xs px-3 py-1 rounded-xl",
    };

    const colorStyles = {
      blue: "bg-blue-500 text-white",
      green: "bg-green-500 text-white",
      red: "bg-red-500 text-white",
      purple: "bg-purple-500 text-white",
      yellow: "bg-yellow-500 text-white",
      gray: "bg-gray-500 text-white",
    };

    return (
      <span
        className={cn(
          baseStyles,
          variantStyles[variant],
          colorStyles[color],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

/**
 * NotificationBadge
 * Small circular badge for notification counts on icons
 */
interface NotificationBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number;
  max?: number;
  color?: "red" | "blue" | "green";
}

export const NotificationBadge = React.memo(
  ({ count, max = 99, color = "red", className, ...props }: NotificationBadgeProps) => {
    const displayCount = count > max ? `${max}+` : count;
    
    const colorStyles = {
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
    };

    if (count === 0) return null;

    return (
      <span
        className={cn(
          "absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full",
          colorStyles[color],
          className
        )}
        {...props}
      >
        {displayCount}
      </span>
    );
  }
);

NotificationBadge.displayName = "NotificationBadge";

/**
 * StatusBadge
 * Badge for online/offline/status indicators
 */
interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "online" | "offline" | "away" | "busy";
}

export const StatusBadge = React.memo(
  ({ status, className, ...props }: StatusBadgeProps) => {
    const statusConfig = {
      online: { color: "bg-green-500", label: "Online" },
      offline: { color: "bg-gray-500", label: "Offline" },
      away: { color: "bg-yellow-500", label: "Away" },
      busy: { color: "bg-red-500", label: "Busy" },
    };

    const config = statusConfig[status];

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full",
          config.color,
          "text-white",
          className
        )}
        {...props}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", config.color)} />
        {config.label}
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";
