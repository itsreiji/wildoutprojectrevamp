export const validateEmail = (email: string) => {
  // Basic email validation
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return { isValid: regex.test(email), errors: regex.test(email) ? [] : ['Invalid email format'] };
}; 