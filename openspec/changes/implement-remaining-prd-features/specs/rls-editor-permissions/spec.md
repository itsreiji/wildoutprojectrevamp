## ADDED Requirements

### Requirement: Editor Role RLS Policies
The database SHALL enforce granular Row Level Security (RLS) policies distinguishing Editor from Admin/Member roles, using `profiles.role` and JWT claims via `is_editor_or_admin_via_jwt()` RPC. Editors gain full CRUD on content tables (events, partners, team_members, gallery_items, venues, artists, benefits), read-only on audit_log/profiles, no access to admin-only (e.g., user role changes).

#### Scenario: Editor creates event
- **WHEN** authenticated Editor INSERTs to `events`
- **THEN** succeeds if `profile.role = 'editor'`, denied for 'member'
- **SQL**:
```sql
-- Enable RLS if not already
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Editors+ full CRUD on events
CREATE POLICY "Editors+ manage events" ON events
FOR ALL TO authenticated
USING (is_editor_or_admin_via_jwt())
WITH CHECK (is_editor_or_admin_via_jwt());

-- Public read upcoming events (existing, extended)
CREATE POLICY "Public read published events" ON events
FOR SELECT TO public
USING (status = 'published' AND start_date > now());
```

#### Scenario: Editor updates partner
- **WHEN** Editor UPDATEs `partners`
- **THEN** succeeds
- **SQL**:
```sql
CREATE POLICY "Editors+ manage partners" ON partners
FOR ALL TO authenticated
USING (is_editor_or_admin_via_jwt())
WITH CHECK (is_editor_or_admin_via_jwt());
```

#### Scenario: Editor manages team_members
- **SQL**:
```sql
CREATE POLICY "Editors+ manage team" ON team_members
FOR ALL TO authenticated
USING (is_editor_or_admin_via_jwt())
WITH CHECK (is_editor_or_admin_via_jwt());
```

#### Scenario: Editor CRUD gallery_items
- **SQL**:
```sql
CREATE POLICY "Editors+ manage gallery" ON gallery_items
FOR ALL TO authenticated
USING (is_editor_or_admin_via_jwt())
WITH CHECK (is_editor_or_admin_via_jwt());
```

#### Scenario: Editor read-only audit_log
- **WHEN** Editor SELECTs `audit_log`
- **THEN** succeeds (monitoring), no INSERT/UPDATE/DELETE
- **SQL**:
```sql
CREATE POLICY "Editors+ read audit_log" ON audit_log
FOR SELECT TO authenticated
USING (is_editor_or_admin_via_jwt());
```

#### Scenario: Editor manages new tables (venues, artists, benefits)
- **SQL** (applied to venues, artists, benefits_events, benefits_partners):
```sql
CREATE POLICY "Editors+ manage venues/artists/benefits" ON venues -- repeat for others
FOR ALL TO authenticated
USING (is_editor_or_admin_via_jwt())
WITH CHECK (is_editor_or_admin_via_jwt());
```

#### Scenario: Editor singleton content (hero/about/settings)
- **SQL**:
```sql
-- For hero_content, about_content, site_settings
CREATE POLICY "Editors+ manage content singletons" ON hero_content
FOR ALL TO authenticated
USING (is_editor_or_admin_via_jwt())
WITH CHECK (is_editor_or_admin_via_jwt());
```

#### Scenario: Editor event_artists junction
- **SQL**:
```sql
CREATE POLICY "Editors+ manage event_artists" ON event_artists
FOR ALL TO authenticated
USING (is_editor_or_admin_via_jwt())
WITH CHECK (is_editor_or_admin_via_jwt());
```

### Requirement: Role Validation RPC Extension
Extend existing `is_editor_or_admin_via_jwt()` if needed for new tables.

#### Scenario: JWT role check
- **WHEN** policy calls RPC
- **THEN** returns true for 'editor'/'admin'

**Migration**: Single SQL file `20251124_rls_editor_policies.sql` with all policies. Test via `test_rls_policies()` RPC and manual role switches.

**Verification**: 
- Create test users (admin/editor/member)
- Run CRUD ops per role
- All policies enforce correctly, no leaks.