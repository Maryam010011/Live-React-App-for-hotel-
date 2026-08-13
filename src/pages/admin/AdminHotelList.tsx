import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hotel } from '../../types/hotel';
import { fetchHotels, deleteHotel } from '../../services/hotelService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import './AdminHotelList.css';

function AdminHotelList() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Delete modal state
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [deletingHotelName, setDeletingHotelName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchHotels();
      setHotels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const confirmDelete = (hotel: Hotel) => {
    setDeletingId(hotel.id);
    setDeletingHotelName(hotel.name);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setIsDeleting(true);
      await deleteHotel(deletingId);
      setDeletingId(null);
      await loadHotels(); // Refetch after successful deletion
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete hotel');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredHotels = hotels.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <div>
          <span className="admin-tag">ADMIN MANAGEMENT</span>
          <h1 className="admin-title">Hotel Directory</h1>
          <p className="admin-subtitle">Manage, create, update, and remove hotel inventory</p>
        </div>
        <Link to="/admin/hotels/new" className="create-hotel-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add New Hotel
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="admin-toolbar">
        <div className="admin-search-input">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="Search by hotel name, city, country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="count-badge">Total: {filteredHotels.length} Hotels</span>
      </div>

      {/* Content States */}
      {loading && <LoadingSpinner />}

      {!loading && error && <ErrorMessage message={error} onRetry={loadHotels} />}

      {!loading && !error && filteredHotels.length === 0 && (
        <EmptyState
          message="No hotels found"
          suggestion={searchTerm ? 'Try clearing your search term' : 'Click "Add New Hotel" to create your first listing'}
        />
      )}

      {!loading && !error && filteredHotels.length > 0 && (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Location</th>
                <th>Price / Night</th>
                <th>Rating</th>
                <th>Type</th>
                <th>Rooms</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHotels.map((hotel) => (
                <tr key={hotel.id}>
                  <td>
                    <div className="hotel-cell">
                      <img src={hotel.image} alt={hotel.name} className="hotel-thumb" />
                      <div>
                        <strong>{hotel.name}</strong>
                        <small>{hotel.address}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {hotel.city}, {hotel.country}
                  </td>
                  <td>
                    <span className="price-tag">${hotel.price}</span>
                  </td>
                  <td>
                    <span className="rating-pill">⭐ {hotel.rating}</span>
                  </td>
                  <td>
                    <span className="type-badge">{hotel.type}</span>
                  </td>
                  <td>{hotel.rooms} Rooms</td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/admin/hotels/${hotel.id}/edit`} className="edit-btn">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Edit
                      </Link>
                      <button onClick={() => confirmDelete(hotel)} className="delete-btn">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId !== null && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-icon warning">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <h2>Confirm Deletion</h2>
            <p>
              Are you sure you want to delete <strong>"{deletingHotelName}"</strong>? This action will remove it permanently from MongoDB.
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                disabled={isDeleting}
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </button>
              <button
                className="btn-delete-confirm"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? 'Deleting...' : 'Delete Hotel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHotelList;
