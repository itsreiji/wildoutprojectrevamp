# WildOut! Components - CLAUDE.md

> **Parent Context**: This extends [../CLAUDE.md](../CLAUDE.md)

## 1. Components Identity

### Overview

- **Technology**: React 19, TypeScript 5.9, Shadcn UI, Radix UI
- **Structure**: Component library with UI primitives and domain components
- **Styling**: Tailwind CSS 4.1 with utility-first approach

## 2. Directory Structure

```
src/components/
├── ui/                      # Shadcn UI primitives
│   ├── button.tsx           # Button component
│   ├── card.tsx             # Card component
│   ├── input.tsx            # Input component
│   └── ...                  # Other UI primitives
├── auth/                    # Authentication components
│   ├── LoginPage.tsx        # Login page
│   └── RegisterPage.tsx     # Registration page
├── dashboard/               # Dashboard components
│   ├── DashboardHome.tsx    # Dashboard home
│   ├── DashboardEvents.tsx  # Events management
│   └── ...                  # Other dashboard components
├── EventDetailModal.tsx     # Event detail modal
├── TeamMemberModal.tsx      # Team member modal
├── Navigation.tsx           # Main navigation
├── Footer.tsx               # Footer component
├── HeroSection.tsx          # Hero section
├── EventsSection.tsx        # Events section
├── AboutSection.tsx         # About section
├── PartnersSection.tsx      # Partners section
├── TeamSection.tsx          # Team section
├── GallerySection.tsx       # Gallery section
└── LandingPage.tsx          # Main landing page
```

## 3. Component Categories

### UI Primitives (`ui/`)

- **Purpose**: Reusable, unstyled building blocks
- **Source**: Shadcn UI components
- **Pattern**: Follow Radix UI conventions
- **Example**: `Button`, `Card`, `Input`, `DropdownMenu`

### Domain Components

- **Purpose**: Application-specific components
- **Pattern**: Compose UI primitives with business logic
- **Example**: `EventDetailModal`, `TeamMemberModal`, `DashboardEvents`

### Page Components

- **Purpose**: Complete page layouts
- **Pattern**: Compose domain components into pages
- **Example**: `LandingPage`, `LoginPage`, `DashboardHome`

## 4. Component Development Patterns

### Component Structure

✅ **DO**: Use this structure for new components

```tsx
// 1. Imports
import React from 'react';
import { cn } from '@/lib/utils';

// 2. Props Interface
interface ComponentProps {
  /** Description of prop */
  propName: string;
  /** Optional prop with default */
  variant?: 'primary' | 'secondary';
  /** Event handlers */
  onClick?: () => void;
  /** Children */
  children?: React.ReactNode;
}

// 3. Component Definition
export function Component({
  propName,
  variant = 'primary',
  onClick,
  children,
}: ComponentProps) {
  // 4. Component Logic
  const handleClick = () => {
    onClick?.();
  };

  // 5. Render
  return (
    <div
      className={cn(
        'component-base',
        variant === 'primary' && 'component-primary',
        variant === 'secondary' && 'component-secondary'
      )}
      onClick={handleClick}
    >
      {children || propName}
    </div>
  );
}

// 6. Default Export (optional)
export default Component;
```

### Props Validation

✅ **DO**: Use TypeScript interfaces for prop validation

```tsx
// ✅ Correct: TypeScript interface
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// ❌ Avoid: PropTypes (legacy)
Button.propTypes = {
  variant: PropTypes.string, // No type safety
};
```

### Styling Approach

✅ **DO**: Use Tailwind CSS utility classes

```tsx
// ✅ Correct: Tailwind utility classes
<button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors">
  Click me
</button>
```

✅ **DO**: Use `cn()` utility for conditional classes

```tsx
// ✅ Correct: Conditional classes with cn()
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
)}>
  Content
</div>
```

❌ **DON'T**: Use inline styles or hardcoded colors

