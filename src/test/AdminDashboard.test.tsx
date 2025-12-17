import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock Figma asset import before other imports
vi.mock('figma:asset/7f0e33eb82cb74c153a3d669c82ee10e38a7e638.png', () => 'test-logo.png');

// Mock dependencies
vi.mock('../components/router', () => ({
  useRouter: vi.fn(() => ({
    getCurrentSubPath: vi.fn(() => 'home'),
    navigate: vi.fn(),
    getAdminPath: vi.fn((slug: string) => `/admin/${slug}`)
  }))
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: '1',
      email: 'admin@wildoutproject.com',
      user_metadata: { full_name: 'Admin User' }
    },
    signOut: vi.fn(() => Promise.resolve())
  }))
}));

vi.mock('../contexts/StaticContentContext', () => ({
  useStaticContent: vi.fn(() => ({
    adminSections: [
      {
        id: 'home',
        slug: 'home',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        order_index: 1
      },
      {
        id: 'events',
        slug: 'events',
        label: 'Events',
        icon: 'Calendar',
        order_index: 2
      },
      {
        id: 'settings',
        slug: 'settings',
        label: 'Settings',
        icon: 'Settings',
        order_index: 3
      }
    ],
    getSectionPermissions: vi.fn(() => ({ canView: true }))
  }))
}));

// Mock Lucide icons
const mockIcon = 'svg';
vi.mock('lucide-react', () => ({
  LayoutDashboard: mockIcon,
  Users: mockIcon,
  Settings: mockIcon,
  Shield: mockIcon,
  LogOut: mockIcon,
  ChevronLeft: mockIcon,
  Menu: mockIcon,
  X: mockIcon,
  Calendar: mockIcon
}));

// Mock the logo import and UI components
vi.mock('figma:asset/7f0e33eb82cb74c153a3d669c82ee10e38a7e638.png', () => 'test-logo.png');

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: any) =>
    React.createElement('div', { className, 'data-testid': 'user-avatar' }, children),
  AvatarFallback: ({ children, className }: any) =>
    React.createElement('div', { className, 'data-testid': 'user-avatar-fallback' }, children)
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: ({ className }: any) =>
    React.createElement('div', { className, 'data-testid': 'admin-header-separator' })
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, size, className, onClick, ...props }: any) =>
    React.createElement('button', { className, onClick, ...props }, children)
}));

// Import the actual component after mocks
import AdminDashboard from '../components/admin/AdminDashboard';

