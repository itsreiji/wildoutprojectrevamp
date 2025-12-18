import React from "react";
import { cn } from "@/lib/utils";

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
  | "delete";

interface StatusBadgeProps {
  status: string | StatusType;
  className?: string;
  icon?: React.ReactNode;
  showDot?: boolean;
  children?: React.ReactNode;
  id?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  icon,
  showDot = true,
  children,
  id
}) => {
  const getStatusStyles = (statusStr: string) => {
    const s = statusStr.toLowerCase();
    switch (s) {
      case "active":
      case "published":
      case "operational":
      case "ongoing":
      case "insert":
        return {
          container: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]",
          dot: "bg-emerald-500",
          label: s === "operational" ? "OPERATIONAL" : s.toUpperCase(),
        };
      case "upcoming":
      case "update":
        return {
          container: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          dot: "bg-blue-500",
          label: s.toUpperCase(),
        };
      case "inactive":
      case "draft":
      case "archived":
        return {
          container: "bg-white/5 text-white/40 border-white/10",
          dot: "bg-white/20",
          label: s.toUpperCase(),
        };
      case "cancelled":
      case "delete":
        return {
          container: "bg-red-500/10 text-red-400 border-red-500/20",
          dot: "bg-red-500",
          label: s.toUpperCase(),
        };
      case "completed":
        return {
          container: "bg-gray-500/10 text-gray-400 border-gray-500/20",
          dot: "bg-gray-500",
          label: "COMPLETED",
        };
      default:
        return {
          container: "bg-white/5 text-white/60 border-white/10",
          dot: "bg-white/40",
          label: s.toUpperCase(),
        };
    }
  };

  const styles = getStatusStyles(status);

  return (
    <div
      id={id}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wider transition-all duration-300",
        styles.container,
        className
      )}
    >
      {icon ? (
        icon
      ) : showDot ? (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", styles.dot)} />
          <span className={cn("relative inline-flex rounded-full h-2 w-2", styles.dot)} />
        </span>
      ) : null}
      {children || styles.label}
    </div>
  );
};
