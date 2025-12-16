# AdminDashboard Component

A comprehensive admin dashboard layout component with fixed sidebar navigation, responsive design, and accessibility features built for React and TypeScript applications.

## Component Overview

The `AdminDashboard` component provides a professional admin interface with a fixed left sidebar for navigation and a scrollable main content area. It supports dynamic admin sections, user authentication integration, and mobile-responsive overlay functionality.

### Key Features

- **Fixed Layout**: Sidebar remains pinned while content scrolls independently
- **Dynamic Navigation**: Auto-generates menu from admin sections with permission-based rendering
- **Mobile-Responsive**: Collapsible sidebar with dark overlay on mobile devices
- **Accessibility**: WCAG-compliant with keyboard navigation and screen reader support
- **Authentication**: Integrated user profile display and logout functionality
- **Router Integration**: Supports custom routing with `getAdminPath` navigation

### Use Cases

- Content management systems (CMS)
- Administrative panels
- Data dashboards
- User management interfaces
- Business intelligence tools

### Prerequisites

- React 19+
- TypeScript 5.9+
- Context providers: `AuthContext`, `StaticContentContext`, `RouterContext`
- Tailwind CSS for styling
- Lucide React icons

## Installation & Setup

The component ships as part of the project's admin component library.

### Import

```tsx
import { AdminDashboard } from '@/components/admin/AdminDashboard'
```

### Dependencies

Requires these contexts to be available in the component tree:

- `AuthContext` - User authentication state and methods
- `StaticContentContext` - Admin section definitions and permissions
- `RouterContext` - Navigation utilities and path helpers

### Context Setup Example

```tsx
// src/App.tsx or admin wrapper component
import { AuthProvider } from '@/contexts/AuthContext'
import { StaticContentProvider } from '@/contexts/StaticContentContext'
import { RouterProvider } from '@/components/router'

function AdminApp() {
  return (
    <RouterProvider>
      <AuthProvider>
        <StaticContentProvider>
          <AdminDashboard>
            {/* Admin content */}
          </AdminDashboard>
        </StaticContentProvider>
      </AuthProvider>
    </RouterProvider>
  )
}
```

## Props Documentation

### `AdminDashboardProps`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `React.ReactNode` | Yes | - | Main content to render in the scrollable area |

### Example

```tsx
<AdminDashboard>
  <div className="p-4">
    <h1>Dashboard Content</h1>
    {/* Your admin content here */}
  </div>
</AdminDashboard>
```

## Usage Examples

### Basic Admin Dashboard Implementation

```tsx
// src/pages/AdminPage.tsx
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { DashboardHome } from '@/components/dashboard/DashboardHome'

export default function AdminPage() {
  return (
    <AdminDashboard>
      <DashboardHome />
    </AdminDashboard>
  )
}
```

### Advanced Customization with Custom Navigation

```tsx
// src/components/CustomAdminDashboard.tsx
import { useStaticContent } from '@/contexts/StaticContentContext'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

interface CustomAdminDashboardProps {
  children: React.ReactNode
  showFooterStats?: boolean
}

export function CustomAdminDashboard({ children, showFooterStats }: CustomAdminDashboardProps) {
  return (
    <AdminDashboard>
      {showFooterStats && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">42</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
          </div>
        </div>
      )}
      {children}
    </AdminDashboard>
  )
}
```

### Integration with Routing Systems

```tsx
// src/App.tsx
import { BrowserRouter } from 'react-router-dom'
import { RouterProvider } from '@/components/router'

function App() {
  return (
    <BrowserRouter>
      <RouterProvider>
        <Routes>
          <Route path="/admin/*" element={
            <AuthGuard>
              <AdminDashboard />
            </AuthGuard>
          } />
        </Routes>
      </RouterProvider>
    </BrowserRouter>
  )
}
```

#### Authentication Integration Examples

##### With Protected Routes

```tsx
// src/components/ProtectedAdmin.tsx
import { useAuth } from '@/contexts/AuthContext'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/admin/login" />

  return <AdminDashboard>{children}</AdminDashboard>
}
```

##### Custom User Profile Display

