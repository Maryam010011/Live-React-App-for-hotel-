const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface BookingPayload {
  id?: string;
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
 * Creates a new reservation in MongoDB via POST /api/bookings
 */
export const createBooking = async (bookingData: Partial<BookingPayload>): Promise<BookingPayload> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || 'Failed to submit booking');
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.warn('[bookingService] Failed to post booking to API, returning local object fallback:', error);
    return {
      ...(bookingData as BookingPayload),
      bookingRef: bookingData.bookingRef || 'LX-' + Math.floor(100000 + Math.random() * 900000),
    };
  }
};

/**
 * Fetches all bookings via GET /api/bookings
 */
export const fetchBookings = async (): Promise<BookingPayload[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bookings`);
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
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.message || 'Failed to delete booking');
  }
};
