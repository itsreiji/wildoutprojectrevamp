## MODIFIED Requirements

### Requirement: Admin Dashboard URL-Based Navigation
The admin dashboard SHALL use URL-based routing for all navigation instead of state-based navigation, enabling direct links, browser history, and deep linking to specific admin sections.

#### Scenario: Dashboard derives current page from URL
- **WHEN** a user navigates to `/admin/events`
- **THEN** the Dashboard component extracts the sub-path `events` from the URL
- **AND** the Dashboard renders the `DashboardEventsNew` component
- **AND** the DashboardLayout highlights the "Events" navigation item as active

#### Scenario: Navigation links update URL
- **WHEN** a user clicks the "Team" navigation link in the sidebar
- **THEN** the router's `navigate` function is called with `/admin/team`
- **AND** the URL updates to `/admin/team`
- **AND** the Dashboard renders the `DashboardTeam` component
- **AND** the page does not reload

#### Scenario: Direct URL navigation works
- **WHEN** a user types `/admin/partners` directly in the browser address bar
- **THEN** the router recognizes the path
- **AND** the Dashboard component renders the `DashboardPartners` component
- **AND** the DashboardLayout highlights the "Partners" navigation item as active

#### Scenario: Browser history integration
- **WHEN** a user navigates from `/admin/events` to `/admin/team` then clicks browser back button
- **THEN** the URL updates to `/admin/events`
- **AND** the Dashboard renders the `DashboardEventsNew` component
- **AND** the DashboardLayout highlights the "Events" navigation item as active

#### Scenario: Default admin route
- **WHEN** a user navigates to `/admin` without a sub-path
- **THEN** the Dashboard renders the `DashboardHome` component
- **AND** the DashboardLayout highlights the "Dashboard" navigation item as active
- **OR** the router redirects to `/admin/home`

## ADDED Requirements

### Requirement: Nested Route Matching
The router SHALL support nested route matching for admin dashboard paths, allowing `/admin/*` to match all admin sub-routes.

#### Scenario: Router matches nested admin routes
- **WHEN** the router receives a path like `/admin/events`
- **THEN** the router matches it against the `/admin` route pattern
- **AND** the router extracts the sub-path `events`
- **AND** the router renders the Dashboard component with the sub-path available

#### Scenario: Router handles admin sub-routes
- **WHEN** the current path is `/admin/team`
- **THEN** the router recognizes it as an admin route
- **AND** the router renders the Dashboard component
- **AND** the Dashboard component can access the sub-path `team` from the URL

