import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAdminToken } from '../../api/adminApi';
import { getReviews, deleteReview } from '../../api/reviewApi';
import { getServices, createService, updateService, deleteService } from '../../api/serviceApi';
import { getServiceImageUrl } from '../../utils/imageUrl';
import seedServices from '../../data/services';
import './AdminDashboard.css';

const emptyForm = { slug: '', image: '', name: '', shortDesc: '', longDesc: '', features: '' };

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('services');
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);

  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [r, s] = await Promise.all([
          getReviews().catch(() => []),
          getServices().catch(() => [])
        ]);
        if (mounted) {
          setReviews(r);
          setServices(s);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  const handleLogout = () => {
    clearAdminToken();
    navigate('/admin/login');
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const openNewServiceForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setEditingService('new');
    setFormError('');
  };

  const openEditServiceForm = (service) => {
    setForm({
      slug: service.slug,
      image: service.image || '',
      name: service.name,
      shortDesc: service.shortDesc,
      longDesc: service.longDesc,
      features: (service.features || []).join(', '),
    });
    setImageFile(null);
    setImagePreview(getServiceImageUrl(service));
    setEditingService(service);
    setFormError('');
  };

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append('slug', form.slug.trim().toLowerCase().replace(/\s+/g, '-'));
    formData.append('name', form.name);
    formData.append('shortDesc', form.shortDesc);
    formData.append('longDesc', form.longDesc);
    formData.append('features', JSON.stringify(
      form.features.split(',').map((f) => f.trim()).filter(Boolean)
    ));
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return formData;
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    const formData = buildFormData();

    try {
      if (editingService === 'new') {
        const created = await createService(formData);
        setServices((prev) => [...prev, created]);
      } else {
        const updated = await updateService(editingService._id, formData);
        setServices((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      }
      setEditingService(null);
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (service) => {
    if (!window.confirm(`Delete "${service.name}"?`)) return;
    try {
      await deleteService(service._id);
      setServices((prev) => prev.filter((s) => s._id !== service._id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImportDefaults = async () => {
    setSaving(true);
    try {
      for (const s of seedServices) {
        await createService({
          slug: s.slug,
          image: '',
          name: s.name,
          shortDesc: s.shortDesc,
          longDesc: s.longDesc,
          features: s.features,
        });
      }
      // Reload data after import
      const [r, s] = await Promise.all([
        getReviews().catch(() => []),
        getServices().catch(() => [])
      ]);
      setReviews(r);
      setServices(s);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setForm((prev) => ({ ...prev, image: '' }));
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </header>

      <div className="admin-tabs">
        <button className={tab === 'services' ? 'active' : ''} onClick={() => setTab('services')}>
          Services
        </button>
        <button className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>
          Reviews
        </button>
      </div>

      {loading ? (
        <p className="admin-loading">Loading...</p>
      ) : tab === 'services' ? (
        <div className="admin-services">
          <div className="admin-section-header">
            <h2>Services ({services.length})</h2>
            <button className="admin-add-btn" onClick={openNewServiceForm}>
              + Add Service
            </button>
          </div>

          {services.length === 0 ? (
            <div className="admin-empty-state">
              <p>No services in the database yet.</p>
              <button className="admin-add-btn" onClick={handleImportDefaults} disabled={saving}>
                {saving ? 'Importing...' : 'Import Default Services'}
              </button>
            </div>
          ) : (
            <div className="admin-services-grid">
              {services.map((service) => (
                <div className="admin-service-card" key={service._id}>
                  {service.image ? (
                    <img src={getServiceImageUrl(service)} alt={service.name} className="admin-service-img" />
                  ) : (
                    <div className="admin-service-img admin-service-img-placeholder">No Image</div>
                  )}
                  <h4>{service.name}</h4>
                  <p>{service.shortDesc}</p>
                  <div className="admin-service-actions">
                    <button onClick={() => openEditServiceForm(service)}>Edit</button>
                    <button className="danger" onClick={() => handleDeleteService(service)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="admin-reviews">
          <h2>Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="admin-empty-state">No reviews submitted yet.</p>
          ) : (
            <div className="admin-reviews-list">
              {reviews.map((review) => (
                <div className="admin-review-row" key={review._id}>
                  <div>
                    <strong>{review.name}</strong> — {'★'.repeat(review.rating)}
                    <p>{review.text}</p>
                  </div>
                  <button className="danger" onClick={() => handleDeleteReview(review._id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editingService && (
        <div className="admin-modal-overlay" onClick={() => setEditingService(null)}>
          <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSaveService}>
            <h3>{editingService === 'new' ? 'Add Service' : 'Edit Service'}</h3>

            <input
              name="slug"
              placeholder="Slug (e.g. emergency-towing)"
              value={form.slug}
              onChange={handleFormChange}
              required
              disabled={editingService !== 'new'}
            />

            <label className="admin-image-label">
              Service Image
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>
            {imagePreview && (
              <div className="admin-image-preview-wrapper">
                <img src={imagePreview} alt="Preview" className="admin-image-preview" />
                <button type="button" className="admin-image-remove" onClick={removeImage} aria-label="Remove image">×</button>
              </div>
            )}

            <input
              name="name"
              placeholder="Service Name"
              value={form.name}
              onChange={handleFormChange}
              required
            />
            <input
              name="shortDesc"
              placeholder="Short Description (shown on the card)"
              value={form.shortDesc}
              onChange={handleFormChange}
              required
            />
            <textarea
              name="longDesc"
              placeholder="Full Description (shown on the service detail page)"
              rows="4"
              value={form.longDesc}
              onChange={handleFormChange}
              required
            />
            <input
              name="features"
              placeholder="Features, comma separated"
              value={form.features}
              onChange={handleFormChange}
            />

            {formError && <p className="admin-form-error">{formError}</p>}

            <div className="admin-modal-actions">
              <button type="button" onClick={() => { setEditingService(null); setImageFile(null); setImagePreview(''); }}>
                Cancel
              </button>
              <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;