# Track Specification: Supabase Integration (Landing Page & Admin Dashboard)

## Overview
This track involves fully integrating Supabase as the dynamic data source for the WildOut! application. We will move away from static or mocked data to a real-time, synchronized architecture where content managed in the Admin Dashboard is immediately reflected on the public Landing Page.

## Functional Requirements
### 1. Dynamic Landing Page
- **Events Section:** Fetch and display upcoming and past events from the `events` table.
- **Media Gallery:** Populate the gallery grid using records from the `gallery` table, linked to Supabase Storage.
- **Team Section:** Display team members dynamically from the `team_members` table.
- **Partners Section:** Render partner logos and links from the `partners` table.
- **Real-time Sync:** Implement Supabase real-time subscriptions so the Landing Page updates automatically when data changes in the database.

### 2. Admin Dashboard Enhancements
- **Content Management (CRUD):** 
    - Full management interface for Events, Team Members, and Partners.
    - Searchable data tables with pagination.
    - Soft-delete/Archiving functionality.
- **Media Handling:** 
    - Integrated image upload flow for member photos, logos, and gallery items using Supabase Storage.
    - Image preview and basic metadata management.
- **RBAC Enforcement:**
    - UI elements (buttons, forms, pages) conditionally rendered based on user roles (Admin/Editor).
    - Strict Row Level Security (RLS) policies on all tables to prevent unauthorized data modification.

## Non-Functional Requirements
- **Performance:** Utilize TanStack Query (v5) for efficient caching and state management.
- **Type Safety:** Strict adherence to generated TypeScript types from `src/supabase/types.ts`.
- **UX:** Implement optimistic updates for dashboard actions to ensure a responsive feel.

## Acceptance Criteria
- All four Landing Page sections (Events, Gallery, Team, Partners) pull data directly from Supabase.
- Changes made in the Admin Dashboard appear on the Landing Page in real-time without a manual refresh.
- Only authorized users can access and modify content in the dashboard (verified via RLS).
- Image uploads correctly store files in Supabase Storage and link them to the database records.

## Out of Scope
- Implementation of the Inngest workflow for background image optimization (to be handled in a separate "Performance" track).
- Advanced analytics or audit logging beyond basic database timestamps.