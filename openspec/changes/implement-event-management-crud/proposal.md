# Change: Implement Event Management CRUD in Dashboard

## Why
`DashboardEvents.tsx` now delivers the baseline CRUD workflow, but there are reliability gaps we need to close before we can treat it as production-ready:
- File uploads lack size/type validation or progress feedback, and the current replacement flow deletes an existing featured image before confirming the new upload succeeded.
- The modal-driven edit experience depends on `DashboardEventForm.tsx` maintaining consistent defaults and reset behaviour; today it does not reset when switching between events in the same dialog session.
- Proposal documentation still references legacy filenames (`DashboardEventsNew.tsx`), creating confusion for reviewers and increasing the risk of duplicating work.

This change hardens the Supabase-backed mutations, improves UX resilience, and aligns our documentation with the current architecture so implementation can proceed with clarity.

## What Changes

### Modified Components
- **MODIFY** `src/components/dashboard/DashboardEvents.tsx`:
  - Replace local state form management with React Hook Form
  - Integrate with ContentContext mutation functions (`addEvent`, `updateEvent`, `deleteEvent`)
  - Add Supabase Storage integration for `featured_image` and `gallery_images` uploads
  - Replace `confirm()` with `AlertDialog` component for deletion confirmation
  - Add proper form validation using React Hook Form and Zod (if available)
  - Update form submission to call ContentContext mutation functions instead of local state updates

### Form Abstraction
- **REFINE** `src/components/dashboard/DashboardEventForm.tsx`:
  - Ensure form abstraction supports both create and edit flows
  - Uses React Hook Form for form state management with Zod resolver
  - Integrates with shadcn/ui Form components
  - Handles file upload UI for featured image and gallery images
  - Accepts `defaultValues` prop for editing existing events and resets when the editing target changes

### Routing Integration
- **CONFIRM** custom router mapping ensures `/admin/events` renders the updated `DashboardEvents` component
- **MAINTAIN** in-modal create/edit flow (no extra route files required) while ensuring deep links continue to load events view correctly
- **OPTIONAL**: Introduce dedicated edit route only if modal-based UX proves insufficient in testing

### Storage Integration
- **ADD** Supabase Storage upload functionality:
  - Upload `featured_image` to `event-media` bucket (or appropriate bucket)
  - Upload `gallery_images` array to `event-media` bucket
  - Get public URLs after upload
  - Include URLs in event data before calling mutation functions
  - Handle upload errors and progress states

### No Breaking Changes
- Existing `DashboardEvents.tsx` component will be enhanced, not replaced
- ContentContext API remains unchanged (mutation functions already exist)
- Dashboard routing structure remains the same

## Impact

- **Affected specs**: `admin-dashboard` capability (adds event CRUD requirements)
- **Affected code**:
  - **Modified**: `src/components/dashboard/DashboardEvents.tsx`
  - **Modified**: `src/components/dashboard/DashboardEventForm.tsx`
  - **Potential follow-up**: `src/components/router/index.tsx` if dedicated routes are introduced
  - **Dependencies**:
    - `src/contexts/ContentContext.tsx` (already has mutation functions)
    - `src/supabase/client.ts` (for Storage API access)
    - `src/components/ui/` components (Form, AlertDialog, etc. - already exist)
- **Database operations**:
  - **Read**: Uses existing `events` from ContentContext (fetched from `public_events_view`)
  - **Create**: Calls `addEvent` mutation function (inserts into `events` table)
  - **Update**: Calls `updateEvent` mutation function (updates `events` table)
  - **Delete**: Calls `deleteEvent` mutation function (deletes from `events` table)
- **Storage operations**:
  - **Upload**: `featured_image` and `gallery_images` to Supabase Storage bucket
  - **Delete**: Remove associated images from Storage when event is deleted (handled by `deleteEvent` in ContentContext)
- **Breaking changes**: None (backward compatible enhancement)

## Dependencies

- **Task 4** (ContentContext): ✅ Complete - Mutation functions (`addEvent`, `updateEvent`, `deleteEvent`) are implemented
- **Task 6** (Dashboard Router): ✅ Complete - URL-based routing is implemented
- **Task 3** (UI Components): ✅ Complete - Form, Dialog, AlertDialog components are available

## Implementation Notes

### File Upload Strategy
- Use Supabase Storage API (`supabaseClient.storage.from('event-media').upload()`)
- Validate file type and size client-side before upload; surface validation feedback in the form
- Add upload progress feedback for featured and gallery images
- Defer deletion of existing assets until replacement uploads succeed, then clean up superseded files
- Store public URLs in event data and handle partial gallery upload failures gracefully

### Form Management
- Use React Hook Form for form state and validation
- Integrate with shadcn/ui Form components (`FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`)
- Use Zod for schema validation (already present) and expand validation messages where needed
- Reset form state when `defaultValues` change so editing different events in a single dialog shows the correct values
- Handle form submission errors from Supabase and display contextual toasts/messages

### Edit Functionality
- Continue using the dialog/modal experience for editing while ensuring the router can deep-link to `/admin/events`
- Fetch event data through ContentContext and pre-populate the form reliably
- Ensure switching between events reinitialises the form (see reset behaviour above)
- Evaluate the need for a dedicated edit route after validating modal UX with stakeholders

### Delete Confirmation
- Confirm `AlertDialog` surfaces the event title and provides accessible copy
- Surface errors from `deleteEvent` via toast notifications and keep the dialog open on failure
- Verify Supabase storage cleanup occurs only after the database delete succeeds or handle rollbacks appropriately

