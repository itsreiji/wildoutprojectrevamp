## 1. Implementation Checklist

### 1.1 Extend ContentContext Data Layer
- [ ] Add Supabase-backed fetch helpers for `team_members`, `partners`, and `gallery_items`.
- [ ] Implement typed `add*/update*/delete*` mutations that return `{ data, error }` and perform optimistic state updates.
- [ ] Wire storage cleanup for replaced or deleted media via shared helpers (e.g., extend `storageHelpers.ts`).
- [ ] Ensure errors propagate with actionable messages for the UI.
- [ ] Add Vitest coverage mocking Supabase interactions for success/error paths.

### 1.2 Upgrade Team Management UI
- [ ] Refactor `DashboardTeam.tsx` to consume Supabase data from `ContentContext` (remove local setters).
- [ ] Create `DashboardTeamForm.tsx` using React Hook Form + Zod with file input for avatar uploads.
- [ ] Provide upload validation (type/size), progress feedback, and toast messaging.
- [ ] Keep the edit dialog open on mutation failure and surface error details.
- [ ] Verify accessibility (labels, focus management, keyboard flow) for the dialog.

### 1.3 Upgrade Partner Management UI
- [ ] Refactor `DashboardPartners.tsx` to use context-powered CRUD operations.
- [ ] Build `DashboardPartnerForm.tsx` with validation for partner metadata and logo uploads.
- [ ] Reuse shared upload helpers; ensure logo replacements clean up old assets.
- [ ] Add accessible confirmation dialog for deletions with error retry handling.
- [ ] Implement regression tests or manual scripts covering create/update/delete flows.

### 1.4 Upgrade Gallery Management UI
- [ ] Replace URL-only gallery form with Supabase upload workflow (single/multi file support).
- [ ] Provide bulk selection + deletion while batching storage cleanup.
- [ ] Implement `DashboardGalleryForm.tsx` with metadata fields and preview.
- [ ] Surface partial upload warnings and keep track of successfully uploaded paths for rollback.
- [ ] Validate grid renders loading/empty/error states consistently with other modules.

### 1.5 Shared UX & Navigation Updates
- [ ] Update dashboard navigation (`DashboardNav.tsx` / router) to highlight Team/Partners/Gallery routes using the URL-driven router.
- [ ] Extract reusable form pieces (e.g., `MediaUploadField`) where duplication occurs.
- [ ] Document the CMS workflow in project docs (README or dashboard guide).
- [ ] Perform end-to-end smoke test across all dashboard CMS sections to confirm parity with event management.

## 2. Testing & Validation
- [ ] Manual CRUD verification for Team, Partners, and Gallery (create, edit with media, delete with cleanup).
- [ ] Supabase console check to ensure records + storage objects align after operations.
- [ ] Automated unit tests for new context helpers (success + failure scenarios).
- [ ] Optional integration tests (Playwright/Cypress) for primary dashboard flows.


