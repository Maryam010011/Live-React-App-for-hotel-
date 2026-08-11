import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import HotelList from './pages/HotelList';
import HotelDetail from './pages/HotelDetail';
import './App.css';

/**
 * Main App Component
 * 
 * This is the root component that sets up:
 * 1. React Router for navigation between pages
 * 2. Layout structure with Header and Footer
 * 3. Route definitions for all pages
 * 
 * The component uses BrowserRouter to enable client-side routing,
 * allowing navigation without page reloads.
 */
function App() {
  return (
    <Router>
      <div className="app">
        {/* Header is outside Routes so it appears on all pages */}
        <Header />
        
        <main className="main-content">
          <Routes>
            {/* Home page - the landing/search page */}
            <Route path="/" element={<Home />} />
            
            {/* Hotel list page - shows search results */}
            <Route path="/hotels" element={<HotelList />} />
            
            {/* Hotel detail page - shows individual hotel details
                :id is a URL parameter that will be extracted in the component */}
            <Route path="/hotel/:id" element={<HotelDetail />} />
          </Routes>
        </main>
        
        {/* Footer is outside Routes so it appears on all pages */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
