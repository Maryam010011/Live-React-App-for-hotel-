import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Hotel } from '../types/hotel';
import { fetchHotelById } from '../services/hotelService';
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate API processing
    setTimeout(() => {
      const ref = 'LX-' + Math.floor(100000 + Math.random() * 900000);
      setBookingRef(ref);
      setSubmitting(false);
      setIsConfirmed(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  if (loading) {
    return (
      <div className="booking-page container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="booking-page container">
        <button className="back-btn" onClick={() => navigate('/hotels')}>
          &larr; Back to Search Results
        </button>
        <ErrorMessage message={error || 'Hotel not found'} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  // Render Confirmation Receipt View
  if (isConfirmed) {
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
            <button className="btn-secondary" onClick={() => window.print()}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Receipt
            </button>
            <Link to="/" className="btn-primary">
              Return to Home
            </Link>
            <Link to="/hotels" className="btn-outline">
              Explore More Hotels
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 019-2834"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Stay Dates & Room Type */}
          <div className="form-card">
            <div className="form-card-header">
              <div className="step-badge">2</div>
              <div>
                <h2>Dates & Room Selection</h2>
                <p>Customize your stay preferences</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label>Check-in Date *</label>
                <input
                  type="date"
                  required
                  value={formData.checkIn}
                  onChange={(e) => handleInputChange('checkIn', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Check-out Date *</label>
                <input
                  type="date"
                  required
                  value={formData.checkOut}
                  onChange={(e) => handleInputChange('checkOut', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Adults</label>
                <select
                  value={formData.adults}
                  onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
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
                  onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
                >
                  <option value={0}>No Children</option>
                  <option value={1}>1 Child</option>
                  <option value={2}>2 Children</option>
                </select>
              </div>
            </div>

            <div className="room-selector">
              <label className="selector-label">Select Room Category</label>
              <div className="room-options-grid">
                <div
                  className={`room-option-card ${formData.roomType === 'standard' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('roomType', 'standard')}
                >
                  <div className="option-radio"></div>
                  <div className="option-info">
                    <h4>Standard King / Twin</h4>
                    <p>Comfortable room with city views, Wi-Fi, and king bed</p>
                  </div>
                  <div className="option-price">${hotel.price}<small>/night</small></div>
                </div>

                <div
                  className={`room-option-card ${formData.roomType === 'deluxe' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('roomType', 'deluxe')}
                >
                  <div className="option-radio"></div>
                  <div className="option-info">
                    <h4>Deluxe Ocean View</h4>
                    <p>Spacious suite with balcony, ocean panorama & breakfast</p>
                  </div>
                  <div className="option-price">${Math.round(hotel.price * 1.25)}<small>/night</small></div>
                </div>

                <div
                  className={`room-option-card ${formData.roomType === 'suite' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('roomType', 'suite')}
                >
                  <div className="option-radio"></div>
                  <div className="option-info">
                    <h4>Executive Penthouse Suite</h4>
                    <p>Luxury high-floor suite, VIP lounge access & spa tub</p>
                  </div>
                  <div className="option-price">${Math.round(hotel.price * 1.6)}<small>/night</small></div>
                </div>
              </div>
            </div>

            <div className="input-group full-width">
              <label>Special Requests (Optional)</label>
              <textarea
                rows={3}
                placeholder="High floor, late check-in, quiet room, quiet bed arrangement..."
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              />
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="form-card">
            <div className="form-card-header">
              <div className="step-badge">3</div>
              <div>
                <h2>Payment Details</h2>
                <p>Choose your preferred payment method</p>
              </div>
            </div>

            <div className="payment-tabs">
              <button
                type="button"
                className={`payment-tab ${formData.paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => handleInputChange('paymentMethod', 'card')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                Credit / Debit Card
              </button>
              <button
                type="button"
                className={`payment-tab ${formData.paymentMethod === 'paypal' ? 'active' : ''}`}
                onClick={() => handleInputChange('paymentMethod', 'paypal')}
              >
                PayPal Express
              </button>
              <button
                type="button"
                className={`payment-tab ${formData.paymentMethod === 'hotel' ? 'active' : ''}`}
                onClick={() => handleInputChange('paymentMethod', 'hotel')}
              >
                Pay at Check-in
              </button>
            </div>

            {formData.paymentMethod === 'card' && (
              <div className="form-grid">
                <div className="input-group full-width">
                  <label>Cardholder Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Name as printed on card"
                    value={formData.cardName}
                    onChange={(e) => handleInputChange('cardName', e.target.value)}
                  />
                </div>
                <div className="input-group full-width">
                  <label>Card Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="4532 0000 0000 8892"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Expiry Date *</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={formData.cardExpiry}
                    onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>CVC / CVV *</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="123"
                    value={formData.cardCvc}
                    onChange={(e) => handleInputChange('cardCvc', e.target.value)}
                  />
                </div>
              </div>
            )}

            {formData.paymentMethod === 'paypal' && (
              <div className="payment-notice-box">
                <p>You will be redirected to PayPal to complete your payment securely after clicking confirm.</p>
              </div>
            )}

            {formData.paymentMethod === 'hotel' && (
              <div className="payment-notice-box">
                <p>No upfront charge! You will pay directly to the hotel reception upon check-in.</p>
              </div>
            )}

            <button type="submit" className="submit-booking-btn" disabled={submitting}>
              {submitting ? (
                <span>Processing Reservation...</span>
              ) : (
                <>
                  <span>Confirm & Complete Booking (${totalPrice})</span>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Sidebar Summary Right Column */}
        <aside className="booking-summary-sidebar">
          <div className="summary-card">
            <div className="summary-hotel-header">
              <img src={hotel.image} alt={hotel.name} className="summary-thumb" />
              <div>
                <span className="summary-badge">{hotel.type}</span>
                <h3 className="summary-title">{hotel.name}</h3>
                <p className="summary-location">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {hotel.city}, {hotel.country}
                </p>
                <div className="summary-rating">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" color="#eab308"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  <strong>{hotel.rating}</strong> / 5.0 Rating
                </div>
              </div>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-dates">
              <div className="date-block">
                <span className="label">Check-In</span>
                <strong>{formData.checkIn}</strong>
                <small>From 14:00</small>
              </div>
              <div className="date-arrow">&rarr;</div>
              <div className="date-block">
                <span className="label">Check-Out</span>
                <strong>{formData.checkOut}</strong>
                <small>Until 11:00</small>
              </div>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-breakdown">
              <h4>Price Breakdown</h4>
              <div className="breakdown-row">
                <span>${basePricePerNight} x {nights} {nights === 1 ? 'night' : 'nights'}</span>
                <span>${subtotal}</span>
              </div>
              <div className="breakdown-row">
                <span>Taxes & Service Fees (12%)</span>
                <span>${taxesAndFees}</span>
              </div>
              <div className="breakdown-row total-row">
                <span>Total Due</span>
                <span className="total-price">${totalPrice} USD</span>
              </div>
            </div>

            <div className="guarantee-box">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <div>
                <strong>Free Cancellation</strong>
                <p>Cancel up to 24 hours prior to check-in for a full refund.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Booking;
