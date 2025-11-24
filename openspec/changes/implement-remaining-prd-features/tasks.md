# Implementation Tasks

## 1. Phase 1: Quick Wins (Items 3,5,9,15)
Direct implementation, no sub-proposals needed.

### 1.1 Item 3: Gallery items linked to events (add event_id FK, migration)
- [ ] Create migration `supabase/migrations/20251124_add_gallery_event_fk.sql`: `ALTER TABLE gallery_items ADD COLUMN event_id uuid REFERENCES events(id); CREATE INDEX idx_gallery_event_id;`
- [ ] Run migration locally: `supabase migration up`
- [ ] Update `src/supabase/types.ts` (regen via Supabase CLI)
- [ ] Update `src/components/dashboard/DashboardGallery.tsx` + `ContentContext.tsx` to include/use `event_id` in forms/queries
- [ ] Add form field for event selection in `DashboardGalleryForm.tsx`
- **Verification**: Query `gallery_items` with `event_id`, types.ts reflects FK, form saves/links correctly, no migration errors.

### 1.2 Item 5: Partner tiered visibility (add sponsorship_level column)
- [ ] Create migration `supabase/migrations/20251124_add_partner_sponsorship.sql`: `ALTER TABLE partners ADD COLUMN sponsorship_level text CHECK (sponsorship_level IN ('bronze','silver','gold','platinum')) DEFAULT 'bronze'; CREATE INDEX idx_partners_sponsorship;`
- [ ] Run migration locally
- [ ] Regen `src/supabase/types.ts`
- [ ] Update `DashboardPartnerForm.tsx`: Add select for `sponsorship_level`
- [ ] Update `PartnersSection.tsx`: Filter/sort by tier (e.g., platinum first)
- **Verification**: Insert/update partner with tier, query shows column, UI displays tiers correctly.

### 1.3 Item 9: RLS policies full manual testing
- [ ] Run `supabase db dump --schema-only` to capture current RLS
- [ ] Test as public: SELECT from `public_events_view`, expect read-only
- [ ] Test as authenticated non-admin: INSERT/UPDATE expect deny
- [ ] Test as admin: Full CRUD on all tables
- [ ] Test as editor (post-Phase2): Partial CRUD
- [ ] Use RPC `test_rls_policies()` for automated check
- **Verification**: All tests pass, no unauthorized access, `get_table_policies()` confirms policies.

### 1.4 Item 15: Audit log full integration/triggers
- [ ] Create triggers for all tables: `CREATE OR REPLACE FUNCTION audit_log_trigger()...` (INSERT/UPDATE/DELETE log to `audit_log`)
- [ ] Migration: `supabase/migrations/20251124_audit_triggers.sql`
- [ ] Test: CRUD on `events`, verify `audit_log` entries
- **Verification**: Logs capture user_id/action/old_new_data, RPC `get_recent_security_events` works.

## 2. Phase 2: Medium DB/Content (Items 2,4,6,12,13,14)
### 2.1 Item 2: Artist lineups CRUD (event_artists)
- [ ] Update `DashboardEventForm.tsx`: Multi-select artists + add to `event_artists`
- [ ] New `DashboardArtists.tsx` list + form (leverage existing table)
- [ ] Mutations in `ContentContext.tsx`: add/update/delete `event_artists`
- **Verification**: Link artists to event, query joins correctly.

### 2.2 Item 4: Hero/About/Site Settings tables/CRUD
- [ ] Migrations for `hero_content`, `about_content`, `site_settings` (singletons, jsonb fields)
- [ ] `DashboardHero.tsx`, `DashboardAbout.tsx`, `DashboardSettings.tsx` forms
- [ ] RPCs: `get_hero_content()`, `upsert_hero_content()`
- [ ] Integrate to `ContentContext.tsx`
- **Verification**: Save/load content, reflects on landing.

### 2.3 Item 6: Editor role full RLS/permissions
- [ ] See `specs/rls-editor-permissions/spec.md`
- [ ] SQL policies: Editors CRUD own content, read all
- **Verification**: Role-based tests pass.

### 2.4 Item 12: Venues table CRUD/integration
- [ ] Migration: `CREATE TABLE venues (id uuid PK, name text, address text, ...);`
- [ ] `DashboardVenues.tsx` + form
- [ ] Link `events.venue_id`
- **Verification**: Events reference venues.

### 2.5 Item 13: Separate Artists table CRUD
- [ ] Migration: `CREATE TABLE artists (id uuid PK, name text, ...);`
- [ ] Refactor `event_artists.artist_name` → `artist_id`
- [ ] `DashboardArtists.tsx` full CRUD
- **Verification**: Normalized artists, no data loss.

### 2.6 Item 14: Benefits tables CRUD
- [ ] Migrations: `benefits_events`, `benefits_partners` junction tables
- [ ] Forms in respective dashboards
- **Verification**: Benefits linked correctly.

## 3. Phase 3: Medium Refactors (Items 8,10,11)
### 3.1 Item 8: Router migration
- [ ] Migrate to TanStack Router or React Router
- [ ] Update all routes/components
- **Verification**: Navigation works, no regressions.

### 3.2 Item 10: Edge functions deploy/test
- [ ] Deploy `src/supabase/functions/server/*`
- [ ] Test RPCs/endpoints
- **Verification**: Functions execute correctly.

### 3.3 Item 11: Real-time subscriptions
- [ ] Supabase realtime on `events`, `partners`
- [ ] Subscribe in `ContentContext.tsx`
- **Verification**: Live updates on changes.

## 4. Phase 4: High Effort (Sub-proposals required)
### 4.1 Item 1: Event ticketing (Stripe)
- [ ] Create sub-openspec `add-event-ticketing`
- [ ] New tables, Stripe integration, Edge functions

### 4.2 Item 7: TanStack Query migration
- [ ] Create sub-openspec `migrate-tanstack-query`
- [ ] Refactor contexts to queries

**Post-Phase Completion**: `openspec archive implement-remaining-prd-features`, update `STATUS.md`.