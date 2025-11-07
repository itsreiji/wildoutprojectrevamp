## 1. Router Enhancement
- [ ] 1.1 Add nested route matching support to router (e.g., `/admin/*` matches `/admin/events`, `/admin/team`)
- [ ] 1.2 Update router to extract sub-paths from nested routes (e.g., `events` from `/admin/events`)

## 2. Dashboard Refactoring
- [ ] 2.1 Remove `currentPage` state from `Dashboard.tsx`
- [ ] 2.2 Remove `onNavigate` callback from `Dashboard.tsx`
- [ ] 2.3 Update `Dashboard` to use `useRouter` hook to get current path
- [ ] 2.4 Extract admin sub-path from current URL (e.g., `events` from `/admin/events`)
- [ ] 2.5 Update `renderPage()` to use extracted sub-path instead of state

## 3. DashboardLayout Updates
- [ ] 3.1 Remove `currentPage` prop from `DashboardLayoutProps` interface
- [ ] 3.2 Remove `onNavigate` prop from `DashboardLayoutProps` interface
- [ ] 3.3 Add `useRouter` hook to `DashboardLayout` to get current path
- [ ] 3.4 Derive active navigation item from current URL path
- [ ] 3.5 Update navigation links to use router's `navigate` function with full paths (e.g., `/admin/events`)
- [ ] 3.6 Update header to display current page label based on URL path

## 4. App Routing Updates
- [ ] 4.1 Update `App.tsx` routes to support nested admin routes
- [ ] 4.2 Ensure `/admin` route still works as default (redirects to `/admin/home` or shows home)
- [ ] 4.3 Test all admin routes: `/admin`, `/admin/home`, `/admin/events`, `/admin/team`, `/admin/partners`, `/admin/gallery`, `/admin/settings`

## 5. Testing
- [ ] 5.1 Verify browser back/forward buttons work correctly
- [ ] 5.2 Verify direct URL navigation works (e.g., typing `/admin/events` in address bar)
- [ ] 5.3 Verify navigation links update URL and content correctly
- [ ] 5.4 Verify active navigation item highlights correctly based on URL
- [ ] 5.5 Test responsive behavior (mobile sidebar toggle still works)