const renderAdminDashboard = () => {
  return render(<AdminDashboard />);
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window size to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Layout Functionality', () => {
    it('should render the main layout structure', () => {
      renderAdminDashboard();
      const layout = screen.getByTestId('admin-dashboard-layout');
      expect(layout).toBeInTheDocument();
      expect(layout).toHaveClass('relative flex h-screen w-full overflow-hidden bg-background');
    });

    it('should render admin sidebar', () => {
      renderAdminDashboard();
      const sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass('fixed top-0 left-0 h-full');
    });

    it('should render main content area', () => {
      renderAdminDashboard();
      const mainContent = screen.getByTestId('admin-main-content');
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).toHaveClass('relative flex-1 flex flex-col h-full min-w-0');
    });

    it('should render admin header', () => {
      renderAdminDashboard();
      const header = screen.getByTestId('admin-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex h-16 shrink-0 items-center gap-2 border-b border-border');
    });

    it('should render main content section', () => {
      renderAdminDashboard();
      const main = screen.getByTestId('admin-main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('flex-1 overflow-y-auto p-4 md:p-6 bg-background');
    });

    it('should render child content in main area', () => {
      renderAdminDashboard();
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Layout Positioning', () => {
    it('should have fixed sidebar placement on desktop', () => {
      renderAdminDashboard();
      const sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toHaveClass('fixed');
      expect(sidebar).toHaveClass('top-0');
      expect(sidebar).toHaveClass('left-0');
      expect(sidebar).toHaveClass('h-full');
    });

    it('should have proper main content margin on desktop', () => {
      renderAdminDashboard();
      const mainContent = screen.getByTestId('admin-main-content');
      expect(mainContent).toHaveClass('ml-0 md:ml-[16rem]');
    });
  });

  describe('Responsive Design - Mobile', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('should show mobile menu button', () => {
      renderAdminDashboard();
      const menuButton = screen.getByTestId('mobile-menu-button');
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveClass('md:hidden');
    });

    it('should have overlay hidden by default', () => {
      renderAdminDashboard();
      const overlay = screen.getByTestId('admin-mobile-overlay');
      expect(overlay).toHaveStyle('display: none');
      expect(overlay).toHaveStyle('opacity: 0');
      expect(overlay).toHaveAttribute('aria-hidden', 'true');
    });

    it('should show overlay when mobile sidebar opens', () => {
      renderAdminDashboard();
      const menuButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(menuButton);

      const overlay = screen.getByTestId('admin-mobile-overlay');
      expect(overlay).toHaveStyle('display: block');
      expect(overlay).toHaveStyle('opacity: 1');
      expect(overlay).toHaveAttribute('aria-hidden', 'false');
    });

    it('should hide overlay when overlay is clicked', () => {
      renderAdminDashboard();
      const menuButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(menuButton);

      const overlay = screen.getByTestId('admin-mobile-overlay');
      fireEvent.click(overlay);

      expect(overlay).toHaveStyle('display: none');
      expect(overlay).toHaveStyle('opacity: 0');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for navigation', () => {
      renderAdminDashboard();
      const sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toHaveAttribute('role', 'navigation');
      expect(sidebar).toHaveAttribute('aria-label', 'Admin navigation');
    });

    it('should have menu items with proper roles', () => {
      renderAdminDashboard();
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBe(5); // 3 sections + back + logout
      menuItems.forEach(item => {
        expect(item).toHaveAttribute('tabindex', '0');
      });
    });

    it('should have proper ARIA labels for navigation links', () => {
      renderAdminDashboard();
      const backButton = screen.getByRole('menuitem', { name: /back to website/i });
      expect(backButton).toHaveAttribute('aria-label', 'Back to website');

      const logoutButton = screen.getByRole('menuitem', { name: /log out/i });
      expect(logoutButton).toHaveAttribute('aria-label', 'Log out');
    });

    it('should indicate current page with ARIA current', () => {
      renderAdminDashboard();
      const currentItem = screen.getByRole('menuitem', { current: 'page' });
      expect(currentItem).toHaveAttribute('aria-current', 'page');
      expect(currentItem.textContent).toMatch(/Dashboard/i);
    });

    it('should handle keyboard navigation with Enter key', () => {
      renderAdminDashboard();
      const eventsItem = screen.getByRole('menuitem', { name: /Events/i });

      // Simulate Enter key press
      fireEvent.keyDown(eventsItem, { key: 'Enter', code: 'Enter' });

      // Should not crash and maintain focus
      expect(document.activeElement).toBe(eventsItem);
    });

    it('should handle keyboard navigation with Space key on mobile toggle', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderAdminDashboard();
      const menuButton = screen.getByTestId('mobile-menu-button');

      // Simulate Space key press
      fireEvent.keyDown(menuButton, { key: ' ', code: 'Space' });

      const overlay = screen.getByTestId('admin-mobile-overlay');
      expect(overlay).toHaveStyle('display: block');
    });
  });

  describe('Navigation', () => {
    it('should render all admin sections', () => {
      renderAdminDashboard();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Events')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Back to Site')).toBeInTheDocument();
      expect(screen.getByText('Log out')).toBeInTheDocument();
    });

    it('should show active state for current page', () => {
      renderAdminDashboard();

      const activeItem = screen.getByRole('menuitem', { current: 'page' });
      expect(activeItem).toHaveClass('bg-accent text-accent-foreground');
      expect(activeItem).not.toHaveClass('text-muted-foreground');
    });

    it('should have inactive styles for non-current pages', () => {
      renderAdminDashboard();

      const eventsItem = screen.getByRole('menuitem', { name: /Events/i });
      expect(eventsItem).not.toHaveAttribute('aria-current');
      expect(eventsItem).toHaveClass('text-muted-foreground');
      expect(eventsItem).not.toHaveClass('bg-accent');
    });

    it('should enable mobile sidebar toggle functionality', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderAdminDashboard();
      const overlay = screen.getByTestId('admin-mobile-overlay');

      // Initially hidden
      expect(overlay).toHaveStyle('display: none');

      const menuButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(menuButton);

      // Should open overlay
      expect(overlay).toHaveStyle('display: block');

      // Clicking again should close
      fireEvent.click(menuButton);
      expect(overlay).toHaveStyle('display: none');

      // Clicking a menu item should also close sidebar
      fireEvent.click(menuButton);
      expect(overlay).toHaveStyle('display: block');

      const eventsItem = screen.getByRole('menuitem', { name: /Events/i });
      fireEvent.click(eventsItem);
      expect(overlay).toHaveStyle('display: none');
    });
  });

  describe('User Interface', () => {
    it('should display header with current page title', () => {
      renderAdminDashboard();
      const headerTitle = screen.getByTestId('admin-header-title');
      expect(headerTitle).toBeInTheDocument();
      expect(headerTitle.textContent).toMatch(/Dashboard|Admin Dashboard/i);
    });

    it('should display user avatar with fallback', () => {
      renderAdminDashboard();

      const avatar = screen.getByTestId('user-avatar');
      expect(avatar).toBeInTheDocument();

      const avatarFallback = screen.getByTestId('user-avatar-fallback');
      expect(avatarFallback).toBeInTheDocument();

      // Check that initial is derived from email
      expect(avatarFallback.textContent).toBe('A');
    });

    it('should display user name and email', () => {
      renderAdminDashboard();

      expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User');
      expect(screen.getByTestId('user-email')).toHaveTextContent('admin@wildoutproject.com');
    });

    it('should display admin logo and branding', () => {
      renderAdminDashboard();

      const logo = screen.getByTestId('admin-logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveClass('flex items-center gap-2 font-semibold text-lg');

      const logoImage = screen.getByTestId('logo-image');
      expect(logoImage).toBeInTheDocument();
      expect(logoImage).toHaveAttribute('alt', 'WildOut Admin Logo');

      const logoText = screen.getByTestId('logo-text');
      expect(logoText).toHaveTextContent('Admin Panel');
    });

    it('should have proper visual hierarchy with separators', () => {
      renderAdminDashboard();

      const separator = screen.getByTestId('admin-header-separator');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveClass('mr-2 h-4 bg-border');
    });
  });

  describe('Admin Sections', () => {
    it('should filter sections based on permissions', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useStaticContent } = require('../contexts/StaticContentContext');
      const mockUseStaticContent = useStaticContent as MockedFunction<any>;

      mockUseStaticContent.mockReturnValue({
        adminSections: [
          {
            id: 'visible',
            slug: 'visible',
            label: 'Visible Section',
            icon: 'LayoutDashboard',
            order_index: 1
          },
          {
            id: 'hidden',
            slug: 'hidden',
            label: 'Hidden Section',
            icon: 'Settings',
            order_index: 2
          }
        ],
        getSectionPermissions: vi.fn().mockImplementation((sectionSlug: string) =>
          sectionSlug === 'visible' ? { canView: true } : { canView: false }
        )
      });

      renderAdminDashboard();

      expect(screen.getByText('Visible Section')).toBeInTheDocument();
      expect(screen.queryByText('Hidden Section')).not.toBeInTheDocument();
    });

    it('should sort sections by order_index', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useStaticContent } = require('../contexts/StaticContentContext');
      const mockUseStaticContent = useStaticContent as MockedFunction<any>;

      mockUseStaticContent.mockReturnValue({
        adminSections: [
          { id: 'first', slug: 'first', label: 'First', icon: 'Settings', order_index: 2 },
          { id: 'second', slug: 'second', label: 'Second', icon: 'Users', order_index: 1 },
          { id: 'third', slug: 'third', label: 'Third', icon: 'Shield', order_index: 3 }
        ],
        getSectionPermissions: vi.fn(() => ({ canView: true }))
      });

      renderAdminDashboard();

      const menuItems = screen.getAllByRole('menuitem');
      // Include "Back to Site" and "Log out" buttons
      expect(menuItems.length).toBe(5);

      const sectionItems = menuItems.filter(item =>
        !item.textContent?.includes('Back') && !item.textContent?.includes('Log')
      );

      expect(sectionItems[0]).toHaveTextContent('Second');
      expect(sectionItems[1]).toHaveTextContent('First');
      expect(sectionItems[2]).toHaveTextContent('Third');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user information gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useAuth } = require('../contexts/AuthContext');
      const mockUseAuth = useAuth as MockedFunction<any>;

      mockUseAuth.mockReturnValue({
        user: null,
        signOut: vi.fn(() => Promise.resolve())
      });

      renderAdminDashboard();

      // Should display fallback values
      const avatarFallback = screen.getByTestId('user-avatar-fallback');
      expect(avatarFallback.textContent).toBe('A');

      expect(screen.getByTestId('user-name')).toHaveTextContent(/^.*$/); // Any text
      expect(screen.getByTestId('user-email')).toHaveTextContent(/^.*$/); // Any text
    });

    it('should handle missing user metadata gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useAuth } = require('../contexts/AuthContext');
      const mockUseAuth = useAuth as MockedFunction<any>;

      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          email: 'admin@test.com',
          user_metadata: null
        },
        signOut: vi.fn(() => Promise.resolve())
      });

      renderAdminDashboard();

      const avatarFallback = screen.getByTestId('user-avatar-fallback');
      expect(avatarFallback.textContent).toBe('A'); // 'a' from email

      expect(screen.getByTestId('user-name')).toHaveTextContent('admin@test.com'); // email part before @
      expect(screen.getByTestId('user-email')).toHaveTextContent('admin@test.com');
    });
  });
});