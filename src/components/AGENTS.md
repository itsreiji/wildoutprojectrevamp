# src/components/ - UI Components

**Detailed guidance for component development**

## Package Identity

- **Purpose**: UI components for WildOut! platform
- **Primary Tech**: React 19, TypeScript 5.9, Shadcn UI, Tailwind CSS
- **Component Library**: Shadcn UI with Radix UI primitives

## Setup & Run

```bash
# No special setup needed - components are part of main app
# Test components individually
pnpm test -- src/components/**/*.test.*
```

## Patterns & Conventions

### File Organization Rules
- **UI Components**: `src/components/ui/` - Shadcn UI primitives
- **Custom Components**: `src/components/` - Custom application components
- **Auth Components**: `src/components/auth/` - Authentication components
- **Dashboard Components**: `src/components/dashboard/` - Admin dashboard components
- **Figma Components**: `src/components/figma/` - Design system components

### Naming Conventions
- **Component Files**: PascalCase (e.g., `Button.tsx`, `UserCard.tsx`)
- **Component Functions**: PascalCase (e.g., `export function Button()`)
- **Props Interfaces**: ComponentName + "Props" (e.g., `ButtonProps`)
- **Hooks**: `use` prefix + camelCase (e.g., `useButtonState`)

### Preferred Patterns

✅ **DO**: Use Shadcn UI components as foundation
```typescript
// Example: src/components/ui/button.tsx (Shadcn pattern)
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

✅ **DO**: Create custom components that extend Shadcn
```typescript
// Example: src/components/CustomButton.tsx
import { Button } from "./ui/button";

interface CustomButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
}

export function CustomButton({ children, onClick, icon }: CustomButtonProps) {
  return (
    <Button onClick={onClick} className="gap-2">
      {icon && <span>{icon}</span>}
      {children}
    </Button>
  );
}
```

✅ **DO**: Use TypeScript for all component props
```typescript
// Example: src/components/UserProfile.tsx
interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export function UserProfile({ user, onEdit, onDelete }: UserProfileProps) {
  // Component implementation
}
```

✅ **DO**: Use Lucide icons
```typescript
// Example: src/components/IconButton.tsx
import { Button } from "./ui/button";
import { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  tooltip?: string;
}

export function IconButton({ icon: Icon, onClick, tooltip }: IconButtonProps) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} title={tooltip}>
      <Icon className="h-4 w-4" />
    </Button>
  );
}
```

❌ **DON'T**: Create components that duplicate Shadcn functionality
```typescript
// Avoid: Creating custom button when Shadcn button exists
function MyCustomButton() { /* Don't reinvent the wheel */ }
```

❌ **DON'T**: Use inline styles or hardcoded colors
```typescript
// Avoid: Inline styles
<div style={{ color: "#3b82f6", padding: "16px" }}>Content</div>

// Instead use Tailwind classes
<div className="text-blue-500 p-4">Content</div>
```

## Touch Points / Key Files

- **Shadcn Button**: `src/components/ui/button.tsx` - Primary button component
- **Shadcn Card**: `src/components/ui/card.tsx` - Card component pattern
- **Shadcn Form**: `src/components/ui/form.tsx` - Form handling
- **Custom Components**: `src/components/*.tsx` - Application-specific components
- **Auth Components**: `src/components/auth/*.tsx` - Login/Register pages
- **Dashboard Components**: `src/components/dashboard/*.tsx` - Admin UI

## JIT Index Hints

```bash
# Find Shadcn UI components
ls -la src/components/ui/

# Find custom components
ls -la src/components/ | grep -v ui

# Find component usage
rg -n "import.*from.*components" src/

# Find specific component
rg -n "export function ComponentName" src/components

# Find component tests
find src/components/ -name "*.test.*"

# Find icon usage
rg -n "lucide-react" src/components/
```

## Common Gotchas

- **Shadcn Components**: Always extend existing Shadcn components rather than recreating
- **Tailwind Classes**: Use utility classes, never inline styles
- **Icon Sizing**: Use consistent icon sizes (h-4 w-4 for buttons, h-6 w-6 for standalone)
- **Component Props**: Always define TypeScript interfaces for props
- **Accessibility**: Ensure proper ARIA attributes and keyboard navigation

## Design System Reference

- **Shadcn UI**: Primary component library
- **Radix UI**: Underlying primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Icon library
- **Color System**: Tailwind semantic colors (primary, secondary, destructive, etc.)
- **Spacing**: 8-point grid system (use Tailwind spacing: p-4, m-2, gap-8, etc.)

## Pre-PR Checks

```bash
# Run component tests
pnpm test -- src/components/**/*.test.*

# Check TypeScript types
pnpm type-check

# Verify no inline styles
rg -n "style={{|style=\"" src/components/ && echo "Found inline styles!" || echo "No inline styles found"
```