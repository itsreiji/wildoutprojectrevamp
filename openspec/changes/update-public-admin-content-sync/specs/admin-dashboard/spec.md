## MODIFIED Requirements

### Requirement: Admin Dashboard Content Persistence
The admin dashboard SHALL persist all content changes to Supabase database, ensuring changes are retained across sessions and immediately reflected on the public landing page.

#### Scenario: Hero content saves persist to database
- **WHEN** an admin clicks "Save Hero Section" in the dashboard
- **THEN** the hero content SHALL be saved to the Supabase `hero_content` table
- **AND** the public landing page SHALL immediately display the updated hero content
- **AND** the changes SHALL persist across browser restarts and deployments

#### Scenario: About content saves persist to database
- **WHEN** an admin saves changes to the about section
- **THEN** the about content SHALL be saved to the Supabase `about_content` table
- **AND** the landing page about section SHALL update in real-time
- **AND** loading indicators SHALL show during the save operation

#### Scenario: Site settings saves persist to database
- **WHEN** an admin updates site settings (contact info, social media)
- **THEN** the settings SHALL be saved to the Supabase `site_settings` table
- **AND** all public pages using these settings SHALL update immediately
- **AND** error messages SHALL display if the save operation fails

### Requirement: Admin Dashboard URL-Based Navigation with Configurable Paths
The admin dashboard SHALL use URL-based routing with configurable base paths, enabling direct links and supporting flexible deployment configurations.

#### Scenario: Dashboard routes work under /sadmin
- **WHEN** a user navigates to `/sadmin/events`
- **THEN** the Dashboard component SHALL extract the sub-path `events` from the URL
- **AND** the Dashboard SHALL render the `DashboardEvents` component
- **AND** the DashboardLayout SHALL highlight the "Events" navigation item as active

#### Scenario: Navigation links update URL with configurable base path
- **WHEN** a user clicks the "Team" navigation link in the sidebar
- **THEN** the router's `navigate` function SHALL be called with `/sadmin/team`
- **AND** the URL SHALL update to `/sadmin/team`
- **AND** the Dashboard SHALL render the `DashboardTeam` component

#### Scenario: Direct URL navigation works with base path
- **WHEN** a user types `/sadmin/partners` directly in the browser address bar
- **THEN** the router SHALL recognize the path
- **AND** the Dashboard SHALL render the `DashboardPartners` component
- **AND** the DashboardLayout SHALL highlight the "Partners" navigation item as active

## ADDED Requirements

### Requirement: Content Import and Synchronization
The application SHALL provide tools to import existing content configuration into Supabase, ensuring seamless migration from local dummy data to database-backed content.

#### Scenario: Content import script seeds database
- **WHEN** the import script is run against the current repository
- **THEN** all hero, about, and settings content SHALL be extracted from code constants
- **AND** the content SHALL be inserted into appropriate Supabase tables
- **AND** the admin dashboard SHALL immediately show the imported content

#### Scenario: Import script handles empty database state
- **WHEN** the database tables are empty
- **THEN** the import script SHALL detect this condition
- **AND** SHALL populate all tables with repository configuration
- **AND** SHALL provide feedback on successful import operations
