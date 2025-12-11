# App Directory - AGENTS.md

## 1. Package Identity
- **Scope**: Next.js 16 App Router (Routes, Layouts, API Endpoints).
- **Tech**: React Server Components (default), Client Components (`'use client'`).

## 2. Setup & Run
- **Dev**: `pnpm dev` (runs at http://localhost:3000)
- **New Route**: Create `folder/page.tsx` for `/folder`.

## 3. Patterns & Conventions
- **Server vs Client**:
    - ✅ **Server Components** (Default): Fetch data directly, keep secrets.
    - ✅ **Client Components**: Add `'use client'` at top. Use for interactivity (onClick, hooks).
- **Data Fetching**:
    - Server: `const data = await db.query(...)` or `fetch(...)`.
    - Client: Use `useQuery` from `@tanstack/react-query`.
- **API Routes**:
    - Located in `app/api/path/route.ts`.
    - Export `GET`, `POST`, etc.
    - Return `NextResponse`.

### File Examples
- **Page**: `app/page.tsx`
- **Layout**: `app/layout.tsx` (Global providers wrap children here).
- **API**: `app/api/auth/route.ts` (Example)

## 4. Touch Points
- **Providers**: `app/layout.tsx` -> `providers/CombinedProviders.tsx`.
- **Global CSS**: `app/globals.css`.
- **Authentication**: Pages under `app/(auth)/` or `app/login/`.

## 5. JIT Index Hints
- Find all pages: `glob "app/**/page.tsx"`
- Find API routes: `glob "app/api/**/route.ts"`
- Find layouts: `glob "app/**/layout.tsx"`