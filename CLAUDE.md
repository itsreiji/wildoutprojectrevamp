# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands

```bash
# Development
pnpm dev                    # Start Vite dev server (port 3000)
pnpm dev:smart              # Start enhanced dev server with Hono proxy
pnpm dev:check              # Verify dev server setup

# Build & Test
pnpm build                  # Build for production to /build
pnpm test                   # Run Vitest tests (single run)
pnpm test -- -t "pattern"   # Run single test by name pattern
```

## High-Level Architecture

### Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **State**: React Context (`ContentContext`) + useState for local state
- **UI**: shadcn/ui components + Radix UI primitives
- **Backend**: Supabase Edge Functions with Hono framework
- **Data**: PostgreSQL-based KV store (key-value table pattern)
- **Validation**: Zod schemas (shared client/server)
- **Auth**: Supabase JWT authentication

### Core Flow

**Data Layer**:
1. `src/lib/supabase.ts` - Supabase client singleton
2. `src/supabase/api/client.ts` - `SupabaseKVClient` class with typed CRUD methods
3. `src/contexts/ContentContext.tsx` - Global state provider with fallback initial data
4. Edge Functions: `src/supabase/functions/server/index.tsx` - Hono-based API

**Routing**:
- Custom client-side router in `src/components/Router.tsx`
- Pages: `landing`, `admin`, `all-events`, `login`
- Uses `window.history.pushState` for SPA behavior (no hash routing)

**App Structure**:
```
src/
├── App.tsx                    # Root with ThemeProvider + ContentProvider + RouterProvider
├── main.tsx                   # Entry point
├── components/
│   ├── Router.tsx             # Custom router context
│   ├── LandingPage.tsx        # Public landing page
│   ├── Dashboard.tsx          # Admin panel
│   ├── AllEventsPage.tsx      # Events listing
│   ├── LoginPage.tsx          # Auth page
│   ├── ui/                    # shadcn/ui components (40+ components)
│   └── dashboard/             # Admin-specific components
├── contexts/
│   └── ContentContext.tsx     # Global state + API sync logic
├── supabase/
│   ├── api/client.ts          # Typed API client (SupabaseKVClient)
│   └── functions/
│       └── server/
│           ├── index.tsx      # Hono API routes
│           ├── kv_store.tsx   # PostgreSQL KV operations
│           └── schemas.ts     # Zod schemas (server-side)
├── types/
│   ├── schemas.ts             # Zod schemas + TypeScript types
│   └── supabase.ts            # Supabase types
└── lib/
    └── supabase.ts            # Supabase client config
```

### API Architecture

**Edge Functions** (`/functions/v1/make-server-41a567c3`):
- **Auth**: JWT required for all write operations (PUT, POST, DELETE)
- **Caching**: GET endpoints return `Cache-Control: public, max-age=60`
- **Validation**: Zod schemas on all inputs
- **KV Store**: PostgreSQL table with `key` and `value` columns

**Endpoints**:
- `GET/PUT /hero` - Hero section content
- `GET/PUT /about` - About section content
- `GET/POST/PUT/DELETE /events/:id` - Event management
- `GET/POST/PUT/DELETE /team/:id` - Team member management
- `GET/POST/PUT/DELETE /partners/:id` - Partner management
- `GET/POST/PUT/DELETE /gallery/:id` - Gallery image management
- `GET/PUT /settings` - Global site settings

**Client API Methods** (`apiClient`):
```typescript
// Hero
apiClient.getHero()
apiClient.updateHero(data)

// Events (CRUD)
apiClient.getEvents()
apiClient.getEvent(id)
apiClient.createEvent(data)
apiClient.updateEvent(id, data)
apiClient.deleteEvent(id)

// Similar patterns for: Team, Partners, Gallery, Settings, About
```

### State Management Pattern

**ContentContext** provides:
- Data: `events`, `partners`, `gallery`, `team`, `hero`, `about`, `settings`
- Update functions: `updateEvents()`, `updateHero()`, etc.
- `refresh()` - Fetches all data from API with 5s timeout
- `loading` - Boolean loading state

**Update Flow**:
1. Update local state immediately (optimistic UI)
2. Call API to persist to Supabase
3. If API fails, call `refresh()` to revert to server state

**Fallback Strategy**: If API calls fail, the app uses hardcoded initial data and continues to function.

### Key Patterns & Conventions

**Imports**:
```typescript
import React, { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/supabase/api/client";
import type { Hero } from "@/types/schemas";
```

**Error Handling**:
```typescript
try {
  await apiClient.updateHero(data);
  toast.success("Updated successfully");
} catch (error) {
  toast.error(error.message);
  console.error("API Error:", error);
}
```

**Component Structure**:
- Functional components with hooks
- `React.memo()` for providers and large components
- Context pattern: create context + custom hook + provider
- Motion: `motion` from 'motion/react' for animations

**TypeScript**:
- Strict mode enabled
- Zod schemas define runtime types
- Avoid `any` - use proper interfaces
- Shared types between client and server

**Testing**:
- Framework: Vitest
- Schema tests: `*.test.ts` alongside schemas
- Run single test: `pnpm test -- -t "test name"`

### Important Notes

- **Router**: Hash-free SPA using `window.history` - requires server config for production
- **Theme**: Next-themes with dark mode default
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner toast library
- **Icons**: Lucide React
- **Environment**: Uses Supabase credentials from `.env` or fallbacks for development
- **Dev Server**: Port 3000, strict port mode enabled

### Development Workflow

1. **Start**: `pnpm dev:smart` (enhanced server with API proxy)
2. **API Changes**: Deploy Edge Functions to Supabase first
3. **UI Changes**: Hot reload available, check TypeScript compilation
4. **Testing**: Run `pnpm test` before commits
5. **Build**: `pnpm build` validates production build

### Edge Function Development

**Location**: `src/supabase/functions/server/`

**Files**:
- `index.tsx` - Hono app with routes
- `kv_store.tsx` - PostgreSQL KV operations
- `schemas.ts` - Zod schemas (server-side copy)

**Deployment**: Manual deployment to Supabase Edge Functions required for changes to take effect.

### Common Issues & Solutions

**API Timeout**: Requests have 5s timeout. If Supabase is slow, check:
- Network connection
- Supabase project status
- Edge Function deployment status

**Auth Errors**: 401 errors mean:
- User not logged in (redirect to login)
- Expired JWT token (refresh session)
- Invalid Supabase configuration

**Data Sync**: If UI doesn't reflect server changes:
- Call `refresh()` from `useContent()`
- Check browser console for API errors
- Verify Edge Function deployment
