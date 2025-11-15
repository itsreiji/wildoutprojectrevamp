# Change: Sync Public Landing & Admin Content with Supabase

## Why
Currently, the landing page displays static content from `INITIAL_*` constants in `ContentContext.tsx`, while admin dashboard components (Hero, About, Settings) only update local state without persisting to Supabase. This creates a disconnect where changes in the admin don't reflect on the public landing page, and data isn't shared across sessions.

The application needs unified content management where:
- Admin edits persist to Supabase database
- Landing page immediately reflects admin changes
- Content is available across sessions and deployments
- Router supports configurable admin base path (`/sadmin`)

This change will create a complete sync between admin editing and public display, with Supabase as the single source of truth.

## What Changes
- **MODIFY** `src/contexts/ContentContext.tsx`:
  - **ADD** Supabase tables for site-wide content (hero, about, settings)
  - **ADD** mutation functions for hero/about/settings content
  - **MODIFY** data fetching to use Supabase by default with dummy data as explicit fallback
  - **ADD** configurable admin base path support (`VITE_ADMIN_BASE_PATH`)

- **MODIFY** Admin dashboard components:
  - **MODIFY** `DashboardHero.tsx`, `DashboardAbout.tsx`, `DashboardSettings.tsx` to persist changes to Supabase
  - **ADD** loading states and error handling for save operations
  - **ADD** real-time sync so landing page updates immediately after admin saves

- **MODIFY** Router and navigation:
  - **MODIFY** `RouterProvider` to support configurable admin base path
  - **MODIFY** `Navigation.tsx` and routing logic to use `sadmin` prefix
  - **MODIFY** `vite.config.ts` to proxy `/sadmin` routes in development

- **ADD** Database schema and seed import:
  - **ADD** new Supabase migrations for hero/about/settings tables
  - **ADD** `scripts/importContentFromRepo.ts` to seed current repo config into Supabase
  - **MODIFY** `src/supabase/types.ts` to include new table types

- **MODIFY** Landing page components:
  - **ENSURE** `LandingPage.tsx` and section components consume Supabase data
  - **REMOVE** any remaining dummy data fallbacks that could desync content

## Impact
- **Affected specs**: `public-ui/spec.md`, `admin-dashboard/spec.md`
- **Affected code**:
  - **Modified**: `src/contexts/ContentContext.tsx`, `src/components/router/index.tsx`, `src/App.tsx`
  - **Modified**: `src/components/dashboard/DashboardHero.tsx`, `DashboardAbout.tsx`, `DashboardSettings.tsx`
  - **Modified**: `src/components/LandingPage.tsx` and section components
  - **New**: `supabase/migrations/20251115_content_tables.sql`
  - **New**: `scripts/importContentFromRepo.ts`
  - **Modified**: `vite.config.ts`, routing configuration
- **Database changes**:
  - **New tables**: `hero_content`, `about_content`, `site_settings`
  - **New RLS policies**: Public read access, admin write access
- **Breaking changes**:
  - Admin dashboard now requires Supabase connection for content editing
  - Landing page content depends on database availability
  - Router changes affect admin URL paths (`/admin/*` → `/sadmin/*`)

## Technical Implementation

### Database Schema Additions
```sql
-- Hero content table
CREATE TABLE public.hero_content (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    subtitle text,
    description text,
    stats jsonb DEFAULT '{}',
    cta_text text,
    cta_link text,
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);

-- About content table
CREATE TABLE public.about_content (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    subtitle text,
    founded_year text,
    story text[],
    features jsonb DEFAULT '[]',
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);

-- Site settings table
CREATE TABLE public.site_settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    site_name text NOT NULL,
    site_description text,
    tagline text,
    email text,
    phone text,
    address text,
    social_media jsonb DEFAULT '{}',
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);
```

### Router Configuration Changes
- **Environment variable**: `VITE_ADMIN_BASE_PATH` (defaults to `/sadmin`)
- **Router updates**: Support dynamic admin base path in `RouterProvider`
- **Navigation**: Update all admin links to use configurable base path
- **Vite proxy**: Add `/sadmin` proxy configuration for development

### Content Provider Updates
- **New mutation functions**: `saveHeroContent()`, `saveAboutContent()`, `saveSiteSettings()`
- **Default data source**: Supabase first, dummy data only when `VITE_USE_DUMMY_DATA=true`
- **Loading states**: Enhanced to cover all content types during fetch/save operations

### Admin Component Updates
- **Persistence**: All form saves now call Supabase mutations
- **Real-time sync**: Landing page updates immediately after admin saves
- **Error handling**: Toast notifications for save failures
- **Loading states**: Disable forms during save operations
