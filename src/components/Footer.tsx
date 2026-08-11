import './Footer.css';

/**
 * Footer Component
 * 
 * A simple footer that appears at the bottom of every page.
 * This is a presentational component with no state or complex logic.
 * 
 * It's placed outside the Routes in App.tsx so it appears on all pages.
 */
function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container footer-content">
        <p className="footer-text">
          © {currentYear} LuxeStay. Find your perfect stay.
        </p>
        <div className="footer-links">
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
