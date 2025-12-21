import React from "react";
import { cn } from "./utils";
import { Badge as StandardBadge } from "./badge";

/**
 * Enhanced Badge Components (Legacy - Deprecated)
 * These components are maintained for backward compatibility but should use the standardized Badge component
 * @deprecated Use the standardized Badge component from ./badge instead
 */

interface LegacyBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "count" | "status" | "new" | "pill";
  color?: "blue" | "green" | "red" | "purple" | "yellow" | "gray";
  children: React.ReactNode;
}

/**
 * @deprecated Use Badge component with variant="category" and appropriate color classes
 */
export const Badge = React.memo(
  ({ variant = "count", color = "blue", className, children, ...props }: LegacyBadgeProps) => {
    // Map legacy variants to standardized badge variants
    const variantMap: Record<string, any> = {
      count: { variant: "count", size: "sm" },
      status: { variant: "secondary", size: "sm" },
      new: { variant: "category", size: "sm" },
      pill: { variant: "category", size: "md", rounded: "lg" },
    };

    // Map legacy colors to standardized color classes
    const colorClassMap: Record<string, string> = {
      blue: "bg-blue-500 text-white",
      green: "bg-green-500 text-white",
      red: "bg-red-500 text-white",
      purple: "bg-purple-500 text-white",
      yellow: "bg-yellow-500 text-white",
      gray: "bg-gray-500 text-white",
    };

    const mappedVariant = variantMap[variant];
    const colorClass = colorClassMap[color];

    return (
      <StandardBadge
        variant={mappedVariant.variant}
        size={mappedVariant.size}
        rounded={mappedVariant.rounded || "full"}
        className={cn(colorClass, className)}
        {...props}
      >
        {children}
      </StandardBadge>
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

    // Map colors to standardized variants
    const variantMap: Record<string, any> = {
      red: "error",
      blue: "info",
      green: "success",
    };

    if (count === 0) return null;

    return (
      <StandardBadge
        variant={variantMap[color]}
        size="sm"
        rounded="full"
        className={cn(
          "absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 min-w-[1.25rem] h-5 px-1.5 text-[10px] font-bold flex items-center justify-center",
          className
        )}
        {...props}
      >
        {displayCount}
      </StandardBadge>
    );
  }
);

NotificationBadge.displayName = "NotificationBadge";

/**
 * StatusBadge (Presence)
 * Badge for online/offline/status indicators
 */
interface PresenceBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "online" | "offline" | "away" | "busy";
}

export const PresenceBadge = React.memo(
  ({ status, className, ...props }: PresenceBadgeProps) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      online: { variant: "success", label: "Online" },
      offline: { variant: "outline", label: "Offline" },
      away: { variant: "warning", label: "Away" },
      busy: { variant: "error", label: "Busy" },
    };

    const config = statusConfig[status];

    return (
      <StandardBadge
        variant={config.variant}
        size="sm"
        rounded="full"
        dot={true}
        className={cn("font-medium", className)}
        {...props}
      >
        {config.label}
      </StandardBadge>
    );
  }
);

PresenceBadge.displayName = "PresenceBadge";
