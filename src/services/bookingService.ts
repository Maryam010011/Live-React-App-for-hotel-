/**
 * Resolves the API Base URL cleanly for both local development and Vercel production environments.
 */
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocal && envUrl && envUrl.includes('localhost')) {
      return '';
    }
  }
  if (!envUrl) return '';
  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
};

const API_BASE_URL = getApiBaseUrl();

/** Reads the JWT from localStorage and returns an Authorization header object */
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('luxestay_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface BookingPayload {
  id?: string;
  user?: string;
  bookingRef: string;
  hotelId: number | string;
  hotelName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomType: string;
  specialRequests?: string;
  paymentMethod: string;
  totalPrice: number;
  status?: 'confirmed' | 'cancelled' | 'pending';
  createdAt?: string;
}

/**
 * Creates a new reservation in MongoDB via POST /api/bookings (Requires Auth)
 */
export const createBooking = async (bookingData: Partial<BookingPayload>): Promise<BookingPayload> => {
  const endpoint = `${API_BASE_URL}/api/bookings`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    const message = errJson.message || `API responded with status ${response.status}`;
    console.error(`❌ [bookingService] createBooking error (${response.status}):`, message);
    throw new Error(message);
  }

  const json = await response.json();
  return json.data;
};

/**
 * Fetches the logged-in customer's own bookings via GET /api/bookings/my
 */
export const fetchMyBookings = async (): Promise<BookingPayload[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bookings/my`, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.warn('[bookingService] Failed to fetch customer bookings:', error);
    return [];
  }
};

/**
 * Fetches all bookings via GET /api/bookings (Admin only)
 */
export const fetchBookings = async (): Promise<BookingPayload[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.warn('[bookingService] Failed to fetch bookings from API:', error);
    return [];
  }
};

/**
 * Updates a booking status or details via PUT /api/bookings/:id
 */
export const updateBooking = async (
  id: string,
  data: Partial<BookingPayload>
): Promise<BookingPayload> => {
  const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.message || 'Failed to update booking');
  }

  const json = await response.json();
  return json.data;
};

/**
 * Deletes a booking via DELETE /api/bookings/:id
 */
export const deleteBooking = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.message || 'Failed to delete booking');
  }
};