```tsx
// src/components/CustomUserDisplay.tsx (extends AdminDashboard functionality)
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function CustomUserDisplay() {
  const { user } = useAuth()

  const displayInfo = {
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin',
    role: user?.user_metadata?.role || 'Administrator',
    initials: (user?.user_metadata?.full_name || user?.email || 'A').charAt(0).toUpperCase()
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>{displayInfo.initials}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm">
        <span className="font-medium">{displayInfo.name}</span>
        <span className="text-xs text-muted-foreground">{displayInfo.role}</span>
      </div>
    </div>
  )
}
```

## Accessibility Guide

The `AdminDashboard` component meets WCAG 2.1 AA standards with comprehensive accessibility features.

### WCAG Compliance Features

- **Keyboard Navigation**: Full keyboard support with Tab, Enter, Space, and Arrow keys
- **Screen Reader Support**: Proper ARIA labels and semantic HTML structure
- **Focus Management**: Visible focus indicators with proper tab order
- **Color Contrast**: Minimum 4.5:1 ratio meeting AA guidelines
- **Reduced Motion**: Respects `prefers-reduced-motion` media queries

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move to next focusable element |
| `Shift + Tab` | Move to previous focusable element |
| `Enter` / `Space` | Activate buttons and menu items |
| `Escape` | Close mobile menu overlay |
| `Arrow Up/Down` | Navigate sidebar menu items (when focused) |

### Screen Reader Support

- Navigation sections announced with "Admin navigation" label
- Current page indicated with `aria-current="page"`
- Menu states communicated via `aria-expanded`
- Hidden elements managed with `aria-hidden`
- Logo and icons include `aria-label` descriptions

### Mobile Accessibility

- Touch targets minimum 44px for thumb accessibility
- Swipe gestures disabled to prevent accidental activation
- Large tap areas for menu toggle buttons
- Proper heading structure for content navigation

### Implementation Details

```tsx
// Keyboard handler example (internal)
const handleKeyDown = (e: React.KeyboardEvent, onClick: () => void) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    onClick()
  }
}

// ARIA attributes
<button
  aria-current={isActive ? 'page' : undefined}
  aria-label="Open menu"
  aria-expanded={isOpen}
/>
```

## Customization Guide

### Modifying Navigation Sections

Navigation dynamically renders from `adminSections` context:

```tsx
// Custom section structure (in StaticContentContext)
interface AdminSection {
  id: string
  slug: string
  label: string
  order_index: number
  icon: 'dashboard' | 'shield' | 'users' | 'settings'
}

// Modify sections in context
const customSections: AdminSection[] = [
  { id: '1', slug: 'home', label: 'Dashboard', order_index: 0, icon: 'dashboard' },
  { id: '2', slug: 'users', label: 'Users', order_index: 1, icon: 'users' }
]
```

### Styling Customization with Tailwind

Override default styles using Tailwind classes:

```tsx
// Custom styled dashboard
<AdminDashboard className="custom-admin" />

/* In your CSS file */
.custom-admin {
  /* Sidebar */
  --admin-sidebar-bg: theme('colors.gray.900');
  --admin-sidebar-text: theme('colors.white');

  /* Header */
  --admin-header-bg: theme('colors.blue.600');
}
```

#### Specific Component Overrides

```tsx
// Sidebar container (id: admin-sidebar)
#admin-sidebar {
  background: linear-gradient(180deg, var(--admin-sidebar-bg) 0%, var(--admin-sidebar-bg-darker) 100%);
}

// Header container (id: admin-header)
#admin-header {
  border-bottom: 2px solid theme('colors.red.500');
}
```

### Custom Admin Controls/User Management Sections

```tsx
// src/components/admin/CustomSidebar.tsx
import { useStaticContent } from '@/contexts/StaticContentContext'
import { Badge } from '@/components/ui/badge'

export function CustomSidebar() {
  const { adminSections, getSectionPermissions } = useStaticContent()

  return (
    <nav aria-label="Admin navigation">
      {adminSections.map(section => {
        const hasAlerts = section.slug === 'messages' && unreadCount > 0

        return (
          <button key={section.id} className="relative">
            {section.label}
            {hasAlerts && (
              <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0">
                {unreadCount}
              </Badge>
            )}
          </button>
        )
      })}
    </nav>
  )
}
```

### Dynamic Content Placement Guidelines

