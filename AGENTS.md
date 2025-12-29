# WildOut! Project - Agent Guidelines

## Build & Test Commands

### Documentation & Roadmap

- **Review Summary**: `docs/PROJECT_REVIEW.md` - Comprehensive architectural overview.
- **Roadmap**: `docs/ROADMAP.md` - Phased implementation plan for improvements.

```bash
# Development
pnpm dev                    # Start Vite dev server
pnpm dev:smart              # Start enhanced dev server (port 3000)
pnpm dev:check              # Verify dev server setup

# Build & Test
pnpm build                  # Build for production
pnpm test                   # Run Vitest tests (single run)
# For single test: pnpm test -- -t "test-name"
```

## Architecture Overview

**Stack**: React 19 + TypeScript + Vite + Supabase + Tailwind + Radix UI

**Core Structure**:

- **Router**: Custom client-side router (`src/components/Router.tsx`) with pages: landing, admin, all-events, login
- **Data Layer**: Supabase Edge Functions with KV store pattern (PostgreSQL key-value table)
- **API Client**: `src/supabase/api/client.ts` - typed API wrapper for all CRUD operations
- **Content Management**: `src/contexts/ContentContext.tsx` - React context for global state
- **UI System**: shadcn/ui components + Radix UI primitives + Tailwind CSS

**Key Subprojects**:

- **Landing Page**: Hero, About, Events, Team, Partners, Gallery sections
- **Dashboard**: Full admin panel for content management (Hero, Events, Team, Partners, Gallery, Settings)
- **Edge Functions**: Hono-based serverless API at `src/supabase/functions/server/index.tsx`

## Code Style Guidelines

### Imports & Organization

```typescript
// External libs first
import React, { useState } from "react";
import { z } from "zod";

// Internal modules (use @/ alias)
import { Button } from "@/components/ui/button";
import { apiClient } from "@/supabase/api/client";
import type { Hero } from "@/types/schemas";
```

### Naming Conventions

- **Components**: PascalCase (`DashboardLayout.tsx`, `ImageUpload.tsx`)
- **Hooks**: usePrefix (`useRouter`, `useMobile`)
- **Types/Interfaces**: PascalCase (`RouterContextValue`, `DashboardLayoutProps`)
- **API Functions**: camelCase (`updateHero`, `getEvents`)
- **Variables**: camelCase for regular, UPPER_CASE for constants

### TypeScript & Types

- **Strict mode enabled** - all types must be explicit
- **Zod schemas** for runtime validation in `src/types/schemas.ts`
- **API types** defined in schemas, UI types in component files
- **Avoid `any`** - use proper interfaces or generics

### Error Handling

```typescript
// API calls with toast notifications
try {
  const result = await apiClient.updateHero(data);
  toast.success("Updated successfully");
} catch (error) {
  toast.error(error.message);
  console.error("API Error:", error);
}
```

### Component Patterns

- **Functional components** with hooks
- **Memoization**: `React.memo()` for providers and large components
- **Context pattern**: Create context + custom hook + provider
- **Motion**: Use `motion` from 'motion/react' for animations
- **UI components**: Import from `@/components/ui/` (shadcn/ui)

### Supabase & API

- **Client**: `src/lib/supabase.ts` - singleton Supabase client
- **Edge Functions**: Hono framework, CORS enabled, JWT auth required for writes
- **KV Store**: PostgreSQL table for key-value storage (serverless pattern)
- **Caching**: 60s cache on GET endpoints
- **Auth**: JWT tokens via `Authorization: Bearer <token>` header

### File Structure Conventions

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── dashboard/    # Admin panel components
│   └── [feature]/    # Feature-specific components
├── contexts/         # React contexts
├── lib/              # Utility libraries (supabase.ts)
├── supabase/         # API client & edge functions
├── types/            # TypeScript types & Zod schemas
├── utils/            # Helper functions
└── styles/           # CSS files
```

### Testing

- **Framework**: Vitest
- **Location**: `*.test.ts`, `*.spec.ts` alongside source files
- **Run single test**: `pnpm test -- -t "test name pattern"`
- **API testing**: Use `src/verify-api.ts` for manual API verification

### Development Workflow

1. **Start**: `pnpm dev:smart` (enhanced dev server on port 3000)
2. **API Changes**: Deploy Edge Functions first, then update client
3. **UI Changes**: Use hot reload, check TypeScript compilation
4. **Testing**: Run `pnpm test` before commits
5. **Build**: `pnpm build` for production validation

### Important Notes

- **Environment**: Uses fallback Supabase credentials for development
- **Router**: Custom hash-based routing for SPA behavior
- **Theme**: Next-themes for dark/light mode
- **Forms**: React Hook Form + Zod validation
- **Toasts**: Sonner for notifications
- **Icons**: Lucide React
- **State**: React context + useState for local state

### Edge Function Development

- **Location**: `src/supabase/functions/server/`
- **Framework**: Hono (TypeScript)
- **Deploy**: Manual deployment to Supabase Edge Functions
- **Schemas**: Shared with client via `schemas.ts`
- **KV Store**: PostgreSQL-based key-value storage in `kv_store.tsx`
