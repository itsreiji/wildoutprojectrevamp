import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { badgeVariants } from "./badge-variants"

/**
 * Standardized Badge Component
 * Consistent styling across all badge types with accessibility compliance
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  dot?: boolean;
}

const Badge = ({
  className,
  variant,
  size,
  rounded,
  icon,
  dot = false,
  children,
  ...props
}: BadgeProps) => {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size, rounded }),
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </div>
  )
}

export { Badge }
