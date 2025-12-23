import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginPage } from '../components/auth/LoginPage';
import { useAuth } from '../contexts/AuthContext';

// Mock dependencies
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn()
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

describe('LoginPage Feedback States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.open for OAuth popup check
    window.open = vi.fn().mockReturnValue({
      close: vi.fn()
    });
  });

  it('should show email/password loading state', async () => {
    (useAuth as any).mockReturnValue({
      signInWithOAuth: vi.fn(() => new Promise(() => {})), // Never resolves to keep loading state
      signInWithEmailPassword: vi.fn(),
      role: 'user',
      loading: false,
      isAuthenticated: false,
      error: null,
      getRememberedEmail: vi.fn(() => null)
    });

    render(<LoginPage />);
    
    const googleButton = screen.getByText(/Continue with Google/i);
    fireEvent.click(googleButton);

    expect(await screen.findByTestId('loading-overlay')).toBeInTheDocument();
  });

  it('should show enhanced error message styling', () => {
    (useAuth as any).mockReturnValue({
      signInWithOAuth: vi.fn(),
      signInWithEmailPassword: vi.fn(),
      role: 'user',
      loading: false,
      isAuthenticated: false,
      error: 'Invalid credentials', // Auth error from context
      getRememberedEmail: vi.fn(() => null)
    });

    render(<LoginPage />);
    
    const errorContainer = screen.getByRole('alert').parentElement;
    expect(errorContainer).toHaveClass('animate-shake'); // Expecting a shake animation class we'll add
  });
});
