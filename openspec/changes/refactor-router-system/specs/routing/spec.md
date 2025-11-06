## ADDED Requirements

### Requirement: Path-Based Router System
The application SHALL provide a path-based routing system that uses string paths (e.g., '/', '/admin', '/events') instead of hardcoded page types.

#### Scenario: Router tracks current path from URL
- **WHEN** the application loads
- **THEN** the router reads the current path from `window.location.pathname`
- **AND** the router state reflects the current URL path

#### Scenario: Navigation updates URL and router state
- **WHEN** `navigate(path: string)` is called with a path
- **THEN** the URL is updated using `window.history.pushState`
- **AND** the router state is updated to reflect the new path
- **AND** the page does not reload

### Requirement: Router Component with Routes Object
The application SHALL provide a `Router` component that accepts a routes object and conditionally renders components based on the current path.

#### Scenario: Router renders component for matching path
- **WHEN** the Router component receives a routes object `{ '/': LandingPage, '/admin': Dashboard, '/events': AllEventsPage }`
- **AND** the current path is '/admin'
- **THEN** the Router renders the Dashboard component

#### Scenario: Router handles 404 for unknown paths
- **WHEN** the Router component receives a routes object
- **AND** the current path does not match any route in the object
- **THEN** the Router renders `routes['/404']` if defined
- **OR** renders nothing/null if no 404 route is defined

### Requirement: Link Component for Navigation
The application SHALL provide a `Link` component for declarative internal navigation that prevents full page reloads.

#### Scenario: Link component navigates without page reload
- **WHEN** a user clicks a Link component with `to="/admin"`
- **THEN** the default anchor behavior is prevented
- **AND** the router's `navigate` function is called with '/admin'
- **AND** the page does not reload

#### Scenario: Link component maintains accessibility
- **WHEN** a Link component is rendered
- **THEN** it renders an underlying `<a>` tag with `href` attribute set to the `to` prop
- **AND** standard browser behaviors work (right-click to open in new tab, copy link, etc.)

### Requirement: Browser History Integration
The router SHALL integrate with the browser's History API to support back/forward navigation.

#### Scenario: Browser back button updates router state
- **WHEN** a user navigates to '/admin' then clicks the browser back button
- **THEN** the router's `popstate` event listener updates the path state
- **AND** the correct component is rendered based on the new path

#### Scenario: Browser forward button updates router state
- **WHEN** a user navigates back then clicks the browser forward button
- **THEN** the router's `popstate` event listener updates the path state
- **AND** the correct component is rendered based on the new path

## MODIFIED Requirements

### Requirement: RouterProvider Context API
The RouterProvider SHALL provide router context with path-based navigation instead of page-based navigation.

#### Scenario: RouterProvider provides path and navigate function
- **WHEN** a component uses the `useRouter` hook within RouterProvider
- **THEN** it receives an object with `path: string` and `navigate: (path: string) => void`
- **AND** `path` reflects the current URL pathname
- **AND** `navigate` accepts a string path instead of a Page type

#### Scenario: useRouter throws error outside provider
- **WHEN** `useRouter` is called outside of RouterProvider
- **THEN** it throws an error with message "useRouter must be used within RouterProvider"

