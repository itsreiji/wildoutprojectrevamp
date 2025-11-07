## ADDED Requirements

### Requirement: Normalized Database Schema
The database SHALL use a normalized schema with proper foreign key relationships, ENUM types for status fields, and junction tables for many-to-many relationships.

#### Scenario: Event-Artist relationship via junction table
- **WHEN** an event is created with multiple artists
- **THEN** the relationship is stored in the `event_artists` junction table with foreign keys to both `events` and `artists` tables
- **AND** the `events` table does not contain string or array fields for artist data

#### Scenario: Status fields use ENUM types
- **WHEN** a status field is defined (e.g., `event_status`, `user_status`)
- **THEN** it uses a PostgreSQL ENUM type (e.g., `CREATE TYPE event_status AS ENUM ('draft', 'published', 'archived')`)
- **AND** the database enforces valid enum values

### Requirement: Migration Workflow
The database schema SHALL be managed through Supabase CLI migrations stored in version control.

#### Scenario: Local development reset
- **WHEN** `supabase db reset` is executed locally
- **THEN** all migrations in `supabase/migrations/` are applied in order
- **AND** the database schema matches the migration files exactly

#### Scenario: Production deployment
- **WHEN** migrations are ready for production
- **THEN** `supabase migration up` applies all new migrations to the remote database
- **AND** the migration history is tracked and auditable

### Requirement: Row Level Security (RLS)
All database tables SHALL have RLS enabled with policies based on user roles and content status.

#### Scenario: Public read access for published content
- **WHEN** an anonymous (unauthenticated) user queries the `events` table
- **THEN** only rows where `status = 'published'` are returned
- **AND** INSERT, UPDATE, DELETE operations are denied

#### Scenario: Authenticated user profile management
- **WHEN** an authenticated user attempts to update their profile
- **THEN** the operation succeeds only if `auth.uid() = profiles.id`
- **AND** attempts to modify other users' profiles are denied

#### Scenario: Admin full access
- **WHEN** a user with 'admin' role performs any operation on content tables
- **THEN** all operations (SELECT, INSERT, UPDATE, DELETE) are permitted
- **AND** the role is verified using the `get_current_user_role()` function

### Requirement: Role-Based Access Control (RBAC)
The system SHALL support role-based permissions through a `roles` table and `user_roles` junction table.

#### Scenario: User role assignment
- **WHEN** a user is assigned a role
- **THEN** the relationship is stored in the `user_roles` table
- **AND** the role can be retrieved via `get_current_user_role()` function

#### Scenario: Automatic profile creation
- **WHEN** a new user signs up via Supabase Auth
- **THEN** a corresponding row is automatically created in the `profiles` table
- **AND** the profile `id` matches `auth.users.id`

### Requirement: Storage Bucket Configuration
The system SHALL use segregated storage buckets with appropriate access policies.

#### Scenario: Public assets bucket
- **WHEN** a file is uploaded to the `public-assets` bucket
- **THEN** it is accessible via public URL without authentication
- **AND** upload/delete operations require admin or editor role

#### Scenario: Event media bucket
- **WHEN** a file is uploaded to the `event-media` bucket
- **THEN** access is controlled by RLS policies
- **AND** only users with 'admin' or 'editor' roles can upload/delete
- **AND** public read access is granted for published events

#### Scenario: Profile pictures bucket
- **WHEN** a user uploads their profile picture
- **THEN** the upload succeeds only if `auth.uid() = owner`
- **AND** admins can also upload/update any profile picture

### Requirement: Edge Functions Infrastructure
The system SHALL have Edge Functions configured for secure server-side operations.

#### Scenario: Local Edge Function development
- **WHEN** `supabase functions serve` is executed
- **THEN** Edge Functions are available at local endpoints
- **AND** environment variables are loaded from `.env` file

#### Scenario: Edge Function deployment
- **WHEN** `supabase functions deploy <function-name>` is executed
- **THEN** the function is deployed to the remote Supabase project
- **AND** the function is accessible via its public URL

### Requirement: TypeScript Type Generation
The frontend application SHALL use TypeScript types generated from the database schema.

#### Scenario: Type generation after schema changes
- **WHEN** `supabase gen types typescript --local` is executed
- **THEN** types are generated in `src/supabase/database.types.ts`
- **AND** the types match the current database schema exactly

#### Scenario: Type validation
- **WHEN** the frontend application is compiled
- **THEN** all Supabase client operations are type-safe
- **AND** IntelliSense provides correct autocompletion for tables and columns

### Requirement: Database Seeding
The system SHALL include a seed script for initial data setup.

#### Scenario: Seed script execution
- **WHEN** `supabase db reset` is executed
- **THEN** the `supabase/seed.sql` file is automatically executed
- **AND** default roles ('admin', 'editor', 'member') are created
- **AND** a default admin user is created if specified

### Requirement: Production Configuration
The Supabase project SHALL be configured for production deployment.

#### Scenario: Production settings review
- **WHEN** the `supabase/config.toml` file is reviewed
- **THEN** all settings are appropriate for production
- **AND** JWT expiry, email signup, and SMTP settings are configured

#### Scenario: Production migration documentation
- **WHEN** migrations are ready for production
- **THEN** a documented procedure exists for deployment
- **AND** the procedure includes rollback steps if needed

