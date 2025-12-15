# Pages - AGENTS.md

## 1. Package Identity

This directory contains all application pages and routes for the WildOut! application. Pages represent the main entry points and views of the application.

## 2. Setup & Run

No specific setup required beyond the root project setup.

## 3. Patterns & Conventions

### File Organization

- **Page Files**: Individual page components (`Home.tsx`, `Events.tsx`, etc.)
- **Route Structure**: Follows application routing conventions

### Page Structure

```tsx
// ✅ Preferred page structure
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EventService } from '@/services/EventService';
import { Layout } from '@/components/Layout';

export function HomePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventService = new EventService();
        const data = await eventService.getEvents();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Layout>
      <h1>Welcome to WildOut!</h1>
      <EventList events={events} />
    </Layout>
  );
}
```

### Page Patterns

- ✅ **DO**: Use context providers for state management
- ✅ **DO**: Use service classes for data fetching
- ✅ **DO**: Handle loading and error states properly
- ✅ **DO**: Use layout components for consistent page structure
- ❌ **DON'T**: Include business logic directly in page components

### Routing

- ✅ **DO**: Use proper route definitions
- ✅ **DO**: Handle route parameters and navigation
- ✅ **DO**: Implement proper authentication guards when needed

### Examples

- ✅ **Home Page**: See `src/pages/Home.tsx` for basic page structure
- ✅ **Auth Pages**: See `src/pages/Login.tsx` for authentication flows
- ✅ **Admin Pages**: See `src/pages/admin/Dashboard.tsx` for protected routes

## 4. Touch Points / Key Files

- **Layouts**: `src/components/Layout.tsx` (page layout structure)
- **Contexts**: `src/contexts/` (state management)
- **Services**: `src/services/` (data fetching)
- **Components**: `src/components/` (UI components)

## 5. JIT Index Hints

- Find a page: `find src/pages -name "*.tsx" -o -name "*.ts"`
- Find page usage: `grep -r "import.*PageName" src/`
- Find all pages with useEffect: `grep -r "useEffect" src/pages/`

## 6. Common Gotchas

- Always handle loading and error states in pages
- Use proper TypeScript types for page props
- Implement proper authentication guards for protected routes
- Avoid putting too much logic in page components - move to services

## 7. Pre-PR Checks

```bash
# Run type checking
pnpm type-check

# Run tests
pnpm test

# Check for proper page structure
grep -r "useEffect" src/pages/ | wc -l
grep -r "useAuth\|useEvents" src/pages/ | wc -l
```