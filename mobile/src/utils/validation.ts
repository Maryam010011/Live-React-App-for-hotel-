import { MESSAGES } from '../constants/messages';

/**
 * Validates a Name field (First name, Last name, Full name, Cardholder name)
 */
export const validateName = (name: string, fieldLabel = 'Name'): string | null => {
  const trimmed = name.trim();
  if (!trimmed) {
    return MESSAGES.VALIDATION.NAME_REQUIRED(fieldLabel);
  }
  if (trimmed.length < 2) {
    return MESSAGES.VALIDATION.NAME_MIN_CHAR(fieldLabel);
  }
  const nameRegex = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return MESSAGES.VALIDATION.NAME_INVALID(fieldLabel);
  }
  return null;
};

/**
 * Validates an Email field
 */
export const validateEmail = (email: string): string | null => {
  const trimmed = email.trim();
  if (!trimmed) {
    return MESSAGES.VALIDATION.EMAIL_REQUIRED;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return MESSAGES.VALIDATION.EMAIL_INVALID;
  }
  return null;
};

/**
 * Validates a Phone Number field
 */
export const validatePhone = (phone: string): string | null => {
  const trimmed = phone.trim();
  if (!trimmed) {
    return MESSAGES.VALIDATION.PHONE_REQUIRED;
  }
  const phoneCharRegex = /^[\d\s+\-()]+$/;
  if (!phoneCharRegex.test(trimmed)) {
    return MESSAGES.VALIDATION.PHONE_INVALID;
  }
  const digitCount = trimmed.replace(/\D/g, '').length;
  if (digitCount < 10) {
    return MESSAGES.VALIDATION.PHONE_MIN_DIGITS;
  }
  return null;
};

/**
 * Validates a Password field
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return MESSAGES.VALIDATION.PASSWORD_REQUIRED;
  }
  if (password.length < 6) {
    return MESSAGES.VALIDATION.PASSWORD_MIN_CHAR;
  }
  return null;
};
