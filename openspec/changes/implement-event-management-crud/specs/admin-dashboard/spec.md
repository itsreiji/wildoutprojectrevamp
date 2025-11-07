## ADDED Requirements

### Requirement: Event Management CRUD Operations
The admin dashboard SHALL provide complete Create, Read, Update, and Delete (CRUD) functionality for events, allowing administrators to manage event data and media through a user-friendly interface integrated with Supabase.

#### Scenario: Create new event with form validation
- **WHEN** an administrator navigates to the event creation page/form
- **THEN** a form is displayed with all event fields (title, description, dates, location, category, status, capacity, price range, ticket URL, featured image, gallery images)
- **AND** required fields are marked and validated
- **WHEN** the administrator fills out the form and submits
- **THEN** form validation runs (required fields, date validation, etc.)
- **AND** if validation passes, file uploads (featured image, gallery images) are processed to Supabase Storage
- **AND** the event data (including image URLs) is saved to Supabase via ContentContext `addEvent` function
- **AND** a success toast notification is displayed
- **AND** the administrator is redirected to the events list or the form is closed
- **AND** the new event appears in the events list

#### Scenario: Create event with file uploads
- **WHEN** an administrator creates a new event and uploads a featured image
- **THEN** the file is validated (type, size)
- **AND** the file is uploaded to Supabase Storage bucket (e.g., `event-media`)
- **AND** a public URL is obtained for the uploaded file
- **AND** the URL is included in the event data before saving
- **WHEN** the administrator uploads multiple gallery images
- **THEN** each file is uploaded to Supabase Storage
- **AND** all public URLs are collected and included in the event data
- **AND** partial upload failures are handled gracefully (show error for failed files, continue with successful uploads)

#### Scenario: View events list
- **WHEN** an administrator navigates to `/admin/events`
- **THEN** a table or grid displays all events from ContentContext
- **AND** each event row shows key information (title, date, venue, category, status)
- **AND** each event row has 'Edit' and 'Delete' action buttons
- **AND** a 'Create New Event' button is visible
- **AND** search/filter functionality allows filtering events by name or category
- **WHEN** no events exist
- **THEN** an empty state message is displayed

#### Scenario: Edit existing event
- **WHEN** an administrator clicks 'Edit' on an event row
- **THEN** the event edit form/page is displayed
- **AND** the form is pre-populated with the event's current data
- **WHEN** the administrator modifies fields and submits
- **THEN** form validation runs
- **AND** if new images are uploaded, they are processed to Supabase Storage
- **AND** the event data is updated in Supabase via ContentContext `updateEvent` function
- **AND** a success toast notification is displayed
- **AND** the updated event data is reflected in the events list
- **AND** changes persist after page refresh

#### Scenario: Delete event with confirmation
- **WHEN** an administrator clicks 'Delete' on an event row
- **THEN** an AlertDialog confirmation dialog is displayed
- **AND** the dialog shows the event title and asks for confirmation
- **WHEN** the administrator confirms deletion
- **THEN** the ContentContext `deleteEvent` function is called
- **AND** the event is removed from Supabase database
- **AND** associated images are deleted from Supabase Storage (handled by `deleteEvent`)
- **AND** a success toast notification is displayed
- **AND** the event is removed from the events list
- **WHEN** the administrator cancels the deletion
- **THEN** the dialog closes and no changes are made

#### Scenario: Form validation errors
- **WHEN** an administrator submits the event form with missing required fields
- **THEN** validation errors are displayed for each invalid field
- **AND** the form submission is prevented
- **AND** error messages are shown using FormMessage components
- **WHEN** an administrator uploads an invalid file (wrong type or too large)
- **THEN** a file validation error is displayed
- **AND** the invalid file is not uploaded
- **AND** the form submission is prevented

#### Scenario: Error handling for mutations
- **WHEN** an event creation/update/delete operation fails (network error, Supabase error, RLS policy violation)
- **THEN** an error toast notification is displayed with a descriptive message
- **AND** the form/dialog remains open (for create/update) or the event remains in the list (for delete)
- **AND** the user can retry the operation
- **WHEN** a file upload fails
- **THEN** an error message is shown for the specific file
- **AND** other successful uploads are preserved
- **AND** the user can retry uploading the failed file

