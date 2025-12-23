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
