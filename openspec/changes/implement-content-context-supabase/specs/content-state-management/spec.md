## ADDED Requirements

### Requirement: Global Content State Management
The application SHALL provide a global state management system using React Context API that manages all content entities (events, team members, partners, gallery images, hero content, about content, and site settings) with data fetched from Supabase.

#### Scenario: Application Initialization
- **WHEN** the application mounts
- **THEN** the ContentProvider SHALL fetch all content data from Supabase tables (events, teams, partners, gallery_items, settings)
- **AND** the loading state SHALL be set to `true` during the fetch operation
- **AND** after successful fetch, loading state SHALL be set to `false`
- **AND** all fetched data SHALL be available through the `useContent` hook

#### Scenario: Data Fetching Failure
- **WHEN** the initial data fetch fails (network error, database error, missing tables)
- **THEN** the error state SHALL be populated with a user-friendly error message
- **AND** the loading state SHALL be set to `false`
- **AND** the application SHALL continue to function with empty data arrays
- **AND** error details SHALL be logged for debugging

#### Scenario: Accessing Content Data
- **WHEN** a component calls `useContent()` hook
- **THEN** the component SHALL receive access to:
  - `events: Event[]` - Array of all events
  - `team: TeamMember[]` - Array of all team members
  - `partners: Partner[]` - Array of all partners
  - `gallery: GalleryImage[]` - Array of all gallery images
  - `hero: HeroContent` - Hero section content
  - `about: AboutContent` - About section content
  - `settings: SiteSettings` - Site settings
  - `loading: boolean` - Loading state indicator
  - `error: string | null` - Error message if any

### Requirement: Event Data Mutations
The ContentContext SHALL provide mutation functions for managing event data that synchronize with Supabase.

#### Scenario: Adding a New Event
- **WHEN** `addEvent(newEvent: Omit<Event, 'id'>)` is called
- **THEN** the function SHALL:
  - Map the TypeScript Event type to the database schema
  - Insert the event into the `events` table via Supabase
  - Handle any errors during insertion
  - On success: Update the local `events` state to include the new event
  - Return a Promise that resolves on success or rejects on error

#### Scenario: Updating an Existing Event
- **WHEN** `updateEvent(id: string, updates: Partial<Event>)` is called
- **THEN** the function SHALL:
  - Map the partial Event updates to the database schema
  - Update the event in the `events` table via Supabase where `id` matches
  - Handle any errors during update
  - On success: Update the local `events` state to reflect the changes
  - Return a Promise that resolves on success or rejects on error

#### Scenario: Deleting an Event
- **WHEN** `deleteEvent(id: string)` is called
- **THEN** the function SHALL:
  - Delete the event from the `events` table via Supabase where `id` matches
  - Handle any errors during deletion
  - On success: Remove the event from the local `events` state
  - Return a Promise that resolves on success or rejects on error

### Requirement: Loading State Management
The ContentContext SHALL expose loading states to indicate when data operations are in progress.

#### Scenario: Initial Data Loading
- **WHEN** the ContentProvider mounts
- **THEN** `loading` SHALL be `true` immediately
- **AND** `loading` SHALL remain `true` until all initial data fetches complete
- **AND** `loading` SHALL be set to `false` after all fetches complete (success or failure)

#### Scenario: Loading State During Mutations
- **WHEN** a mutation function (addEvent, updateEvent, deleteEvent) is called
- **THEN** the loading state MAY be set to `true` during the operation (optional for individual operations)
- **AND** the loading state SHALL be set to `false` after the operation completes

### Requirement: Error State Management
The ContentContext SHALL expose error states and handle errors gracefully.

#### Scenario: Error Handling During Fetch
- **WHEN** an error occurs during initial data fetch
- **THEN** the error SHALL be caught and stored in the `error` state
- **AND** the error message SHALL be user-friendly (not raw database errors)
- **AND** the full error details SHALL be logged to console for debugging
- **AND** the application SHALL continue to function with empty data

#### Scenario: Error Handling During Mutations
- **WHEN** an error occurs during a mutation (addEvent, updateEvent, deleteEvent)
- **THEN** the error SHALL be caught and stored in the `error` state
- **AND** the error message SHALL be user-friendly
- **AND** the full error details SHALL be logged to console
- **AND** the Promise SHALL reject with the error for caller handling
- **AND** the local state SHALL NOT be updated if the mutation fails

### Requirement: Data Mapping Between Database and TypeScript Types
The ContentContext SHALL properly map data between Supabase database schema and TypeScript type definitions.

#### Scenario: Database to TypeScript Mapping
- **WHEN** data is fetched from Supabase
- **THEN** database column names SHALL be mapped to TypeScript property names:
  - `img` → `image_url` or `url` (depending on type)
  - `photo_url` → `photoUrl` (for TeamMember)
  - JSONB fields SHALL be properly deserialized (social_links, contact_info)
  - Date/timestamp fields SHALL be converted to appropriate TypeScript Date or string formats
  - UUID arrays SHALL be properly handled (artist_ids)

