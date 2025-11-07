# Change: Initialize and Configure Supabase Client

## Why
The application needs a properly configured Supabase client instance to interact with the backend database. Currently, Supabase credentials are hardcoded in `src/utils/supabase/info.tsx`, which is a security risk and makes configuration management difficult. A centralized, typed client instance will provide type safety for all database operations and enable secure credential management through environment variables.

## What Changes
- **Discovery Phase**: First examine actual database tables, schema, and sample data using Supabase MCP server to understand the current state
- Create `src/supabase/client.ts` with a typed Supabase client singleton
- Set up environment variables for Supabase URL and anon key (using Vite's `VITE_` prefix)
- Generate TypeScript types from Supabase schema using Supabase CLI or MCP server
- Create `src/supabase/types.ts` with database type definitions
- **BREAKING**: Replace hardcoded credentials in `src/utils/supabase/info.tsx` with environment variable references (or deprecate this file)
- Ensure the client uses the existing `@jsr/supabase__supabase-js` package (JSR version, not npm version)
- Add `.env.local` to `.gitignore` if not already present
- Create `.env.example` file with placeholder values for documentation
- Adjust implementation based on discovered schema differences from expected structure (e.g., actual table names, column names, relationships)

## Impact
- **Affected specs**: None (no existing specs)
- **Affected code**:
  - New files: `src/supabase/client.ts`, `src/supabase/types.ts`
  - Modified: `src/utils/supabase/info.tsx` (may be deprecated or updated)
  - New files: `.env.local` (not committed), `.env.example` (committed)
  - Modified: `.gitignore` (if needed)
- **Breaking changes**:
  - Any code importing from `src/utils/supabase/info.tsx` may need updates
  - Environment variables must be set for the application to work

## Discovered Database Schema (Initial Discovery)
Based on initial examination via Supabase MCP server, the database contains:

**Core Tables:**
- `settings` - Site configuration (1 row) with JSONB fields for `social_links`, `content_config`, `seo_settings`
- `partners` - Partner/sponsor information (10 rows) with `name`, `logo`, `url`
- `teams` - Team members (12 rows) with `name`, `role`, `photo_url`, `bio`, `email`, `phone`, `socials` (JSONB), `department`, `status`, `featured`
- `gallery_items` - Gallery images (10 rows) with `img`, `alt`
- `photo_moments` - Photo moments (3 rows) with `img`, `caption`

**Event-Related Tables:**
- `events` - Events (0 rows currently) with `event_date`, `day_name`, `venue`, `artists`, `time`, `description`, `status`, `venue_id` (FK), `artist_ids` (UUID array)
- `venues` - Venues (0 rows) with `name`, `address`, `city`, `capacity`, `contact_info` (JSONB), `status`
- `artists` - Artists (0 rows) with `name`, `genre`, `bio`, `social_links` (JSONB), `status`

**Benefits Tables:**
- `benefits_partners` - Partner benefits (3 rows) with `name`, `description`, `icon`
- `benefits_members` - Member benefits (3 rows) with `name`, `description`, `icon`

**Key Observations:**
- Column naming differs from TypeScript types (e.g., `img` vs `image_url`, `photo_url` vs `avatar_url`)
- JSONB fields used for flexible data (`social_links`, `contact_info`, `content_config`)
- UUID arrays used for relationships (`artist_ids` in events)
- Foreign key relationship: `events.venue_id` → `venues.id`
- All tables have RLS (Row Level Security) enabled

