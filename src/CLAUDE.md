# WildOut! Core Application - CLAUDE.md

> **Parent Context**: This extends [../CLAUDE.md](../CLAUDE.md)

## 1. Core Application Identity

### Overview

- **Technology**: React 19, TypeScript 5.9, Vite 7.2
- **Entry Point**: `main.tsx` → `App.tsx`
- **State Management**: TanStack Query + React Context
- **Styling**: Tailwind CSS 4.1 + Shadcn UI components

## 2. Setup & Commands

### Development Commands

```bash
# From project root
pnpm dev          # Start Vite dev server
pnpm build        # Build for production
pnpm type-check   # TypeScript validation
pnpm test         # Run all tests
```

### From src/ directory

```bash
# Run specific test
pnpm test src/test/AuthContext.test.tsx

# Watch mode
pnpm test:watch
```

### Pre-PR Checklist

```bash
# Complete validation
pnpm type-check && pnpm lint && pnpm test
```

## 3. Architecture & Patterns

### Directory Structure

```
src/
├── App.tsx                  # Root application component
├── main.tsx                 # Entry point with providers
├── components/              # UI components
│   ├── ui/                  # Shadcn UI components
│   ├── dashboard/           # Dashboard components
│   ├── auth/                # Authentication components
│   └── ...                  # Other component groups
├── contexts/                # State management contexts
│   ├── AuthContext.tsx      # Authentication state
│   ├── EventsContext.tsx    # Events management
│   └── ...                  # Other contexts
├── services/                # Business logic services
│   ├── auditService.ts      # Audit logging
│   └── ...                  # Other services
├── supabase/                # Database and auth
│   ├── client.ts            # Supabase client
│   ├── types.ts             # Database types
│   └── functions/           # Edge functions
├── utils/                   # Utility functions
│   ├── api.ts               # API utilities
│   ├── validation.ts        # Form validation
│   └── ...                  # Other utilities
├── types/                   # TypeScript types
│   ├── events.ts            # Event types
│   ├── team.ts              # Team member types
│   └── ...                  # Other types
└── test/                    # Test files
```

### Code Organization Patterns

#### Components

✅ **DO**: Functional components with TypeScript interfaces
```tsx
// ✅ Correct pattern
interface ButtonProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = "primary", children, onClick }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

❌ **DON'T**: Class components or untyped props
```tsx
// ❌ Avoid this pattern
class OldButton extends React.Component {
  render() {
    return <button>{this.props.children}</button>; // No type safety
  }
}
```

#### State Management

✅ **DO**: Use TanStack Query for server state
```tsx
// ✅ Correct pattern
const { data: events, isLoading, error } = useQuery({
  queryKey: ['events'],
  queryFn: fetchEvents,
});
```

✅ **DO**: Use React Context for client state
```tsx
// ✅ Correct pattern
const { user, login, logout } = useAuth();
```

❌ **DON'T**: Mix concerns or use global variables
```tsx
// ❌ Avoid this pattern
let globalUser = null; // Global state anti-pattern
```

#### Data Fetching

✅ **DO**: Use TanStack Query with proper error handling
```tsx
// ✅ Correct pattern
const { data, error, isLoading } = useQuery({
  queryKey: ['events', eventId],
  queryFn: () => fetchEvent(eventId),
  retry: 1,
});

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorDisplay error={error} />;
```

❌ **DON'T**: Direct API calls in components
```tsx
// ❌ Avoid this pattern
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/events')
    .then(res => res.json())
    .then(setData);
}, []); // No error handling, caching, or retries
```

#### Styling

✅ **DO**: Use Tailwind utility classes
```tsx
// ✅ Correct pattern
<button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded">
  Click me
</button>
```

✅ **DO**: Use Shadcn UI components when available
```tsx
// ✅ Correct pattern
import { Button } from '@/components/ui/button';

<Button variant="default">Submit</Button>
```

❌ **DON'T**: Hardcode colors or use inline styles
```tsx
// ❌ Avoid this pattern
<button style={{ backgroundColor: '#3b82f6', color: 'white' }}>
  Click me
</button>
```

#### Forms

✅ **DO**: Use React Hook Form + Zod validation
```tsx
// ✅ Correct pattern
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      <button type="submit">Login</button>
    </form>
  );
}
```

## 4. Key Files & Touch Points

### Core Files (understand these first)

- `main.tsx` - Application entry point with QueryClient setup
- `App.tsx` - Root component with router and providers
- `components/ui/` - Shadcn UI component library
- `contexts/AuthContext.tsx` - Authentication state management
- `supabase/client.ts` - Supabase client configuration
- `utils/api.ts` - API utility functions

### Common Patterns

- **API Calls**: See `src/services/auditService.ts` for pattern
- **Forms**: Copy `src/components/auth/LoginPage.tsx`
- **Dashboard**: Copy `src/components/dashboard/DashboardHome.tsx`
- **Modals**: Copy `src/components/EventDetailModal.tsx`

## 5. JIT Search Hints

### Find Components

```bash
# Find component definition
grep -rn "export.*function.*Component\|export.*const.*Component" src/components/

