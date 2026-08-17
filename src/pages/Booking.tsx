import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Hotel } from '../types/hotel';
import { fetchHotelById } from '../services/hotelService';
import { createBooking } from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './Booking.css';

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomType: 'standard' | 'deluxe' | 'suite';
  specialRequests: string;
  paymentMethod: 'card' | 'paypal' | 'hotel';
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
}

function Booking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  // Default dates: check-in tomorrow, check-out 3 days later
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const inThreeDays = new Date();
  inThreeDays.setDate(inThreeDays.getDate() + 4);

  const formatDateForInput = (d: Date) => d.toISOString().split('T')[0];

  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkIn: formatDateForInput(tomorrow),
    checkOut: formatDateForInput(inThreeDays),
    adults: 2,
    children: 0,
    roomType: 'standard',
    specialRequests: '',
    paymentMethod: 'card',
    cardNumber: '4532 •••• •••• 8892',
    cardExpiry: '08/28',
    cardCvc: '882',
    cardName: '',
  });

  // Auto-fill logged-in user details into booking form
  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(' ');
      const first = nameParts[0] || '';
      const last = nameParts.slice(1).join(' ') || '';
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || first,
        lastName: prev.lastName || last,
        email: prev.email || user.email,
        cardName: prev.cardName || user.name,
      }));
    }
  }, [user]);

  useEffect(() => {
    const loadHotel = async () => {
      if (!id) {
        setError('Invalid hotel ID');
        setLoading(false);
        return;
      }

      const hotelId = parseInt(id, 10);
      if (isNaN(hotelId)) {
        setError('Invalid hotel ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchHotelById(hotelId);
        if (data) {
          setHotel(data);
        } else {
          setError('Hotel not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load hotel');
      } finally {
        setLoading(false);
      }
    };

    loadHotel();
  }, [id]);

  // Calculate stay duration in nights
  const checkInDate = new Date(formData.checkIn);
  const checkOutDate = new Date(formData.checkOut);
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)) || 1);

  // Room type prices
  const roomMultipliers = {
    standard: 1.0,
    deluxe: 1.25,
    suite: 1.6,
  };

  const basePricePerNight = hotel ? Math.round(hotel.price * roomMultipliers[formData.roomType]) : 0;
  const subtotal = basePricePerNight * nights;
  const taxesAndFees = Math.round(subtotal * 0.12);
  const totalPrice = subtotal + taxesAndFees;

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?redirect=/book/${id}`);
      return;
    }

    setSubmitting(true);
    setError(null);

    const generatedRef = 'LX-' + Math.floor(100000 + Math.random() * 900000);

    if (!hotel) return;

    try {
      const created = await createBooking({
        bookingRef: generatedRef,
        hotelId: hotel.id,
        hotelName: hotel.name,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        adults: formData.adults,
        children: formData.children,
        roomType: formData.roomType,
        specialRequests: formData.specialRequests,
        paymentMethod: formData.paymentMethod,
        totalPrice: totalPrice,
      });

      setBookingRef(created.bookingRef || generatedRef);
      setIsConfirmed(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      console.error('Booking submission error:', err);
      const msg = err instanceof Error ? err.message : 'Could not create reservation.';
      if (msg.includes('log in') || msg.includes('token') || msg.includes('Access denied')) {
        navigate(`/login?redirect=/book/${id}`);
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="booking-page container">
        <LoadingSpinner />
      </div>
    );
  }

  // If visitor is not logged in, show clear Sign In prompt before booking
  if (!user) {
    return (
      <div className="booking-page container">
        <button className="back-btn" onClick={() => navigate('/hotels')}>
          &larr; Back to Hotels
        </button>
        <div className="auth-required-box" style={{
          textAlign: 'center',
          background: 'white',
          borderRadius: '16px',
          padding: '3.5rem 2rem',
          border: '1px solid #e2e8f0',
          maxWidth: '520px',
          margin: '2rem auto',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <h2 style={{ fontSize: '1.6rem', color: '#0f172a', marginBottom: '0.6rem', fontWeight: 800 }}>
            Sign In Required to Book
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Please sign in to your LuxeStay account to complete your hotel reservation and view your bookings anytime.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to={`/login?redirect=/book/${id}`} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
              Sign In to Continue
            </Link>
            <Link to={`/register?redirect=/book/${id}`} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error && !hotel) {
    return (
      <div className="booking-page container">
        <button className="back-btn" onClick={() => navigate('/hotels')}>
          &larr; Back to Search Results
        </button>
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  // Render Confirmation Receipt View
  if (isConfirmed && hotel) {
    return (
      <div className="booking-page container">
        <div className="confirmation-card">
          <div className="confirmation-header">
            <div className="success-icon-badge">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className="confirmation-tag">RESERVATION CONFIRMED</span>
            <h1 className="confirmation-title">Your Booking is Complete!</h1>
            <p className="confirmation-subtitle">
              We have sent a confirmation email with all details to <strong>{formData.email || 'your email'}</strong>.
            </p>
          </div>

          <div className="ref-number-box">
            <span className="ref-label">Booking Reference Number</span>
            <div className="ref-value-row">
              <span className="ref-code">{bookingRef}</span>
              <span className="ref-badge">Guaranteed</span>
            </div>
          </div>

          <div className="confirmation-details-grid">
            <div className="confirm-item">
              <span className="confirm-label">Hotel</span>
              <span className="confirm-value">{hotel.name}</span>
            </div>
            <div className="confirm-item">
              <span className="confirm-label">Location</span>
              <span className="confirm-value">{hotel.city}, {hotel.country}</span>
            </div>
            <div className="confirm-item">
              <span className="confirm-label">Guest Name</span>
              <span className="confirm-value">{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="confirm-item">
              <span className="confirm-label">Dates</span>
              <span className="confirm-value">{formData.checkIn} to {formData.checkOut} ({nights} {nights === 1 ? 'night' : 'nights'})</span>
            </div>
            <div className="confirm-item">
              <span className="confirm-label">Guests</span>
              <span className="confirm-value">{formData.adults} Adults{formData.children > 0 ? `, ${formData.children} Children` : ''}</span>
            </div>
            <div className="confirm-item">
              <span className="confirm-label">Room Type</span>
              <span className="confirm-value" style={{ textTransform: 'capitalize' }}>{formData.roomType} Room</span>
            </div>
            <div className="confirm-item">
              <span className="confirm-label">Total Amount Paid</span>
              <span className="confirm-value total-highlight">${totalPrice} USD</span>
            </div>
            <div className="confirm-item">
              <span className="confirm-label">Payment Method</span>
              <span className="confirm-value" style={{ textTransform: 'capitalize' }}>
                {formData.paymentMethod === 'card' ? 'Credit Card (Paid)' : formData.paymentMethod === 'paypal' ? 'PayPal Express' : 'Pay at Property'}
              </span>
            </div>
          </div>

          <div className="confirmation-actions">
            <Link to="/my-bookings" className="btn-primary">
              View My Bookings
            </Link>
            <button className="btn-secondary" onClick={() => window.print()}>
              Print Receipt
            </button>
            <Link to="/hotels" className="btn-outline">
              Explore More Hotels
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) return null;

  return (
    <div className="booking-page container">
      <div className="booking-header">
        <button className="back-btn" onClick={() => navigate(`/hotel/${hotel.id}`)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Hotel Overview
        </button>
        <h1 className="page-heading">Complete Your Reservation</h1>
        <p className="page-subheading">Instant confirmation &bull; No hidden reservation fees &bull; Secure 256-bit SSL encryption</p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div className="booking-layout">
        {/* Main Form Left Column */}
        <form className="booking-form" onSubmit={handleSubmit}>
          
          {/* Step 1: Guest Information */}
          <div className="form-card">
            <div className="form-card-header">
              <div className="step-badge">1</div>
              <div>
                <h2>Guest Information</h2>
                <p>Enter the primary guest details for check-in</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label>First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Doe"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Stay & Room Configuration */}
          <div className="form-card">
            <div className="form-card-header">
              <div className="step-badge">2</div>
              <div>
                <h2>Stay Details & Options</h2>
                <p>Select your stay dates and preferred room tier</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label>Check-In Date *</label>
                <input
                  type="date"
                  required
                  value={formData.checkIn}
                  onChange={(e) => handleInputChange('checkIn', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Check-Out Date *</label>
                <input
                  type="date"
                  required
                  value={formData.checkOut}
                  onChange={(e) => handleInputChange('checkOut', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Adult Guests</label>
                <select
                  value={formData.adults}
                  onChange={(e) => handleInputChange('adults', parseInt(e.target.value, 10))}
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults</option>
                  <option value={4}>4 Adults</option>
                </select>
              </div>
              <div className="input-group">
                <label>Children</label>
                <select
                  value={formData.children}
                  onChange={(e) => handleInputChange('children', parseInt(e.target.value, 10))}
                >
                  <option value={0}>No Children</option>
                  <option value={1}>1 Child</option>
                  <option value={2}>2 Children</option>
                </select>
              </div>
            </div>

            <div className="room-selector-group">
              <label className="section-label">Room Tier Selection</label>
              <div className="room-options-grid">
                <div
                  className={`room-option-card ${formData.roomType === 'standard' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('roomType', 'standard')}
                >
                  <div className="room-title">Standard Room</div>
                  <div className="room-desc">Comfortable queen bed with city view</div>
                  <div className="room-price">${hotel.price} / night</div>
                </div>

                <div
                  className={`room-option-card ${formData.roomType === 'deluxe' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('roomType', 'deluxe')}
                >
                  <div className="room-title">Deluxe Room</div>
                  <div className="room-desc">King bed, private balcony & premium bath</div>
                  <div className="room-price">${Math.round(hotel.price * 1.25)} / night</div>
                </div>

                <div
                  className={`room-option-card ${formData.roomType === 'suite' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('roomType', 'suite')}
                >
                  <div className="room-title">Executive Suite</div>
                  <div className="room-desc">Separate living lounge & ocean view</div>
                  <div className="room-price">${Math.round(hotel.price * 1.6)} / night</div>
                </div>
              </div>
            </div>

            <div className="input-group full-width" style={{ marginTop: '1rem' }}>
              <label>Special Requests (Optional)</label>
              <textarea
                rows={3}
                placeholder="High floor, quiet room, late check-in, dietary preferences..."
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="form-card">
            <div className="form-card-header">
              <div className="step-badge">3</div>
              <div>
                <h2>Payment Information</h2>
                <p>Choose your preferred payment method</p>
              </div>
            </div>

            <div className="payment-methods-tabs">
              <button
                type="button"
                className={`pay-tab ${formData.paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => handleInputChange('paymentMethod', 'card')}
              >
                Credit / Debit Card
              </button>
              <button
                type="button"
                className={`pay-tab ${formData.paymentMethod === 'paypal' ? 'active' : ''}`}
                onClick={() => handleInputChange('paymentMethod', 'paypal')}
              >
                PayPal Express
              </button>
              <button
                type="button"
                className={`pay-tab ${formData.paymentMethod === 'hotel' ? 'active' : ''}`}
                onClick={() => handleInputChange('paymentMethod', 'hotel')}
              >
                Pay at Check-In
              </button>
            </div>

            {formData.paymentMethod === 'card' && (
              <div className="form-grid" style={{ marginTop: '1.25rem' }}>
                <div className="input-group full-width">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Name as printed on card"
                    value={formData.cardName}
                    onChange={(e) => handleInputChange('cardName', e.target.value)}
                  />
                </div>
                <div className="input-group full-width">
                  <label>Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="4532 •••• •••• 8892"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Expiration Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={formData.cardExpiry}
                    onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>CVC Security Code</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="123"
                    value={formData.cardCvc}
                    onChange={(e) => handleInputChange('cardCvc', e.target.value)}
                  />
                </div>
              </div>
            )}

            {formData.paymentMethod === 'paypal' && (
              <div className="tab-info-box">
                <p>You will be redirected to PayPal to complete your purchase securely after clicking "Confirm & Pay".</p>
              </div>
            )}

            {formData.paymentMethod === 'hotel' && (
              <div className="tab-info-box">
                <p>Your credit card is used to guarantee your room reservation. No charge will be processed until check-in.</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="submit-booking-btn"
            disabled={submitting}
          >
            {submitting ? 'Processing Reservation...' : `Confirm & Pay $${totalPrice}`}
          </button>
        </form>

        {/* Price Breakdown Sidebar */}
        <aside className="booking-summary-sidebar">
          <div className="summary-card">
            <h3>Reservation Summary</h3>

            <div className="summary-hotel-info">
              <img src={hotel.image} alt={hotel.name} className="summary-hotel-img" />
              <div>
                <h4 className="summary-hotel-name">{hotel.name}</h4>
                <p className="summary-hotel-location">📍 {hotel.city}, {hotel.country}</p>
                <div className="summary-rating">★ {hotel.rating} / 5.0 Rating</div>
              </div>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Nights Stay</span>
              <span>{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
            </div>
            <div className="summary-row">
              <span>Room Tier</span>
              <span style={{ textTransform: 'capitalize' }}>{formData.roomType}</span>
            </div>
            <div className="summary-row">
              <span>Rate / Night</span>
              <span>${basePricePerNight}</span>
            </div>
            <div className="summary-row">
              <span>Room Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Taxes & Service Fees (12%)</span>
              <span>${taxesAndFees}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total-row">
              <span>Total Price</span>
              <span>${totalPrice} USD</span>
            </div>

            <div className="cancellation-policy-box">
              <strong>Free Cancellation</strong>
              <p>Cancel up to 24 hours before check-in for a 100% full refund.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Booking;
