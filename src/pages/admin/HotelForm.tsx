import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Hotel } from '../../types/hotel';
import { fetchHotelById, createHotel, updateHotel } from '../../services/hotelService';
import { validateName } from '../../utils/validation';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ImageUploader from '../../components/ImageUploader';
import './HotelForm.css';

type HotelFormField = 'name' | 'city' | 'country' | 'address' | 'description' | 'image' | 'price';

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

  // Field validation state
  const [touched, setTouched] = useState<Record<HotelFormField, boolean>>({
    name: false,
    city: false,
    country: false,
    address: false,
    description: false,
    image: false,
    price: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<HotelFormField, string | null>>({
    name: null,
    city: null,
    country: null,
    address: null,
    description: null,
    image: null,
    price: null,
  });

  const validateField = (field: HotelFormField, value: any): string | null => {
    const strVal = String(value || '').trim();
    switch (field) {
      case 'name':
        return validateName(strVal, 'Hotel name');
      case 'city':
        return validateName(strVal, 'City');
      case 'country':
        return validateName(strVal, 'Country');
      case 'address':
        if (!strVal) return 'Address is required.';
        if (strVal.length < 5) return 'Address must be at least 5 characters.';
        return null;
      case 'description':
        if (!strVal) return 'Description is required.';
        if (strVal.length < 10) return 'Description must be at least 10 characters.';
        return null;
      case 'image':
        if (!strVal) return 'Main image URL is required.';
        return null;
      case 'price':
        if (value === undefined || value === null || isNaN(value) || value <= 0) {
          return 'Please enter a valid positive price.';
        }
        return null;
      default:
        return null;
    }
  };

  const handleBlur = (field: HotelFormField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = formData[field];
    setFieldErrors((prev) => ({ ...prev, [field]: validateField(field, val) }));
  };

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
    if (touched[field as HotelFormField]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: validateField(field as HotelFormField, value),
      }));
    }
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

    // Validate all fields on submit
    const nameErr = validateField('name', formData.name);
    const cityErr = validateField('city', formData.city);
    const countryErr = validateField('country', formData.country);
    const addressErr = validateField('address', formData.address);
    const descErr = validateField('description', formData.description);
    const imageErr = validateField('image', formData.image);
    const priceErr = validateField('price', formData.price);

    setTouched({
      name: true,
      city: true,
      country: true,
      address: true,
      description: true,
      image: true,
      price: true,
    });

    setFieldErrors({
      name: nameErr,
      city: cityErr,
      country: countryErr,
      address: addressErr,
      description: descErr,
      image: imageErr,
      price: priceErr,
    });

    if (nameErr || cityErr || countryErr || addressErr || descErr || imageErr || priceErr) {
      return;
    }

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

      <form className="hotel-edit-form" onSubmit={handleSubmit} noValidate>
        <div className="form-section">
          <h2>Basic Details</h2>
          <div className="form-grid">
            <div className="input-field full-width">
              <label>Hotel Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Grand Luxury Hotel & Resort"
                className={touched.name && fieldErrors.name ? 'input-has-error' : ''}
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
              />
              {touched.name && fieldErrors.name && (
                <span className="field-error-msg">{fieldErrors.name}</span>
              )}
            </div>

            <div className="input-field">
              <label>City *</label>
              <input
                type="text"
                required
                placeholder="e.g. New York"
                className={touched.city && fieldErrors.city ? 'input-has-error' : ''}
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                onBlur={() => handleBlur('city')}
              />
              {touched.city && fieldErrors.city && (
                <span className="field-error-msg">{fieldErrors.city}</span>
              )}
            </div>

            <div className="input-field">
              <label>Country *</label>
              <input
                type="text"
                required
                placeholder="e.g. USA"
                className={touched.country && fieldErrors.country ? 'input-has-error' : ''}
                value={formData.country || ''}
                onChange={(e) => handleInputChange('country', e.target.value)}
                onBlur={() => handleBlur('country')}
              />
              {touched.country && fieldErrors.country && (
                <span className="field-error-msg">{fieldErrors.country}</span>
              )}
            </div>

            <div className="input-field full-width">
              <label>Full Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. 123 Park Avenue, Manhattan"
                className={touched.address && fieldErrors.address ? 'input-has-error' : ''}
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                onBlur={() => handleBlur('address')}
              />
              {touched.address && fieldErrors.address && (
                <span className="field-error-msg">{fieldErrors.address}</span>
              )}
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
                className={touched.price && fieldErrors.price ? 'input-has-error' : ''}
                value={formData.price ?? 150}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                onBlur={() => handleBlur('price')}
              />
              {touched.price && fieldErrors.price && (
                <span className="field-error-msg">{fieldErrors.price}</span>
              )}
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
              <label>Total Rooms</label>
              <input
                type="number"
                min="1"
                required
                value={formData.rooms ?? 50}
                onChange={(e) => handleInputChange('rooms', parseInt(e.target.value, 10) || 1)}
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
                <option value="Business">Business</option>
                <option value="Boutique">Boutique</option>
                <option value="Lodge">Lodge</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Description & Media</h2>
          <div className="input-field full-width">
            <label>Detailed Overview / Description *</label>
            <textarea
              rows={4}
              required
              placeholder="Describe amenities, location highlights, room features..."
              className={touched.description && fieldErrors.description ? 'input-has-error' : ''}
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
            ></textarea>
            {touched.description && fieldErrors.description && (
              <span className="field-error-msg">{fieldErrors.description}</span>
            )}
          </div>

          <div className="input-field full-width" style={{ marginTop: '1.25rem' }}>
            <label>Main Image URL *</label>
            <ImageUploader
              value={formData.image}
              onImageUploaded={(url) => handleInputChange('image', url)}
            />
            {touched.image && fieldErrors.image && (
              <span className="field-error-msg">{fieldErrors.image}</span>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>Amenities List</h2>
          <div className="amenities-builder">
            <div className="amenity-input-row">
              <input
                type="text"
                placeholder="e.g. Free Breakfast, Spa, Infinity Pool"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAmenity();
                  }
                }}
              />
              <button type="button" className="add-tag-btn" onClick={handleAddAmenity}>
                + Add Amenity
              </button>
            </div>

            <div className="amenities-tags">
              {(formData.amenities || []).map((amenity) => (
                <span className="tag-chip" key={amenity}>
                  {amenity}
                  <button type="button" onClick={() => handleRemoveAmenity(amenity)}>
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
          <button type="submit" className="btn-save-form" disabled={submitting}>
            {submitting ? 'Saving to Database...' : isEditMode ? 'Save Changes' : 'Create Hotel'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default HotelForm;
