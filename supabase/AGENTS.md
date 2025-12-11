# Supabase Directory - AGENTS.md

## 1. Package Identity
- **Scope**: Database migrations, seeds, configuration, and generated types.
- **Tech**: PostgreSQL, SQL, Supabase CLI.

## 2. Patterns & Conventions
- **Migrations**:
    - Located in `supabase/migrations/`.
    - Format: `YYYYMMDDHHMMSS_name.sql`.
    - ✅ DO: Use `pnpm db:migration:new` (if script exists) or Supabase CLI.
- **Seeds**:
    - `supabase/seed.sql` or specific seed files in migrations.
- **Types**:
    - `types/supabase.ts` is generated from the schema.
    - Do NOT edit `types/supabase.ts` manually.

### Examples
- **Migration**: `supabase/migrations/20251107123000_01_database_schema.sql`
- **Config**: `supabase/config.toml`

## 3. Touch Points
- **Client**: `lib/supabase/client.ts` uses the schema.
- **Scripts**: `scripts/seed-public-content.ts`.

## 4. JIT Index Hints
- Find migrations: `glob "supabase/migrations/*.sql"`
- Search schema definition: `search_file_content pattern="CREATE TABLE table_name" dir_path="supabase/migrations"`