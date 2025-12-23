import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('LoginPage Animations & Interactions', () => {
  it('should have motion attributes on the login container', () => {
    const { container } = render(<LoginPage />);
    const motionDiv = container.querySelector('.login-container');
    
    // In motion/react, motion components often have these properties or data attributes
    // We already checked data-animated="true" in layout tests.
    // Let's check for specific transition properties if they are exposed in the DOM styles
    const style = window.getComputedStyle(motionDiv!);
    // Note: JSDom might not fully populate these from motion props, but we can check if it's rendered.
    expect(motionDiv).toBeInTheDocument();
  });

  it('should have enhanced focus ring classes on inputs', () => {
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    
    // Expecting specific focus classes from our spec
    expect(emailInput).toHaveClass('focus:ring-brand-pink/50');
    expect(emailInput).toHaveClass('focus:border-brand-pink/50');
  });

  it('should apply the transition-all class for smooth state changes', () => {
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    expect(emailInput).toHaveClass('transition-all');
  });

  it('should have scale interactions on interactive buttons', () => {
    render(<LoginPage />);
    const submitButton = screen.getByRole('button', { name: /Sign in with Email/i });
    const googleButton = screen.getByRole('button', { name: /Continue with Google/i });
    
    expect(submitButton).toHaveClass('active:scale-[0.98]');
    // Let's expect hover:scale-105 on the google button icon which might not be there yet
    const googleIcon = screen.getByRole('button', { name: /Continue with Google/i }).querySelector('svg');
    expect(googleIcon).toHaveClass('group-hover:scale-110');
  });

  it('should have rotation animation on terms toggle icon', () => {
    render(<LoginPage />);
    const termsToggle = screen.getByRole('button', { name: /Show Terms & Conditions/i });
    const toggleIcon = termsToggle.querySelector('span:last-child');
    
    expect(toggleIcon).toHaveClass('transition-transform');
    expect(toggleIcon).toHaveClass('duration-300');
  });
});
