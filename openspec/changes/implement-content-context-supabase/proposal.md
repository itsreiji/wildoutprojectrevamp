# Change: Implement ContentContext with Supabase Data Fetching

## Why
The `ContentContext` needs to provide a fully functional state management system that connects the frontend to the rebuilt Supabase backend. While initial data fetching has been implemented, the context still lacks mutation capabilities (create, update, delete) that allow the application to modify content through the database.

The application needs:
1. ✅ Fetches data from Supabase on application mount (already implemented)
2. ✅ Provides loading and error states for better UX (already implemented)
3. ❌ Offers mutation functions (add, update, delete) that sync with Supabase (needs implementation)
4. ✅ Maintains local state for performance while keeping it in sync with the database (already implemented)

This change completes the ContentContext implementation by adding mutation functions, enabling full CRUD operations for all content entities.

## What Changes

### Already Implemented ✅
- **Data Fetching**: `useEffect` hook fetches initial data from Supabase views on mount
- **Loading & Error States**: `loading` and `error` states are exposed in the context
- **Concurrent Fetching**: Uses `Promise.all` for efficient parallel data fetching
- **Database Views**: Leverages optimized views (`public_events_view`, `active_team_view`, `active_partners_view`, `published_gallery_view`) for read operations
- **Fallback Strategy**: Falls back to `INITIAL_*` constants if Supabase fetch fails

### To Be Implemented ❌
- **MODIFY** `src/contexts/ContentContext.tsx` to:
  - **ADD** mutation functions for Events:
    - `addEvent(event: TablesInsert<'events'>): Promise<Event>`
    - `updateEvent(id: string, updates: TablesUpdate<'events'>): Promise<Event>`
    - `deleteEvent(id: string): Promise<void>`
  - **ADD** mutation functions for Team Members:
    - `addTeamMember(member: TablesInsert<'team_members'>): Promise<TeamMember>`
    - `updateTeamMember(id: string, updates: TablesUpdate<'team_members'>): Promise<TeamMember>`
    - `deleteTeamMember(id: string): Promise<void>`
  - **ADD** mutation functions for Partners:
    - `addPartner(partner: TablesInsert<'partners'>): Promise<Partner>`
    - `updatePartner(id: string, updates: TablesUpdate<'partners'>): Promise<Partner>`
    - `deletePartner(id: string): Promise<void>`
  - **ADD** mutation functions for Gallery:
    - `addGalleryImage(item: TablesInsert<'gallery_items'>): Promise<GalleryImage>`
    - `updateGalleryImage(id: string, updates: TablesUpdate<'gallery_items'>): Promise<GalleryImage>`
    - `deleteGalleryImage(id: string): Promise<void>`
  - **ENHANCE** error handling with proper error messages and logging for mutations
  - **OPTIMIZE** state updates using optimistic updates where appropriate
  - **NOTE**: Mutations must target base tables (not views) and respect RLS policies
- **UPDATE** `ContentContextType` interface to include all mutation functions
- **NO BREAKING CHANGES**: Existing components using `useContent()` will continue to work, with new mutation functions available
- **REMOVE** bidirectional sync requirement: Supabase is the single source of truth; `INITIAL_*` constants remain as fallback only

## Impact
- **Affected specs**: Capability `content-state-management` (partially implemented, needs mutation functions)
- **Affected code**:
  - **Modified**: `src/contexts/ContentContext.tsx`
  - **Dependencies**:
    - `src/supabase/client.ts` (already exists)
    - `src/supabase/types.ts` (already exists, provides `Tables`, `TablesInsert`, `TablesUpdate` types)
  - **No changes needed**: `src/App.tsx` (already wraps app with ContentProvider)
- **Database tables used**:
  - **Read Operations** (via views):
    - `public_events_view` - Optimized view for event data with joined partner info
    - `active_team_view` - Active team members only
    - `active_partners_view` - Active partners only
    - `published_gallery_view` - Published gallery items only
  - **Write Operations** (base tables):
    - `events` - Event data (for mutations)
    - `team_members` - Team member data (for mutations)
    - `partners` - Partner/sponsor data (for mutations)
    - `gallery_items` - Gallery image data (for mutations)
  - **Future considerations**:
    - `hero` and `about` content: Currently using `INITIAL_*` constants; may need separate tables or stored in `profiles.metadata`
    - `settings`: No dedicated table yet; may use `profiles.metadata` or create dedicated table
