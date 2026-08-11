import { Link, useLocation } from 'react-router-dom';
import './Header.css';

/**
 * Header Component
 * 
 * This component renders the navigation bar at the top of every page.
 * 
 * Key features:
 * 1. Uses useLocation hook to highlight the active page
 * 2. Provides navigation links using react-router's Link component
 * 3. Responsive design that adapts to mobile screens
 * 
 * Why useLocation is used:
 * - We need to know which page we're on to highlight the active nav link
 * - useLocation returns the current location object with pathname
 * - This triggers a re-render when the route changes
 */
function Header() {
  // Get current location to highlight active nav item
  // This causes the component to re-render when the route changes
  const location = useLocation();
  
  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">🏨</span>
          <span className="logo-text">LuxeStay</span>
        </Link>
        
        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/hotels" 
            className={`nav-link ${location.pathname === '/hotels' ? 'active' : ''}`}
          >
            Browse Hotels
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