# Find component usage
grep -rn "<[A-Z].*" src/ | grep -i componentname

# Find props interface
grep -rn "interface.*Props" src/components/
```

### Find Hooks

```bash
# Custom hooks
grep -rn "export const use[A-Z]" src/

# Hook usage
grep -rn "use[A-Z].*=" src/
```

### Find Services

```bash
# Service functions
grep -rn "export.*function.*Service\|export.*const.*Service" src/services/

# Service usage
grep -rn "import.*from.*services" src/
```

### Find Context Usage

```bash
# Context providers
grep -rn "<.*Context\.Provider" src/

# Context hooks
grep -rn "use.*Context()" src/
```

## 6. Common Gotchas

### Environment Variables

- **Client-side**: Must use `VITE_` prefix (e.g., `VITE_SUPABASE_URL`)
- **Server-side**: Can use any prefix but keep secrets in `.env`
- **Validation**: Always check `import.meta.env.VITE_VARIABLE` exists before use

### Absolute Imports

- **Always** use `@/` prefix for imports from `src/`
- **Example**: `import { Button } from '@/components/ui/button'`

### Supabase Client

- **Initialization**: Use `src/supabase/client.ts` for client setup
- **RLS**: Always respect Row Level Security policies
- **Error Handling**: Supabase errors need proper handling

### React 19 Features

- **New Hooks**: Use `use`, `useOptimistic`, etc. when appropriate
- **Server Components**: Not used in this Vite project (Next.js feature)
- **Actions**: Use TanStack Query mutations for data changes

### TypeScript Strict Mode

- **No Implicit Any**: Always provide explicit types
- **Strict Null Checks**: Handle `null` and `undefined` cases
- **Readonly**: Use `readonly` for immutable props

## 7. Package-Specific Testing

### Unit Tests

- **Location**: Colocated with source (`Component.test.tsx`)
- **Framework**: Vitest + @testing-library/react
- **Pattern**: Test user behavior, not implementation
- **Example**: See `src/test/AuthContext.test.tsx`

### Integration Tests

- **Location**: `src/test/` directory
- **Test**: API integration, context providers
- **Example**: See `src/test/LoginPage.integration.test.tsx`

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test src/test/AuthContext.test.tsx

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

## 8. Pre-PR Validation

Run this command before creating a PR:

```bash
# Complete validation
pnpm type-check && pnpm lint && pnpm test
```

All checks must pass + manual testing complete.

## 9. Performance Optimization

### Bundle Size

- **Chunking**: Vite automatically handles code splitting
- **Lazy Loading**: Use `React.lazy()` for large components
- **Dependencies**: Monitor bundle size with `pnpm build`

### Rendering Performance

- **Memoization**: Use `React.memo()` for pure components
- **Virtualization**: Use for large lists (e.g., `react-window`)
- **Debouncing**: Use for rapid user input (e.g., search)

### Data Fetching

- **Caching**: TanStack Query provides automatic caching
- **Stale Data**: Configure appropriate `staleTime`
- **Optimistic Updates**: Use for better UX

## 10. Internationalization (Future)

### Planned Implementation

- **Library**: i18next or similar
- **Structure**: `src/locales/` directory
- **Format**: JSON files per language

### Current State

- **Hardcoded**: English strings currently
- **Preparation**: Use descriptive keys for future i18n

## 11. Accessibility

### Standards

- **WCAG 2.1 AA**: Target compliance level
- **Keyboard Navigation**: All interactive elements
- **ARIA**: Proper labels and roles
- **Color Contrast**: Minimum 4.5:1 for text

### Testing

```bash
# Run accessibility tests (future)
# pnpm test:a11y
```

## 12. Error Handling

### Best Practices

✅ **DO**: Use error boundaries for components
✅ **DO**: Show user-friendly error messages
✅ **DO**: Log errors to console (development only)
✅ **DO**: Use TanStack Query error handling

❌ **DON'T**: Show raw error objects to users
❌ **DON'T**: Swallow errors silently
❌ **DON'T**: Use generic "An error occurred"

### Error Boundary Example

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function MyComponent() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <RiskyComponent />
    </ErrorBoundary>
  );
}
```