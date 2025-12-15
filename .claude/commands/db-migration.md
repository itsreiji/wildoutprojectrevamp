# Create Database Migration

Create a new database migration for the WildOut! project following established patterns.

## Steps

1. **Analyze Requirements**: Understand the database changes needed
2. **Check Existing Schema**: Review current database structure
3. **Create Migration File**: Generate migration with proper naming
4. **Write Migration**: Implement up and down functions
5. **Review Safety**: Ensure no data loss
6. **Test Migration**: Verify locally
7. **Document Changes**: Update migration documentation
8. **Commit Migration**: Add to version control

## Command Usage

```bash
/db-migration <description>
/db-migration add_instagram_field_to_team_members
```

## Detailed Process

### 1. Analyze Requirements

- **Type of Change**: New table, modify table, add column, etc.
- **Data Impact**: Will existing data be affected?
- **Backward Compatibility**: Can this be rolled back safely?
- **Dependencies**: Are there other tables affected?

### 2. Check Existing Schema

```bash
# Check current database schema
pnpm supabase db diff

# Review existing migrations
ls -la supabase/migrations/

# Check specific table structure
pnpm supabase db describe table_name
```

### 3. Create Migration File

```bash
# Create new migration file
pnpm supabase migration create $ARGUMENTS

# Example:
pnpm supabase migration create add_instagram_field_to_team_members
```

### 4. Write Migration

Follow the established migration pattern:

```sql
-- Example: Adding instagram field to team_members table

-- Up migration (apply changes)
CREATE OR REPLACE FUNCTION public.up() RETURNS void AS $$
BEGIN
  -- Check if column already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'instagram'
  ) THEN
    -- Add the new column
    ALTER TABLE team_members 
    ADD COLUMN instagram varchar(255);
    
    -- Add comment for documentation
    COMMENT ON COLUMN team_members.instagram 
    IS 'Team member Instagram handle';
    
    -- Update RLS policies if needed
    -- Example: ALTER POLICY "Team members are viewable by all." ON team_members
    -- RENAME TO "Team members are viewable by all with instagram.";
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Down migration (revert changes)
CREATE OR REPLACE FUNCTION public.down() RETURNS void AS $$
BEGIN
  -- Check if column exists before removing
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'instagram'
  ) THEN
    -- Remove the column
    ALTER TABLE team_members 
    DROP COLUMN instagram;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### 5. Review Safety Checklist

- ✅ **Data Preservation**: No existing data will be lost
- ✅ **Rollback Possible**: Down migration works correctly
- ✅ **RLS Updated**: Row Level Security policies updated if needed
- ✅ **Indexes Considered**: Proper indexes for performance
- ✅ **Constraints Added**: Appropriate constraints (NOT NULL, etc.)
- ✅ **Comments Added**: Documentation for new fields

### 6. Test Migration

```bash
# Apply migration locally
pnpm supabase db reset
pnpm supabase migration up

# Verify migration
pnpm supabase db describe team_members

# Test rollback
pnpm supabase migration down
pnpm supabase migration up

# Run application tests
pnpm test
```

### 7. Document Changes

Update the migration documentation:

```markdown
# Migration: add_instagram_field_to_team_members

## Description
Adds an `instagram` field to the `team_members` table to store Instagram handles.

## Changes
- **Table**: `team_members`
- **New Column**: `instagram` (varchar, nullable)
- **Purpose**: Store team member Instagram handles for social media integration

## Impact
- **Data**: No data loss, new column is nullable
- **Performance**: Minimal impact, indexed if needed
- **RLS**: No changes to existing policies required
- **API**: New field available in team member responses

## Rollback
Safe to rollback - simply drops the new column without affecting other data.

## Testing
- ✅ Migration applies successfully
- ✅ Rollback works correctly
- ✅ Application tests pass
- ✅ API responses include new field
```

### 8. Commit Migration

```bash
# Add migration to git
git add supabase/migrations/*

# Commit with descriptive message
git commit -m "feat(db): add instagram field to team members table"

# Push to repository
git push origin dev
```

## Migration Patterns

### Common Migration Types

#### 1. Add Column

```sql
-- Up
ALTER TABLE table_name ADD COLUMN column_name data_type;

-- Down  
ALTER TABLE table_name DROP COLUMN column_name;
```

#### 2. Create Table

```sql
-- Up
CREATE TABLE table_name (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Down
DROP TABLE table_name;
```

#### 3. Add Constraint

```sql
-- Up
ALTER TABLE table_name ADD CONSTRAINT constraint_name CHECK (condition);

-- Down
ALTER TABLE table_name DROP CONSTRAINT constraint_name;
```

#### 4. Create Index

```sql
-- Up
CREATE INDEX index_name ON table_name (column_name);

-- Down
DROP INDEX index_name;
```

### Best Practices

✅ **DO**:
- Use `IF NOT EXISTS` / `IF EXISTS` for safety
- Add comments for documentation
- Test both up and down migrations
- Consider data migration for existing records
- Update RLS policies if needed

❌ **DON'T**:
- Drop tables without backup
- Modify data without transaction
- Forget to update related RLS policies
- Create migrations that can't be rolled back
- Add breaking changes without deprecation period

## Example: Complex Migration

```sql
-- Migration: create_events_artists_junction_table

-- Up
CREATE OR REPLACE FUNCTION public.up() RETURNS void AS $$
BEGIN
  -- Create junction table for many-to-many relationship
  CREATE TABLE IF NOT EXISTS events_artists (
    event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    position integer,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (event_id, artist_id)
  );
  
  -- Add comment
  COMMENT ON TABLE events_artists IS 'Junction table for events and artists';
  
  -- Create index for performance
  CREATE INDEX IF NOT EXISTS idx_events_artists_event_id ON events_artists(event_id);
  CREATE INDEX IF NOT EXISTS idx_events_artists_artist_id ON events_artists(artist_id);
  
  -- Update RLS policies
  ALTER TABLE events_artists ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Events artists are manageable by authenticated users." ON events_artists
    FOR ALL USING (auth.uid() IS NOT NULL);
  
  CREATE POLICY "Events artists are viewable by all." ON events_artists
    FOR SELECT USING (true);
END;
$$ LANGUAGE plpgsql;

-- Down
CREATE OR REPLACE FUNCTION public.down() RETURNS void AS $$
BEGIN
  -- Remove RLS policies
  DROP POLICY IF EXISTS "Events artists are manageable by authenticated users." ON events_artists;
  DROP POLICY IF EXISTS "Events artists are viewable by all." ON events_artists;
  
  -- Drop indexes
  DROP INDEX IF EXISTS idx_events_artists_event_id;
  DROP INDEX IF EXISTS idx_events_artists_artist_id;
  
  -- Drop table
  DROP TABLE IF EXISTS events_artists;
END;
$$ LANGUAGE plpgsql;
```

## Troubleshooting

### Common Issues

**Migration Fails to Apply**:
- Check for syntax errors in SQL
- Verify table/column doesn't already exist
- Check database connection

**Rollback Fails**:
- Ensure down migration is properly implemented
- Check for dependencies that prevent dropping
- Verify no data would be lost

**Performance Issues**:
- Add proper indexes
- Consider batching large data migrations
- Test with production-like data volume

## Security Considerations

- ✅ **RLS Policies**: Always update when adding new tables
- ✅ **Data Validation**: Add constraints for data integrity
- ✅ **Backup**: Ensure backups before production migrations
- ✅ **Testing**: Test with staging data first
- ✅ **Rollback Plan**: Always have a tested rollback procedure