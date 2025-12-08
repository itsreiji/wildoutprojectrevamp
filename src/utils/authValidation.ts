import {
  validatePasswordComplexity,
  checkRateLimit,
  recordRateLimitAttempt,
  clearRateLimit,
  generateCSRFToken,
  verifyCSRFToken
} from './security';

export const validateEmail = (email: string) => {
  // Basic email validation
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return { isValid: regex.test(email), errors: regex.test(email) ? [] : ['Invalid email format'] };
};

/**
 * Validate password with detailed feedback
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const result = validatePasswordComplexity(password);
  return {
    isValid: result.isValid,
    errors: result.feedback
  };
};

/**
 * Check password strength for UI feedback
 */
export const validatePasswordStrength = (password: string): {
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
  feedback: string[];
  suggestions: string[];
} => {
  const result = validatePasswordComplexity(password);

  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (result.score >= 4) strength = 'strong';
  else if (result.score >= 3) strength = 'good';
  else if (result.score >= 2) strength = 'fair';

  const suggestions: string[] = [];
  if (result.score < 4) {
    if (password.length < 12) suggestions.push('Use at least 12 characters for better security');
    if (!/[A-Z]/.test(password)) suggestions.push('Add uppercase letters');
    if (!/[0-9]/.test(password)) suggestions.push('Add numbers');
    if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push('Add special characters');
  }

  return {
    strength,
    score: result.score,
    feedback: result.feedback,
    suggestions
  };
};

/**
 * Check if login is rate limited for an email
 */
export const checkLoginRateLimit = (email: string): { isBlocked: boolean; timeRemaining?: number } => {
  const result = checkRateLimit(`login_${email}`);
  return {
    isBlocked: !result.allowed,
    timeRemaining: result.timeRemaining
  };
};

/**
 * Record a failed login attempt
 */
export const recordFailedLogin = (email: string): void => {
  recordRateLimitAttempt(`login_${email}`);
};

/**
 * Clear login attempts for an email (on successful login)
 */
export const clearLoginAttempts = (email: string): void => {
  clearRateLimit(`login_${email}`);
};

/**
 * Generate a CSRF token
 */
export const generateCsrfToken = (secret: string = 'wildout-secret'): {
  token: string;
  timestamp: number;
  signature: string;
} => {
  return generateCSRFToken(secret);
};

/**
 * Validate a CSRF token
 */
export const validateCsrfToken = (
  token: string,
  timestamp: number,
  signature: string,
  secret: string = 'wildout-secret'
): boolean => {
  return verifyCSRFToken(token, timestamp, signature, secret);
}; 