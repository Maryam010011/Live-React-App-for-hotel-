import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hotel } from '../types/hotel';
import { fetchHotelById } from '../services/hotelService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './HotelDetail.css';

/**
 * HotelDetail Page Component
 * 
 * Displays detailed information about a single hotel.
 * This is the third page in our application.
 * 
 * URL Parameters:
 * - Uses useParams hook to extract the hotel ID from the URL
 * - URL pattern: /hotel/:id (defined in App.tsx Routes)
 * 
 * State Management (WHY state lives here):
 * 
 * 1. hotel - Lives HERE because:
 *    - This page is responsible for fetching single hotel details
 *    - No child components need to manage this data
 *    - It's specific to this page and not shared across the app
 * 
 * 2. loading - Lives HERE because:
 *    - We initiate the API call in this component
 *    - Need to show loading state while fetching
 * 
 * 3. error - Lives HERE because:
 *    - Error handling is centralized where the API call happens
 * 
 * Why this component re-renders:
 * 1. When the id parameter changes (user navigates to different hotel)
 * 2. When hotel state updates (after API call completes)
 * 3. When loading/error states change
 */
function HotelDetail() {
  // Extract the 'id' parameter from the URL
  // useParams returns an object with all URL parameters
  const { id } = useParams<{ id: string }>();
  
  // useNavigate hook for programmatic navigation
  const navigate = useNavigate();
  
  // State for hotel data and UI states
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Loads hotel details by ID
   */
  const loadHotel = async (hotelId: number) => {
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to load hotel details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * useEffect - runs when id changes
   * 
   * Why this effect exists:
   * - Fetch hotel data when component mounts
   * - Re-fetch if the ID changes (user navigates to different hotel)
   * 
   * Dependency: [id]
   * - Effect runs when id parameter changes
   * - We parse string to number for the API call
   */
  useEffect(() => {
    if (id) {
      const hotelId = parseInt(id, 10);
      if (!isNaN(hotelId)) {
        loadHotel(hotelId);
      } else {
        setError('Invalid hotel ID');
        setLoading(false);
      }
    }
  }, [id]);
  
  /**
   * Retry handler - reloads hotel data
   */
  const handleRetry = () => {
    if (id) {
      const hotelId = parseInt(id, 10);
      loadHotel(hotelId);
    }
  };
  
  /**
   * Navigate back to hotel list
   */
  const handleBack = () => {
    navigate('/hotels');
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="hotel-detail-page">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="hotel-detail-page">
        <div className="container">
          <button className="back-button" onClick={handleBack}>
            ← Back to Hotels
          </button>
          <ErrorMessage message={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }
  
  // Render empty state (hotel not found)
  if (!hotel) {
    return (
      <div className="hotel-detail-page">
        <div className="container">
          <button className="back-button" onClick={handleBack}>
            ← Back to Hotels
          </button>
          <div className="not-found">
            <h2>Hotel not found</h2>
            <p>The hotel you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Render success state with hotel details
  return (
    <div className="hotel-detail-page">
      <div className="detail-header">
        <div className="container">
          <button className="back-button" onClick={handleBack}>
            ← Back to Hotels
          </button>
        </div>
      </div>
      
      <div className="container">
        <div className="hotel-detail-content">
          <div className="hotel-image-section">
            <img 
              src={hotel.image} 
              alt={hotel.name}
              className="hotel-detail-image"
            />
            <div className="hotel-type-badge">{hotel.type}</div>
          </div>
          
          <div className="hotel-info-section">
            <div className="hotel-header">
              <div>
                <h1 className="hotel-name">{hotel.name}</h1>
                <p className="hotel-location">
                  📍 {hotel.address}, {hotel.city}, {hotel.country}
                </p>
              </div>
              <div className="hotel-rating-large">
                <span className="rating-icon-large">⭐</span>
                <span className="rating-value-large">{hotel.rating}</span>
              </div>
            </div>
            
            <div className="hotel-description-section">
              <h2 className="section-title">About This Hotel</h2>
              <p className="hotel-description-full">{hotel.description}</p>
            </div>
            
            <div className="hotel-amenities-section">
              <h2 className="section-title">Amenities</h2>
              <div className="amenities-grid">
                {hotel.amenities.map((amenity, index) => (
                  <div key={index} className="amenity-item">
                    <span className="amenity-icon">✓</span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hotel-details-grid">
              <div className="detail-item">
                <span className="detail-label">Total Rooms</span>
                <span className="detail-value">{hotel.rooms}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Hotel Type</span>
                <span className="detail-value">{hotel.type}</span>
              </div>
            </div>
            
            <div className="booking-section">
              <div className="price-section">
                <span className="price-label">Price per night</span>
                <div className="price-display">
                  <span className="price-currency">$</span>
                  <span className="price-amount">{hotel.price}</span>
                </div>
              </div>
              <button className="book-button">Book Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelDetail;
