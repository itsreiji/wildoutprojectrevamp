# Manual Testing Guide: Supabase Rebuild Verification

This guide provides step-by-step instructions for manually testing and verifying the Supabase rebuild implementation. All infrastructure and code implementation is complete; these tests verify functionality in a production environment.

## Prerequisites

- Access to Supabase project dashboard: `qhimllczaejftnuymrsr`
- Database connection credentials
- Supabase CLI installed and configured
- Test user accounts with different roles (admin, editor, user, anonymous)

## 1. Security Policy Testing (RLS)

### 1.1 Default-Deny Policy Verification

**Test**: Verify that default-deny policies prevent unauthorized access

```sql
-- As anonymous user (no auth)
-- Should return empty or error
SELECT * FROM public.events;
SELECT * FROM public.partners;
SELECT * FROM public.team_members;
SELECT * FROM public.gallery_items;
```

**Expected Result**: All queries should return empty results or be blocked by RLS policies.

### 1.2 Public Read Access for Published Content

**Test**: Verify public users can read published content

```sql
-- As anonymous user
-- Should return only published events
SELECT * FROM public.events WHERE status = 'published';

-- Should return only active partners
SELECT * FROM public.partners WHERE status = 'active';

-- Should return only active team members
SELECT * FROM public.team_members WHERE status = 'active';

-- Should return only published gallery items
SELECT * FROM public.gallery_items WHERE status = 'published';
```

**Expected Result**:
- Published events visible to public
- Active partners visible to public
- Active team members visible to public
- Published gallery items visible to public
- Draft/pending content NOT visible to public

### 1.3 Admin Full Access

**Test**: Verify admin users have full CRUD access

```sql
-- As admin user (with role='admin' in JWT claims)
-- Should be able to read all records
SELECT * FROM public.events;
SELECT * FROM public.partners WHERE status = 'pending';

-- Should be able to create records
INSERT INTO public.events (title, start_date, category, status)
VALUES ('Test Event', NOW(), 'music', 'draft');

-- Should be able to update records
UPDATE public.events SET status = 'published' WHERE title = 'Test Event';

-- Should be able to delete records
DELETE FROM public.events WHERE title = 'Test Event';
```

**Expected Result**: Admin can perform all CRUD operations on all tables.

### 1.4 Editor Limited Access

**Test**: Verify editor users have limited access

```sql
-- As editor user (with role='editor' in JWT claims)
-- Should be able to read draft events
SELECT * FROM public.events WHERE status = 'draft';

-- Should be able to update draft events
UPDATE public.events SET title = 'Updated Title' WHERE status = 'draft';

-- Should NOT be able to delete events
DELETE FROM public.events WHERE id = '<some-id>';
```

**Expected Result**:
- Editor can read and update draft/pending content
- Editor cannot delete records
- Editor cannot access admin-only operations

### 1.5 User Profile Self-Management

**Test**: Verify users can manage their own profiles

```sql
-- As authenticated user (not admin)
-- Should be able to read own profile
SELECT * FROM public.profiles WHERE id = auth.uid();

-- Should be able to update own profile
UPDATE public.profiles
SET full_name = 'Updated Name', avatar_url = 'https://example.com/avatar.jpg'
WHERE id = auth.uid();

-- Should NOT be able to update other users' profiles
UPDATE public.profiles SET role = 'admin' WHERE id != auth.uid();
```

**Expected Result**:
- Users can read and update their own profiles
- Users cannot modify other users' profiles
- Users cannot change their own role

### 1.6 Authenticated User Enhanced Access

**Test**: Verify authenticated users have enhanced access over anonymous

```sql
-- As authenticated user
-- Should be able to read all published content (same as public)
SELECT * FROM public.events WHERE status = 'published';

-- Should be able to read own profile
SELECT * FROM public.profiles WHERE id = auth.uid();

-- Should NOT be able to read draft events (unless editor/admin)
SELECT * FROM public.events WHERE status = 'draft';
```

**Expected Result**: Authenticated users have same public read access plus profile management.

## 2. Performance Benchmarking

### 2.1 Query Execution Time Comparison

**Test**: Compare query execution times with previous setup

