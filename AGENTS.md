# WildOut! Project - AGENTS.md

**Lightweight root guidance for AI coding agents**

## Project Snapshot

- **Repository Type**: Simple single project (not monorepo)
- **Primary Tech Stack**: React 19, TypeScript 5.9, Vite 7.2, Supabase, Tailwind CSS
- **Package Manager**: pnpm 10.24
- **Sub-packages**: See JIT Index below for detailed AGENTS.md files

## Root Setup Commands

```bash
# Install dependencies
pnpm install

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

## Universal Conventions

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

### PR Requirements

- Must pass all tests (`pnpm test`)
- Must pass type checking (`pnpm type-check`)
- Must build successfully (`pnpm build`)
- Follow conventional commit messages
- Include relevant documentation updates

## Security & Secrets

- **Never commit**: API keys, tokens, or secrets
- **Environment Variables**: Use `.env` files with `.env.example` template
- **Supabase Secrets**: Store in environment variables, never hardcode
- **PII Handling**: Follow GDPR and data protection best practices

## JIT Index (what to open, not what to paste)

### Package Structure

- **Main Application**: `src/` → [see src/AGENTS.md](src/AGENTS.md)
- **Components**: `src/components/` → [see src/components/AGENTS.md](src/components/AGENTS.md)
- **Contexts**: `src/contexts/` → [see src/contexts/AGENTS.md](src/contexts/AGENTS.md)
- **Pages**: `src/pages/` → [see src/pages/AGENTS.md](src/pages/AGENTS.md)
- **Services**: `src/services/` → [see src/services/AGENTS.md](src/services/AGENTS.md)
- **Supabase Integration**: `src/supabase/` → [see src/supabase/AGENTS.md](src/supabase/AGENTS.md)
- **Supabase Functions**: `src/supabase/functions/` → [see src/supabase/functions/AGENTS.md](src/supabase/functions/AGENTS.md)
- **Utilities**: `src/utils/` → [see src/utils/AGENTS.md](src/utils/AGENTS.md)
- **Types**: `src/types/` → [see src/types/AGENTS.md](src/types/AGENTS.md)
- **Database**: `supabase/` → [see supabase/AGENTS.md](supabase/AGENTS.md)
- **Tests**: `test/` → [see test/AGENTS.md](test/AGENTS.md)
- **Scripts**: `scripts/` → [see scripts/AGENTS.md](scripts/AGENTS.md)

### Quick Find Commands

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

# Find script files
find scripts/ -name "*.ts"

# Find database migrations
ls -la supabase/migrations/
```

## Definition of Done

Before creating a PR, ensure:

- ✅ All tests pass (`pnpm test`)
- ✅ Type checking passes (`pnpm type-check`)
- ✅ Build completes successfully (`pnpm build`)
- ✅ Code follows project conventions
- ✅ Documentation updated (if applicable)
- ✅ No secrets or sensitive data committed

## Critical Files Reference

- **Main Entry**: `src/main.tsx`
- **App Component**: `src/App.tsx`
- **Supabase Client**: `src/supabase/client.ts`
- **TypeScript Config**: `tsconfig.json`
- **Vite Config**: `vite.config.ts`
- **Tailwind Config**: `tailwind.config.ts`

## Common Gotchas

- **Supabase RLS**: Always implement Row-Level Security policies for new tables
- **Environment Variables**: Use proper `.env` files, never commit secrets
- **Type Safety**: Avoid `any` type unless absolutely necessary and documented
- **Component Imports**: Use `@/` prefix for absolute imports from `src/`
- **Testing**: Use Vitest with React Testing Library patterns

## Pre-PR Check Command

```bash
# Run this before creating any PR
pnpm type-check && pnpm test && pnpm build
```
