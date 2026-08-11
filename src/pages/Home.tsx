import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const handleSearch = (city: string) => {
    if (city) {
      navigate(`/hotels?city=${encodeURIComponent(city)}`);
    } else {
      navigate('/hotels');
    }
  };

  const popularCities = [
    { name: 'Dubai', country: 'United Arab Emirates', count: '1,240+ Hotels', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80' },
    { name: 'Paris', country: 'France', count: '890+ Hotels', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80' },
    { name: 'New York', country: 'United States', count: '1,450+ Hotels', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80' },
    { name: 'London', country: 'United Kingdom', count: '1,120+ Hotels', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80' },
    { name: 'Tokyo', country: 'Japan', count: '980+ Hotels', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80' },
    { name: 'Rome', country: 'Italy', count: '760+ Hotels', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80' },
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <div className="hero-badge">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" color="#d97706"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>Premier Luxury Hotel Booking Platform</span>
          </div>

          <h1 className="hero-title">Experience Hospitality Redefined</h1>
          <p className="hero-subtitle">
            Book handpicked 5-star hotels, luxury resorts, and boutique stays worldwide with instant confirmation and price match guarantee.
          </p>

          <div className="search-section">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="container stats-grid">
          <div className="stat-item">
            <span className="stat-number">500K+</span>
            <span className="stat-label">Luxury Rooms Worldwide</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">120+</span>
            <span className="stat-label">Countries Covered</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4.9 / 5</span>
            <span className="stat-label">Average Guest Rating</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Dedicated VIP Support</span>
          </div>
        </div>
      </section>

      {/* Featured Cities Section */}
      <section className="destinations-section container">
        <div className="section-header">
          <span className="section-tag">TOP DESTINATIONS</span>
          <h2 className="section-title">Explore Iconic Cities</h2>
          <p className="section-subtitle">Discover top-rated luxury stays in the world's most sought-after travel destinations</p>
        </div>

        <div className="destinations-grid">
          {popularCities.map((city, index) => (
            <div
              key={index}
              className="destination-card"
              onClick={() => handleSearch(city.name)}
            >
              <img src={city.image} alt={city.name} className="destination-img" />
              <div className="destination-overlay"></div>
              <div className="destination-content">
                <span className="destination-count">{city.count}</span>
                <h3 className="destination-name">{city.name}</h3>
                <p className="destination-country">{city.country}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SaaS Value Propositions Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">WHY LUXESTAY</span>
            <h2 className="section-title">Built for Discerning Travelers</h2>
            <p className="section-subtitle">Industry-leading booking engine backed by real-time API pricing and zero hidden fees</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3 className="feature-title">Real-Time Search</h3>
              <p className="feature-description">
                Direct integration with global hotel APIs delivers live rates and instant availability across 120+ countries.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h3 className="feature-title">Best Price Guarantee</h3>
              <p className="feature-description">
                We compare prices across multiple travel networks to ensure you receive the lowest available rate guaranteed.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="feature-title">Instant & Secure Booking</h3>
              <p className="feature-description">
                Seamless 256-bit encrypted checkout with instant reservation confirmation and zero booking markup.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <h3 className="feature-title">Worldwide Coverage</h3>
              <p className="feature-description">
                From bustling metropolitan hubs to tranquil beach resorts, access top-rated properties worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="cta-section container">
        <div className="cta-card">
          <div className="cta-content">
            <span className="cta-badge">FLEXIBLE BOOKING</span>
            <h2>Ready to plan your next retreat?</h2>
            <p>Enjoy free cancellation up to 24h prior to check-in on select rooms.</p>
          </div>
          <button className="cta-button" onClick={() => navigate('/hotels')}>
            Browse All Hotels
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
