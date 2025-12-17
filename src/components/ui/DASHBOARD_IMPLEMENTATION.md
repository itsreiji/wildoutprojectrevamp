# Dashboard Layout Implementation with Radix UI

## Overview

This project implements a responsive dashboard layout using Radix UI and Radix Themes as per the 2025 dashboard architecture requirements. The implementation includes:

- High-level layout architecture with responsive panels
- Component best practices with Radix primitives
- Adaptive responsive strategy
- Accessibility considerations

## Architecture Components

### 1. DashboardLayout Component

The base `DashboardLayout` component provides:
- Horizontal Flex wrapper for side-by-side panels
- Fixed left sidebar (240-300px) with collapsible functionality
- Main content area with flexGrow="1"
- Optional third panel for contextual details

### 2. ResponsiveDashboardLayout Component

The advanced `ResponsiveDashboardLayout` component provides:
- Full responsive behavior with mobile-first approach
- Collapsible sidebars and optional right panels
- Adaptive width adjustments based on breakpoints
- Mobile overlay navigation

## Component Best Practices Implemented

### Navigation
- Uses Navigation Menu primitive for keyboard accessibility
- Proper focus management implemented

### Scroll Management
- Scroll Area primitive wraps long sidebars and content areas
- Custom-styled scrollbars that don't shift layout

### Interactivity
- Popovers for simple settings within panels
- Modals (Dialogs) for blocking actions
- Responsive behavior with mobile-first approach

### Visual Hierarchy
- Navigation links grouped by relevance
- Low-frequency items placed at bottom of sidebar

## Responsive Strategy (2025)

### Adaptive Widths
- Uses Radix Themes breakpoints for dynamic width adjustment
- Example: width={{ initial: '100%', md: '250px' }}

### Collapsible Panels
- Toggle state for sidebar with icon-only mode when collapsed
- Smooth transitions between expanded/collapsed states

### Mobile First
- Layout defaults to single column on mobile
- Sidebar accessible via hamburger menu using Sheet/Drawer pattern
- Right panel accessible via floating button on mobile

## Key Features

### 1. Left Sidebar
- Fixed width 240px (collapses to 64px)
- Navigation menu with icons and labels
- Back to site and logout options
- Mobile responsive overlay menu

### 2. Main Content Area
- Flexible width that takes remaining space
- Scrollable content area
- Responsive grid layouts for dashboard widgets

### 3. Right Panel (Optional)
- 300px contextual panel for details
- Toggle functionality on desktop
- Mobile overlay view
- Collapsible to save screen space

### 4. Header
- Responsive navigation toggle
- User profile information with avatar
- Page title display
- Mobile-friendly controls

## Usage Examples

### Basic Dashboard Layout
```tsx
<DashboardLayout
  sidebarContent={<SidebarContent />}
  headerContent="Dashboard"
  user={{ name: 'Admin User', email: 'admin@example.com' }}
  onLogout={() => console.log('Logout')}
  onBackToSite={() => console.log('Back to site')}
>
  <MainContent />
</DashboardLayout>
```

### Responsive Dashboard with Right Panel
```tsx
<ResponsiveDashboardLayout
  sidebarContent={<SidebarContent />}
  headerContent="Dashboard with Details"
  user={{ name: 'Admin User', email: 'admin@example.com' }}
  onLogout={() => console.log('Logout')}
  onBackToSite={() => console.log('Back to site')}
  showRightPanel={true}
  rightPanelContent={<RightPanelContent />}
>
  <MainContent />
</ResponsiveDashboardLayout>
```

## Accessibility Features

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Semantic HTML structure

## Responsive Breakpoints

- Mobile: <768px - Single column layout with overlay navigation
- Tablet: 768px-1024px - Adapts layout appropriately
- Desktop: >1024px - Full three-panel layout with collapsible options

## Implementation Files

- `src/components/ui/dashboard-layout.tsx` - Basic dashboard layout
- `src/components/ui/responsive-dashboard-layout.tsx` - Advanced responsive layout
- `src/components/dashboard/DashboardWithRightPanel.tsx` - Example implementation
- `src/components/ui/navigation-menu.tsx` - Enhanced navigation menu
- `src/components/ui/scroll-area.tsx` - Scroll area component (pre-existing)
- `src/components/ui/popover.tsx` - Popover component (pre-existing)
- `src/components/ui/dialog.tsx` - Dialog component (pre-existing)