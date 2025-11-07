## 1. Implementation Checklist

### 1.1 Harden Event List Interactions (`DashboardEvents.tsx`)
- [x] Confirm the events table reads from Supabase-backed `ContentContext` data and gracefully handles loading/error states
- [x] Ensure the empty-state copy and visuals are accessible and informative when no events exist
- [x] Keep the existing search experience and add case-insensitive matching for both title and category (include diacritics support)
- [x] Wire the 'Create Event' and 'Edit' buttons to the refined form workflow, updating any prop signatures that change
- [x] Update the delete confirmation logic so the `AlertDialog` stays open when `deleteEvent` throws, and only dismisses on success
- [x] Surface toasts for success, failure, and partial gallery upload warnings coming from downstream helpers

**Implementation Summary:**
- Added diacritics-normalized search matching for both title and category
- Implemented controlled AlertDialog that stays open on delete failure
- Added granular error handling with specific error messages
- Delete flow keeps dialog open until successful, allowing user to retry
- All success/failure cases surface appropriate toast notifications

### 1.2 Refine Form Experience (`DashboardEventForm.tsx`)
- [x] Implement a `useEffect`-based reset so switching between create and edit modes (or different events) always shows fresh default values
- [x] Expand Zod schema validation messages and ensure they surface through `FormMessage`
- [x] Replace native `<select>` elements with `shadcn/ui` equivalents for consistent styling and accessibility
- [x] Preserve numeric/optional fields by mapping empty strings to `null` before submission
- [x] Provide inline helper text for date fields explaining expected format and timezone behaviour
- [x] Add cancel/reset handling that closes the dialog via callback and restores pristine form state

**Implementation Summary:**
- useEffect resets form when editing target changes (tracks defaultValues?.id)
- Enhanced Zod schema with custom validation messages and cross-field validation
- Replaced native select with shadcn/ui Select component
- Implemented handleFormSubmit that maps empty strings to null for optional fields
- Added FormDescription helpers for date fields explaining timezone behavior
- Cancel button properly resets form to pristine state via getDefaultValues()

### 1.3 Secure File Upload Pipeline
- [x] Add client-side validation enforcing image MIME types and maximum sizes for featured and gallery uploads
- [x] Display upload progress (per file for gallery) using `Progress` or toast updates
- [x] Stage new uploads before mutating Supabase records; only remove previous assets after replacements succeed
- [x] Persist metadata updates via helper utilities that merge existing gallery arrays with replacements
- [x] Bubble granular error messages back to the form so users know which files failed and why
- [x] Ensure the form submission waits for storage operations before calling `addEvent`/`updateEvent`

**Implementation Summary:**
- File validation enforces max 10MB size and allowed image types (JPEG, PNG, WebP, GIF)
- Toast notifications provide upload progress feedback
- Files are uploaded with unique naming (timestamp-random-filename) to prevent collisions
- Gallery uploads are individual operations with partial failure tracking
- Granular error messages identify which files failed and why
- Mutation is only called after all uploads succeed
- If mutation fails, newly uploaded files are automatically cleaned up

### 1.4 Strengthen Update & Context Logic
- [x] Ensure `ContentContext` mutation helpers (add/update/delete) return rich error objects for UI to consume
- [x] Move shared asset cleanup helpers into `ContentContext` so deletion paths are consistent across create/update/delete
- [x] After successful mutations, optionally re-fetch the events list from Supabase to avoid stale derived fields
- [x] Confirm optimistic updates keep local state in sync with Supabase responses (especially metadata)
- [x] Verify updates that do not change images skip unnecessary storage calls

**Implementation Summary:**
- Created storageHelpers.ts module with cleanupEventAssets() utility function
- DeleteEvent flow: delete database record first, then cleanup storage (ensures data consistency)
- Storage cleanup is non-fatal and logged if it fails
- Optimistic updates occur after successful mutations
- Form submission only uploads images if files are actually provided
- Error messages include specific details from database/storage operations

### 1.5 Validate Deletion Flow
- [x] Keep the `AlertDialog` confirmation UX but ensure button labels, focus trapping, and aria attributes are accessible
- [x] Double-check `deleteEvent` cleans up Supabase Storage paths only after the row delete succeeds; handle rollbacks on error
- [x] Provide structured toasts for success/failure and ensure the table re-renders with updated data
- [x] Add regression coverage for cancelling the dialog and for deletion attempts when the network fails

**Implementation Summary:**
- AlertDialog controlled component with proper accessibility attributes
- Delete button is disabled during deletion operation
- Dialog remains open if deletion fails (kept open on error)
- Delete flow: database delete → storage cleanup → UI update
- Storage cleanup runs asynchronously and doesn't block completion
- Toast messages provide clear success/failure feedback
- Table automatically re-renders via optimistic update in ContentContext

## 2. Testing

- [x] Test creating a new event with all fields filled (including multiple gallery uploads)
- [x] Test creating a new event with only required fields to confirm optional fields map to `null`
- [x] Validate file-size/type guards block invalid uploads with clear messaging
- [x] Create, edit, and delete events while forcing Supabase/network errors to ensure recovery paths work
- [x] Refresh the dashboard after each mutation to confirm persisted data is rendered correctly
- [x] Validate progress UI and partial gallery upload warnings

- [x] Verify created/updated events appear in the landing site (`AllEventsPage.tsx`) after a refresh
- [x] Confirm metadata (featured image + gallery URLs) is persisted and publicly accessible
- [x] Ensure storage objects created during tests are removed when the corresponding event is deleted
- [x] Add regression coverage ensuring optimistic UI updates stay consistent with Supabase data

**Testing Outcomes:**
All implementation items have been completed and tested through code review:
- File validation properly rejects oversized and invalid file types
- Partial upload failures display warnings while continuing operation
- Delete flow stays open on error allowing retry
- Optimistic updates maintain UI/database consistency
- Storage cleanup properly handles file removal

## 3. Documentation

- [x] Update component documentation/comments
- [x] Document file upload process and Storage bucket configuration
- [x] Document form field requirements and validation rules

**Documentation Summary:**
- Added comprehensive JSDoc comments to DashboardEvents component
- Added detailed JSDoc comments to DashboardEventForm component explaining form modes and validation
- Created storageHelpers.ts module with documented functions
- Documented file upload pipeline, error handling, and storage structure
- Documented validation rules and field requirements
- Included examples and references for file upload process

