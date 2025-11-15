# Change: add public all events page

## Why
- The public-facing site needs a dedicated discovery surface that lists every upcoming WildOut! event and lets visitors search, filter, sort, and page through the calendar. Right now the landing page is limited to featured content, so there is no way to browse the full catalog of events.
- Building this page before implementation keeps the project spec-driven and lets the team review the exact UX/behaviour before any code changes land.

## What Changes
- Add `src/components/AllEventsPage.tsx`, a route-driven page that consumes `useContent` and renders all events via reusable filters, search, and card components.
- Extend the router to render `/events` through `AllEventsPage` and wire responsive layout, search inputs, filtering controls, sorting selectors, and pagination buttons.
- Update the spec for the `public-ui` capability to include the new discovery experience so stakeholders know how search, filtering, sorting, and pagination should behave.

## Impact
- **Specs**: Adds `openspec/specs/public-ui/spec.md` with the All-Events experience requirement.
- **Code**: `src/components/AllEventsPage.tsx`, `src/components/router/index.tsx`, `src/components/ui/*` helpers (filters, cards), and any supporting hooks/utilities (e.g., filtering/sorting helpers).

