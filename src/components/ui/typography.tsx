import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Standardized Typography System
 * Consistent text styling across the entire application
 */

// Heading Components
export const H1 = React.memo(({
  className,
  children,
  gradient,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { gradient?: string }) => (
  <h1
    className={cn(
      "text-4xl md:text-5xl lg:text-6xl",
      "font-bold tracking-tight",
      gradient ? "bg-gradient-to-r bg-clip-text text-transparent" : "text-foreground",
      gradient,
      "leading-tight",
      className
    )}
    {...props}
  >
    {children}
  </h1>
));

export const H2 = React.memo(({
  className,
  children,
  gradient,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { gradient?: string }) => (
  <h2
    className={cn(
      "text-3xl md:text-4xl lg:text-5xl",
      "font-bold tracking-tight",
      gradient ? "bg-gradient-to-r bg-clip-text text-transparent" : "text-foreground",
      gradient,
      "leading-tight",
      className
    )}
    {...props}
  >
    {children}
  </h2>
));

export const H3 = React.memo(({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "text-2xl md:text-3xl",
      "font-semibold tracking-tight",
      "text-foreground",
      "leading-snug",
      className
    )}
    {...props}
  >
    {children}
  </h3>
));

export const H4 = React.memo(({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h4
    className={cn(
      "text-xl md:text-2xl",
      "font-semibold",
      "text-foreground",
      "leading-snug",
      className
    )}
    {...props}
  >
    {children}
  </h4>
));

export const H5 = React.memo(({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h5
    className={cn(
      "text-lg md:text-xl",
      "font-semibold",
      "text-foreground",
      "leading-snug",
      className
    )}
    {...props}
  >
    {children}
  </h5>
));

export const H6 = React.memo(({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h6
    className={cn(
      "text-base md:text-lg",
      "font-semibold",
      "text-foreground",
      "leading-snug",
      className
    )}
    {...props}
  >
    {children}
  </h6>
));

// Paragraph Components
export const LeadText = React.memo(({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(
      "text-lg md:text-xl",
      "text-muted-foreground",
      "leading-relaxed",
      className
    )}
    {...props}
  >
    {children}
  </p>
));

export const BodyText = React.memo(({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(
      "text-base",
      "text-foreground",
      "leading-relaxed",
      className
    )}
    {...props}
  >
    {children}
  </p>
));

export const SmallText = React.memo(({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(
      "text-sm",
      "text-foreground",
      "leading-normal",
      className
    )}
    {...props}
  >
    {children}
  </p>
));

export const TinyText = React.memo(({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(
      "text-xs",
      "text-foreground",
      "leading-normal",
      className
    )}
    {...props}
  >
    {children}
  </p>
));

// Special Text Components
export const GradientText = React.memo(({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { from?: string; to?: string; via?: string }) => (
  <span
    className={cn(
      "bg-gradient-to-r",
      "from-white via-[#E93370] to-white",
      "bg-clip-text",
      "text-transparent",
      "font-bold",
      className
    )}
    {...props}
  >
    {children}
  </span>
));

export const MutedText = React.memo(({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "text-muted-foreground",
      className
    )}
    {...props}
  >
    {children}
  </span>
));

export const HighlightText = React.memo(({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "bg-primary/10",
      "text-primary-foreground",
      "px-1",
      "rounded-sm",
      className
    )}
    {...props}
  >
    {children}
  </span>
));

// Text alignment utilities
export const TextAlign = {
  Left: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) =>
    <span className={cn("text-left", className)} {...props} />,
  Center: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) =>
    <span className={cn("text-center", className)} {...props} />,
  Right: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) =>
    <span className={cn("text-right", className)} {...props} />,
  Justify: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) =>
    <span className={cn("text-justify", className)} {...props} />,
};

// Text weight utilities
export const TextWeight = {
  Light: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) =>
    <span className={cn("font-light", className)} {...props} />,
  Normal: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) =>
    <span className={cn("font-normal", className)} {...props} />,
  Medium: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) =>
    <span className={cn("font-medium", className)} {...props} />,
  Semibold: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) =>
    <span className={cn("font-semibold", className)} {...props} />,
  Bold: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) =>
    <span className={cn("font-bold", className)} {...props} />,
  Black: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) =>
    <span className={cn("font-black", className)} {...props} />,
};

// Text transform utilities
export const TextTransform = {
  Uppercase: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) =>
    <span className={cn("uppercase", className)} {...props} />,
  Lowercase: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) =>
    <span className={cn("lowercase", className)} {...props} />,
  Capitalize: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) =>
    <span className={cn("capitalize", className)} {...props} />,
  NormalCase: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) =>
    <span className={cn("normal-case", className)} {...props} />,
};

// Export display names
H1.displayName = "H1";
H2.displayName = "H2";
H3.displayName = "H3";
H4.displayName = "H4";
H5.displayName = "H5";
H6.displayName = "H6";
LeadText.displayName = "LeadText";
BodyText.displayName = "BodyText";
SmallText.displayName = "SmallText";
TinyText.displayName = "TinyText";
GradientText.displayName = "GradientText";
MutedText.displayName = "MutedText";
HighlightText.displayName = "HighlightText";