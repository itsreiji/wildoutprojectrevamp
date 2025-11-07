# Routing Capability

## Requirements

### Requirement: Router Component with Routes Object
The application SHALL provide a `Router` component that accepts a routes object and conditionally renders components based on the current path, with support for nested route matching.

#### Scenario: Router renders component for matching path
- **WHEN** the Router component receives a routes object `{ '/': LandingPage, '/admin': Dashboard, '/events': AllEventsPage }`
- **AND** the current path is '/admin'
- **THEN** the Router renders the Dashboard component

#### Scenario: Router matches nested routes
- **WHEN** the Router component receives a routes object with '/admin' route
- **AND** the current path is '/admin/events'
- **THEN** the Router matches the '/admin' route pattern
- **AND** the Router renders the Dashboard component
- **AND** the Dashboard component can access the sub-path 'events' from the URL

#### Scenario: Router handles 404 for unknown paths
- **WHEN** the Router component receives a routes object
- **AND** the current path does not match any route in the object
- **THEN** the Router renders `routes['/404']` if defined
- **OR** renders nothing/null if no 404 route is defined

### Requirement: Nested Route Pattern Matching
The router SHALL support pattern matching for nested routes, allowing routes like `/admin` to match paths that start with `/admin/`.

#### Scenario: Router extracts sub-path from nested route
- **WHEN** the current path is `/admin/events`
- **AND** the router has a route defined for `/admin`
- **THEN** the router matches the `/admin` route
- **AND** the router extracts the sub-path `events` from the URL
- **AND** the matched component can access the sub-path via router context or props

#### Scenario: Router handles exact path matches
- **WHEN** the current path is exactly `/admin`
- **AND** the router has a route defined for `/admin`
- **THEN** the router matches the `/admin` route exactly
- **AND** the sub-path is empty or defaults to a home/default value
