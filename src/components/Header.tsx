import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

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
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/hotels" className={`nav-link ${location.pathname === '/hotels' ? 'active' : ''}`}>
            Browse Hotels
          </Link>

          {/* My Bookings link — visible when logged in */}
          {user && (
            <Link
              to="/my-bookings"
              className={`nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}
            >
              My Bookings
            </Link>
          )}

          {/* Admin link — only visible to admins */}
          {isAdmin && (
            <Link
              to="/admin/hotels"
              className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
            >
              Admin
            </Link>
          )}

          <Link
            to="/book/1"
            className={`nav-link nav-book-btn ${location.pathname.startsWith('/book') ? 'active' : ''}`}
          >
            Book a Stay
          </Link>

          {/* Auth section */}
          {user ? (
            <div className="nav-user-menu" ref={dropdownRef}>
              <button
                className="nav-user-pill"
                onClick={() => setDropdownOpen((o) => !o)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <span className="nav-user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="nav-user-name">{user.name.split(' ')[0]}</span>
                {user.role === 'admin' && (
                  <span className="nav-admin-badge">Admin</span>
                )}
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-header">
                    <span className="nav-dropdown-name">{user.name}</span>
                    <span className="nav-dropdown-email">{user.email}</span>
                    <span className={`nav-dropdown-role ${user.role}`}>{user.role}</span>
                  </div>
                  <div className="nav-dropdown-divider" />

                  <Link
                    to="/my-bookings"
                    className="nav-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    My Bookings
                  </Link>

                  <div className="nav-dropdown-divider" />
                  <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className={`nav-link nav-login-btn ${location.pathname === '/login' ? 'active' : ''}`}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
