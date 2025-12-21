import React from "react";
import { Badge } from "./badge";

export type StatusType =
  | "active"
  | "inactive"
  | "upcoming"
  | "ongoing"
  | "completed"
  | "draft"
  | "published"
  | "cancelled"
  | "archived"
  | "operational"
  | "insert"
  | "update"
  | "delete"
  | "brand"
  | "new"
  | "completed_modern";

interface StatusBadgeProps {
  status: string | StatusType;
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "error" | "info" | "category" | "brand" | "completed";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  icon?: React.ReactNode;
  showDot?: boolean;
  children?: React.ReactNode;
  id?: string;
}

/**
 * Standardized StatusBadge Component
 * Uses the standardized Badge component for consistent styling
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = "md",
  className,
  icon,
  showDot = true,
  children,
  id
}) => {
  const getStatusConfig = (statusStr: string) => {
    const s = statusStr.toLowerCase();
    switch (s) {
      case "brand":
      case "new":
        return {
          variant: "brand" as const,
          label: s.toUpperCase(),
        };
      case "active":
      case "published":
      case "operational":
      case "ongoing":
      case "insert":
        return {
          variant: "success" as const,
          label: s.toUpperCase(),
        };
      case "upcoming":
      case "update":
        return {
          variant: "info" as const,
          label: s.toUpperCase(),
        };
      case "inactive":
      case "draft":
      case "archived":
        return {
          variant: "outline" as const,
          label: s.toUpperCase(),
        };
      case "cancelled":
      case "delete":
        return {
          variant: "error" as const,
          label: s.toUpperCase(),
        };
      case "completed":
        return {
          variant: "completed" as const,
          label: "COMPLETED",
        };
      default:
        return {
          variant: "category" as const,
          label: s.toUpperCase(),
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={variant || config.variant}
      size={size}
      className={className}
      dot={showDot}
      icon={icon}
      id={id}
    >
      {children || config.label}
    </Badge>
  );
};