#### Breadcrumbs Integration

```tsx
// In admin content area
import { useLocation } from 'react-router-dom'

function AdminContent({ children }) {
  const location = useLocation()

  const breadcrumbs = generateBreadcrumbs(location.pathname)

  return (
    <main>
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <li key={index}>
              <Link to={crumb.path}>{crumb.label}</Link>
            </li>
          ))}
        </ol>
      </nav>
      {children}
    </main>
  )
}
```

#### Loading States

```tsx
// Content area with loading
import { Skeleton } from '@/components/ui/skeleton'

function AdminContent({ isLoading, children }) {
  return (
    <div>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      ) : (
        children
      )}
    </div>
  )
}
```

## Responsive Design

### Breakpoint Behaviors

| Breakpoint | Behavior |
|------------|----------|
| `< 768px` (Mobile) | Sidebar hidden behind overlay, hamburger menu in header, full-width content |
| `768px - 1024px` (Tablet) | Sidebar collapsible, optional narrow mode, content shrinks to fit |
| `> 1024px` (Desktop) | Full sidebar visible, optimal content padding |

### Mobile Overlay Functionality

```tsx
// Mobile sidebar (internal implementation)
const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false)

<div
  className="fixed left-0 top-0 h-screen w-[16rem] border-r border-border bg-card z-40 md:block"
  style={{
    width: isMobile ? '16rem' : '16rem',
    transform: isMobile && isMobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
    ...(isMobile && isMobileSidebarOpen ? {
      boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
    } : {}),
  }}
/>

// Dark overlay
<div
  className="fixed inset-0 bg-black/50 z-30 md:hidden"
  style={{
    display: isMobileSidebarOpen ? 'block' : 'none',
    opacity: isMobileSidebarOpen ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  }}
  onClick={() => setIsMobileSidebarOpen(false)}
  aria-hidden={!isMobileSidebarOpen}
/>
```

### Responsive Adjustments

- **Typography**: Scales from `text-sm` on mobile to `text-base` on desktop
- **Spacing**: Padding reduces from `p-6` on desktop to `p-4` on mobile
- **Touch Targets**: Minimum 44px height for mobile interaction
- **Content Width**: Max width of `max-w-[1600px]` constrains wide content

## Best Practices

### Performance Tips

- **Memoize Navigation**: Use `React.memo` for sidebar performance
- **Lazy Load Content**: Split admin routes with dynamic imports
- **Debounce Resizing**: Throttle window resize events for mobile detection

```tsx
// Debounced resize handler
import { useMemo, useCallback } from 'react'
import { debounce } from 'lodash'

const debouncedResize = useMemo(
  () => debounce(() => setIsMobile(window.innerWidth < 768), 100),
  []
)

window.addEventListener('resize', debouncedResize)
```

### Security Considerations

- **Authentication Guards**: Always wrap admin routes with auth checks
- **Permission-Based Rendering**: Use `getSectionPermissions` to control access
- **CSRF Protection**: Include tokens for admin actions
- **Input Validation**: Sanitize all form inputs

### Maintenance Guidelines

- **Type Safety**: Use strict TypeScript interfaces for admin sections
- **Testing Coverage**: Unit tests for navigation logic and responsiveness
- **Context Updates**: Document changes to required context providers
- **Icon Consistency**: Standardize icon usage from Lucide React

## Troubleshooting

### Common Issues and Solutions

#### Sidebar Not Displaying

**Problem**: Sidebar invisible or partially rendered.

**Solutions**:
- Verify `StaticContentContext` provides valid `adminSections` array
- Check CSS positioning conflicts with `z-index` values
- Ensure `overflow-hidden` applied to parent containers
- Confirm breakpoint detection works: `window.innerWidth < 768`

#### Mobile Overlay Problems

**Problem**: Overlay doesn't cover screen or close on tap.

**Solutions**:
- Check `z-index` hierarchy: overlay uses `z-30`, sidebar `z-40`
- Verify `pointer-events` set correctly: `'auto'` when open, `'none'` when closed
- Test `onClick` handler on overlay element
- Ensure mobile state updates on window resize

#### Navigation Not Working

**Problem**: Clicking menu items doesn't change routes.

