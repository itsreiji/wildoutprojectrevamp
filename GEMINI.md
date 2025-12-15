# WildOut! Project - GEMINI.md

> **AI Context**: This file provides specific guidance for the Gemini AI model when working with the WildOut! project. It extends the general project documentation with Gemini-specific instructions.

## 1. Project Identity

### Overview

- **Type**: Single React 19 Application with Vite 7.2
- **Stack**: TypeScript 5.9, Tailwind CSS 4.1, Supabase, TanStack Query, Shadcn UI
- **Architecture**: React frontend with Supabase backend (PostgreSQL, Auth, Storage)
- **Team Size**: Multi-developer with Admin/Editor/Member roles

This GEMINI.md provides **Gemini-specific guidance** for working with the WildOut! codebase, complementing the general project documentation in AGENTS.md and CLAUDE.md.

## 2. Gemini-Specific Rules

### Code Generation (MUST)

- **MUST** use TypeScript with strict mode enabled (`"strict": true` in tsconfig)
- **MUST** follow the existing code patterns and conventions established in the codebase
- **MUST** use `@/` alias for imports (e.g., `import { Button } from '@/components/ui/button'`)
- **MUST** use TanStack Query for data fetching and state management
- **MUST** use Shadcn UI components for consistent styling
- **MUST** reference the Supabase types from `src/supabase/types.ts` for database operations

### Best Practices (SHOULD)

- **SHOULD** prefer functional components with hooks over class components
- **SHOULD** use descriptive variable names (no single letters except in loops)
- **SHOULD** keep functions under 50 lines of code
- **SHOULD** extract complex logic into separate utility functions
- **SHOULD** use Tailwind CSS utility classes for styling
- **SHOULD** follow the existing Context API patterns for state management
- **SHOULD** use the singleton Supabase client from `src/supabase/client.ts`

### Anti-Patterns (MUST NOT)

- **MUST NOT** use `any` type without explicit justification in comments
- **MUST NOT** bypass TypeScript errors with `@ts-ignore`
- **MUST NOT** push directly to `main` branch (use feature branches)
- **MUST NOT** hardcode API URLs or database credentials
- **MUST NOT** use direct DOM manipulation (use React state instead)
- **MUST NOT** commit generated files (build/, dist/, .vite/)
- **MUST NOT** commit secrets or sensitive data

## 3. Core Commands

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm type-check

# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## 4. Architecture Patterns

### Technology Stack

- **Frontend**: React 19.2.0 with TypeScript 5.9
- **Build Tool**: Vite 7.2
- **UI Framework**: Shadcn/ui components with RadixUI primitives
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React Context (ContentContext, AuthContext, etc.)
- **Backend**: Supabase integration (PostgreSQL, Auth, Storage)

### Application Structure

The application follows a modular structure:

```
src/
├── components/          # Main application components
├── contexts/           # React context providers
├── pages/              # Page components
├── services/           # Business logic and services
├── supabase/           # Supabase client and types
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main application component
```

### Key Components

#### File Organization

- `src/components/` - Main application components

  - `LandingPage.tsx` - Main public landing page
  - `Dashboard.tsx` - Admin dashboard shell
  - `AllEventsPage.tsx` - Events listing page
  - `EventDetailModal.tsx` - Event details modal
  - `TeamMemberModal.tsx` - Team member details modal

- `src/contexts/` - React context providers

  - `AuthContext.tsx` - Authentication context
  - `ContentContext.tsx` - Content management context
  - `EventsContext.tsx` - Events data context
  - `PartnersContext.tsx` - Partners data context
  - `TeamContext.tsx` - Team data context

- `src/services/` - Business logic and services

  - `auditService.ts` - Audit logging service

- `src/supabase/` - Supabase integration
  - `client.ts` - Supabase client initialization
  - `types.ts` - Generated Supabase types
  - `functions/` - Supabase edge functions

## 5. Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (if configured)
- **Linting**: ESLint (if configured)
- **Imports**: Use `@/` prefix for `src/` directory (e.g., `@/components/Button`)

### Commit Format

- Use conventional commits format
- Prefix with type: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- Keep commits atomic and focused

### Branch Strategy

- **Main Branch**: `main` (production-ready)
- **Development Branch**: `dev` (integration branch)
- **Feature Branches**: `feat/feature-name` or `fix/issue-name`

## 6. Supabase Integration

### Client Usage

Always import the singleton client from `src/supabase/client.ts`:

```typescript
import { supabase } from "@/supabase/client";

// Example usage
const { data, error } = await supabase
  .from("events")
  .select("*")
  .eq("is_active", true);
```

### Type Safety

Use the generated types from `src/supabase/types.ts`:

```typescript
import type { Database } from "@/supabase/types";

type Event = Database["public"]["Tables"]["events"]["Row"];
type NewEvent = Database["public"]["Tables"]["events"]["Insert"];
```

### Error Handling

Wrap Supabase calls in try/catch blocks and handle errors appropriately:

```typescript
try {
  const { data, error } = await supabase.from("events").insert(newEvent);

  if (error) throw error;

  return data;
} catch (error) {
  console.error("Error creating event:", error);
  // Handle error appropriately
  throw error;
}
```

## 7. Testing

### Test Structure

- Unit tests: `*.test.tsx` files colocated with source
- Integration tests: `test/` directory
- Test setup: `test/setup.ts`

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

### Test Examples

```typescript
// Example test file structure
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EventDetailModal } from "@/components/EventDetailModal";

describe("EventDetailModal", () => {
  it("should render event details", () => {
    const event = {
      id: "1",
      name: "Test Event",
      description: "Test Description",
    };

    render(<EventDetailModal event={event} onClose={() => {}} />);

    expect(screen.getByText("Test Event")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });
});
```

## 8. Security & Secrets

### Environment Variables

- **Never commit**: API keys, tokens, or secrets
- **Environment Variables**: Use `.env` files with `.env.example` template
- **Supabase Secrets**: Store in environment variables, never hardcode
- **PII Handling**: Follow GDPR and data protection best practices

### Example .env file

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 9. Common Gotchas

### Supabase RLS

- Always implement Row-Level Security policies for new tables
- Test RLS policies thoroughly before deploying to production

### Type Safety

- Avoid `any` type unless absolutely necessary and documented
- Use proper TypeScript interfaces and types

### Component Imports

- Use `@/` prefix for absolute imports from `src/`
- Follow the established import patterns

### Testing

- Use Vitest with React Testing Library patterns
- Aim for high test coverage (>80%)
- Mock external APIs using test utilities

## 10. Pre-PR Check Command

```bash
# Run this before creating any PR
pnpm type-check && pnpm test && pnpm build
```

## 11. Quick Find Commands

```bash
# Search for a React component
rg -n "export.*function.*Component" src/components

# Find a specific function
rg -n "functionName" src/

# Find API calls or Supabase queries
rg -n "supabase\.(from|select|insert|update|delete)" src/

# Find context usage
rg -n "useContext" src/

# Find page components
rg -n "export.*function.*Page" src/pages

# Find service classes
rg -n "export.*class.*Service" src/services

# Find test files
find . -name "*.test.*" -not -path "./node_modules/*"

# Find TypeScript types
rg -n "type|interface" src/types/

# Find Supabase edge functions
find src/supabase/functions/ -name "*.ts"
```

## 12. Definition of Done

Before creating a PR, ensure:

- ✅ All tests pass (`pnpm test`)
- ✅ Type checking passes (`pnpm type-check`)
- ✅ Build completes successfully (`pnpm build`)
- ✅ Code follows project conventions
- ✅ Documentation updated (if applicable)
- ✅ No secrets or sensitive data committed
