# Design: Rebuild Supabase Database from Scratch

## Context
The WildOut! platform requires a production-ready Supabase database architecture that can scale to support 500+ events, 50K+ members, and 100+ partners. The current database lacks proper normalization, comprehensive security policies, performance optimizations, and maintainable migration workflows. This design document outlines the technical decisions for a complete rebuild from scratch.

## Goals
- Establish a normalized, production-grade database schema
- Implement comprehensive Row Level Security (RLS) policies
- Optimize for performance at scale with strategic indexing
- Create a maintainable migrations workflow using Supabase CLI
- Ensure type safety through automated TypeScript type generation
- Set up storage buckets and Edge Functions architecture
- Support the platform's scale requirements (500+ events, 50K+ members, 100+ partners)

## Non-Goals
- Migration of existing data (fresh start)
- Real-time subscriptions (future enhancement)
- Advanced analytics or reporting features (future enhancement)
- Multi-tenant architecture (not required for current scope)

## Decisions

### Decision 1: Complete Rebuild vs Incremental Migration
**Decision**: Complete rebuild from scratch
**Rationale**:
- Current schema lacks proper normalization and relationships
- Existing migrations are not production-grade
- Clean slate allows implementation of best practices from the start
- Faster to rebuild than to incrementally fix existing issues
**Alternatives Considered**:
- Incremental migration: Would require maintaining backward compatibility and gradual refactoring
- Schema evolution: Current schema too different from desired state

### Decision 2: UUID Primary Keys
**Decision**: Use UUID primary keys for all tables
**Rationale**:
- Better for distributed systems and future scaling
- Prevents enumeration attacks
- Works well with Supabase Auth (which uses UUIDs)
- Standard practice in modern applications
**Alternatives Considered**:
- Auto-incrementing integers: Simpler but less secure and scalable
- ULIDs: Good alternative but UUID is standard in Supabase ecosystem

### Decision 3: RLS Pattern: "Public Read, Admin Write"
**Decision**: Implement "public read, admin write" pattern for all business tables
**Rationale**:
- Landing page needs public access to events, partners, team members
- Admin dashboard needs full CRUD access
- Simpler than role-based access control for current requirements
- Can be extended later if more granular permissions needed
**Alternatives Considered**:
- Role-based access: More complex, not needed for MVP
- Per-table custom policies: Less maintainable

### Decision 4: Admin Check via JWT Custom Claim
**Decision**: Use JWT custom claim `is_admin` for admin identification
**Rationale**:
- Simple and performant (no database lookup required)
- Works well with Supabase Auth
- Centralized in `is_admin()` helper function
- Can be set via Supabase Dashboard or programmatically
**Alternatives Considered**:
- Database lookup in `profiles` table: Adds latency, requires extra query
- Separate admin table: More complex, unnecessary for current scale

### Decision 5: JSONB for Flexible Fields
**Decision**: Use JSONB for fields that may evolve (social_links, contact_info, gallery_images_urls)
**Rationale**:
- Allows schema flexibility without migrations
- Good performance with proper indexing
- Type-safe when used with TypeScript types
- Common pattern in Supabase/PostgreSQL
**Alternatives Considered**:
- Separate tables: More normalized but requires more joins
- Text fields: Less type-safe and harder to query

### Decision 6: Junction Table for Events-Artists Relationship
**Decision**: Create `event_artists` junction table for many-to-many relationship
**Rationale**:
- Proper normalization (events can have multiple artists, artists can have multiple events)
- Allows storing additional metadata (e.g., role, performance time) in the future
- Better query performance than JSONB arrays
- Standard database design pattern
**Alternatives Considered**:
- JSONB array in events table: Simpler but less queryable and normalized
- Single artist per event: Too limiting for platform requirements

### Decision 7: Storage Buckets: Public Reads, RLS for Writes
**Decision**: Make storage buckets public for reads, secure writes with RLS
**Rationale**:
- Public reads enable CDN caching and better performance
- RLS on writes ensures only admins can upload/modify
- Best practice for media-heavy applications
- Reduces API calls for image serving
**Alternatives Considered**:
- Signed URLs: More secure but adds complexity and latency
- Private buckets: Requires authentication for every image load

