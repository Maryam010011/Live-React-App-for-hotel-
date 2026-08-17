import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyBookings, BookingPayload } from '../services/bookingService';
import './MyBookings.css';

export default function MyBookings() {
  const [bookings, setBookings] = useState<BookingPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyBookings()
      .then((data) => {
        setBookings(data);
      })
      .catch((err) => {
        console.error('Error loading my bookings:', err);
        setError('Failed to load your reservations. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="my-bookings-page">
      <div className="container">
        <div className="my-bookings-header">
          <div>
            <h1 className="my-bookings-title">My Bookings</h1>
            <p className="my-bookings-subtitle">
              Manage and view details for all your hotel reservations
            </p>
          </div>
          <Link to="/hotels" className="my-bookings-browse-btn">
            + Book Another Hotel
          </Link>
        </div>

        {loading ? (
          <div className="my-bookings-loading">
            <div className="spinner"></div>
            <p>Loading your reservations...</p>
          </div>
        ) : error ? (
          <div className="my-bookings-error">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="my-bookings-empty">
            <div className="empty-icon">🏨</div>
            <h2>No Reservations Found</h2>
            <p>You haven't booked any hotel stays yet.</p>
            <Link to="/hotels" className="btn-primary">
              Browse Available Hotels
            </Link>
          </div>
        ) : (
          <div className="my-bookings-list">
            {bookings.map((booking) => (
              <div className="booking-card" key={booking.id || booking.bookingRef}>
                <div className="booking-card-header">
                  <div className="booking-card-hotel">
                    <span className="booking-ref-badge">Ref: {booking.bookingRef}</span>
                    <h2 className="booking-hotel-name">{booking.hotelName}</h2>
                  </div>
                  <div className={`booking-status-badge ${booking.status || 'confirmed'}`}>
                    {(booking.status || 'confirmed').toUpperCase()}
                  </div>
                </div>

                <div className="booking-card-body">
                  <div className="booking-info-group">
                    <span className="info-label">Check-In</span>
                    <span className="info-value">{formatDate(booking.checkIn)}</span>
                  </div>

                  <div className="booking-info-group">
                    <span className="info-label">Check-Out</span>
                    <span className="info-value">{formatDate(booking.checkOut)}</span>
                  </div>

                  <div className="booking-info-group">
                    <span className="info-label">Room Type</span>
                    <span className="info-value capitalize">{booking.roomType} Room</span>
                  </div>

                  <div className="booking-info-group">
                    <span className="info-label">Guests</span>
                    <span className="info-value">
                      {booking.adults} Adult{booking.adults > 1 ? 's' : ''}
                      {booking.children > 0 ? `, ${booking.children} Child` : ''}
                    </span>
                  </div>
                </div>

                <div className="booking-card-footer">
                  <div className="booking-guest-info">
                    <span>Guest: {booking.firstName} {booking.lastName}</span>
                    <span className="bullet">•</span>
                    <span>{booking.email}</span>
                  </div>
                  <div className="booking-total">
                    <span className="total-label">Total Paid</span>
                    <span className="total-amount">${booking.totalPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
