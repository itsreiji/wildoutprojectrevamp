## ADDED Requirements

### Requirement: All-Events Discovery Experience
The public-facing site SHALL expose an `/events` discovery page that lists every upcoming WildOut! event with searchable, filterable, sortable, and paginated controls so visitors can easily browse the catalog.

#### Scenario: Search and filter by text and category
- **WHEN** a visitor navigates to `/events`
- **AND** types a query into the search input
- **AND** optionally picks a category filter
- **THEN** the page SHALL show only events whose title, description, artist names, or category match the search + filter criteria
- **AND** the displayed cards update in real time as the visitor types or changes filters

#### Scenario: Sort and paginate events
- **WHEN** the visitor selects a sort option (e.g., Date Newest First, Title A-Z)
- **AND** the dataset exceeds the per-page limit
- **THEN** the page SHALL sort the filtered list accordingly
- **AND** render only the subset of events for the current page
- **AND** the Previous/Next controls SHALL disable when the visitor is on the first or last page respectively

