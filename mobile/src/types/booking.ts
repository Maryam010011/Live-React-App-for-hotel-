export interface BookingPayload {
  id?: string;
  _id?: string;
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
  roomType: 'standard' | 'deluxe' | 'suite' | string;
  specialRequests?: string;
  paymentMethod: 'card' | 'paypal' | 'hotel' | string;
  totalPrice: number;
  status?: 'confirmed' | 'cancelled' | 'pending';
  createdAt?: string;
}
