# WildOut! Code Style & Conventions

## TypeScript
- **Strict Mode**: Enabled in tsconfig.json
- **Type Safety**: All code should be properly typed
- **Interfaces**: Use `interface` for component props and data structures
- **Type Aliases**: Use `type` for union types and complex type definitions

## Component Structure
- **Server Components**: Default (no directive needed)
- **Client Components**: Add `'use client'` directive at top
- **Props**: Define `Props` interface or component-specific interface
- **Styling**: Use `cn()` utility for class merging

## File Organization
- **Atomic Components**: `components/ui/` (buttons, inputs, etc.)
- **Feature Components**: `components/<feature>/` (admin, navigation, etc.)
- **Services**: `services/<noun>Service.ts` (auditService.ts, etc.)
- **Utilities**: `lib/utils.ts` for shared helpers

## Naming Conventions
- **Components**: PascalCase (Button.tsx, Dashboard.tsx)
- **Functions**: camelCase (getUserData, validateInput)
- **Variables**: camelCase (userData, isLoading)
- **Constants**: UPPER_CASE (MAX_RETRIES, API_BASE_URL)
- **Types/Interfaces**: PascalCase (UserType, ButtonProps)

## Imports
- **Root Alias**: Use `@/` for root imports (e.g., `import { cn } from '@/lib/utils'`)
- **Grouping**: Organize imports by source (React, local, external)

## Error Handling
- **Async/Await**: Prefer `async/await` over promises
- **Error Boundaries**: Use error boundary components for UI errors
- **Try/Catch**: Wrap async operations in try/catch blocks

## Testing
- **Framework**: Vitest
- **Location**: Test files in `test/` directory
- **Naming**: `<module>.test.ts` (e.g., `security.test.ts`)

## Linting & Formatting
- **ESLint**: Configured with TypeScript, React, and accessibility plugins
- **Prettier**: Code formatting with standard configuration
- **Commands**: 
  - `pnpm lint` - Run ESLint
  - `pnpm format` - Format code with Prettier
  - `pnpm lint:all` - Run all checks

## Environment Variables
- **Prefix**: Use `NEXT_PUBLIC_` for client-side variables
- **Access**: `process.env.NEXT_PUBLIC_VAR_NAME`
- **Validation**: Always validate environment variables before use

## Security
- **Secrets**: Never commit `.env` files or real tokens
- **Supabase**: Use Row Level Security (RLS) for all tables
- **Authentication**: Validate sessions and permissions