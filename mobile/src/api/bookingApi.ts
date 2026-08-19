import { API_BASE_URL, ENDPOINTS } from '../constants/api';
import { BookingPayload } from '../types/booking';
import { getAuthHeaders } from '../utils/storage';

export const createBooking = async (bookingData: Partial<BookingPayload>): Promise<BookingPayload> => {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.BOOKINGS}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(bookingData),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to create booking');
  }
  return json.data || json;
};

export const fetchMyBookings = async (): Promise<BookingPayload[]> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MY_BOOKINGS}`, {
      headers: {
        ...authHeaders,
      },
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Failed to fetch personal bookings');
    }
    return json.data || [];
  } catch (error) {
    console.warn('⚠️ [bookingApi] Failed to fetch personal bookings:', error);
    return [];
  }
};

export const fetchBookings = async (): Promise<BookingPayload[]> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.BOOKINGS}`, {
      headers: {
        ...authHeaders,
      },
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Failed to fetch all bookings');
    }
    return json.data || [];
  } catch (error) {
    console.warn('⚠️ [bookingApi] Failed to fetch bookings:', error);
    return [];
  }
};

export const updateBooking = async (
  id: string,
  data: Partial<BookingPayload>
): Promise<BookingPayload> => {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.BOOKINGS}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to update booking');
  }
  return json.data || json;
};

export const deleteBooking = async (id: string): Promise<void> => {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.BOOKINGS}/${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders,
    },
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.message || 'Failed to delete booking');
  }
};