- **Breaking changes**: None (backward compatible, adds new functionality)

## Database Schema Considerations
Based on the rebuilt Supabase schema (from `rebuild-supabase-from-scratch`):

### Schema Structure
- **Views for Reads**: Use optimized views for read operations (already implemented):
  - `public_events_view`: Includes joined partner information (`partner_name`, `partner_logo_url`, `partner_website_url`)
  - `active_team_view`: Filters `team_members` where `status = 'active'`
  - `active_partners_view`: Filters `partners` where `status = 'active'`
  - `published_gallery_view`: Filters `gallery_items` where `status = 'published'`

- **Base Tables for Writes**: Mutations must target base tables (not views):
  - `events`: Core events table with 3NF normalization
  - `team_members`: Team member profiles
  - `partners`: Partner organizations
  - `gallery_items`: Gallery images with optional event/partner associations

### Column Naming
- **Consistent naming**: Schema uses consistent naming (`image_url`, `avatar_url`, `logo_url`) - no mapping needed
- **JSONB fields**: `social_links`, `metadata` require proper JSON serialization/deserialization
- **Timestamps**: All tables have `created_at` and `updated_at` with automatic defaults

### Relationships
- **Events ↔ Partners**: `events.partner_id` → `partners.id` (foreign key)
- **Gallery ↔ Events**: `gallery_items.event_id` → `events.id` (optional foreign key)
- **Gallery ↔ Partners**: `gallery_items.partner_id` → `partners.id` (optional foreign key)
- **Event Artists**: Separate `event_artists` junction table for many-to-many relationship

### Security (RLS)
- **Row-Level Security**: All tables have RLS enabled with default-deny principle
- **Public Read Access**: Views have policies allowing public read access for published/active content
- **Authenticated Write Access**: Mutations require authenticated user with appropriate role (admin/editor)
- **JWT Claims**: Role-based access control via custom JWT claims in `auth.users.metadata`

### Type Safety
- **TypeScript Types**: Use generated types from `src/supabase/types.ts`:
  - `Tables<'events'>` for read operations
  - `TablesInsert<'events'>` for create operations
  - `TablesUpdate<'events'>` for update operations

## Implementation Strategy

### Phase 1: Events Mutations (Priority)
1. Implement `addEvent`, `updateEvent`, `deleteEvent` functions
2. Handle `event_artists` junction table for artist associations
3. Implement optimistic updates for better UX
4. Add proper error handling and rollback on failure

### Phase 2: Team Members Mutations
1. Implement `addTeamMember`, `updateTeamMember`, `deleteTeamMember` functions
2. Handle `avatar_url` uploads (if needed, via Storage API)
3. Respect `display_order` for team member ordering

### Phase 3: Partners Mutations
1. Implement `addPartner`, `updatePartner`, `deletePartner` functions
2. Handle `logo_url` uploads (if needed, via Storage API)
3. Update related events when partner is deleted (cascade handling)

### Phase 4: Gallery Mutations
1. Implement `addGalleryImage`, `updateGalleryImage`, `deleteGalleryImage` functions
2. Handle `image_url` and `thumbnail_url` uploads via Storage API
3. Support optional `event_id` and `partner_id` associations

### Data Source Strategy
- **Supabase is Source of Truth**: All data operations prioritize Supabase database
- **INITIAL_* Constants**: Remain as fallback only for development/testing scenarios
- **No Bidirectional Sync**: Not needed after Supabase rebuild; database is authoritative
- **Migration**: If legacy data needs to be migrated, use one-time migration script (not runtime sync)

### Error Handling
- **Network Errors**: Retry logic with exponential backoff
- **RLS Policy Violations**: Clear error messages indicating permission issues
- **Validation Errors**: Surface database constraint violations to user
- **Optimistic Updates**: Rollback on error, show error notification

### Performance Considerations
- **Optimistic Updates**: Update local state immediately, sync with database in background
- **Batch Operations**: Support bulk operations where appropriate
- **Caching**: Leverage React state for client-side caching
- **Refetch Strategy**: Optionally refetch after mutations to ensure consistency

