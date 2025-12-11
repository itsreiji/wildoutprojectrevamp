# Hooks Directory - AGENTS.md

## 1. Package Identity
- **Scope**: Custom React Hooks for reusing state logic and side effects.
- **Tech**: React, TypeScript.

## 2. Patterns & Conventions
- **Naming**: Must start with `use` (e.g., `useAuth`, `useDebounce`).
- **Logic**:
    - ✅ DO: Abstract complex `useEffect` or state logic here.
    - ✅ DO: Return consistent interfaces (values, handlers, loading states).
- **Imports**:
    - Prefer importing from `@/hooks/useHookName`.

## 3. JIT Index Hints
- Find hooks: `glob "hooks/*.ts"`, `glob "hooks/*.tsx"`