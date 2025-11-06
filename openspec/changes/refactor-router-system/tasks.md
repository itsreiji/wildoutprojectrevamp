## 1. Implementation

### 1.1 Create Router Directory Structure
- [ ] Create `src/components/router/` directory
- [ ] Create `src/components/router/index.tsx` for main router implementation
- [ ] Create `src/components/router/Link.tsx` for Link component

### 1.2 Refactor RouterProvider to Path-Based System
- [ ] Update RouterContext to use `path: string` instead of `currentPage: Page`
- [ ] Update RouterProvider to track current path from `window.location.pathname`
- [ ] Update `navigateTo` function to accept path string instead of Page type
- [ ] Ensure `popstate` event listener correctly updates path state
- [ ] Maintain scroll-to-top behavior on navigation

### 1.3 Create Router Component
- [ ] Create `Router` component that accepts `routes` prop (object mapping paths to components)
- [ ] Implement route matching logic (exact path matching)
- [ ] Add 404 fallback route support (`routes['/404']` or default)
- [ ] Ensure Router component uses `useRouter` hook correctly

### 1.4 Create Link Component
- [ ] Create `Link` component in `src/components/router/Link.tsx`
- [ ] Accept `to`, `className`, and `children` props
- [ ] Use `useRouter` hook to access `navigate` function
- [ ] Implement `onClick` handler that prevents default and calls `navigate(to)`
- [ ] Set `href` attribute on underlying `<a>` tag for accessibility
- [ ] Support standard anchor tag behaviors (open in new tab, etc.)

### 1.5 Update App.tsx
- [ ] Define routes object mapping paths to page components
- [ ] Replace conditional rendering with `<Router routes={...} />` component
- [ ] Remove hardcoded page switching logic
- [ ] Ensure all existing routes work: '/', '/admin', '/events'

### 1.6 Update Navigation Components
- [ ] Update `Navigation.tsx` to use new `Link` component for internal navigation (if applicable)
- [ ] Update `DashboardLayout.tsx` to use new `Link` component where appropriate
- [ ] Ensure backward compatibility during transition period

### 1.7 Testing & Validation
- [ ] Test navigation between all routes using Link components
- [ ] Verify browser back/forward buttons work correctly
- [ ] Test URL updates in address bar
- [ ] Verify no page reloads occur on navigation
- [ ] Test 404 handling for unknown routes
- [ ] Run `tsc --noEmit` to ensure no type errors

