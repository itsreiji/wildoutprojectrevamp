## ADDED Requirements

### Requirement: Team Management CMS
The admin dashboard SHALL provide a Supabase-backed interface for managing team member records, including media uploads and validation.

#### Scenario: Create team member with avatar
- **WHEN** an administrator opens the "Add Team Member" dialog in `DashboardTeam`
- **AND** enters required fields (name, role, email) and selects an avatar image
- **AND** submits the form
- **THEN** the system SHALL validate the image type and size before upload
- **AND** upload the avatar to Supabase Storage
- **AND** persist the team member record to Supabase via `ContentContext.addTeamMember`
- **AND** display success feedback and refresh the list without a full page reload

#### Scenario: Edit team member details
- **WHEN** an administrator edits an existing team member
- **AND** updates metadata or replaces the avatar
- **THEN** the form SHALL preload existing values
- **AND** replacement avatars SHALL trigger deletion of the previous file after the new upload succeeds
- **AND** the updated record SHALL be persisted via `ContentContext.updateTeamMember`
- **AND** the dialog SHALL remain open if an error occurs, showing an explanatory message

#### Scenario: Delete team member
- **WHEN** an administrator confirms deletion for a team member
- **THEN** the record SHALL be removed from Supabase via `ContentContext.deleteTeamMember`
- **AND** associated storage assets SHALL be cleaned up using shared helpers
- **AND** success or failure toasts SHALL surface the result to the user

### Requirement: Partner Management CMS
The admin dashboard SHALL allow administrators to create, edit, and delete partner profiles with logo uploads using Supabase-backed storage and database operations.

#### Scenario: Create partner with logo
- **WHEN** an administrator submits the partner form with required metadata and a logo file
- **THEN** the logo SHALL be validated and uploaded to Supabase Storage
- **AND** the partner record SHALL be inserted via `ContentContext.addPartner`
- **AND** the UI SHALL display success feedback and reflect the new partner in the list

#### Scenario: Update partner information
- **WHEN** an administrator edits a partner
- **AND** modifies metadata or replaces the logo
- **THEN** the form SHALL surface validation errors inline
- **AND** new logos SHALL replace old assets, cleaning up superseded files
- **AND** updates SHALL be persisted via `ContentContext.updatePartner`

#### Scenario: Delete partner with confirmation
- **WHEN** an administrator confirms deletion in the accessible dialog
- **THEN** the partner record SHALL be removed from Supabase via `ContentContext.deletePartner`
- **AND** associated logos SHALL be deleted from storage
- **AND** the dialog SHALL remain open on failure, allowing retry or cancellation

### Requirement: Gallery Management CMS
The admin dashboard SHALL provide a gallery management interface supporting media uploads, bulk actions, and metadata editing with Supabase persistence.

#### Scenario: Upload new gallery image
- **WHEN** an administrator uploads one or more images using the gallery form
- **THEN** each file SHALL be validated (type, size) and uploaded to Supabase Storage with unique paths
- **AND** the gallery metadata SHALL be saved via `ContentContext.addGalleryImage`
- **AND** the grid SHALL update to include the new images with previews

#### Scenario: Bulk delete gallery images
- **WHEN** an administrator selects multiple images and confirms deletion
- **THEN** the selected records SHALL be removed via `ContentContext.deleteGalleryImage`
- **AND** all associated files SHALL be removed from storage in batch
- **AND** toast notifications SHALL indicate success or enumerate failures

#### Scenario: Edit gallery metadata
- **WHEN** an administrator edits a gallery item’s caption or associated event
- **THEN** the form SHALL preload metadata, validate inputs, and persist changes via `ContentContext.updateGalleryImage`
- **AND** UI feedback SHALL confirm success or expose errors without closing the dialog automatically


