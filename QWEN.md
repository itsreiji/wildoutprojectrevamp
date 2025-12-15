# WildOut! Project - QWEN.md

> **AI Context**: This file provides specific guidance for the Qwen AI model when working with the WildOut! project. It extends the general project documentation with Qwen-specific instructions.

## 1. Project Identity

### Overview

- **Type**: Single React 19 Application with Vite 7.2
- **Stack**: TypeScript 5.9, Tailwind CSS 4.1, Supabase, TanStack Query, Shadcn UI
- **Architecture**: React frontend with Supabase backend (PostgreSQL, Auth, Storage)
- **Team Size**: Multi-developer with Admin/Editor/Member roles

This QWEN.md provides **Qwen-specific guidance** for working with the WildOut! codebase, complementing the general project documentation.

## 2. Qwen-Specific Rules

### Code Generation (MUST)

- **MUST** use TypeScript with strict mode enabled
- **MUST** follow the existing code patterns and conventions
- **MUST** use `@/` alias for imports (e.g., `import { Button } from '@/components/ui/button'`)
- **MUST** use TanStack Query for data fetching and state management
- **MUST** use Shadcn UI components for consistent styling

### Best Practices (SHOULD)

- **SHOULD** prefer functional components with hooks over class components
- **SHOULD** use descriptive variable names (no single letters except in loops)
- **SHOULD** keep functions under 50 lines of code
- **SHOULD** extract complex logic into separate utility functions
- **SHOULD** use Tailwind CSS utility classes for styling

### Anti-Patterns (MUST NOT)

- **MUST NOT** use `any` type without explicit justification in comments
- **MUST NOT** bypass TypeScript errors with `@ts-ignore`
- **MUST NOT** push directly to `main` branch (use feature branches)
- **MUST NOT** hardcode API URLs or database credentials
- **MUST NOT** use direct DOM manipulation (use React state instead)

## 3. Core Commands

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm type-check
```

### Supabase

```bash
# Generate TypeScript types from Supabase
pnpm supabase gen types typescript --project-id $VITE_SUPABASE_PROJECT_ID > src/supabase/types.ts

# Apply database migrations
pnpm supabase migration up
```

## 4. Architecture Patterns

### Supabase Integration

- **Client**: Use the singleton client from `src/supabase/client.ts`
- **Types**: Use generated types from `src/supabase/types.ts`
- **RLS**: Always consider Row Level Security policies when writing queries
- **Error Handling**: Wrap Supabase calls in try/catch blocks

### State Management

- **Global State**: Use React Context API (AuthContext, ContentContext, etc.)
- **Server State**: Use TanStack Query for data fetching and caching
- **Local State**: Use React hooks (useState, useReducer)

### UI Components

- **Component Library**: Shadcn UI with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **Icons**: Lucide React icons

## 5. Development Workflow

### Information Gathering

1. **Analyze**: Understand the user's request and current project state
2. **Explore**: Use codebase search tools to find relevant files
3. **Verify**: Read relevant files to confirm assumptions

### Code Implementation

1. **Plan**: Create a step-by-step implementation plan
2. **Generate**: Write code following established patterns
3. **Test**: Verify changes work as expected
4. **Document**: Update relevant documentation

### Quality Assurance

1. **Type Checking**: Run `pnpm type-check`
2. **Testing**: Run `pnpm test`
3. **Linting**: Run `pnpm lint`
4. **Build**: Run `pnpm build`

## 6. Key Files Reference

### Main Application

- **Entry Point**: `src/main.tsx`
- **App Component**: `src/App.tsx`
- **Supabase Client**: `src/supabase/client.ts`
- **TypeScript Config**: `tsconfig.json`
- **Vite Config**: `vite.config.ts`

### Contexts

- **Auth Context**: `src/contexts/AuthContext.tsx`
- **Content Context**: `src/contexts/ContentContext.tsx`
- **Events Context**: `src/contexts/EventsContext.tsx`

### Services

- **Audit Service**: `src/services/auditService.ts`

### Components

- **Landing Page**: `src/components/LandingPage.tsx`
- **Dashboard**: `src/components/Dashboard.tsx`
- **Navigation**: `src/components/Navigation.tsx`

## 7. Common Gotchas

### Supabase

- **RLS Policies**: Always implement Row-Level Security policies for new tables
- **Environment Variables**: Use proper `.env` files, never commit secrets
- **Type Safety**: Avoid `any` type unless absolutely necessary and documented

### Component Imports

- **Import Paths**: Use `@/` prefix for absolute imports from `src/`
- **Component Structure**: Follow existing component patterns

### Testing

- **Test Framework**: Vitest with React Testing Library patterns
- **Test Files**: Use `.test.tsx` extension
- **Test Coverage**: Aim for >80% coverage

## 8. Pre-PR Check Command

```bash
# Run this before creating any PR
pnpm type-check && pnpm test && pnpm build
```

## 9. Qwen-Specific Tips

### Code Generation

- **Context Awareness**: Always read the surrounding code context before making changes
- **Pattern Matching**: Follow existing code patterns and conventions
- **Error Handling**: Implement proper error handling for all operations

### Documentation

- **Comments**: Write clear, concise comments for complex logic
- **Documentation**: Update relevant documentation when making changes
- **Examples**: Provide code examples when documenting new features

### Collaboration

- **Communication**: Be clear and concise in your responses
- **Explanation**: Provide explanations for your code changes
- **Verification**: Always verify your changes work as expected
