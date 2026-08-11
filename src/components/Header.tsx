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
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
            <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
            <line x1="8" y1="6" x2="8.01" y2="6"></line>
            <line x1="16" y1="6" x2="16.01" y2="6"></line>
            <line x1="12" y1="6" x2="12.01" y2="6"></line>
            <line x1="12" y1="9" x2="12.01" y2="9"></line>
          </svg>
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
          <Link 
            to="/book/1" 
            className={`nav-link nav-book-btn ${location.pathname.startsWith('/book') ? 'active' : ''}`}
          >
            Book a Stay
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