```sql
-- Enable query timing
\timing on

-- Test 1: Simple SELECT with index
EXPLAIN ANALYZE
SELECT * FROM public.events
WHERE status = 'published'
ORDER BY start_date DESC
LIMIT 10;

-- Test 2: JOIN query with foreign key index
EXPLAIN ANALYZE
SELECT e.*, p.name as partner_name
FROM public.events e
JOIN public.partners p ON e.partner_id = p.id
WHERE e.status = 'published';

-- Test 3: Full-text search with pg_trgm
EXPLAIN ANALYZE
SELECT * FROM public.events
WHERE title ILIKE '%music%' OR description ILIKE '%music%'
ORDER BY start_date DESC;

-- Test 4: Filtered index query
EXPLAIN ANALYZE
SELECT * FROM public.events
WHERE status = 'published' AND category = 'music';
```

**Expected Result**:
- All queries should use indexes (check EXPLAIN output)
- Query execution times should be < 100ms for simple queries
- JOIN queries should use foreign key indexes
- Full-text search should use GIN index

### 2.2 View Performance

**Test**: Verify database views provide better performance

```sql
-- Test public_events_view (if created)
EXPLAIN ANALYZE
SELECT * FROM public_events_view
WHERE status = 'published';

-- Compare with direct table query
EXPLAIN ANALYZE
SELECT * FROM public.events
WHERE status = 'published';
```

**Expected Result**: Views should provide optimized query plans.

### 2.3 Index Effectiveness Validation

**Test**: Verify indexes are being used

```sql
-- Check index usage statistics
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

**Expected Result**:
- Foreign key indexes should show usage
- Filtered indexes should show usage for WHERE clause queries
- Full-text search indexes should show usage for text searches

### 2.4 Function Performance Benchmark

**Test**: Benchmark database functions

```sql
-- Test bulk_archive_past_events function (as admin)
SELECT * FROM bulk_archive_past_events();

-- Test moderate_content function (as editor/admin)
SELECT moderate_content('<content-id>', 'approve');
```

**Expected Result**: Functions should execute efficiently and return expected results.

## 3. End-to-End Testing

### 3.1 User Signup and Automatic Profile Creation

**Test**: Verify automatic profile creation on signup

**Steps**:
1. Create a new user via Supabase Auth (dashboard or API)
2. Check if profile is automatically created

```sql
-- After user signup, verify profile exists
SELECT * FROM public.profiles WHERE id = '<new-user-id>';
```

**Expected Result**:
- Profile record automatically created
- Profile has default role 'user'
- Profile has created_at timestamp
- Profile linked to auth.users via foreign key

### 3.2 JWT Claims Propagation and Role-Based Access

**Test**: Verify JWT claims update when role changes

**Steps**:
1. Create a test user
2. Update user's role in profiles table
3. Verify JWT claims are updated

```sql
-- Update user role
UPDATE public.profiles SET role = 'admin' WHERE id = '<test-user-id>';

-- Verify JWT claims updated (check auth.users.raw_app_meta_data)
SELECT
    id,
    raw_app_meta_data->>'role' as role_in_jwt
FROM auth.users
WHERE id = '<test-user-id>';
```

**Expected Result**:
- Role update triggers JWT claims update
- JWT contains role in app_metadata
- RLS policies respect updated role

### 3.3 Audit Logging

**Test**: Verify audit logging captures all operations

**Steps**:
1. Perform various CRUD operations
2. Check audit_log table

```sql
-- Perform operations as different users
-- Then check audit log
SELECT
    table_name,
    action,
    user_id,
    created_at
FROM public.audit_log
ORDER BY created_at DESC
LIMIT 20;
```

**Expected Result**:
- All INSERT operations logged
- All UPDATE operations logged
- All DELETE operations logged
- User context captured correctly
- Timestamps accurate

### 3.4 Storage Bucket Policies and RLS

**Test**: Verify storage bucket policies work correctly

**Steps**:
1. Test public read access to public_media bucket
2. Test admin upload access
3. Test user-specific storage restrictions

```sql
-- Check storage buckets exist
SELECT * FROM storage.buckets;

