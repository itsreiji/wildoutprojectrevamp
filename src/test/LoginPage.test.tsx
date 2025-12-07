import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '../components/auth/LoginPage';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePasswordStrength, checkLoginRateLimit } from '../utils/authValidation';

const signInWithEmailPasswordMock = vi.fn();
// Mock dependencies
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    signInWithOAuth: vi.fn(),
    signInWithEmailPassword: signInWithEmailPasswordMock,
    role: 'user',
    loading: false,
    isAuthenticated: false,
    error: null,
    getRememberedEmail: vi.fn(() => null)
  }))
}));

vi.mock('../components/router', () => ({
  useRouter: () => ({
    navigate: vi.fn()
  })
}));

vi.mock('../components/Background3D', () => ({
  Background3D: () => <div data-testid="background-3d-mock" />
}));

vi.mock('../components/ui/button', () => ({
  Button: (props: any) => <button {...props} />
}));

vi.mock('../utils/authValidation', () => ({
  validateEmail: vi.fn(() => ({ isValid: true, errors: [] })),
  validatePasswordStrength: vi.fn(() => ({ strength: 'weak', score: 0, feedback: [], suggestions: [] })),
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
  return render(<LoginPage />);
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    const validateEmailMock = validateEmail as unknown as ReturnType<typeof vi.fn>;
    validateEmailMock.mockReturnValue({ isValid: true, errors: [] });
    const checkLoginRateLimitMock = checkLoginRateLimit as unknown as ReturnType<typeof vi.fn>;
    checkLoginRateLimitMock.mockReturnValue({ isBlocked: false });
    const useAuthMock = useAuth as unknown as ReturnType<typeof vi.fn>;
    useAuthMock.mockImplementation(() => ({
      signInWithOAuth: vi.fn(),
      signInWithEmailPassword: signInWithEmailPasswordMock,
      role: 'user',
      loading: false,
      isAuthenticated: false,
      error: null,
      getRememberedEmail: vi.fn(() => null)
    }));
  });

  it('should render login form with all elements', () => {
    renderLoginPage();

    expect(screen.getByText('Admin access')).toBeInTheDocument();
    expect(screen.getByText('Sign in with your WildOut! administrator account to manage landing page content.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Email')).toBeInTheDocument();
  });

  it('should show email validation errors', async () => {
    const validateEmailMock = validateEmail as unknown as ReturnType<typeof vi.fn>;
    validateEmailMock.mockReturnValue({
      isValid: false,
      errors: ['Invalid email format']
    });

    renderLoginPage();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('should show password strength indicator', async () => {
    const validatePasswordStrengthMock = validatePasswordStrength as unknown as ReturnType<typeof vi.fn>;
    validatePasswordStrengthMock.mockReturnValue({
      strength: 'weak',
      score: 0,
      feedback: ['Password is too short'],
      suggestions: ['Use at least 12 characters for better security']
    });

    renderLoginPage();

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    expect(await screen.findByTestId('password-strength')).toBeInTheDocument();
    expect(await screen.findByText('Very Weak')).toBeInTheDocument();
    expect(await screen.findByText('Password is too short')).toBeInTheDocument();
  });

  it('should toggle password visibility', () => {
    renderLoginPage();

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    // There are two buttons, one with text "Show password", one with icon.
    // getByText('Show password') finds the text button.
    const toggleButton = screen.getByText('Show password');

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);

    expect(screen.getByText('Hide password')).toBeInTheDocument();
  });

  it('should handle remember me functionality', () => {
    renderLoginPage();

    const rememberMeCheckbox = screen.getByLabelText('Remember me');

    fireEvent.click(rememberMeCheckbox);

    expect(rememberMeCheckbox).toBeChecked();
  });

  it('should show rate limit warning', async () => {
    const checkLoginRateLimitMock = checkLoginRateLimit as unknown as ReturnType<typeof vi.fn>;
    checkLoginRateLimitMock.mockReturnValue({
      isBlocked: true,
      timeRemaining: 600000 // 10 minutes
    });

    renderLoginPage();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    await waitFor(() => {
      expect(screen.getByText(/Account temporarily locked/)).toBeInTheDocument();
      expect(screen.getByText(/Please try again in 10 minute/)).toBeInTheDocument();
    });
  });

  it('should disable sign in button when rate limited', async () => {
    const checkLoginRateLimitMock = checkLoginRateLimit as unknown as ReturnType<typeof vi.fn>;
    checkLoginRateLimitMock.mockReturnValue({
      isBlocked: true,
      timeRemaining: 600000
    });

    renderLoginPage();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    await waitFor(() => {
      const signInButton = screen.getByText('Sign in with Email');
      expect(signInButton).toBeDisabled();
    });
  });

  it('should call signInWithEmailPassword on form submission', async () => {
    signInWithEmailPasswordMock.mockResolvedValue(null);

    const validateEmailMock = validateEmail as unknown as ReturnType<typeof vi.fn>;
    validateEmailMock.mockReturnValue({ isValid: true, errors: [] });

    const useAuthMock = useAuth as unknown as ReturnType<typeof vi.fn>;
    useAuthMock.mockImplementation(() => ({
      signInWithOAuth: vi.fn(),
      signInWithEmailPassword: signInWithEmailPasswordMock,
      role: 'user',
      loading: false,
      isAuthenticated: false,
      error: null,
      getRememberedEmail: () => 'test@example.com'
    }));

    renderLoginPage();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const signInButton = screen.getByRole('button', { name: 'Sign in with Email' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(signInWithEmailPasswordMock).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
