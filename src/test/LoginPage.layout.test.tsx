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

describe('LoginPage Layout', () => {
  it('should have a full-screen centered layout container', () => {
    const { container } = render(<LoginPage />);
    const mainContainer = container.querySelector('#admin-login-page');
    
    expect(mainContainer).toHaveClass('min-h-screen');
    expect(mainContainer).toHaveClass('flex');
    expect(mainContainer).toHaveClass('items-center');
    expect(mainContainer).toHaveClass('justify-center');
  });

  it('should have a maximum width container for the login card', () => {
    const { container } = render(<LoginPage />);
    const cardContainer = container.querySelector('.login-container');
    
    expect(cardContainer).toHaveClass('w-full');
    expect(cardContainer).toHaveClass('max-w-[380px]');
  });

  it('should use WildOut! specific brand colors and styling', () => {
    const { container } = render(<LoginPage />);
    const card = container.querySelector('.login-card');
    
    // Expecting specific brand border and background
    expect(card).toHaveClass('border-white/10');
    expect(card).toHaveClass('bg-[#0a0a0a]/80');
    expect(card).toHaveClass('backdrop-blur-3xl');
  });

  it('should have a centered header with specific typography', () => {
    const { container } = render(<LoginPage />);
    const header = container.querySelector('#admin-login-header');
    const title = container.querySelector('#admin-login-title');
    
    expect(header).toHaveClass('text-center');
    expect(title).toHaveClass('text-3xl');
    expect(title).toHaveClass('font-black');
    expect(title).toHaveClass('tracking-tight');
  });

  it('should have an entrance animation for the login card', () => {
    const { container } = render(<LoginPage />);
    const cardContainer = container.querySelector('.login-container');
    
    expect(cardContainer).toHaveAttribute('data-animated', 'true');
  });

  it('should use theme-compliant brand classes', () => {
    const { container } = render(<LoginPage />);
    const titleSpan = container.querySelector('#admin-login-title span');
    const submitButton = container.querySelector('#admin-login-submit-button');
    
    // We want to move towards these classes instead of hardcoded hex
    expect(titleSpan).toHaveClass('text-brand-pink');
    expect(submitButton).toHaveClass('bg-brand-pink');
  });
});
