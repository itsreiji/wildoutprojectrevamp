import { cva } from "class-variance-authority"

export const badgeVariants = cva(
  // Base styles - consistent sizing, spacing, and typography
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase select-none",
  {
    variants: {
      variant: {
        // Primary/Default - Used for main actions and highlights
        default: "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",

        // Secondary - Used for secondary information
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",

        // Destructive - Used for warnings and destructive actions
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",

        // Outline - Used for neutral information
        outline: "text-foreground border-current hover:bg-foreground/5",

        // Status variants for consistent state indicators with WCAG AA contrast
        success: "border-[#10b981]/30 bg-[#10b981]/5 text-[#10b981] hover:bg-[#10b981]/10 shadow-[0_0_10px_rgba(16,185,129,0.05)] transition-all hover:scale-105 active:scale-95",
        warning: "border-[#f59e0b]/30 bg-[#f59e0b]/5 text-[#f59e0b] hover:bg-[#f59e0b]/10 shadow-[0_0_10px_rgba(245,158,11,0.05)]",
        error: "border-[#ef4444]/30 bg-[#ef4444]/5 text-[#ef4444] hover:bg-[#ef4444]/10 shadow-[0_0_10px_rgba(239,68,68,0.05)]",
        info: "border-[#3b82f6]/30 bg-[#3b82f6]/5 text-[#3b82f6] hover:bg-[#3b82f6]/10 shadow-[0_0_10px_rgba(59,130,246,0.05)]",
        brand: "border-[#E93370]/30 bg-[#E93370]/5 text-[#E93370] hover:bg-[#E93370]/10 shadow-[0_0_15px_rgba(233,51,112,0.1)] transition-all hover:scale-105 active:scale-95",

        // Completed variant - More positive than secondary but distinct from success
         completed: "border-indigo-500/30 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 shadow-[0_0_10px_rgba(99,102,241,0.05)] transition-all hover:scale-105 active:scale-95",

        // Category badges - Used for categorization
        category: "border-white/10 bg-white/5 text-white/90 backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95",
        
        // Count badge - Used for displaying counts/numbers
        count: "bg-pink-500 text-white border-pink-600 hover:bg-pink-600 hover:border-pink-700 shadow-lg shadow-pink-500/20",
      },
      size: {
        xs: "text-[12px] px-2 py-0.5 min-w-[1.25rem] h-6 justify-center",
        sm: "text-xs px-2.5 py-1",
        md: "text-sm px-3 py-1.5",
        lg: "text-base px-4 py-2",
      },
      rounded: {
        sm: "rounded-md",
        md: "rounded-lg",
        lg: "rounded-xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      rounded: "full",
    },
  }
)
