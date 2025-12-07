import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../components/auth/LoginPage';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePasswordStrength } from '../utils/authValidation';

// Mock dependencies
vi.mock('../components/router', () => ({
  useRouter: () => ({
    navigate: vi.fn()
  })
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../utils/authValidation', () => ({
  validateEmail: vi.fn(),
  validatePasswordStrength: vi.fn(),
  checkLoginRateLimit: vi.fn(() => ({ isBlocked: false })),
  generateCsrfToken: vi.fn(() => ({ token: 'test-token', timestamp: Date.now(), signature: 'test-signature' })),
  validateCsrfToken: vi.fn(() => true)
}));

vi.mock('../utils/security', () => ({
  checkRateLimit: vi.fn(),
  recordRateLimitAttempt: vi.fn(),
  sanitizeInput: vi.fn((input: string) => input),
  validateSecureEmail: vi.fn(),
  hashPassword: vi.fn()
}));

const renderLoginPage = () => {
  // Default mock implementation for useAuth if not already mocked in the test
  // This is handled by beforeEach or individual tests setting up the mock
  return render(<LoginPage />);
};

describe('LoginPage Integration', () => {
  const useAuthMock = useAuth as unknown as ReturnType<typeof vi.fn>;
  const validateEmailMock = validateEmail as unknown as ReturnType<typeof vi.fn>;
  const validatePasswordStrengthMock = validatePasswordStrength as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Default mocks
    useAuthMock.mockReturnValue({
      signInWithOAuth: vi.fn(),
      signInWithEmailPassword: vi.fn(),
      role: 'user',
      loading: false,
      isAuthenticated: false,
      error: null,
      getRememberedEmail: vi.fn(() => null)
    });
  });

  it('should handle complete login flow with valid credentials', async () => {
    const mockSignIn = vi.fn().mockResolvedValue(null);

    useAuthMock.mockReturnValue({
      signInWithOAuth: vi.fn(),
      signInWithEmailPassword: mockSignIn,
      role: 'admin',
      loading: false,
      isAuthenticated: false,
      error: null,
      getRememberedEmail: vi.fn(() => null)
    });

    validateEmailMock.mockReturnValue({ isValid: true, errors: [] });
    validatePasswordStrengthMock.mockReturnValue({
      strength: 'strong',
      score: 4,
      feedback: [],
      suggestions: []
    });

    renderLoginPage();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const signInButton = screen.getByText('Sign in with Email');

    await userEvent.type(emailInput, 'admin@example.com');
    await userEvent.type(passwordInput, 'StrongPassword123!');

    // Wait for validation to pass (debounced/async)
    await waitFor(() => {
      expect(screen.queryByText(/Invalid email/i)).not.toBeInTheDocument();
    });

    await userEvent.click(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('admin@example.com', 'StrongPassword123!');
    });
  });

  it('should handle failed login attempt with error message', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ message: 'Authentication failed' });

    useAuthMock.mockReturnValue({
      signInWithOAuth: vi.fn(),
      signInWithEmailPassword: mockSignIn,
      role: 'user',
      loading: false,
      isAuthenticated: false,
      error: null, // Initial state
      getRememberedEmail: vi.fn(() => null)
    });

    validateEmailMock.mockReturnValue({ isValid: true, errors: [] });
    validatePasswordStrengthMock.mockReturnValue({
      strength: 'strong',
      score: 4,
      feedback: [],
      suggestions: []
    });

    renderLoginPage();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const signInButton = screen.getByText('Sign in with Email');

    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.type(passwordInput, 'WrongPassword123!');

    await userEvent.click(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });

    expect(await screen.findByText(/Authentication failed/i)).toBeInTheDocument();
  });
});
