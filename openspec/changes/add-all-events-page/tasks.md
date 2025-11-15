## 1. Implementation
- [x] **1.1** Create `AllEventsPage` component shell, hook it into the router, and render a basic list of upcoming events from `ContentContext`.
- [x] **1.2** Add the search bar UI plus client-side filtering that matches titles, descriptions, and artist metadata.
- [x] **1.3** Introduce category and date filter controls using the UI primitives plus the derived filters inside the component.
- [x] **1.4** Implement sorting controls for date (newest/oldest) and title (A-Z) and apply them after filtering.
- [x] **1.5** Replace placeholder rows with styled event cards and add pagination controls (`Previous`/`Next`) to limit the number of rows rendered at once.

## 2. Verification
- [x] Manually test the `/events` route, ensuring search, filters, sorting, and pagination all work together.
- [x] Validate that `useContent` is the only data source and that loading/error states are surfaced (loading indicator, error banner).
- [x] Confirm that pagination controls disable correctly at the ends of the dataset and that cards render all required fields (image, title, date, venue).