**Solutions**:
- Confirm `RouterContext` provides working `navigate` and `getAdminPath` functions
- Check permission filtering: `getSectionPermissions(section.slug).canView`
- Verify `currentPage` derivation from `getCurrentSubPath()`
- Test router integration independently

#### Authentication Loading Issues

**Problem**: Logout doesn't work or user info missing.

**Solutions**:
- Verify `AuthContext` provides `signOut` method and `user` object
- Check error handling in logout `try/catch`
- Ensure user metadata parsing handles missing fields gracefully
- Test auth context outside admin dashboard

#### Styling Issues

**Problem**: Custom classes not applying or theme variables not working.

**Solutions**:
- Confirm Tailwind CSS configured with custom properties
- Use browser dev tools to inspect computed styles
- Verify CSS specificity for overridden components
- Test theme variables in isolation

#### Keyboard Navigation Failure

**Problem**: Tab order incorrect or focus trapping issues.

**Solutions**:
- Check `tabIndex={0}` and `role` attributes on interactive elements
- Verify no `outline: none` overrides default focus indicators
- Test skip links implementation
- Confirm ARIA attributes correct for screen reader compatibility

### Debug Commands

```bash
# Check context providers
console.log('Admin sections:', adminSections)
console.log('Current user:', user)
console.log('Router state:', getCurrentSubPath())

# Test mobile detection
console.log('Is mobile:', window.innerWidth < 768)
console.log('Computed styles:', getComputedStyle(document.getElementById('admin-sidebar')))
```

## Migration Guide

### Upgrading from Existing Admin Layouts

#### From Legacy AdminLayout

```tsx
// Before: Legacy layout
<AdminLayout>
  <div className="admin-content">
    {children}
  </div>
</AdminLayout>

// After: AdminDashboard
<AdminDashboard>
  {children}
</AdminDashboard>
```

**Breaking Changes:**
- Remove custom content wrapper divs
- Footer and action bar logic moved to content area
- Sidebar state managed internally (no external `isOpen` prop)

#### From DashboardLayout

If migrating from `DashboardLayout`:

```tsx
// Before
<DashboardLayout>
  <EmptyContent />
</DashboardLayout>

// After
<AdminDashboard>
  <EmptyContent />
</AdminDashboard>
```

**Differences:**
- Admin sections now drive navigation (not hardcoded)
- Permission-based routing replaces generic nav
- Mobile overlay standardized across admin interfaces

#### Custom Navigation Upgrades

When adding custom navigation:

```tsx
// Extend StaticContentContext
const customAdminSections = [
  ...existingSections,
  {
    id: 'analytics',
    slug: 'analytics',
    label: 'Analytics',
    order_index: 5,
    icon: 'bar-chart',
  }
]

// Update context provider
<StaticContentProvider adminSections={customAdminSections}>
  <AdminDashboard>{children}</AdminDashboard>
</StaticContentProvider>
```

#### Performance Migration Notes

- View-based routing replaces URL-based in complex cases
- Icon mapping requires `iconMap` updates for custom icons
- Redux/Recoil selectors should adapt to context hooks

For complex migrations, encapsulate `AdminDashboard` in wrapper component:

```tsx
// Migration wrapper
function LegacyAdminCompat({ children, ...legacyProps }) {
  // Transform legacy props to AdminDashboard format
  const adaptedProps = transformLegacyProps(legacyProps)

  return <AdminDashboard {...adaptedProps}>{children}</AdminDashboard>
}
```

### Version Compatibility

- **React 18+**: Required for concurrent features
- **TypeScript 5.9+**: Strict mode enforcement
- **Supabase Client**: v2.x for auth compatibility

### Deprecation Warnings

Monitor console for:
- Legacy context usage warnings
- Deprecated style class notifications
- Authentication method changes

## Conclusion

The `AdminDashboard` component provides a robust, accessible foundation for admin interfaces with extensive customization capabilities. Its integration with project contexts ensures consistent behavior across different admin sections while maintaining type safety and performance.

For additional help, refer to:
- Context documentation: [@/contexts/StaticContentContext](src/contexts/StaticContentContext.tsx)
- Router implementation: [@/components/router](src/components/router/index.tsx)
- Authentication setup: [@/contexts/AuthContext](src/contexts/AuthContext.tsx)