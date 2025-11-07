## ADDED Requirements

### Requirement: Database Schema Discovery
The application SHALL first examine the actual database structure before generating types and creating the client.

#### Scenario: All tables are discovered and documented
- **WHEN** the discovery phase begins
- **THEN** all tables in the public schema are listed using Supabase MCP server
- **AND** for each table, column names, data types, constraints, and relationships are documented
- **AND** sample data (if available) is examined to understand data structure

#### Scenario: Schema discrepancies are identified
- **WHEN** the discovered schema is compared with expected structure
- **THEN** differences in table names, column names, or data types are documented
- **AND** a mapping strategy is created to handle these discrepancies
- **AND** adjustments are made to type generation and implementation plans

### Requirement: Supabase Client Configuration
The application SHALL provide a centralized, typed Supabase client instance for all database interactions.

#### Scenario: Client is initialized with environment variables
- **WHEN** the application loads
- **THEN** the Supabase client is initialized using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from environment variables
- **AND** the client is a singleton instance exported from `src/supabase/client.ts`

#### Scenario: Client uses TypeScript types from database schema
- **WHEN** the Supabase client is created
- **THEN** it is typed with the `Database` interface generated from the Supabase schema
- **AND** all database queries provide type safety and autocomplete

#### Scenario: Missing environment variables are handled
- **WHEN** `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing
- **THEN** the application provides a clear error message
- **AND** the client initialization fails gracefully

### Requirement: Environment Variable Management
The application SHALL use environment variables for Supabase credentials, following Vite's convention.

#### Scenario: Environment variables use VITE_ prefix
- **WHEN** environment variables are defined
- **THEN** they use the `VITE_` prefix (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- **AND** they are accessible via `import.meta.env.VITE_*` in the application

#### Scenario: Sensitive credentials are not committed
- **WHEN** environment variables are set
- **THEN** `.env.local` file is in `.gitignore`
- **AND** `.env.example` file exists with placeholder values for documentation

### Requirement: TypeScript Type Generation
The application SHALL have TypeScript types generated from the Supabase database schema.

#### Scenario: Types are generated from current schema
- **WHEN** TypeScript types are generated
- **THEN** they reflect the current database schema (tables, columns, relationships)
- **AND** the `Database` interface includes a `public` schema with all tables

#### Scenario: Types are kept in sync with database
- **WHEN** database schema changes
- **THEN** TypeScript types can be regenerated using Supabase CLI or MCP server
- **AND** the types file is located at `src/supabase/types.ts`

### Requirement: Client Singleton Pattern
The application SHALL provide a single Supabase client instance that can be imported throughout the application.

#### Scenario: Client is imported and used consistently
- **WHEN** a component or utility needs to interact with Supabase
- **THEN** it imports the client from `src/supabase/client.ts`
- **AND** all database operations use this same client instance

#### Scenario: Client provides type-safe queries
- **WHEN** a developer uses the client to query a table
- **THEN** TypeScript provides autocomplete for table names and columns
- **AND** type errors are caught at compile time for invalid queries

### Requirement: Client Connection Verification
The application SHALL verify that the Supabase client can successfully connect to the database.

#### Scenario: Basic connection test succeeds
- **WHEN** a basic query is executed (e.g., `supabaseClient.from('events').select('*').limit(1)`)
- **THEN** the query completes without connection errors
- **AND** the response data or error is logged for verification

