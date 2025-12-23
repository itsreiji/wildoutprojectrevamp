# Implementation Plan - Supabase Integration (Landing Page & Admin Dashboard)

## Phase 1: Database Schema & Security (RLS)
- [ ] Task: Verify Database Schema and Enable Real-time
    - Ensure `events`, `team_members`, `partners`, and `gallery` tables exist with correct schemas.
    - Enable Real-time replication for all four tables in Supabase.
- [ ] Task: Implement Row Level Security (RLS) Policies
    - Create/Update RLS policies: SELECT allowed for all (public), ALL/WRITE only for authenticated `admin` and `editor` roles.
    - Test RLS policies using Supabase SQL editor or CLI.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Database Schema & Security (RLS)' (Protocol in workflow.md)

## Phase 2: Core Data Services & Real-time Integration
- [ ] Task: Implement Centralized Data Fetching Hooks (TanStack Query)
    - Create `useEvents`, `useTeam`, `usePartners`, and `useGallery` hooks in `src/services/`.
    - Ensure hooks use the generated Supabase types.
- [ ] Task: Implement Real-time Synchronization Layer
    - Create a `useRealtimeSync` hook or update `EventsContext`/`ContentContext` to subscribe to Supabase channels.
    - Verify that local TanStack Query cache invalidates correctly on remote changes.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Core Data Services & Real-time Integration' (Protocol in workflow.md)

## Phase 3: Landing Page Dynamic Population
- [ ] Task: Integrate Supabase Data into Events Section
    - Replace static data in `AllEventsPage.tsx` and `LandingPage` with the `useEvents` hook.
- [ ] Task: Integrate Supabase Data into Team and Partners Sections
    - Update `AboutSection.tsx` or relevant components to consume dynamic data.
- [ ] Task: Integrate Supabase Data into Media Gallery
    - Update gallery components to fetch from the `gallery` table and render Supabase Storage URLs.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Landing Page Dynamic Population' (Protocol in workflow.md)

## Phase 4: Admin Dashboard CRUD & Media Management
- [ ] Task: Implement Content Management Tables
    - Create/Update searchable, paginated tables for Events, Team, and Partners.
- [ ] Task: Implement CRUD Forms with Image Upload
    - Create forms for adding/editing content.
    - Integrate Supabase Storage upload for photos and logos using a shared `ImageUpload` component.
- [ ] Task: Implement Soft-Delete and Archiving
    - Add `is_active` or `deleted_at` logic to tables and UI.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Admin Dashboard CRUD & Media Management' (Protocol in workflow.md)

## Phase 5: RBAC & Final Polishing
- [ ] Task: Implement Frontend Permission Context
    - Create `usePermissions` hook to check user roles from `AuthContext`.
    - Conditionally hide/disable Admin Dashboard features based on Role (Admin vs Editor).
- [ ] Task: Implement Optimistic Updates for Dashboard Actions
    - Update TanStack Query mutations to use `onMutate` for a responsive UI.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: RBAC & Final Polishing' (Protocol in workflow.md)
