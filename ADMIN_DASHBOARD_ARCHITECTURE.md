# Admin Dashboard Architecture Plan

## Current State Analysis

### Existing Components

**1. Admin Layout (`src/admin/AdminLayout.tsx`)**
- Simple fixed sidebar (20% width) with navigation
- Mobile-responsive (hides sidebar on mobile)
- Fixed header with page title
- Scrollable main content area
- Uses custom implementation without shadcn/ui sidebar

**2. Dashboard Layout (`src/components/dashboard/DashboardLayout.tsx`)**
- More advanced implementation using shadcn/ui Sidebar component
- Collapsible sidebar (icon-only mode)
- Mobile overlay for better UX
- Sidebar trigger in header
- Better accessibility with keyboard shortcuts
- Local storage for sidebar state persistence
- Smooth transitions and animations

**3. UI Components Available**
- Comprehensive shadcn/ui component library including:
  - Sidebar with all variants (sidebar, floating, inset)
  - Dropdown menus
  - Avatars
  - Separators
  - Tables
  - Forms
  - Buttons
  - Tabs
  - Cards
  - And more...

**4. Tailwind CSS Configuration**
- Dark mode support via `class` strategy
- CSS variables for colors (using HSL)
- Extended theme with custom border radius
- Animation utilities for smooth transitions

## Requirements Analysis

Based on the task requirements:
1. **Fixed left panel** - Sidebar should remain fixed (no scrolling)
2. **Scrollable right panel** - Content area should scroll independently
3. **Responsive design** - Must work on mobile and desktop
4. **Accessible layout** - Proper ARIA attributes, keyboard navigation
5. **Clear visual hierarchy** - Distinct sections with proper spacing
6. **Smooth scrolling** - CSS transitions for better UX

## Proposed Architecture

### Component Structure

```
src/
├── admin/
│   ├── AdminLayout.tsx (main layout container)
│   ├── AdminSidebar.tsx (extract sidebar logic)
│   ├── AdminHeader.tsx (extract header logic)
│   └── AdminContent.tsx (scrollable content wrapper)
└── components/
    └── ui/
        └── sidebar.tsx (existing, will use)
```

### Layout Strategy

**Option 1: Use Enhanced DashboardLayout (Recommended)**
- Extend existing `DashboardLayout` which already has:
  - Fixed sidebar with `overflow-hidden`
  - Scrollable content with `overflow-y-auto`
  - Mobile responsiveness
  - Accessibility features
  - Keyboard shortcuts

**Option 2: Custom Implementation**
- Keep `AdminLayout` structure but enhance with:
  - Better mobile UX (overlay like DashboardLayout)
  - Sidebar state persistence
  - Keyboard navigation
  - Collapsible mode

### Detailed Component Breakdown

#### 1. AdminLayout (Container)
```tsx
<AdminLayout>
  <AdminSidebar />
  <AdminMain>
    <AdminHeader />
    <AdminContent>
      {/* Dynamic content */}
    </AdminContent>
  </AdminMain>
</AdminLayout>
```

#### 2. AdminSidebar (Fixed Panel)
```tsx
<div className="fixed left-0 top-0 h-screen w-[var(--sidebar-width)] overflow-hidden flex flex-col bg-card border-r border-border z-30">
  <SidebarHeader />
  <SidebarContent />
  <SidebarFooter />
</div>
```

**Key Features:**
- `overflow-hidden` prevents scrolling
- Fixed positioning keeps it visible
- Uses CSS variables for responsive width
- `z-30` ensures it stays above content

#### 3. AdminContent (Scrollable Panel)
```tsx
<div className="flex-1 overflow-y-auto p-4 md:p-6 bg-background relative z-10">
  <div className="w-full max-w-[1600px] mx-auto">
    {children}
  </div>
</div>
```

**Key Features:**
- `overflow-y-auto` enables vertical scrolling
- `flex-1` takes remaining space
- Proper padding with responsive values
- Max-width constraint for content

### Responsive Design Strategy

**Breakpoints:**
- **Mobile (< 768px):**
  - Sidebar collapses to icon-only or hides behind overlay
  - Mobile menu button appears in header
  - Full-width content when sidebar hidden

- **Tablet (768px - 1024px):**
  - Sidebar visible but collapsible
  - Proper spacing adjustments

- **Desktop (> 1024px):**
  - Full sidebar with labels
  - Optimal spacing

**Implementation:**
```tsx
// Mobile detection
const [isMobile, setIsMobile] = React.useState(false);

React.useEffect(() => {
  const checkIfMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };
  checkIfMobile();
  window.addEventListener('resize', checkIfMobile);
  return () => window.removeEventListener('resize', checkIfMobile);
}, []);

// Conditional rendering
{!isMobile && <AdminSidebar />}
{isMobile && <MobileSidebarOverlay />}
```

