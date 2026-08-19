export const MESSAGES = {
  VALIDATION: {
    NAME_REQUIRED: (field: string) => `${field} is required.`,
    NAME_MIN_CHAR: (field: string) => `${field} must be at least 2 characters.`,
    NAME_INVALID: (field: string) => `Please enter a valid ${field.toLowerCase()} (letters only).`,
    
    EMAIL_REQUIRED: 'Email address is required.',
    EMAIL_INVALID: 'Please enter a valid email address.',
    
    PHONE_REQUIRED: 'Phone number is required.',
    PHONE_INVALID: 'Please enter a valid phone number (digits, +, -, and parentheses only).',
    PHONE_MIN_DIGITS: 'Please enter a valid phone number (at least 10 digits).',

    PASSWORD_REQUIRED: 'Password is required.',
    PASSWORD_MIN_CHAR: 'Password must be at least 6 characters.',
  },
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    BOOKING_FAILED: 'Could not complete your booking. Please check details.',
    LOGIN_FAILED: 'Invalid email or password.',
    REGISTER_FAILED: 'Could not create account. Email might be in use.',
    ADMIN_REQUIRED: 'Access denied. Administrator privileges required.',
    NETWORK: 'Network error. Please check your internet connection.',
  },
  SUCCESS: {
    BOOKING_CONFIRMED: 'Your reservation is confirmed!',
    HOTEL_CREATED: 'Hotel listing created successfully.',
    HOTEL_UPDATED: 'Hotel listing updated successfully.',
    HOTEL_DELETED: 'Hotel listing deleted successfully.',
  }
};
