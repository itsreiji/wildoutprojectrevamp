## ADDED Requirements

### Requirement: Partner Sponsorship Levels
The database SHALL support tiered partner visibility through a `sponsorship_level` column on the `partners` table.

#### Scenario: Add sponsorship level to partners
- **WHEN** an admin updates a partner record with `sponsorship_level`
- **THEN** the value is validated against CHECK constraint ('bronze','silver','gold','platinum') and stored
- **SQL Migration**:
```sql
ALTER TABLE partners 
ADD COLUMN sponsorship_level text 
CHECK (sponsorship_level IN ('bronze', 'silver', 'gold', 'platinum')) 
DEFAULT 'bronze';

CREATE INDEX idx_partners_sponsorship_level ON partners(sponsorship_level);
```

#### Scenario: Query partners by tier
- **WHEN** frontend queries active platinum partners
- **THEN** only 'platinum' status='active' records returned, indexed for performance

### Requirement: Gallery Items Event Linking
The database SHALL link gallery items to events via `event_id` foreign key.

#### Scenario: Add event_id to gallery_items
- **WHEN** migration adds FK
- **THEN** gallery_items can reference events(id), optional for general gallery
- **SQL Migration**:
```sql
ALTER TABLE gallery_items 
ADD COLUMN event_id uuid 
REFERENCES events(id) ON DELETE SET NULL;

CREATE INDEX idx_gallery_items_event_id ON gallery_items(event_id);
```

#### Scenario: Query event gallery
- **WHEN** query gallery for specific event
- **THEN** only items with matching event_id returned

### Requirement: Hero Content Singleton Table
The database SHALL store hero section content as a singleton table.

#### Scenario: Hero content CRUD
- **WHEN** admin upserts hero_content (id fixed UUID)
- **THEN** single row stored with jsonb stats
- **SQL Migration**:
```sql
CREATE TABLE hero_content (
  id uuid PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  title text NOT NULL,
  subtitle text,
  description text,
  stats jsonb,
  cta_text text,
  cta_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin upsert hero" ON hero_content
FOR ALL USING (get_current_user_role_via_jwt() = 'admin');
```

### Requirement: About Content Singleton Table
The database SHALL store about section content as singleton.

#### Scenario: About content management
- **SQL Migration**:
```sql
CREATE TABLE about_content (
  id uuid PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000002'::uuid,
  title text NOT NULL,
  subtitle text,
  founded_year text,
  story text[],
  features jsonb[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin upsert about" ON about_content
FOR ALL USING (get_current_user_role_via_jwt() = 'admin');
```

### Requirement: Site Settings Singleton Table
The database SHALL store site-wide settings.

#### Scenario: Site settings update
- **SQL Migration**:
```sql
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000003'::uuid,
  site_name text NOT NULL,
  tagline text,
  email text,
  phone text,
  address text,
  social_media jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin upsert settings" ON site_settings
FOR ALL USING (get_current_user_role_via_jwt() = 'admin');
```

### Requirement: Venues Table
The database SHALL support venue management.

#### Scenario: Venue CRUD
- **SQL Migration**:
```sql
CREATE TABLE venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  capacity integer,
  status text CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE venues ADD CONSTRAINT venues_name_unique UNIQUE (name);
CREATE INDEX idx_venues_status ON venues(status);

-- FK to events
ALTER TABLE events ADD COLUMN venue_id uuid REFERENCES venues(id);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Editor+ manage venues" ON venues
FOR ALL USING (is_editor_or_admin_via_jwt());
```

### Requirement: Artists Table
The database SHALL normalize artists.

#### Scenario: Artist normalization
- **SQL Migration**:
```sql
CREATE TABLE artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  bio text,
  social_links jsonb,
  status text CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Refactor event_artists
ALTER TABLE event_artists DROP COLUMN artist_name;
ALTER TABLE event_artists ADD COLUMN artist_id uuid REFERENCES artists(id);

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Editor+ manage artists" ON artists
FOR ALL USING (is_editor_or_admin_via_jwt());
```

### Requirement: Benefits Junction Tables
The database SHALL track benefits per entity.

#### Scenario: Event/partner benefits
- **SQL Migration**:
```sql
CREATE TABLE benefits_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  benefit_type text NOT NULL CHECK (benefit_type IN ('vip_access', 'merch', 'afterparty', 'etc')),
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE benefits_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  benefit_type text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Indexes and RLS similar to above
```

**Post-Migration**: Regen `src/supabase/types.ts`; test all FKs/CHECKs/RLS.