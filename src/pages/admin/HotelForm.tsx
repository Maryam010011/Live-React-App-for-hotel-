import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Hotel } from '../../types/hotel';
import { fetchHotelById, createHotel, updateHotel } from '../../services/hotelService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import './HotelForm.css';

function HotelForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Hotel>>({
    name: '',
    city: '',
    country: '',
    address: '',
    price: 150,
    rating: 4.5,
    description: '',
    image: '',
    amenities: ['WiFi', 'Air Conditioning', 'Room Service'],
    rooms: 50,
    type: 'Luxury',
  });

  const [amenityInput, setAmenityInput] = useState('');

  useEffect(() => {
    if (isEditMode && id) {
      const loadHotelData = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await fetchHotelById(id);
          if (data) {
            setFormData(data);
          } else {
            setError('Hotel not found');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load hotel');
        } finally {
          setLoading(false);
        }
      };

      loadHotelData();
    }
  }, [id, isEditMode]);

  const handleInputChange = (field: keyof Hotel, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAmenity = () => {
    if (!amenityInput.trim()) return;
    const current = formData.amenities || [];
    if (!current.includes(amenityInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...(prev.amenities || []), amenityInput.trim()],
      }));
    }
    setAmenityInput('');
  };

  const handleRemoveAmenity = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: (prev.amenities || []).filter((a) => a !== item),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEditMode && id) {
        await updateHotel(id, formData);
      } else {
        await createHotel(formData);
      }
      navigate('/admin/hotels');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save hotel');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="hotel-form-page container">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="hotel-form-page container">
      <div className="form-header">
        <Link to="/admin/hotels" className="back-link">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Hotel Directory
        </Link>
        <h1 className="form-title">{isEditMode ? 'Edit Hotel Listing' : 'Add New Hotel'}</h1>
        <p className="form-subtitle">
          {isEditMode
            ? 'Update property details, rates, and amenities in MongoDB'
            : 'Create a new hotel entry to display in the LuxeStay catalog'}
        </p>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      <form className="hotel-edit-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Basic Details</h2>
          <div className="form-grid">
            <div className="input-field full-width">
              <label>Hotel Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Grand Luxury Hotel & Resort"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="input-field">
              <label>City *</label>
              <input
                type="text"
                required
                placeholder="e.g. New York"
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>

            <div className="input-field">
              <label>Country *</label>
              <input
                type="text"
                required
                placeholder="e.g. USA"
                value={formData.country || ''}
                onChange={(e) => handleInputChange('country', e.target.value)}
              />
            </div>

            <div className="input-field full-width">
              <label>Full Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. 123 Park Avenue, Manhattan"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Pricing & Specifications</h2>
          <div className="form-grid">
            <div className="input-field">
              <label>Price per Night (USD) *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.price ?? 150}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="input-field">
              <label>Rating (1.0 to 5.0)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                required
                value={formData.rating ?? 4.5}
                onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 4.5)}
              />
            </div>

            <div className="input-field">
              <label>Total Available Rooms</label>
              <input
                type="number"
                min="1"
                required
                value={formData.rooms ?? 50}
                onChange={(e) => handleInputChange('rooms', parseInt(e.target.value, 10) || 50)}
              />
            </div>

            <div className="input-field">
              <label>Category / Type</label>
              <select
                value={formData.type || 'Luxury'}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="Luxury">Luxury</option>
                <option value="Resort">Resort</option>
                <option value="Boutique">Boutique</option>
                <option value="Business">Business</option>
                <option value="Lodge">Lodge</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Media & Description</h2>
          <div className="form-grid">
            <div className="input-field full-width">
              <label>Main Image URL *</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={formData.image || ''}
                onChange={(e) => handleInputChange('image', e.target.value)}
              />
              {formData.image && (
                <div className="image-preview">
                  <img src={formData.image} alt="Preview" />
                  <span>Image Preview</span>
                </div>
              )}
            </div>

            <div className="input-field full-width">
              <label>Detailed Description *</label>
              <textarea
                rows={5}
                required
                placeholder="Describe hotel features, ambiance, dining options, and guest experiences..."
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Amenities & Facilities</h2>
          <div className="amenities-builder">
            <div className="amenity-input-row">
              <input
                type="text"
                placeholder="Add amenity (e.g. Infinity Pool, Valet Parking)..."
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAmenity();
                  }
                }}
              />
              <button type="button" onClick={handleAddAmenity} className="add-tag-btn">
                Add Amenity
              </button>
            </div>

            <div className="amenities-tags">
              {(formData.amenities || []).map((item, idx) => (
                <span key={idx} className="tag-chip">
                  {item}
                  <button type="button" onClick={() => handleRemoveAmenity(item)}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Link to="/admin/hotels" className="btn-cancel-form">
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className="btn-save-form">
            {submitting ? 'Saving to Database...' : isEditMode ? 'Update Hotel' : 'Create Hotel'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default HotelForm;
