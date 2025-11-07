# Change: Implement Dashboard CMS CRUD for Team, Partners, and Gallery

## Why
- Current dashboard modules for Team, Partners, and Gallery use in-memory state setters (`updateTeam`, `updatePartners`, `updateGallery`) instead of the Supabase-backed mutations now available in `ContentContext`.
- Administrators cannot persist edits, uploads, or deletions for team members, partner logos, or gallery assets—resulting in inconsistent landing-page data and orphaned storage assets.
- Task 7 introduced hardened CRUD patterns (React Hook Form + Zod, storage validation/cleanup, structured error feedback). We need parity across all dashboard CMS sections to deliver a consistent authoring experience.

## What Changes

### Data Layer
- **Extend `ContentContext.tsx`**
  - Expose typed getters/mutations for `team_members`, `partners`, and `gallery_items` using existing Supabase tables.
  - Ensure mutation helpers return structured `{ data, error }` objects and perform storage cleanup when records are removed or media is replaced.
  - Align error handling and optimistic updates with the event management flow (Task 7).

### Team Management (`DashboardTeam.tsx`)
- Replace ad-hoc local state updates with context-powered CRUD operations.
- Introduce `DashboardTeamForm.tsx` using React Hook Form + Zod for validation, including avatar uploads to the `event-media` (or dedicated) bucket.
- Provide accessible dialogs, progress feedback, and toast notifications consistent with `DashboardEvents.tsx`.

### Partner Management (`DashboardPartners.tsx`)
- Migrate to context-powered CRUD with storage-backed logo uploads.
- Create `DashboardPartnerForm.tsx`, reusing shared UI primitives and enforcing validation for URLs, categories, and logo files.
- Surface granular toast feedback and keep deletion dialogs open on failure.

### Gallery Management (`DashboardGallery.tsx`)
- Connect to Supabase for metadata + storage operations.
- Replace inline URL entry with upload workflows (single / multiple) and validation for supported file types and sizes.
- Allow bulk selection + deletion while ensuring storage cleanup.

### Shared UI & Navigation
- Introduce reusable form fragments (e.g., `MediaUploadField`) where valuable to reduce duplication.
- Update dashboard navigation (e.g., `DashboardNav.tsx`) to highlight the active CMS section and ensure deep linking works with the custom router.

## Impact
- **Specs affected:** `admin-dashboard/spec.md` (new requirements for Team, Partner, and Gallery CMS).
- **Code touched:**
  - `src/contexts/ContentContext.tsx`
  - `src/components/dashboard/DashboardTeam.tsx`
  - `src/components/dashboard/DashboardPartners.tsx`
  - `src/components/dashboard/DashboardGallery.tsx`
  - New form components under `src/components/dashboard/`
  - `src/utils/storageHelpers.ts` (extensions or new helpers for non-event assets)
  - Dashboard navigation (`DashboardLayout.tsx`, `DashboardNav.tsx`, and router mapping)
- **Storage:** Supabase buckets must handle new media assets (team photos, partner logos, gallery images) with deterministic paths and cleanup routines.
- **Testing:** Manual and automated regression coverage for CRUD, validation, storage cleanup, and optimistic UI updates across all modules.

## Dependencies
- Task 7 (Event Management CRUD) is complete and serves as the reference implementation.
- Supabase tables `team_members`, `partners`, and `gallery_items` already exist (per previous migrations).
- UI primitives (shadcn components) and toast infrastructure are available.

## Risks & Mitigations
- **Storage leakage:** Mitigate by centralizing cleanup helpers and writing regression tests.
- **Inconsistent UX:** Reuse patterns established in Task 7 and share form field components where possible.
- **Schema drift:** Validate Supabase types (`src/supabase/types.ts`) before implementation.

## Rollout / Validation
1. Implement context mutations with unit tests (mock Supabase).
2. Wire UI forms + dialogs per module; perform manual CRUD verification in staging.
3. Run lint/tests, then update documentation / user guides.

## Open Questions
- Do we store partner logos / team avatars in the existing `event-media` bucket or create dedicated buckets?
- Should gallery uploads support drag-and-drop or remain as file input for this iteration?
- Are there RLS policies that require adjustment for these new mutations?


