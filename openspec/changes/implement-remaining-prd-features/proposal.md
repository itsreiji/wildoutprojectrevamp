# Change: Implement Remaining PRD Features

## Why
The platform requires completion of core PRD features to achieve full functionality: event ticketing, artist management, content CMS, partner tiers, editor permissions, refactors, and supporting tables. Current state (from `src/supabase/types.ts`, `openspec/changes/rebuild-supabase-from-scratch/STATUS.md`) shows partial progress: `events`, `partners`, `team_members`, `gallery_items`, `event_artists`, `profiles`, `audit_log` exist with RLS, but missing: `gallery_items.event_id` FK, `partners.sponsorship_level`, new tables (`hero_content`, `about_content`, `site_settings`, `venues`, `artists`, `benefits_*`), full editor RLS, ticketing/Stripe, TanStack Query/router migrations. Supabase rebuild is in-progress (pending implementation post-approval). Prioritizing quick wins enables incremental delivery while high-effort items need sub-proposals.

## What Changes
**BREAKING**: DB schema updates (new columns/tables/RLS); frontend refactors (router, TanStack Query).

**Phased Implementation** (quick wins first, dependencies respected):
- **Phase 1: Quick Wins** (low effort, direct impl, no new capabilities): Items 3,5,9,15 (~1-2 days total).
  - 3: Add `gallery_items.event_id` FK + migration.
  - 5: Add `partners.sponsorship_level` column.
  - 9: Manual RLS testing.
  - 15: Audit log triggers.
- **Phase 2: Medium DB/Content** (new tables/forms/RLS): Items 2,4,6,12,13,14 (~1 week).
  - 2: `event_artists` CRUD forms (table exists).
  - 4: `hero_content`/`about_content`/`site_settings` tables + CRUD.
  - 6: Editor RLS policies.
  - 12: `venues` table + CRUD.
  - 13: Separate `artists` table + refactor.
  - 14: `benefits_*` tables CRUD.
- **Phase 3: Medium Refactors** (~1 week): Items 8,10,11.
  - 8: Router migration.
  - 10: Edge functions deploy/test.
  - 11: Real-time subscriptions.
- **Phase 4: High Effort** (requires sub-openspec): Items 1,7 (~2-3 weeks).
  - 1: Ticketing (Stripe, new tables/functions).
  - 7: TanStack Query migration.

**Effort Estimates**:
| Phase | Effort | Dependencies |
|-------|--------|--------------|
| 1     | Low (4-8h) | Supabase rebuild complete |
| 2     | Medium (20-40h) | Phase 1, types.ts regen |
| 3     | Medium (20h) | Phase 2 |
| 4     | High (40+h) | Phases 1-3, sub-proposals |

**Risks**:
- DB migrations on live data → Backup + dry-run migrations.
- RLS testing misses edge cases → Comprehensive test suite + `test_rls_policies` RPC.
- Refactors break existing CRUD → Incremental migration + tests.
- High-effort scope creep → Sub-openspec proposals.

## Impact
- **Affected Specs**: `admin-dashboard`, `public-ui`, `database-architecture`, `supabase-backend`, new `event-ticketing`, `state-management`.
- **Affected Code**: `src/supabase/types.ts`, `src/contexts/*`, `src/components/dashboard/*`, `supabase/migrations/`, `src/components/router/*`.
- **Users**: Full admin/editor workflows; public ticketing.

## Updated ERD
```mermaid
erDiagram
    EVENTS ||--o{ EVENT_ARTISTS : has
    EVENTS ||--o{ GALLERY_ITEMS : contains
    EVENTS ||--o{ VENUES : at
    PARTNERS ||--o{ EVENTS : sponsors
    ARTISTS ||--o{ EVENT_ARTISTS : performs
    USERS ||--|| PROFILES : has
    PROFILES ||--o{ AUDIT_LOG : generates
    EVENTS ||--o{ BENEFITS_EVENTS : has
    PARTNERS ||--o{ BENEFITS_PARTNERS : has
    
    EVENTS {
        uuid id PK
        string title
        string status CHECK('draft','published','ongoing','completed','cancelled','archived')
        timestamptz start_date
        timestamptz end_date
        uuid venue_id FK "NEW"
        uuid partner_id FK
        jsonb metadata
    }
    
    PARTNERS {
        uuid id PK
        string name
        string status CHECK('active','inactive')
        string sponsorship_level CHECK('bronze','silver','gold','platinum') "NEW"
    }
    
    GALLERY_ITEMS {
        uuid id PK
        string title
        jsonb image_urls
        uuid event_id FK "NEW"
    }
    
    HERO_CONTENT {
        uuid id PK "NEW"
        string title
        jsonb stats
    }
    
    VENUES {
        uuid id PK "NEW"
        string name
        string address
    }
    
    ARTISTS {
        uuid id PK "NEW"
        string name
        jsonb social_links
    }
    
    BENEFITS_EVENTS {
        uuid id PK "NEW"
        uuid event_id FK
        text benefit_type
    }
```

## Updated System Flow
```mermaid
graph TD
    User[User] -->|Interacts| UI[React UI + TanStack Query "Phase 4"]
    UI -->|Action| Context[ContentContext → Real-time Subs "Phase 3"]
    Context -->|Query/Mutate| Supabase[Supabase Client + Edge Functions "Phase 3"]
    Supabase -->|Query| DB[(PostgreSQL + Audit Triggers "Phase 1")]
    Supabase -->|Auth + RLS Editor "Phase 2"| Auth[GoTrue Auth]
    Supabase -->|Stripe Webhook "Phase 4"| Stripe[Stripe Ticketing]
    DB -->|Data| Supabase
    Supabase -->|Response + Realtime| Context
    Context -->|Update| UI
```

**Validation**: Run `openspec validate implement-remaining-prd-features --strict` post-creation.