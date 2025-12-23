import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { LoginPage } from '../components/auth/LoginPage';

// Mock dependencies
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    signInWithOAuth: vi.fn(),
    signInWithEmailPassword: vi.fn(),
    role: 'user',
    loading: false,
    isAuthenticated: false,
    error: null,
    getRememberedEmail: vi.fn(() => null)
  }))
}));

vi.mock('../components/router/RouterContext', () => ({
  useRouter: () => ({
    navigate: vi.fn()
  })
}));

vi.mock('../components/Background3D', () => ({
  Background3D: () => <div data-testid="background-3d-mock" />
}));

vi.mock('../../utils/authValidation', () => ({
  validatePasswordStrength: vi.fn(() => ({ strength: 'weak', score: 0, feedback: [], suggestions: [] })),
  checkLoginRateLimit: vi.fn(() => ({ isBlocked: false }))
}));

describe('LoginPage Refinement - Dimensions & Padding', () => {
  it('should have a refined container width of 340px', () => {
    const { container } = render(<LoginPage />);
    const cardContainer = container.querySelector('.login-container');
    
    expect(cardContainer).toHaveClass('max-w-[340px]');
  });

  it('should have reduced internal padding (p-6)', () => {
    const { container } = render(<LoginPage />);
    const card = container.querySelector('.login-card');
    
    expect(card).toHaveClass('p-6');
    expect(card).not.toHaveClass('p-8');
    expect(card).not.toHaveClass('md:p-10');
  });
});

describe('LoginPage Refinement - Typography & Icons', () => {
  it('should have scaled down font sizes', () => {
    const { container } = render(<LoginPage />);
    const title = container.querySelector('#admin-login-title');
    const subtitle = container.querySelector('#admin-login-subtitle');
    
    expect(title).toHaveClass('text-2xl'); // Down from 3xl
    expect(subtitle).toHaveClass('text-xs'); // Down from text-sm
  });

  it('should have scaled down icons (size-3.5 or h-3.5 w-3.5)', () => {
    const { container } = render(<LoginPage />);
    const emailIcon = container.querySelector('#admin-login-email-icon');
    const passwordIcon = container.querySelector('#admin-login-password-icon');
    
    // Expecting h-3.5 w-3.5 or similar scale down
    expect(emailIcon).toHaveClass('h-3.5');
    expect(emailIcon).toHaveClass('w-3.5');
    expect(passwordIcon).toHaveClass('h-3.5');
    expect(passwordIcon).toHaveClass('w-3.5');
  });
});

describe('LoginPage Refinement - Density & Alignment', () => {
  it('should have tightened vertical gaps (space-y-4 or lower)', () => {
    const { container } = render(<LoginPage />);
    const card = container.querySelector('.login-card');
    const form = container.querySelector('#admin-login-form');
    
    expect(card).toHaveClass('space-y-4'); // Expecting even tighter than 6
    expect(form).toHaveClass('space-y-4'); // Expecting even tighter than 5
  });

  it('should have consistent left alignment for labels and indicators', () => {
    const { container } = render(<LoginPage />);
    const labels = container.querySelectorAll('label');
    
    labels.forEach(label => {
      expect(label).toHaveClass('flex');
      expect(label).toHaveClass('items-center');
      expect(label).toHaveClass('gap-2');
    });
  });
});
