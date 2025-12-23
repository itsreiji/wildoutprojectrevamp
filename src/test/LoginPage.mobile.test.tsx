import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoginPage } from '../components/auth/LoginPage';
import { useAuth } from '../contexts/AuthContext';

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

describe('LoginPage Accessibility & Mobile', () => {
  it('should have adequate touch targets for buttons (min 44px)', () => {
    render(<LoginPage />);
    const submitButton = screen.getByRole('button', { name: /Sign in with Email/i });
    const googleButton = screen.getByRole('button', { name: /Sign in with Google/i });
    
    // h-11 is 44px
    expect(submitButton).toHaveClass('h-11');
    expect(googleButton).toHaveClass('h-11');
  });

  it('should have adequate touch targets for inputs (min 44px)', () => {
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    
    expect(emailInput).toHaveClass('h-11');
    expect(passwordInput).toHaveClass('h-11');
  });

  it('should have proper ARIA labels and roles', () => {
    render(<LoginPage />);
    
    // Use more specific queries to avoid multiple match errors
    expect(screen.getByLabelText(/^Email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Remember me/i)).toBeInTheDocument();
  });

  it('should set aria-busy on the form when submitting', () => {
    const useAuthMock = useAuth as unknown as ReturnType<typeof vi.fn>;
    useAuthMock.mockReturnValue({
      signInWithOAuth: vi.fn(),
      signInWithEmailPassword: vi.fn(),
      role: 'user',
      loading: true, // This should trigger aria-busy
      isAuthenticated: false,
      error: null,
      getRememberedEmail: vi.fn(() => null)
    });

    render(<LoginPage />);
    const form = document.getElementById('admin-login-form');
    expect(form).toHaveAttribute('aria-busy', 'true');
  });

  it('should have a checkbox with accessible touch area or label association', () => {
    render(<LoginPage />);
    const checkbox = screen.getByRole('checkbox');
    // Expecting a specific class or wrapper that ensures touchability
    // For now let's just ensure it's associated with its label
    expect(screen.getByLabelText(/Remember me/i)).toBe(checkbox);
  });
});