#### Scenario: TypeScript to Database Mapping
- **WHEN** data is sent to Supabase (insert/update operations)
- **THEN** TypeScript property names SHALL be mapped to database column names:
  - `image_url` or `url` → `img`
  - `photoUrl` → `photo_url`
  - Object fields SHALL be serialized to JSONB (social_links, contact_info)
  - Date objects SHALL be converted to appropriate database formats
  - UUID arrays SHALL be properly formatted (artist_ids)

### Requirement: Concurrent Data Fetching
The ContentContext SHALL fetch data from multiple tables concurrently for optimal performance.

#### Scenario: Parallel Data Fetching
- **WHEN** initial data fetch occurs
- **THEN** all Supabase queries (events, teams, partners, gallery_items, settings) SHALL be executed concurrently using `Promise.all`
- **AND** the loading state SHALL remain `true` until all queries complete
- **AND** if any query fails, the error SHALL be handled while other successful queries SHALL still populate their respective state

### Requirement: Bidirectional Data Synchronization
The ContentContext SHALL perform bidirectional synchronization between Supabase database and application state during initialization to ensure data consistency and prevent data loss.

#### Scenario: Synchronizing Data from Supabase to Landing Page
- **WHEN** data exists in Supabase but not in the application's local state (from INITIAL_* constants)
- **THEN** the synchronization process SHALL:
  - Fetch the data from Supabase
  - Add it to the local state
  - Ensure the most up-to-date version is used
  - Make the data available through the `useContent` hook

#### Scenario: Synchronizing Data from Landing Page to Supabase
- **WHEN** data exists in local state (from INITIAL_* constants) but not in Supabase
- **THEN** the synchronization process SHALL:
  - Identify the missing data in Supabase
  - Insert the data into the corresponding Supabase table
  - Preserve all data without loss
  - Update local state to reflect the synchronized state
  - Log the synchronization action for audit purposes

#### Scenario: Handling Data Conflicts
- **WHEN** the same data entity (identified by ID) exists in both Supabase and local state but with different values
- **THEN** the synchronization process SHALL:
  - Use Supabase data as the source of truth (most up-to-date)
  - Overwrite local state with Supabase data
  - Log the conflict and resolution for debugging
  - Ensure no data is lost during conflict resolution

#### Scenario: Merging Data from Both Sources
- **WHEN** both Supabase and local state contain data
- **THEN** the synchronization process SHALL:
  - Merge data from both sources intelligently
  - Preserve all unique data from both sources
  - Remove duplicates (same ID) by preferring Supabase version
  - Ensure the final merged state contains the complete, up-to-date dataset
  - Push any new local data to Supabase to maintain consistency

#### Scenario: Data Cleanup During Synchronization
- **WHEN** synchronization identifies obsolete, unused, or invalid data
- **THEN** the synchronization process SHALL:
  - Remove obsolete data from both Supabase and local state
  - Ensure no valid data is accidentally removed
  - Log cleanup actions for audit purposes
  - Maintain data integrity throughout the cleanup process

#### Scenario: Complete Data Rebuild
- **WHEN** a complete rebuild of data structure is required
- **THEN** the synchronization process SHALL:
  - Allow complete rebuild of data structure
  - Preserve all valid data from both sources during rebuild
  - Ensure no data loss occurs during the rebuild process
  - Update both Supabase and local state to the rebuilt structure
  - Verify data integrity after rebuild completion

#### Scenario: Synchronization Failure Handling
- **WHEN** synchronization fails (network error, database error, permission denied)
- **THEN** the synchronization process SHALL:
  - Handle errors gracefully without losing existing data
  - Retain local state if Supabase sync fails
  - Retain Supabase data if local state sync fails
  - Log detailed error information for debugging
  - Allow manual retry of synchronization
  - Set error state to inform the user of synchronization issues

### Requirement: Data Preservation During Synchronization
The ContentContext SHALL ensure that no data is lost during the synchronization process, regardless of the synchronization direction or strategy.

#### Scenario: Preserving All Valid Data
- **WHEN** synchronization occurs between Supabase and local state
- **THEN** all valid data from both sources SHALL be preserved
- **AND** invalid or corrupted data SHALL be handled appropriately (logged, removed, or flagged)
- **AND** data loss SHALL be prevented at all costs
- **AND** the final synchronized state SHALL contain the union of all valid data from both sources

#### Scenario: Post-Synchronization State
- **WHEN** synchronization completes successfully
- **THEN** Supabase SHALL be the single source of truth going forward
- **AND** local state SHALL reflect the synchronized data from Supabase
- **AND** all components using `useContent` SHALL have access to the complete, synchronized dataset
- **AND** future data mutations SHALL update Supabase first, then local state

