import { Link } from 'react-router-dom';
import { Hotel } from '../types/hotel';
import './HotelCard.css';

/**
 * HotelCard Component
 * 
 * Displays a single hotel in a card format.
 * This is a presentational component - it receives data via props and displays it.
 * 
 * Props:
 * - hotel: Hotel object containing all hotel information
 * 
 * Why this component might re-render:
 * 1. When parent re-renders (but React optimizes if props haven't changed)
 * 2. If we added state or hooks (currently none)
 * 
 * This component is kept simple and focused on presentation.
 * All logic and state management happens in parent components.
 */

interface HotelCardProps {
  hotel: Hotel;
}

function HotelCard({ hotel }: HotelCardProps) {
  return (
    <Link to={`/hotel/${hotel.id}`} className="hotel-card">
      <div className="hotel-card-image-wrapper">
        <img 
          src={hotel.image} 
          alt={hotel.name}
          className="hotel-card-image"
          loading="lazy"
        />
        <div className="hotel-card-badge">{hotel.type}</div>
      </div>
      
      <div className="hotel-card-content">
        <div className="hotel-card-header">
          <h3 className="hotel-card-title">{hotel.name}</h3>
          <div className="hotel-card-rating">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" color="#f59e0b" style={{ marginRight: '3px' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span className="rating-value">{hotel.rating}</span>
          </div>
        </div>
        
        <p className="hotel-card-location">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ display: 'inline-block', verticalAlign: 'text-bottom', marginRight: '4px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {hotel.city}, {hotel.country}
        </p>
        
        <p className="hotel-card-description">
          {hotel.description.substring(0, 100)}...
        </p>
        
        <div className="hotel-card-footer">
          <div className="hotel-card-price">
            <span className="price-label">From</span>
            <span className="price-value">${hotel.price}</span>
            <span className="price-period">/night</span>
          </div>
          <button className="view-details-button">View Details</button>
        </div>
      </div>
    </Link>
  );
}

export default HotelCard;
