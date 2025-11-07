## 1. Implementation Checklist

### 1.1 Extend ContentContext Data Layer
- [x] Add Supabase-backed fetch helpers for `team_members`, `partners`, and `gallery_items`.
- [x] Implement typed `add*/update*/delete*` mutations that return `{ data, error }` and perform optimistic state updates.
- [x] Wire storage cleanup for replaced or deleted media via shared helpers (e.g., extend `storageHelpers.ts`).
  - **FIXED:** Team mutations now correctly reference `avatar_url` (not `photoUrl`)
  - **FIXED:** Gallery mutations now correctly handle `image_urls` array (not single `url` field)
- [x] Ensure errors propagate with actionable messages for the UI.
- [x] Add Vitest coverage mocking Supabase interactions for success/error paths.

### 1.2 Upgrade Team Management UI
- [x] Refactor `DashboardTeam.tsx` to consume Supabase data from `ContentContext` (remove local setters).
- [x] Create `DashboardTeamForm.tsx` using React Hook Form + Zod with file input for avatar uploads.
- [x] Provide upload validation (type/size), progress feedback, and toast messaging.
- [x] Keep the edit dialog open on mutation failure and surface error details.
- [x] Verify accessibility (labels, focus management, keyboard flow) for the dialog.

### 1.3 Upgrade Partner Management UI
- [x] Refactor `DashboardPartners.tsx` to use context-powered CRUD operations.
- [x] Build `DashboardPartnerForm.tsx` with validation for partner metadata and logo uploads.
- [x] Reuse shared upload helpers; ensure logo replacements clean up old assets.
- [x] Add accessible confirmation dialog for deletions with error retry handling.
- [x] Implement regression tests or manual scripts covering create/update/delete flows.

### 1.4 Upgrade Gallery Management UI
- [x] Replace URL-only gallery form with Supabase upload workflow (single/multi file support).
  - **FIXED:** Now correctly handles `image_urls` array field for batch cleanup
- [x] Provide bulk selection + deletion while batching storage cleanup.
- [x] Implement `DashboardGalleryForm.tsx` with metadata fields and preview.
- [x] Surface partial upload warnings and keep track of successfully uploaded paths for rollback.
- [x] Validate grid renders loading/empty/error states consistently with other modules.

### 1.5 Shared UX & Navigation Updates
- [x] Update dashboard navigation (`DashboardNav.tsx` / router) to highlight Team/Partners/Gallery routes using the URL-driven router.
- [x] Extract reusable form pieces (e.g., `MediaUploadField`) where duplication occurs.
- [x] Document the CMS workflow in project docs (README or dashboard guide).
- [x] Perform end-to-end smoke test across all dashboard CMS sections to confirm parity with event management.

## 2. Testing & Validation
- [x] Manual CRUD verification for Team, Partners, and Gallery (create, edit with media, delete with cleanup).
- [x] Supabase console check to ensure records + storage objects align after operations.
- [x] Automated unit tests for new context helpers (success + failure scenarios).
- [x] Optional integration tests (Playwright/Cypress) for primary dashboard flows.

## 3. Bug Fixes Applied

### Critical Fixes (Applied Post-Initial Implementation)
- [x] **TeamMember field mismatch:** Updated `updateTeamMember` and `deleteTeamMember` to use correct `avatar_url` field instead of `photoUrl`
- [x] **GalleryImage field mismatch:** Updated `updateGalleryImage` and `deleteGalleryImage` to correctly handle `image_urls` JSON array instead of single `url` field
- [x] **Storage cleanup:** Verified all cleanup operations now reference correct fields and will execute properly
- [x] **TypeScript validation:** All field references are now type-safe and match the database schema


