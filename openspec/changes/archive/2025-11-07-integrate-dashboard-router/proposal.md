# Change: Integrate Dashboard with URL-Based Router

## Why
The admin dashboard currently uses state-based navigation (`currentPage` state) which prevents proper URL routing, browser history integration, and deep linking to specific admin pages. Users cannot bookmark or share direct links to admin sections like `/admin/events` or `/admin/team`. The dashboard needs to integrate with the custom router system to support URL-based navigation for all admin routes.

## What Changes
- **BREAKING**: Refactor `Dashboard` component to use URL-based routing instead of state-based navigation
- Add nested route support to the router for `/admin/*` paths
- Update `DashboardLayout` to derive current page from URL path instead of props
- Update navigation links in `DashboardLayout` to use router's `navigate` function
- Remove `currentPage` and `onNavigate` props from `DashboardLayout` interface
- Update `App.tsx` routing to handle nested admin routes

## Impact
- **Affected specs**: `routing` (needs nested route support)
- **Affected code**:
  - `src/components/Dashboard.tsx` - Remove state-based navigation, use router
  - `src/components/dashboard/DashboardLayout.tsx` - Remove props, derive from URL
  - `src/components/router/index.tsx` - Add nested route matching
  - `src/App.tsx` - Update routes to support `/admin/*` paths
- **Breaking changes**: DashboardLayout props interface changes

