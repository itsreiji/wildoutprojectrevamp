# WildOut! Project - supabase/ AGENTS.md

**Package Identity**
- This package contains Supabase database configuration and migrations
- Primary tech/framework: PostgreSQL, Supabase, SQL

## Setup & Run

```bash
# Apply migrations (via MCP only - DO NOT run locally)
# pnpm supabase db push

# Generate types (via MCP only)
# pnpm supabase gen types typescript --local > src/supabase/types.ts

# Start local Supabase (via MCP only - DO NOT run locally)
# pnpm supabase start
```

## Patterns & Conventions

### File Organization Rules
- **Migrations**: `supabase/migrations/**` - SQL migration files
- **Configuration**: `supabase/config.toml` - Supabase configuration
- **Types**: Generated types go to `src/supabase/types.ts`

### Naming Conventions
- ✅ **Migration files**: Timestamp-based with descriptive names (e.g., `20251107123000_01_database_schema.sql`)
- ✅ **Tables**: snake_case with plural names (e.g., `events`, `partners`)
- ✅ **Columns**: snake_case (e.g., `created_at`, `user_id`)
- ✅ **Functions**: snake_case with verb prefix (e.g., `get_user_events()`)

### Preferred Patterns

**Migrations:**
- ✅ DO: Follow pattern from `supabase/migrations/20251107123000_01_database_schema.sql`
- ✅ DO: Include RLS policies for all tables
- ✅ DO: Use UUIDs for primary keys
- ✅ DO: Include timestamps (`created_at`, `updated_at`)
- ✅ DO: Add proper indexes for performance
- ❌ DON'T: Use serial IDs (use UUIDs instead)

**RLS Policies:**
- ✅ DO: Include public access policies in separate migration
- ✅ DO: Include authenticated access policies
- ✅ DO: Include admin access policies
- ✅ DO: Follow pattern from `supabase/migrations/20251107123400_04_rls_public_access.sql`

**Functions:**
- ✅ DO: Use proper security definer
- ✅ DO: Include parameter validation
- ✅ DO: Handle errors appropriately

## Touch Points / Key Files

- **Main Schema**: `supabase/migrations/20251107123000_01_database_schema.sql`
- **RLS Policies**: `supabase/migrations/20251107123400_04_rls_public_access.sql`
- **Auth Schema**: `supabase/migrations/20251107123100_02_auth_schema.sql`
- **Configuration**: `supabase/config.toml`
- **Generated Types**: `src/supabase/types.ts`

## JIT Index Hints

```bash
# Find migration files
ls -la supabase/migrations/

# Find table definitions
rg -n "CREATE TABLE" supabase/migrations

# Find RLS policies
rg -n "CREATE POLICY" supabase/migrations

# Find function definitions
rg -n "CREATE FUNCTION" supabase/migrations

# Find specific table migrations
rg -n "events\|partners\|team_members" supabase/migrations
```

## Common Gotchas

- **MCP Only**: ALL Supabase commands must be run via MCP server "supabase"
- **No Local Commands**: DO NOT run `supabase start`, `db reset`, `db pull` locally
- **RLS Required**: Every table must have RLS policies
- **UUIDs**: Always use UUIDs for primary keys, not serial
- **Timestamps**: Include `created_at` and `updated_at` in all tables
- **Type Generation**: Types are generated to `src/supabase/types.ts`

## Pre-PR Checks

```bash
# Verify migrations are properly formatted
# Check that all tables have RLS policies
# Ensure no breaking changes to existing schema
```

## Database Schema Reference

### Core Tables

**Events**
- `id`: UUID (PK)
- `title`: string
- `status`: string
- `start_date`: timestamp
- `end_date`: timestamp
- `partner_id`: UUID (FK)

**Partners**
- `id`: UUID (PK)
- `name`: string
- `status`: string
- `sponsorship_level`: string

**Team Members**
- `id`: UUID (PK)
- `name`: string
- `title`: string
- `status`: string

**Gallery Items**
- `id`: UUID (PK)
- `title`: string
- `url`: string
- `event_id`: UUID (FK)

## Migration Pattern

### Recommended Migration Structure

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_description.sql

-- Create table
CREATE TABLE public.table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_table_name_name ON public.table_name(name);

-- Set up RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (in separate migration)
CREATE POLICY "Public read access" ON public.table_name
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated full access" ON public.table_name
  FOR ALL
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin full access" ON public.table_name
  FOR ALL
  TO role('admin')
  WITH CHECK (true);
```

## RLS Policy Patterns

### Standard RLS Policies

```sql
-- Public read-only access
CREATE POLICY "Public read access" ON public.table_name
  FOR SELECT
  USING (status = 'active');

-- Authenticated user access
CREATE POLICY "Authenticated access" ON public.table_name
  FOR SELECT, INSERT, UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin full access
CREATE POLICY "Admin full access" ON public.table_name
  FOR ALL
  TO role('admin')
  WITH CHECK (true);

-- Editor access (where applicable)
CREATE POLICY "Editor access" ON public.table_name
  FOR SELECT, INSERT, UPDATE
  TO role('editor')
  WITH CHECK (true);
```