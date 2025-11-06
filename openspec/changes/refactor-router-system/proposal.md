# Change: Refactor Router System to Path-Based Routing

## Why
The current router implementation uses a hardcoded `Page` type union (`'landing' | 'admin' | 'all-events'`) which limits flexibility and makes it difficult to add new routes. The routing logic is also scattered between Router.tsx and App.tsx, making it harder to maintain. A path-based routing system with a routes object pattern will make the router more extensible, maintainable, and aligned with standard routing patterns.

## What Changes
- **BREAKING**: Refactor `Router.tsx` to use path-based routing (string paths like '/', '/admin', '/events') instead of the `Page` type union
- **BREAKING**: Replace the hardcoded page switching logic in `App.tsx` with a `Router` component that accepts a `routes` object prop
- Create a new `Link` component in `src/components/router/Link.tsx` for declarative navigation
- Reorganize router code into `src/components/router/` directory structure:
  - `index.tsx` - RouterProvider, useRouter hook, Router component
  - `Link.tsx` - Link component
- Update `App.tsx` to use the new Router component with a routes object
- Update `Navigation.tsx` and `DashboardLayout.tsx` to use the new `Link` component where appropriate
- Maintain backward compatibility for existing `navigateTo` function signature during transition

## Impact
- **Affected specs**: None (no existing specs)
- **Affected code**:
  - `src/components/Router.tsx` - Complete refactor to path-based system
  - `src/App.tsx` - Update to use Router component with routes object
  - `src/components/Navigation.tsx` - May use new Link component
  - `src/components/dashboard/DashboardLayout.tsx` - May use new Link component
  - New files: `src/components/router/index.tsx`, `src/components/router/Link.tsx`
- **Breaking changes**:
  - `Page` type will be removed
  - Router API will change from page-based to path-based
  - Components using `navigateTo` with Page type will need updates

