import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { propertyApi } from '../api';
import { ROUTES, getPropertyRoute, roleToPath } from '../config/routes';
import { categoryApi } from '../api/categories';
import {
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  Save,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';


const UNDEAD_PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo / Apartment' },
  { value: 'serviced residence', label: 'Serviced Residence' },
  { value: 'studio', label: 'Studio' },
  { value: 'loft', label: 'Loft' },
  { value: 'house', label: 'House / Bungalow' },
  { value: 'shoplot', label: 'Shoplot / Commercial' },
  { value: 'other', label: 'Other' },
];

const AMENITY_OPTIONS = [
  'WiFi', 'Parking', 'Air conditioning', 'Laundry', 'Swimming pool',
  'Gym', 'Pet friendly', 'Security', 'Elevator', 'Balcony',
  'Garden', 'BBQ area', 'Study room', 'Storage', 'Furnished',
];

export default function AddProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [amenityInput, setAmenityInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await categoryApi.shared();
        setCategories(data?.data ?? []);
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    })();
  }, []);

  const [form, setForm] = useState({
    title: '',
    address: '',
    categoryId: '',
    rent: '',
    city: '',
    state: '',
    availableFrom: '',
    availableTo: '',
    status: 'AVAILABLE',
    amenities: [],
    images: [],
  });

  const change = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* Toggle amenity */
  const toggleAmenity = (a) => {
    setForm((prev) => {
      const exists = prev.amenities.find((x) => x.name === a);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((x) => x.name !== a)
          : [...prev.amenities, { name: a }],
      };
    });
    if (amenityInput === a) setAmenityInput('');
  };

  /* Add custom amenity from input */
  const addAmenity = (e) => {
    e.preventDefault();
    const trimmed = amenityInput.trim();
    if (trimmed && !form.amenities.find((x) => x.name === trimmed)) {
      setForm((prev) => ({
        ...prev,
        amenities: [...prev.amenities, { name: trimmed }],
      }));
      setAmenityInput('');
    }
  };

  /* Remove amenity */
  const removeAmenity = (name) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a.name !== name),
    }));
  };

  /* Add image URL */
  const addImage = (e) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, { url: imageUrl.trim() }],
      }));
      setImageUrl('');
    }
  };

  const removeImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  /* Validate */
  const validate = () => {
    if (!form.title) return 'Title is required';
    if (!form.address) return 'Address is required';
    if (!form.rent || Number(form.rent) <= 0) return 'Valid rental price is required';
    if (!form.city) return 'City is required';
    return null;
  };

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        rent: Number(form.rent),
        availableFrom: form.availableFrom || undefined,
        availableTo: form.availableTo || undefined,
      };
      const res = await propertyApi.create(payload);
      if (res?.data?.success) {
        setSuccess(true);
        setTimeout(() => navigate(getPropertyRoute(user?.role)), 1200);
      } else {
        setError(res?.data?.error?.message || 'Property creation failed');
      }
    } catch (err) {
      setError(
        err.response?.data?.error?.message || 'Failed to create property'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-property-page">
      <header className="add-property-header">
        <div className="add-property-header-left">
          <Link to={getPropertyRoute(user?.role)} className="back-link">
            <ArrowLeft size={20} />
            Properties
          </Link>
          <h1>Add a new property</h1>
        </div>
        <div className="add-property-header-right">
          <Link to={roleToPath(user?.role)} className="close-link">
            <X size={20} />
          </Link>
        </div>
      </header>

      {/* Success state */}
      <AnimatePresence>
        {success && (
          <motion.div
            className="add-property-success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div className="success-check">
              <Check size={22} />
            </motion.div>
            <h2>Property added successfully</h2>
            <p>Redirecting to your properties list...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!success && (
        <form onSubmit={handleSubmit} className="add-property-form">
          {error && (
            <div className="form-alert-error">
              <span>{error}</span>
            </div>
          )}

          <div className="add-property-columns">
            {/* LEFT column */}
            <div className="add-property-left">
              <section className="form-section">
                <h2>Basic details</h2>

                <label>
                  Title <span className="required">*</span>
                  <input
                    type="text"
                    placeholder="e.g. Green Garden Apartment"
                    value={form.title}
                    onChange={(e) => change('title', e.target.value)}
                  />
                </label>

                <label>
                  Category
                  <select
                    value={form.categoryId || ''}
                    onChange={(e) => change('categoryId', e.target.value)}
                  >
                    <option value="">Select a category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Monthly rental (RM) <span className="required">*</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 1800"
                    value={form.rent}
                    onChange={(e) => change('rent', e.target.value)}
                  />
                </label>

                <label>
                  Full address <span className="required">*</span>
                  <input
                    type="text"
                    placeholder="Street, building, unit number..."
                    value={form.address}
                    onChange={(e) => change('address', e.target.value)}
                  />
                </label>
              </section>

              <section className="form-section">
                <h2>Location</h2>

                <div className="field-row">
                  <label>
                    City <span className="required">*</span>
                    <input
                      type="text"
                      placeholder="e.g. Kuala Lumpur"
                      value={form.city}
                      onChange={(e) => change('city', e.target.value)}
                    />
                  </label>

                  <label>
                    State
                    <input
                      type="text"
                      placeholder="e.g. Kuala Lumpur"
                      value={form.state}
                      onChange={(e) => change('state', e.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className="form-section">
                <h2>Availability</h2>

                <div className="field-row">
                  <label>
                    Available from
                    <input
                      type="date"
                      value={form.availableFrom}
                      onChange={(e) => change('availableFrom', e.target.value)}
                    />
                  </label>

                  <label>
                    Available until
                    <input
                      type="date"
                      value={form.availableTo}
                      onChange={(e) => change('availableTo', e.target.value)}
                    />
                  </label>
                </div>

                <label>
                  Status
                  <select
                    value={form.status}
                    onChange={(e) => change('status', e.target.value)}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="MAINTENANCE">Under maintenance</option>
                    <option value="INACTIVE">Inactive (hidden)</option>
                  </select>
                </label>
              </section>
            </div>

            {/* RIGHT column */}
            <div className="add-property-right">
              <section className="form-section">
                <h2>Amenities</h2>

                <div className="amenity-grid">
                  {AMENITY_OPTIONS.map((a) => {
                    const selected = form.amenities.some((x) => x.name === a);
                    return (
                      <button
                        key={a}
                        type="button"
                        className={`amenity-chip ${selected ? 'active' : ''}`}
                        onClick={() => toggleAmenity(a)}
                      >
                        {selected && <Check size={14} />}
                        {a}
                      </button>
                    );
                  })}
                </div>

                {/* Custom amenity input */}
                <div className="custom-amenity-row">
                  <input
                    type="text"
                    placeholder="Add custom amenity..."
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addAmenity(e)}
                  />
                  <button type="button" className="add-amenity-btn" onClick={addAmenity}>
                    <Plus size={18} />
                  </button>
                </div>

                {/* Selected amenities list */}
                {form.amenities.length > 0 && (
                  <div className="selected-amenities">
                    <span className="selected-label">Selected ({form.amenities.length}):</span>
                    <div className="selected-tags">
                      {form.amenities.map((a) => (
                        <span key={a.name} className="selected-tag">
                          {a.name}
                          <button
                            type="button"
                            className="remove-tag"
                            onClick={() => removeAmenity(a.name)}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section className="form-section">
                <h2>Property images</h2>
                <p className="section-hint">
                  Add property image URLs. You can add image files via the property detail page later.
                </p>

                <div className="image-input-row">
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addImage(e)}
                  />
                  <button type="button" className="add-amenity-btn" onClick={addImage}>
                    <Plus size={18} />
                  </button>
                </div>

                {form.images.length > 0 && (
                  <div className="image-list">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="image-thumb">
                        <img src={img.url} alt={`Image ${idx + 1}`} />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => removeImage(idx)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Submit bar */}
          <div className="submit-bar">
            <Link to={getPropertyRoute(user?.role)} className="cancel-btn">
              Cancel
            </Link>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spin-icon" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save property
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
