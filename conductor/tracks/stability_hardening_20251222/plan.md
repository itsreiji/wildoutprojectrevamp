# Track Plan: Operational Stability and Media Management Hardening

## Phase 1: RBAC & Security Hardening
- [x] Task: Audit existing RBAC implementation against Supabase profiles. [commit: 4535e42]
- [x] Task: Write tests for section-level permission validation. [commit: bc0bde8]
- [x] Task: Implement missing permission checks for sensitive delete/publish operations. [commit: 0162dcc]
- [~] Task: Conductor - User Manual Verification 'RBAC & Security Hardening' (Protocol in workflow.md)

## Phase 2: Synchronization & Data Integrity
- [ ] Task: Enhance Supabase real-time subscription handling in Context providers.
- [ ] Task: Write integration tests for Landing Page to Dashboard sync.
- [ ] Task: Refactor Inngest validation logic to ensure data consistency during imports.
- [ ] Task: Conductor - User Manual Verification 'Synchronization & Data Integrity' (Protocol in workflow.md)

## Phase 3: Media Management Completeness
- [ ] Task: Finalize Media Gallery CRUD UI in the Dashboard.
- [ ] Task: Implement robust image deletion from Supabase Storage when gallery items are removed.
- [ ] Task: Add comprehensive error boundary handling for media loading/uploads.
- [ ] Task: Conductor - User Manual Verification 'Media Management Completeness' (Protocol in workflow.md)
