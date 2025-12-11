# Lib Directory - AGENTS.md

## 1. Package Identity
- **Scope**: Shared utilities, configuration, and singleton clients.
- **Tech**: TypeScript, Supabase JS.

## 2. Patterns & Conventions
- **Singletons**:
    - ✅ DO: Initialize clients (like Supabase) here to reuse connections.
    - See `lib/supabase/client.ts`.
- **Utils**:
    - Pure functions preferred.
    - `lib/utils.ts` for generic helpers (classnames, formatting).
- **Typing**:
    - Export types if used across multiple files.

### Examples
- **Supabase**: `lib/supabase/client.ts`
- **Helpers**: `lib/utils.ts`

## 3. Touch Points
- **Env Vars**: Checked/Validated in these files usually.
- **Types**: `types/supabase.ts` (Generated DB types).

## 4. JIT Index Hints
- Find Supabase client: `glob "lib/supabase/*.ts"`
- Find utility functions: `search_file_content pattern="export function" dir_path="lib"`