```tsx
// ❌ Avoid: Inline styles
<button style={{ backgroundColor: '#3b82f6', padding: '0.5rem 1rem' }}>
  Click me
</button>

// ❌ Avoid: Hardcoded colors
<button className="bg-[#3b82f6] text-white">
  Click me
</button>
```

### Component Composition

✅ **DO**: Compose smaller components

```tsx
// ✅ Correct: Composition
function CardWithButton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Content</p>
      </CardContent>
      <CardFooter>
        <Button variant="primary">Action</Button>
      </CardFooter>
    </Card>
  );
}
```

❌ **DON'T**: Create monolithic components

```tsx
// ❌ Avoid: Monolithic component
function MonolithicCard() {
  return (
    <div className="border rounded-lg p-4">
      <div className="font-bold text-lg mb-2">Title</div>
      <div className="mb-4">Content</div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Action
      </button>
    </div>
  );
}
```

## 5. Shadcn UI Components

### Available Primitives

- **Layout**: `Card`, `Separator`, `AspectRatio`
- **Forms**: `Button`, `Input`, `Checkbox`, `RadioGroup`, `Select`, `Switch`, `Textarea`
- **Navigation**: `DropdownMenu`, `NavigationMenu`, `Breadcrumb`, `Tabs`
- **Display**: `Avatar`, `Badge`, `Alert`, `Toast`, `Tooltip`, `Popover`, `Dialog`
- **Data Display**: `Table`, `Accordion`, `Collapsible`

### Adding New Shadcn Components

```bash
# Add a new Shadcn component
npx shadcn-ui@latest add component-name

# Example: Add a new dialog
npx shadcn-ui@latest add dialog
```

### Customizing Shadcn Components

✅ **DO**: Extend Shadcn components

```tsx
// ✅ Correct: Extend Shadcn Button
import { Button } from '@/components/ui/button';

function CustomButton({ children }: { children: React.ReactNode }) {
  return (
    <Button className="custom-additional-classes">
      {children}
    </Button>
  );
}
```

❌ **DON'T**: Modify Shadcn source files directly

```tsx
// ❌ Avoid: Direct modification
// Don't edit node_modules or shadcn source directly
```

## 6. Form Components

### Form Structure

✅ **DO**: Use React Hook Form + Zod validation

```tsx
// ✅ Correct: Complete form pattern
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// 1. Define validation schema
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

// 2. Infer type from schema
type FormValues = z.infer<typeof formSchema>;

// 3. Create form component
export function LoginForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    // Handle form submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
    </Form>
  );
}
```

### Form Validation

✅ **DO**: Use Zod for complex validation

