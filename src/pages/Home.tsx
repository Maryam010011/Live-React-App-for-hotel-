import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import './Home.css';

/**
 * Home Page Component (Landing Page)
 * 
 * This is the main landing page where users can search for hotels.
 * 
 * State Management:
 * - No state lives here because we only need to navigate on search
 * - The search query is passed via URL parameters to the HotelList page
 * 
 * Why this component might re-render:
 * 1. When the route changes (but we'd navigate away)
 * 2. When parent (App) re-renders (rare, and React optimizes this)
 * 
 * Navigation Strategy:
 * - When user searches, we navigate to /hotels with query params
 * - This keeps the search query in the URL, allowing:
 *   - Direct linking to search results
 *   - Browser back button to work correctly
 *   - Bookmarking search results
 */
function Home() {
  const navigate = useNavigate();
  
  /**
   * Handles search submission from SearchBar component
   * 
   * @param city - The city name to search for
   * 
   * Navigation with query parameters:
   * - We use URLSearchParams to properly encode the city parameter
   * - This makes the search shareable and allows browser navigation
   */
  const handleSearch = (city: string) => {
    if (city) {
      navigate(`/hotels?city=${encodeURIComponent(city)}`);
    } else {
      // If empty search, show all hotels
      navigate('/hotels');
    }
  };
  
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <h1 className="hero-title">Find Your Perfect Stay</h1>
          <p className="hero-subtitle">
            Discover amazing hotels around the world. Your next adventure starts here.
          </p>
          
          <div className="search-section">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>
      
      <section className="features">
        <div className="container">
          <h2 className="features-title">Why Choose LuxeStay?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-title">Easy Search</h3>
              <p className="feature-description">
                Find hotels by city with our intuitive search interface
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3 className="feature-title">Best Prices</h3>
              <p className="feature-description">
                Compare prices and find the best deals for your budget
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3 className="feature-title">Top Rated</h3>
              <p className="feature-description">
                Browse hotels with excellent ratings and reviews
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3 className="feature-title">Worldwide</h3>
              <p className="feature-description">
                Access hotels in major cities across the globe
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
