# Change: Implement ContentContext with Supabase Data Fetching

## Why
The `ContentContext` currently uses static initial data (`INITIAL_EVENTS`, `INITIAL_PARTNERS`, etc.) hardcoded in the component. This prevents the application from accessing real data from the Supabase database and makes content management impossible. The application needs a fully functional state management system that:

1. Fetches data from Supabase on application mount
2. Provides loading and error states for better UX
3. Offers mutation functions (add, update, delete) that sync with Supabase
4. Maintains local state for performance while keeping it in sync with the database

This change enables the platform to transition from mock data to production-ready data management, connecting the frontend to the Supabase backend.

## What Changes
- **MODIFY** `src/contexts/ContentContext.tsx` to:
  - Add `useEffect` hook to fetch initial data from Supabase on mount
  - Add `loading` and `error` states to the context
  - Implement mutation functions for events (addEvent, updateEvent, deleteEvent)
  - Remove or deprecate static `INITIAL_*` constants in favor of Supabase data
  - Handle concurrent data fetching using `Promise.all` for performance
  - **IMPLEMENT bidirectional data synchronization** between Supabase and application state:
    - **Supabase → Landing Page**: If data exists in Supabase but not in local state, synchronize from Supabase (Supabase is source of truth)
    - **Landing Page → Supabase**: If data exists in local state (from INITIAL_* constants) but not in Supabase, synchronize to Supabase (preserve data, no data loss)
    - **Data Merging**: When both sources have data, use the most up-to-date version (prefer Supabase for conflicts, but preserve all valid data)
    - **Cleanup**: Remove unused/obsolete data from both sides after synchronization
    - **Migration Strategy**: During initial sync, merge INITIAL_* constants with Supabase data, then use Supabase as single source of truth
- **ADD** mutation functions to `ContentContextType` interface for:
  - Events: `addEvent`, `updateEvent`, `deleteEvent`
  - Team: `addTeamMember`, `updateTeamMember`, `deleteTeamMember` (future)
  - Partners: `addPartner`, `updatePartner`, `deletePartner` (future)
  - Gallery: `addGalleryImage`, `updateGalleryImage`, `deleteGalleryImage` (future)
  - Settings: `updateSettings` (future)
- **ADD** synchronization function `syncData()` to merge and reconcile data between Supabase and local state during initialization
- **ENHANCE** error handling with proper error messages and logging
- **OPTIMIZE** state updates using optimistic updates where appropriate
- **NO BREAKING CHANGES**: Existing components using `useContent()` will continue to work, with added loading/error states
- **DATA PRESERVATION**: All existing data (both in INITIAL_* constants and Supabase) SHALL be preserved during synchronization - no data loss allowed

## Impact
- **Affected specs**: New capability `content-state-management` (to be created)
- **Affected code**:
  - **Modified**: `src/contexts/ContentContext.tsx`
  - **Dependencies**:
    - `src/supabase/client.ts` (already exists from Task 2)
    - `src/types/` (already exists from Task 1)
  - **No changes needed**: `src/App.tsx` (already wraps app with ContentProvider)
- **Database tables used**:
  - `events` - Event data
  - `teams` - Team member data
  - `partners` - Partner/sponsor data
  - `gallery_items` - Gallery image data
  - `settings` - Site settings (singleton)
  - Future: `hero` and `about` content (may be stored in settings or separate tables)
- **Breaking changes**: None (backward compatible)

## Database Schema Considerations
Based on the existing Supabase schema:
- **Column name mappings**: Database uses `img` vs TypeScript `image_url`, `photo_url` vs `avatar_url` - need mapping functions
- **JSONB fields**: `social_links`, `contact_info`, `content_config` require proper serialization/deserialization
- **Relationships**: `events.venue_id` → `venues.id`, `events.artist_ids` → `artists.id[]` need proper handling
- **RLS**: All tables have Row Level Security enabled - ensure proper authentication for mutations

## Data Synchronization Strategy
The implementation SHALL perform bidirectional synchronization during initialization to ensure no data loss:

1. **Initial Sync Process**:
   - Fetch all data from Supabase
   - Compare with existing INITIAL_* constants
   - Identify data that exists in Supabase but not in constants → use Supabase data
   - Identify data that exists in constants but not in Supabase → push to Supabase
   - For conflicts (same ID in both), use Supabase version as source of truth (most up-to-date)
   - Remove obsolete/unused data from both sides after reconciliation

2. **Data Preservation Rules**:
   - **NO DATA LOSS**: All valid data from both sources must be preserved
   - **Rebuild Allowed**: Complete rebuild of data structure is acceptable as long as no data is lost
   - **Source of Truth**: After initial sync, Supabase becomes the single source of truth
   - **Cleanup**: Remove duplicate, obsolete, or invalid data during sync process

3. **Synchronization Scenarios**:
   - **Supabase has data, Landing Page doesn't**: Sync from Supabase → Landing Page
   - **Landing Page has data, Supabase doesn't**: Sync from Landing Page → Supabase
   - **Both have data**: Merge intelligently, prefer Supabase for conflicts
   - **Data in both but different**: Use Supabase version (more up-to-date), log differences

