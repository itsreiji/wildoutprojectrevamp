# Providers Directory - AGENTS.md

## 1. Package Identity
- **Scope**: React Context Providers for global state management.
- **Tech**: React Context API, QueryClientProvider.

## 2. Patterns & Conventions
- **Composition**:
    - `CombinedProviders.tsx` aggregates all providers to keep `layout.tsx` clean.
    - ✅ DO: Add new global providers to `CombinedProviders.tsx`.
- **Client**: Providers are usually Client Components (`'use client'`).

### Examples
- **Root Wrapper**: `providers/CombinedProviders.tsx`
- **Auth**: `providers/auth-provider.tsx`

## 3. Touch Points
- **Layout**: `app/layout.tsx`.
- **State**: `providers/query-provider.tsx` (TanStack Query).

## 4. JIT Index Hints
- Find providers: `glob "providers/*.tsx"`