# Create New Component

Create a new React component following WildOut! project conventions.

## Usage

```bash
claude /create-component ComponentName [--type=ui|domain|page]
```

## Steps

1. **Determine Component Type**:

   - `ui`: Shadcn UI primitive (goes in `src/components/ui/`)
   - `domain`: Domain-specific component (goes in `src/components/`)
   - `page`: Page component (goes in `src/pages/`)
   - Default: `domain`

2. **Create Component File**:

   - Use proper TypeScript interface for props
   - Follow Shadcn UI patterns for UI components
   - Include JSDoc comments
   - Add proper exports

3. **Create Test File**:

   - Vitest + Testing Library setup
   - Basic rendering test
   - Prop validation tests
   - Interaction tests if applicable

4. **Create Story File** (optional):

   - Storybook story for visual testing
   - Multiple variants if applicable

5. **Update Index Files**:
   - Add to appropriate index.ts file
   - Export component and types

## Component Structure

### UI Component Example

```tsx
// src/components/ui/ComponentName.tsx
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const componentNameVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
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

interface ComponentNameProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof componentNameVariants> {
  /** Additional props */
  icon?: React.ReactNode;
}

const ComponentName = React.forwardRef<HTMLButtonElement, ComponentNameProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <button
        className={cn(componentNameVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

ComponentName.displayName = "ComponentName";

export { ComponentName, componentNameVariants };
export type { ComponentNameProps };
```

### Domain Component Example

```tsx
// src/components/ComponentName.tsx
import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ComponentNameProps {
  /** Component title */
  title: string;
  /** Component description */
  description?: string;
  /** Action handler */
  onAction?: () => void;
  /** Action button text */
  actionText?: string;
}

export function ComponentName({
  title,
  description,
  onAction,
  actionText = "Action",
}: ComponentNameProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="flex justify-end">
        <Button onClick={onAction}>{actionText}</Button>
      </CardContent>
    </Card>
  );
}
```

## Test Structure

```tsx
// src/components/ComponentName.test.tsx
import { render, screen } from "@testing-library/react";
import { ComponentName } from "./ComponentName";
import userEvent from "@testing-library/user-event";

describe("ComponentName", () => {
  it("renders component with title", () => {
    render(<ComponentName title="Test Title" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<ComponentName title="Test" description="Test Description" />);
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("calls onAction when button is clicked", async () => {
    const handleAction = vi.fn();
    render(<ComponentName title="Test" onAction={handleAction} />);

    await userEvent.click(screen.getByRole("button"));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("uses default action text when not provided", () => {
    render(<ComponentName title="Test" />);
    expect(screen.getByText("Action")).toBeInTheDocument();
  });
});
```

## Validation

1. **TypeScript**: Run `pnpm type-check`
2. **Linting**: Run `pnpm lint`
3. **Tests**: Run `pnpm test src/components/ComponentName.test.tsx`
4. **Formatting**: Run `pnpm format`

## Integration

1. **Import**: `import { ComponentName } from '@/components/ComponentName'`
2. **Use**: Follow component props interface
3. **Document**: Add to appropriate CLAUDE.md file
