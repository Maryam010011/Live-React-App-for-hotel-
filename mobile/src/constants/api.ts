// Set to Vercel production deployment URL by default.
// If running against local server, change this to your machine's IP (e.g. 'http://192.168.1.100:5000')
export const API_BASE_URL = 'https://reacthotelbooking.vercel.app';

export const ENDPOINTS = {
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_ME: '/api/auth/me',
  HOTELS: '/api/hotels',
  BOOKINGS: '/api/bookings',
  MY_BOOKINGS: '/api/bookings/my',
};

// Cloudinary settings
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'vxwyhut0',
  UPLOAD_PRESET: 'luxestay_uploads',
  UPLOAD_URL: 'https://api.cloudinary.com/v1_1/vxwyhut0/image/upload',
};
