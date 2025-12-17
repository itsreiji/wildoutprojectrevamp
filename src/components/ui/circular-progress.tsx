import React from "react";
import { cn } from "./utils";

/**
 * CircularProgress Component
 * Circular progress indicator with percentage display
 */

interface CircularProgressProps {
  value: number; // 0-100
  size?: number; // diameter in pixels
  strokeWidth?: number;
  color?: "blue" | "green" | "red" | "purple" | "cyan" | "teal";
  label?: string;
  sublabel?: string;
  className?: string;
}

export const CircularProgress = React.memo(
  ({
    value,
    size = 80,
    strokeWidth = 4,
    color = "cyan",
    label,
    sublabel,
    className,
  }: CircularProgressProps) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    const colorStyles = {
      blue: "text-blue-400",
      green: "text-green-400",
      red: "text-red-400",
      purple: "text-purple-400",
      cyan: "text-cyan-400",
      teal: "text-teal-400",
    };

    return (
      <div className={cn("relative inline-block", className)}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-600"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("transition-all duration-500", colorStyles[color])}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {label && (
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-[10px] text-muted-foreground">{sublabel}</span>
          )}
        </div>
      </div>
    );
  }
);

CircularProgress.displayName = "CircularProgress";

/**
 * CircularProgressGroup
 * Container for multiple circular progress indicators
 */
interface CircularProgressGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const CircularProgressGroup = React.memo(
  ({ children, className }: CircularProgressGroupProps) => {
    return (
      <div className={cn("flex items-center justify-center gap-4", className)}>
        {children}
      </div>
    );
  }
);

CircularProgressGroup.displayName = "CircularProgressGroup";
