# WildOut! Project - AGENTS.md

> **AI Context**: This is the root context file. Read specific sub-folder `AGENTS.md` files for detailed patterns.

## 1. Project Snapshot

- **Type**: Single Next.js 16 Application (App Router)
- **Stack**: TypeScript, Tailwind CSS 4, Supabase, TanStack Query, Shadcn UI
- **Key Directories**: `app/` (routes), `components/` (UI), `lib/` (core), `supabase/` (db), `services/` (logic)

## 2. Root Setup & Commands

- **Install**: `pnpm install`
- **Dev Server**: `pnpm dev`
- **Build**: `pnpm build`
- **Test**: `pnpm test` (Vitest)
- **Lint/Check**: `pnpm lint:all` (runs lint, type-check, format)

## 3. Universal Conventions

- **Style**: Strict TypeScript (`tsconfig.json`), Prettier for formatting.
- **Imports**: Use `@/` alias for root (e.g., `import { cn } from '@/lib/utils'`).
- **Env**: Access via `process.env.NEXT_PUBLIC_*`. Validate availability before use.
- **Async**: Prefer `async/await`. Handle errors with `try/catch` or boundary components.

## 4. Security & Secrets

- **NEVER** commit `.env` files or real tokens.
- **Client-side**: Only expose `NEXT_PUBLIC_` variables if safe for public.
- **Supabase**: Use RLS (Row Level Security) for all tables.

## 5. JIT Index - Directory Map

### Core Application

- **Routes & Pages**: `app/` → [see app/AGENTS.md](app/AGENTS.md)
- **UI Components**: `components/` → [see components/AGENTS.md](components/AGENTS.md)
- **Business Logic**: `services/` → [see services/AGENTS.md](services/AGENTS.md)

### Infrastructure & Utils

- **Utilities & Config**: `lib/` → [see lib/AGENTS.md](lib/AGENTS.md)
- **Database & Auth**: `supabase/` → [see supabase/AGENTS.md](supabase/AGENTS.md)
- **Hooks**: `hooks/` → [see hooks/AGENTS.md](hooks/AGENTS.md)
- **Providers**: `providers/` → [see providers/AGENTS.md](providers/AGENTS.md)

### Quick Find Commands

- Find Page: `glob "app/**/page.tsx"`
- Find Component: `glob "components/**/*.tsx"`
- Find Service: `glob "services/*.ts"`
- Search Content: `search_file_content pattern="<term>"`

## 6. Definition of Done

1.  Code compiles (`pnpm type-check`).
2.  Linter passes (`pnpm lint`).
3.  Tests pass (`pnpm test`).
4.  No console errors in DevTools.
