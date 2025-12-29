# WildOut! Implementation Roadmap

This document outlines a phased plan for implementing the recommendations from the December 2025 project review.

## Phase 1: Code Consolidation & Environment Safety
**Objective**: Clean up technical debt and secure the development environment.

1.  **Consolidate API Clients**:
    -   Identify all usages of `src/supabase/api.ts`.
    -   Migrate all calls to the more robust `src/supabase/api/client.ts` (SupabaseKVClient).
    -   Delete `src/supabase/api.ts` once it is no longer referenced.
2.  **Harden Environment Configuration**:
    -   Update `src/lib/supabase.ts` to strictly throw an error if environment variables are missing in production.
    -   Ensure the build process (Vite) fails if necessary secrets are not present.

## Phase 2: Testing & Quality Assurance
**Objective**: Increase confidence in the codebase through automated testing.

1.  **UI & State Testing**:
    -   Implement unit tests for `ContentContext.tsx` using `@testing-library/react`.
    -   Focus on data synchronization logic and error handling (fallbacks).
2.  **API Integration Testing**:
    -   Add integration tests for the `SupabaseKVClient`.
    -   Utilize Vitest's mocking capabilities for `fetch` to simulate various backend responses.
3.  **Edge Function Testing**:
    -   Implement unit tests for the Hono-based Edge Functions using Hono's built-in testing utilities.
    -   Verify auth middleware and Zod validation on the server side.

## Phase 3: Architectural Enhancements
**Objective**: Prepare the application for future feature growth.

1.  **Routing Upgrade**:
    -   Evaluate the migration from the custom `Router.tsx` to `TanStack Router` or `React Router`.
    -   Implement support for dynamic URL parameters (e.g., `/events/:id`).
    -   Enable deep linking for dashboard sections.
2.  **Advanced Caching Strategy**:
    -   Implement SWR (Stale-While-Revalidate) or React Query for more granular data fetching and caching.
    -   This will replace the basic 60s cache in Edge Functions with more intelligent client-side state management.

## Phase 4: Feature Expansion (Optional/Future)
**Objective**: Leverage the solid foundation for new capabilities.

1.  **Image Optimization Service**: Integrate a service for automated image resizing and webp conversion for the gallery.
2.  **Activity Logs**: Implement an audit log in the dashboard to track changes made by different admin users.

---

### Implementation Status Tracking
- [ ] Phase 1: Code Consolidation & Env Safety
- [ ] Phase 2: Testing & QA
- [ ] Phase 3: Architectural Enhancements
- [ ] Phase 4: Feature Expansion
