import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import HotelList from './pages/HotelList';
import HotelDetail from './pages/HotelDetail';
import Booking from './pages/Booking';
import './App.css';

/**
 * Main App Component
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
            
            {/* Hotel detail page */}
            <Route path="/hotel/:id" element={<HotelDetail />} />

            {/* Booking form page */}
            <Route path="/book/:id" element={<Booking />} />
          </Routes>
        </main>
        
        {/* Footer is outside Routes so it appears on all pages */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