```tsx
// ✅ Correct: Complex validation
const complexSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

## 7. Modal Components

### Modal Pattern

✅ **DO**: Use Radix UI Dialog for modals

```tsx
// ✅ Correct: Modal pattern
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function EventDetailModal({ event }: { event: EventType }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Details</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-medium">Date:</span>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-medium">Location:</span>
            <span>{event.location}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-medium">Description:</span>
            <span>{event.description}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Modal Best Practices

✅ **DO**: 
- Use for secondary actions and details
- Keep content focused and concise
- Ensure proper accessibility (focus trap, keyboard navigation)
- Handle mobile responsiveness

❌ **DON'T**:
- Use modals for primary content
- Create nested modals (modal inception)
- Overload with too much information
- Forget to handle escape key and outside clicks

## 8. Dashboard Components

### Dashboard Structure

✅ **DO**: Use consistent layout patterns

```tsx
// ✅ Correct: Dashboard page structure
export function DashboardHome() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline">Secondary Action</Button>
          <Button>Primary Action</Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">1,234</div>
            <p className="text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityList />
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Main Content</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={data} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

## 9. Responsive Design

### Breakpoints

Use Tailwind's responsive prefixes:

```tsx
// ✅ Correct: Responsive design
div className="
  grid grid-cols-1          // Mobile: 1 column
  md:grid-cols-2           // Medium: 2 columns
  lg:grid-cols-3           // Large: 3 columns
  xl:grid-cols-4           // XL: 4 columns
  gap-4
"
```

### Mobile-First Approach

✅ **DO**: Start with mobile and scale up

```tsx
// ✅ Correct: Mobile-first
<div className="
  text-base            // Mobile: base text
  md:text-lg           // Medium: larger text
  lg:text-xl           // Large: even larger text
  p-4                  // Mobile: padding 4
  lg:p-6               // Large: more padding
">
  Responsive content
</div>
```

## 10. Testing Components

### Component Test Structure

✅ **DO**: Test user behavior, not implementation

```tsx
// ✅ Correct: Component test
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Form Testing

✅ **DO**: Test form validation and submission

```tsx
// ✅ Correct: Form test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('shows validation errors for empty submission', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByText('Login'));
    
    expect(await screen.findByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.type(passwordInput, 'password123');
    fireEvent.click(screen.getByText('Login'));
    
    expect(await screen.findByText('Please enter a valid email address.')).toBeInTheDocument();
  });

  it('submits valid form data', async () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

## 11. Performance Optimization

### Memoization

✅ **DO**: Use `React.memo()` for pure components

```tsx
// ✅ Correct: Memoized component
const MemoizedComponent = React.memo(function Component({ data }) {
  // Only re-renders when data changes
  return <div>{data.value}</div>;
});
```

### Lazy Loading

✅ **DO**: Use dynamic imports for large components

```tsx
// ✅ Correct: Lazy loading
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </React.Suspense>
  );
}
```

### Virtualization

✅ **DO**: Use for large lists

```tsx
// ✅ Correct: Virtualized list
import { FixedSizeList as List } from 'react-window';

function VirtualizedList({ items }) {
  return (
    <List
      height={500}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {items[index]}
        </div>
      )}
    </List>
  );
}
```

## 12. Accessibility

### Keyboard Navigation

✅ **DO**: Ensure all interactive elements are keyboard accessible

```tsx
// ✅ Correct: Keyboard accessible button
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  tabIndex={0}
>
  Click me
</button>
```

### ARIA Attributes

✅ **DO**: Use appropriate ARIA attributes

```tsx
// ✅ Correct: ARIA attributes
<div role="alert" aria-live="assertive">
  Error: {errorMessage}
</div>

<button aria-label="Close modal" onClick={closeModal}>
  <XIcon />
</button>
```

### Focus Management

✅ **DO**: Manage focus for modals and navigation

```tsx
// ✅ Correct: Focus management
import { useEffect, useRef } from 'react';

export function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
      
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      className="modal-overlay"
    >
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
}
```

## 13. Common Component Patterns

### Loading States

✅ **DO**: Handle loading states gracefully

```tsx
// ✅ Correct: Loading states
function DataComponent({ isLoading, data, error }) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Render data */}
    </div>
  );
}
```

### Empty States

✅ **DO**: Provide helpful empty states

```tsx
// ✅ Correct: Empty state
function EmptyState({ onAction }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Icon name="inbox" className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No items found</h3>
      <p className="text-muted-foreground mb-4">
        There are no items to display. Try creating one!
      </p>
      <Button onClick={onAction}>
        <Icon name="plus" className="mr-2" />
        Create New Item
      </Button>
    </div>
  );
}
```

### Error Boundaries

✅ **DO**: Use error boundaries for component trees

```tsx
// ✅ Correct: Error boundary
import { ErrorBoundary } from 'react-error-boundary';

function ComponentWithErrorBoundary() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        // Log error to error tracking service
        console.error('Error:', error);
        console.error('Info:', info);
      }}
    >
      <RiskyComponent />
    </ErrorBoundary>
  );
}

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="p-4 bg-destructive-50 rounded-md">
      <h3 className="font-medium mb-2">Something went wrong</h3>
      <p className="text-destructive mb-4">
        {error.message}
      </p>
      <Button
        variant="outline"
        onClick={resetErrorBoundary}
      >
        Try again
      </Button>
    </div>
  );
}
```