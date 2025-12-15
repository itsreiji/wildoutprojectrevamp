# WildOut! Project - src/ AGENTS.md

**Package Identity**
- This package contains the main React application code
- Primary tech/framework: React 19, TypeScript 5.9, Vite 7.2, Tailwind CSS 4.1

## Setup & Run

```bash
# Development server (from root)
pnpm dev

# Build (from root)
pnpm build

# Typecheck
pnpm type-check

# Test
pnpm test
```

## Patterns & Conventions

### File Organization Rules
- **Components**: `src/components/**` - React components organized by feature
- **Contexts**: `src/contexts/**` - React context providers for state management
- **Services**: `src/services/**` - API and business logic services
- **Utils**: `src/utils/**` - Utility functions and helpers
- **Types**: `src/types/**` - TypeScript type definitions
- **Pages**: `src/pages/**` - Main page components
- **Dashboard**: `src/components/dashboard/**` - Admin dashboard components
- **Auth**: `src/components/auth/**` - Authentication components

### Naming Conventions
- ✅ **Components**: PascalCase (e.g., `DashboardEvents.tsx`)
- ✅ **Functions**: camelCase (e.g., `useEventsContext()`)
- ✅ **Types**: PascalCase (e.g., `EventType`)
- ✅ **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_SETTINGS`)
- ✅ **Files**: kebab-case for components, camelCase for utilities

### Preferred Patterns

**Components:**
- ✅ DO: Use functional components with hooks like `src/components/dashboard/DashboardEvents.tsx`
- ✅ DO: Use Shadcn UI components as base, extend when needed
- ✅ DO: Use TypeScript interfaces for props
- ❌ DON'T: Use class components

**Contexts:**
- ✅ DO: Follow pattern from `src/contexts/EventsContext.tsx`
- ✅ DO: Use React.createContext with proper typing
- ✅ DO: Provide custom hooks for context consumption

**Services:**
- ✅ DO: Use Supabase client wrapper pattern from `src/services/auditService.ts`
- ✅ DO: Handle errors with try/catch blocks
- ✅ DO: Use async/await for database operations

**Forms:**
- ✅ DO: Use react-hook-form with zod validation
- ✅ DO: Follow pattern from `src/components/dashboard/DashboardEventForm.tsx`
- ✅ DO: Use Shadcn UI form components

## Touch Points / Key Files

- **Main App**: `src/App.tsx` - Entry point
- **Routing**: `src/components/router/index.tsx` - Custom router
- **Supabase Client**: `src/supabase/client.ts` - Database client
- **Auth Context**: `src/contexts/AuthContext.tsx` - Authentication state
- **Type Definitions**: `src/types/index.ts` - Main type exports
- **Utilities**: `src/utils/api.ts` - API utilities
- **UI Components**: `src/components/ui/**` - Shadcn UI components

## JIT Index Hints

```bash
# Find a React component
rg -n "export function [A-Z]" src/components

# Find a context
rg -n "createContext" src/contexts

# Find a service
rg -n "export.*function\|export.*const" src/services

# Find a utility function
rg -n "export.*function\|export.*const" src/utils

# Find type definitions
rg -n "export.*type\|export.*interface" src/types

# Find dashboard components
rg -n "export function [A-Z]" src/components/dashboard

# Find auth-related components
rg -n "export function [A-Z]" src/components/auth
```

## Common Gotchas

- **Absolute imports**: Always use `@/` prefix for imports from `src/` directory
- **Supabase types**: Use generated types from `src/supabase/types.ts`
- **Authentication**: Use `AuthContext` for user authentication state
- **Error handling**: Always wrap Supabase calls in try/catch blocks
- **Environment variables**: Use `.env` file with proper prefixing

## Pre-PR Checks

```bash
# From root directory
pnpm type-check && pnpm test && pnpm build
```

## Component Structure

### Recommended Component Pattern

```tsx
// src/components/ExampleComponent.tsx
import React from 'react'
import { Button } from '@/components/ui/button'

interface ExampleComponentProps {
  title: string
  onClick: () => void
}

export function ExampleComponent({ title, onClick }: ExampleComponentProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Button onClick={onClick}>Click me</Button>
    </div>
  )
}
```

### Dashboard Components

Dashboard components follow a specific pattern:
- Use `src/components/dashboard/DashboardLayout.tsx` as base layout
- Extend Shadcn UI components for consistent styling
- Use context providers for state management
- Follow CRUD patterns from existing dashboard components

### Form Components

- Use `react-hook-form` with `zod` validation
- Follow pattern from `src/components/dashboard/DashboardEventForm.tsx`
- Use Shadcn UI form components (`Input`, `Select`, `Checkbox`, etc.)
- Provide proper error handling and user feedback