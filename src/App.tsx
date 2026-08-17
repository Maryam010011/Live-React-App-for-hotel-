import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import HotelList from './pages/HotelList';
import HotelDetail from './pages/HotelDetail';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminHotelList from './pages/admin/AdminHotelList';
import HotelForm from './pages/admin/HotelForm';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Header />

          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/hotels" element={<HotelList />} />
              <Route path="/hotel/:id" element={<HotelDetail />} />
              <Route path="/book/:id" element={<Booking />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Admin-only routes — ProtectedRoute redirects non-admins */}
              <Route
                path="/admin/hotels"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminHotelList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/hotels/new"
                element={
                  <ProtectedRoute requireAdmin>
                    <HotelForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/hotels/:id/edit"
                element={
                  <ProtectedRoute requireAdmin>
                    <HotelForm />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