### Decision 8: Supabase CLI for Migrations
**Decision**: Use Supabase CLI for all migrations management
**Rationale**:
- Version-controlled migrations in Git
- Reproducible deployments
- Local development support
- Industry standard for Supabase projects
**Alternatives Considered**:
- Manual SQL in dashboard: Not version-controlled, error-prone
- Third-party migration tools: Adds dependency, Supabase CLI is purpose-built

### Decision 9: Automated Type Generation
**Decision**: Generate TypeScript types from database schema using Supabase CLI
**Rationale**:
- Ensures type safety between database and application
- Single source of truth (database schema)
- Prevents type drift
- Should be part of CI/CD pipeline
**Alternatives Considered**:
- Manual type definitions: Error-prone, easy to get out of sync
- Type inference: Less reliable, doesn't catch schema changes

### Decision 10: Indexing Strategy
**Decision**: Index foreign keys, frequently filtered columns, and common query patterns
**Rationale**:
- Foreign key indexes improve join performance
- Filter indexes speed up WHERE clauses
- Composite indexes optimize multi-column queries
- pg_trgm extension enables fast text search
**Alternatives Considered**:
- Index everything: Wastes storage and slows writes
- No indexes: Unacceptable performance at scale

## Risks / Trade-offs

### Risk 1: Data Loss During Rebuild
**Impact**: High - All existing data will be lost
**Mitigation**:
- Document backup procedure in tasks
- Warn users before execution
- Consider data export if critical data exists
**Trade-off**: Acceptable for development/staging, requires careful planning for production

### Risk 2: Breaking Changes to Application Code
**Impact**: Medium - Application code needs refactoring
**Mitigation**:
- Generate types immediately after schema creation
- Update ContentContext and other data access layers
- Comprehensive testing after rebuild
**Trade-off**: Necessary for long-term maintainability

### Risk 3: RLS Policies May Be Too Restrictive or Permissive
**Impact**: Medium - Security or functionality issues
**Mitigation**:
- Thorough testing of all access patterns
- Clear documentation of policies
- Can be adjusted in future migrations
**Trade-off**: Start conservative (more restrictive), relax as needed

### Risk 4: Performance Issues at Scale
**Impact**: Low-Medium - May need optimization later
**Mitigation**:
- Implement comprehensive indexing strategy
- Use EXPLAIN ANALYZE to verify query plans
- Monitor performance metrics
- Can add indexes or optimize queries in future migrations
**Trade-off**: Initial indexes may need adjustment based on actual query patterns

### Risk 5: Type Generation Workflow Breaks
**Impact**: Low - Types may get out of sync
**Mitigation**:
- Document type generation process
- Include in CI/CD pipeline
- Regular verification
**Trade-off**: Automated but requires discipline

## Migration Plan

### Phase 1: Preparation (Agent 1)
1. Backup any critical data
2. Reset remote database
3. Initialize Supabase CLI
4. Create initial table migrations

### Phase 2: Security (Agent 2)
1. Enable RLS on all tables
2. Create helper functions
3. Implement RLS policies for all tables
4. Implement storage RLS policies

### Phase 3: Infrastructure (Agent 3)
1. Create storage buckets
2. Initialize Edge Functions
3. Create admin function stub
4. Document workflows

### Phase 4: Optimization (Agent 4)
1. Create performance indexes
2. Execute all migrations
3. Generate TypeScript types
4. Integrate types into application

### Rollback Plan
- If critical issues arise, can restore from backup
- Migrations are version-controlled and can be rolled back individually
- Type generation can be re-run if needed

## Open Questions
1. Should we implement soft deletes (deleted_at column) for audit trail?
2. Do we need database-level validation constraints beyond NOT NULL?
3. Should we implement database functions for complex queries (beyond is_admin)?
4. Do we need read replicas for performance (future consideration)?
5. Should we implement database backups as part of this rebuild?

## Success Criteria
- All migrations execute without errors
- All tables, relationships, and indexes are correctly created
- RLS policies work as expected (public read, admin write)
- TypeScript types are generated and integrated successfully
- Application builds without type errors
- Performance is acceptable for target scale
- Documentation is complete and accurate