-- Check storage policies
SELECT * FROM storage.policies;
```

**Using Supabase Client**:
```typescript
// Test public read (should work without auth)
const { data } = await supabase
  .storage
  .from('public_media')
  .list('events');

// Test admin upload (should require admin role)
const { error } = await supabase
  .storage
  .from('admin_content')
  .upload('test-file.jpg', file);
```

**Expected Result**:
- Public media bucket allows public reads
- Admin buckets require admin role for uploads
- RLS policies enforce access restrictions

### 3.5 Edge Functions Deployment and Execution

**Test**: Verify Edge Functions deploy and execute correctly

**Steps**:
1. Deploy Edge Functions (if created)
2. Test function execution
3. Verify error handling

```bash
# Deploy Edge Functions
supabase functions deploy admin-bulk-operations

# Test function execution
curl -X POST https://<project-ref>.supabase.co/functions/v1/admin-bulk-operations \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"operation": "archive_past_events"}'
```

**Expected Result**:
- Functions deploy without errors
- Functions execute with proper authentication
- Error handling works correctly
- CORS headers present

## 4. Database Function Testing

### 4.1 Helper Functions

**Test**: Verify helper functions work correctly

```sql
-- Test is_admin() function
SELECT is_admin(); -- Should return true for admin, false otherwise

-- Test is_editor_or_admin() function
SELECT is_editor_or_admin(); -- Should return true for editor/admin

-- Test get_my_role() function
SELECT get_my_role(); -- Should return current user's role
```

**Expected Result**: All helper functions return correct values based on JWT claims.

### 4.2 Business Logic Functions

**Test**: Verify business logic functions work correctly

```sql
-- Test bulk_archive_past_events (as admin)
SELECT * FROM bulk_archive_past_events();
-- Should return count of archived events

-- Test moderate_content (as editor/admin)
SELECT moderate_content('<event-id>', 'approve');
-- Should update event status to 'published'
```

**Expected Result**: Functions execute correctly and enforce role-based access.

## 5. TypeScript Integration Testing

### 5.1 Type Generation Verification

**Test**: Verify TypeScript types match database schema

```bash
# Regenerate types
supabase gen types typescript --project-id qhimllczaejftnuymrsr > src/supabase/types.ts

# Check for type errors
npm run type-check
```

**Expected Result**:
- Types generate without errors
- Application compiles without type errors
- Types match actual database schema

### 5.2 Client Integration Testing

**Test**: Verify Supabase client works with new schema

```typescript
// Test typed queries
const { data, error } = await supabase
  .from('events')
  .select('*, partners(*)')
  .eq('status', 'published');

// Verify types are correct
if (data) {
  data.forEach(event => {
    // TypeScript should autocomplete event properties
    console.log(event.title, event.partner_id);
  });
}
```

**Expected Result**:
- Client queries work correctly
- TypeScript provides autocomplete
- No type errors in application code

## 6. Performance Monitoring

### 6.1 System Performance View

**Test**: Verify performance monitoring view works

```sql
-- Check system performance metrics
SELECT * FROM system_performance;
```

**Expected Result**: View returns accurate metrics for all tables.

### 6.2 Database Statistics

**Test**: Check database statistics

```sql
-- Table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public';
```

**Expected Result**: Statistics provide insights into database performance.

## Success Criteria Checklist

- [ ] All RLS policies work as designed
- [ ] Public read access works for published content
- [ ] Admin full access policies function correctly
- [ ] Editor limited access works correctly
- [ ] User profile self-management works
- [ ] Default-deny policies prevent unauthorized access
- [ ] Query performance meets targets (< 100ms for simple queries)
- [ ] Indexes are being used effectively
- [ ] User signup creates profiles automatically
- [ ] JWT claims update when roles change
- [ ] Audit logging captures all operations
- [ ] Storage policies work for all user roles
- [ ] Edge Functions deploy and execute correctly
- [ ] TypeScript types match database schema
- [ ] Application compiles without errors

## Notes

- All tests should be performed in a staging/test environment first
- Document any issues or unexpected behavior
- Performance benchmarks should be compared against baseline metrics
- Security testing should verify no unauthorized access is possible

