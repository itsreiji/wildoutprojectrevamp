# WildOut! Pages - CLAUDE.md

> **Parent Context**: This extends [../CLAUDE.md](../CLAUDE.md)

## 1. Pages Identity

### Overview

- **Technology**: React 19, TypeScript 5.9, Vite 7.2
- **Pattern**: Page-level components with routing
- **Purpose**: Main application pages and routing structure

## 2. Directory Structure

```
src/pages/
├── AuthCallbackPage.tsx      # Authentication callback page
├── [future pages]            # Additional page components
└── index.ts                  # Page exports
```

## 3. Page Development Patterns

### Page Structure

✅ **DO**: Use this structure for new pages

```tsx
// 1. Imports
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";

// 2. Props Interface (if needed)
interface PageProps {
  /** Page-specific props */
  pageId?: string;
}

// 3. Page Component
export function PageName({ pageId }: PageProps) {
  // 4. Hooks and State
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // 5. Effects
  React.useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // 6. Handlers
  const handleAction = () => {
    // Page-specific logic
  };

  // 7. Render
  return (
    <Layout>
      <div className="page-container">
        <h1>Page Title</h1>
        <div className="page-content">{/* Page content */}</div>
      </div>
    </Layout>
  );
}
```

### Routing Integration

✅ **DO**: Integrate with the router

```tsx
// In src/components/router/index.tsx
import { PageName } from '@/pages/PageName';

// Add to route configuration
{
  path: '/page-name',
  element: <PageName />,
  protected: true, // If authentication required
}
```

## 4. Common Page Types

### Public Pages

- **Purpose**: Accessible without authentication
- **Pattern**: No auth checks, open to all users
- **Example**: LandingPage, AboutPage, ContactPage

```tsx
// Public page example
export function PublicPage() {
  return (
    <Layout>
      <div className="public-page">{/* Public content */}</div>
    </Layout>
  );
}
```

### Protected Pages

- **Purpose**: Require authentication
- **Pattern**: Use auth context and redirect if not authenticated
- **Example**: Dashboard, Profile, Settings

```tsx
// Protected page example
export function ProtectedPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <div className="protected-page">{/* Protected content */}</div>
    </Layout>
  );
}
```

### Admin Pages

- **Purpose**: Require admin privileges
- **Pattern**: Use auth context with role checking
- **Example**: AdminDashboard, UserManagement

```tsx
// Admin page example
export function AdminPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      navigate("/unauthorized", { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <AdminLayout>
      <div className="admin-page">{/* Admin content */}</div>
    </AdminLayout>
  );
}
```

## 5. Page-Specific Patterns

### Authentication Callback Page

✅ **DO**: Follow the AuthCallbackPage pattern

```tsx
// src/pages/AuthCallbackPage.tsx
export function AuthCallbackPage() {
  const { handleAuthCallback } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const processAuthCallback = async () => {
      try {
        await handleAuthCallback();
        navigate("/dashboard");
      } catch (err) {
        setError("Authentication failed. Please try again.");
        console.error("Auth callback error:", err);
      }
    };

    processAuthCallback();
  }, [handleAuthCallback, navigate]);

  if (error) {
    return (
      <Layout>
        <div className="auth-error">
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <Button onClick={() => navigate("/login")}>Try Again</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="auth-loading">
        <LoadingSpinner />
        <p>Processing authentication...</p>
      </div>
    </Layout>
  );
}
```

## 6. Page Testing

### Unit Tests

✅ **DO**: Test page rendering and behavior

```tsx
// PageName.test.tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PageName } from "./PageName";

describe("PageName", () => {
  it("renders page title", () => {
    render(
      <MemoryRouter>
        <PageName />
      </MemoryRouter>
    );

    expect(screen.getByText("Page Title")).toBeInTheDocument();
  });

  it("shows loading state when authenticating", () => {
    // Mock auth context
    render(
      <MemoryRouter>
        <PageName />
      </MemoryRouter>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
```

## 7. Performance Optimization

### Code Splitting

✅ **DO**: Use lazy loading for large pages

```tsx
// In router configuration
const PageName = React.lazy(() => import('@/pages/PageName'));

// Add to route
{
  path: '/page-name',
  element: (
    <React.Suspense fallback={<LoadingSpinner />}>
      <PageName />
    </React.Suspense>
  ),
}
```

### Memoization

✅ **DO**: Memoize expensive calculations

```tsx
const expensiveCalculation = React.useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

## 8. Common Gotchas

### Routing Issues

- ❌ **DON'T**: Forget to wrap pages in MemoryRouter for tests
- ❌ **DON'T**: Use absolute paths in navigation (use relative paths)
- ❌ **DON'T**: Forget to handle loading states in protected pages

### Authentication

- ❌ **DON'T**: Assume user is always authenticated
- ❌ **DON'T**: Forget to check user roles for admin pages
- ❌ **DON'T**: Store sensitive data in page state

### Performance

- ❌ **DON'T**: Import large libraries in page components
- ❌ **DON'T**: Create heavy computations in render
- ❌ **DON'T**: Forget to clean up effects and subscriptions

## 9. JIT Search Commands

```bash
# Find all page components
rg -n "export function [A-Z].*Page" src/pages

# Find page test files
rg -n "\.test\.tsx" src/pages

# Find route configurations
rg -n "path:" src/components/router

# Find page imports
rg -n "from.*pages" src/
```

## 10. Pre-PR Checklist

```bash
# Run page-specific tests
pnpm test src/pages/**/*.test.*

# Check TypeScript types
pnpm type-check

# Verify routing works
pnpm dev && manually test navigation
```