### Accessibility Requirements

**WCAG 2.1 Compliance:**

1. **Keyboard Navigation:**
   - Tab order: Skip to content link → Sidebar → Main content
   - Arrow keys to navigate sidebar items
   - Escape to close overlays

2. **ARIA Attributes:**
   - `aria-label` for sidebar: "Main navigation"
   - `aria-current="page"` for active nav item
   - `aria-expanded` for collapsible sections
   - `aria-controls` for related elements

3. **Focus Management:**
   - Trap focus in modals/dialogs
   - Return focus to trigger after closing
   - Visible focus indicators

4. **Semantic HTML:**
   - `<nav>` for sidebar
   - `<main>` for primary content
   - `<header>` for page header
   - `<section>` for content areas

### Visual Hierarchy

**Spacing System:**
- Header: `h-16` (4rem)
- Sidebar: `w-[16rem]` (256px) or `w-[3rem]` (48px) when collapsed
- Content padding: `p-4` (mobile) → `p-6` (desktop)
- Max content width: `max-w-[1600px]`

**Color Scheme:**
- Sidebar: `bg-card` with `border-r`
- Content: `bg-background`
- Header: `bg-card/95` with backdrop blur
- Active items: `bg-sidebar-accent`

**Typography:**
- Header title: `text-sm font-medium`
- Sidebar items: `text-sm`
- Content: `text-foreground`

### Smooth Scrolling

**CSS Transitions:**
```css
transition-all duration-300 ease-in-out
```

**Applied to:**
- Sidebar width changes
- Sidebar position (mobile overlay)
- Header sticky behavior
- Active state hover effects

### Integration with Existing Components

**Reuse Strategy:**

1. **From DashboardLayout:**
   - Sidebar component (shadcn/ui)
   - Mobile overlay pattern
   - Sidebar trigger button
   - Keyboard shortcuts
   - State persistence

2. **From AdminLayout:**
   - Navigation structure
   - User profile dropdown
   - Logo and branding
   - Page title display

3. **UI Components:**
   - Dropdown menus for user actions
   - Avatars for user profile
   - Separators for visual division
   - Buttons with proper variants

## Implementation Plan

### Phase 1: Foundation
- [ ] Extract sidebar logic into separate component
- [ ] Extract header logic into separate component
- [ ] Create scrollable content wrapper
- [ ] Implement responsive breakpoints

### Phase 2: Enhancements
- [ ] Add keyboard navigation
- [ ] Implement focus management
- [ ] Add ARIA attributes
- [ ] Set up state persistence

### Phase 3: Polish
- [ ] Add smooth transitions
- [ ] Implement mobile overlay
- [ ] Add skip to content link
- [ ] Test accessibility with screen readers

### Phase 4: Testing
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Keyboard-only navigation testing
- [ ] Screen reader testing

## Technical Decisions

### Why Use shadcn/ui Sidebar?
1. **Already in the codebase** - No new dependencies
2. **Feature-rich** - Collapsible, mobile-friendly, accessible
3. **Consistent** - Matches existing design system
4. **Well-tested** - Production-ready component

### Why Not Custom Implementation?
1. **Reinventing the wheel** - Sidebar is complex
2. **Accessibility risks** - Easy to miss requirements
3. **Maintenance burden** - More code to maintain
4. **Inconsistent UX** - May not match other components

### Mobile Strategy
- **Overlay approach** (like DashboardLayout) is better than:
  - Collapsing sidebar (loses context)
  - Stacked layout (wastes vertical space)
  - Bottom navigation (not suitable for admin)

## Accessibility Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Focus order is logical and visible
- [ ] ARIA attributes are properly set
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1)
- [ ] Semantic HTML is used appropriately
- [ ] Screen reader only text for icons
- [ ] Reduced motion preferences are respected
- [ ] Touch targets are sufficiently large

## Performance Considerations

1. **Virtualize long lists** in sidebar if many items
2. **Lazy load non-critical content** in main area
3. **Use CSS contains** for smooth scrolling
4. **Debounce resize events** for mobile detection
5. **Memoize components** to prevent unnecessary re-renders

## Browser Support

Target: Last 2 versions of all major browsers
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Polyfills needed:
- CSS `backdrop-filter` for Safari (optional)
- `classList` for very old browsers

## Migration Path

1. **Short-term:** Use DashboardLayout as is
2. **Medium-term:** Extract components for better maintainability
3. **Long-term:** Add advanced features (virtualization, etc.)

## Documentation

- Component props and usage
- Accessibility features
- Customization options
- Browser support matrix
- Migration guide from old layout
