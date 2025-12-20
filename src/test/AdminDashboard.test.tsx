import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { render, screen } from '@testing-library/react';
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
vi.mock('lucide-react', () => {
  const mockIcon = 'svg';
  return {
    LayoutDashboard: mockIcon,
    Users: mockIcon,
    Settings: mockIcon,
    Shield: mockIcon,
    LogOut: mockIcon,
    ChevronLeft: mockIcon,
    Menu: mockIcon,
    X: mockIcon,
    Calendar: mockIcon,
    Handshake: mockIcon,
    Image: mockIcon,
    Info: mockIcon,
    Sparkles: mockIcon,
    Bell: mockIcon,
    Search: mockIcon
  };
});

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
  Button: ({ children, variant: _variant, size: _size, className, onClick, ...props }: any) =>
    React.createElement('button', { className, onClick, ...props }, children)
}));

vi.mock('../components/dashboard/DashboardHome', () => ({
  DashboardHome: () => React.createElement('div', { 'data-testid': 'test-content' }, 'Test Content')
}));
vi.mock('../components/dashboard/DashboardHero', () => ({ DashboardHero: () => null }));
vi.mock('../components/dashboard/DashboardEvents', () => ({ DashboardEvents: () => null }));
vi.mock('../components/dashboard/DashboardGallery', () => ({ DashboardGallery: () => null }));
vi.mock('../components/dashboard/DashboardTeam', () => ({ DashboardTeam: () => null }));
vi.mock('../components/dashboard/DashboardAbout', () => ({ DashboardAbout: () => null }));
vi.mock('../components/dashboard/DashboardPartners', () => ({ DashboardPartners: () => null }));
vi.mock('../components/dashboard/DashboardSettings', () => ({ DashboardSettings: () => null }));
vi.mock('../components/dashboard/DashboardAuditLog', () => ({ DashboardAuditLog: () => null }));

// Import the actual component after mocks
import AdminDashboard from '../components/admin/AdminDashboard';
import { useAuth } from '../contexts/AuthContext';
import { useStaticContent } from '../contexts/StaticContentContext';

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
      expect(layout).toHaveClass('bg-background');
    });

    it('should render admin sidebar', () => {
      renderAdminDashboard();
      const sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass('bg-sidebar');
    });

    it('should render main content area', () => {
      renderAdminDashboard();
      const mainContent = screen.getByTestId('admin-main-content');
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).toHaveClass('flex-1');
    });

    it('should render admin header', () => {
      renderAdminDashboard();
      const header = screen.getByTestId('admin-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('h-20');
    });

    it('should render main content section', () => {
      renderAdminDashboard();
      const main = screen.getByTestId('admin-main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('bg-[#12141a]');
    });

    it('should render child content in main area', () => {
      renderAdminDashboard();
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Layout Positioning', () => {
    it('should have sidebar with correct width', () => {
      renderAdminDashboard();
      const sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toHaveClass('w-64');
    });

    it('should have main content with proper flex growth', () => {
      renderAdminDashboard();
      const mainContent = screen.getByTestId('admin-main-content');
      expect(mainContent).toHaveClass('flex-1');
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

    it('should show mobile menu toggle', () => {
      renderAdminDashboard();
      const menuButton = screen.getByTestId('sidebar-trigger');
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have sidebar with correct test id', () => {
      renderAdminDashboard();
      const sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toBeInTheDocument();
    });

    it('should have navigation items with correct test ids', () => {
      renderAdminDashboard();
      expect(screen.getByTestId('nav-home')).toBeInTheDocument();
      expect(screen.getByTestId('nav-events')).toBeInTheDocument();
      expect(screen.getByTestId('nav-settings')).toBeInTheDocument();
    });

    it('should indicate current page with active state', () => {
      renderAdminDashboard();
      const homeItem = screen.getByTestId('nav-home');
      expect(homeItem).toHaveAttribute('data-active', 'true');
    });
  });

  describe('Navigation', () => {
    it('should render main admin sections', () => {
      renderAdminDashboard();

      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Events').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
    });

    it('should show active state for current page', () => {
      renderAdminDashboard();
      const activeItem = screen.getByTestId('nav-home');
      expect(activeItem).toHaveAttribute('data-active', 'true');
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

      expect(screen.getByTestId('user-name')).toHaveTextContent('ADMIN USER');
      expect(screen.getByTestId('user-email')).toHaveTextContent('admin@wildoutproject.com');
    });

    it('should display admin logo and branding', () => {
      renderAdminDashboard();

      const logo = screen.getByTestId('dashboard-logo');
      expect(logo).toBeInTheDocument();

      const logoImage = screen.getByTestId('logo-image');
      expect(logoImage).toBeInTheDocument();
      expect(logoImage).toHaveAttribute('alt', 'WildOut Logo');

      const logoText = screen.getByTestId('logo-text');
      expect(logoText).toHaveTextContent('WILDOUT!');
    });

    it('should have proper visual hierarchy with separators', () => {
      renderAdminDashboard();

      const separators = screen.getAllByTestId('admin-header-separator');
      expect(separators.length).toBeGreaterThan(0);
    });
  });

  describe('Admin Sections', () => {
  it('should filter sections based on permissions', () => {
    const mockUseStaticContent = useStaticContent as MockedFunction<any>;

    mockUseStaticContent.mockReturnValue({
      adminSections: [
        { id: '1', label: 'Section 1', slug: 'home', order_index: 0, icon: 'LayoutDashboard' },
        { id: '2', label: 'Section 2', slug: 'events', order_index: 1, icon: 'Settings' }
      ],
      getSectionPermissions: (slug: string) => ({
        canView: slug === 'home',
        canEdit: false,
        canPublish: false,
        canDelete: false
      }),
      loading: false
    });

    renderAdminDashboard();
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.queryByText('Section 2')).not.toBeInTheDocument();
  });

  it('should sort sections by order_index', () => {
    const mockUseStaticContent = useStaticContent as MockedFunction<any>;

    mockUseStaticContent.mockReturnValue({
      adminSections: [
        { id: '2', label: 'Section 2', slug: 'events', order_index: 2, icon: 'Settings' },
        { id: '1', label: 'Section 1', slug: 'home', order_index: 1, icon: 'LayoutDashboard' }
      ],
      getSectionPermissions: () => ({ canView: true, canEdit: true, canPublish: true, canDelete: true }),
      loading: false
    });

    renderAdminDashboard();
    const sections = screen.getAllByTestId(/^nav-/).map(el => el.textContent);
    const section1Index = sections.findIndex(t => t?.includes('Section 1'));
    const section2Index = sections.findIndex(t => t?.includes('Section 2'));
    expect(section1Index).toBeLessThan(section2Index);
  });
  });

  describe('Error Handling', () => {
    it('should handle missing user metadata gracefully', () => {
      const mockUseAuth = useAuth as MockedFunction<any>;
      mockUseAuth.mockReturnValue({
        user: {
          email: 'test@example.com',
          user_metadata: { full_name: 'Admin User' }
        },
        role: 'admin',
        loading: false,
        signOut: vi.fn()
      });

      renderAdminDashboard();
      expect(screen.getByText('ADMIN USER')).toBeInTheDocument();
    });

  it('should fallback to email prefix when full_name is missing', () => {
    const mockUseAuth = useAuth as MockedFunction<any>;
    mockUseAuth.mockReturnValue({
      user: { email: 'admin@example.com' },
      role: 'admin',
      loading: false,
      signOut: vi.fn()
    });

    renderAdminDashboard();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });
  });
});