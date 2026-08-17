/**
 * Form Validation Utility for LuxeStay
 *
 * Implements strict rules for Name, Email, and Phone fields:
 * - Triggered on blur (onBlur) and on form submit.
 * - Returns user-friendly error messages or null if valid.
 */

/**
 * Validates a Name field (First name, Last name, Full name, Cardholder name)
 * Rule: Required, non-empty, min 2 chars, letters, spaces, hyphens, and apostrophes only.
 */
export const validateName = (name: string, fieldLabel = 'Name'): string | null => {
  const trimmed = name.trim();
  if (!trimmed) {
    return `${fieldLabel} is required.`;
  }
  if (trimmed.length < 2) {
    return `${fieldLabel} must be at least 2 characters.`;
  }
  // Allow Unicode letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return `Please enter a valid ${fieldLabel.toLowerCase()} (letters only).`;
  }
  return null;
};

/**
 * Validates an Email field
 * Rule: Required, non-empty, valid email format.
 */
export const validateEmail = (email: string): string | null => {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email address is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return null;
};

/**
 * Validates a Phone Number field
 * Rule: Required, digits, spaces, +, -, and () only, min 10 digits.
 */
export const validatePhone = (phone: string): string | null => {
  const trimmed = phone.trim();
  if (!trimmed) {
    return 'Phone number is required.';
  }
  // Allow only digits, spaces, +, -, and parentheses ()
  const phoneCharRegex = /^[\d\s+\-()]+$/;
  if (!phoneCharRegex.test(trimmed)) {
    return 'Please enter a valid phone number (digits, +, -, and parentheses only).';
  }
  const digitCount = trimmed.replace(/\D/g, '').length;
  if (digitCount < 10) {
    return 'Please enter a valid phone number (at least 10 digits).';
  }
  return null;
};
