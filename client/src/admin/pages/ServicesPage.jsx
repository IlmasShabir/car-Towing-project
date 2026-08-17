import { useEffect, useRef, useState } from 'react';
import { FiTool, FiTrash2, FiEdit2, FiPlus, FiRefreshCw, FiImage, FiUpload } from 'react-icons/fi';
import { getServices, createService, updateService, deleteService } from '../../api/serviceApi';
import { getServiceImageUrl } from '../../utils/imageUrl';
import seedServices from '../../data/services';
import { useToast } from '../components/Toast';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Modal,
  SearchBox,
  Skeleton,
  Textarea,
} from '../components/ui';

const emptyForm = { slug: '', name: '', shortDesc: '', longDesc: '', features: '' };

const ServiceFormModal = ({ open, onClose, editing, onSaved }) => {
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        slug: editing.slug,
        name: editing.name,
        shortDesc: editing.shortDesc,
        longDesc: editing.longDesc,
        features: (editing.features || []).join(', '),
      });
      setImagePreview(getServiceImageUrl(editing));
    } else {
      setForm(emptyForm);
      setImagePreview('');
    }
    setImageFile(null);
    setErrors({});
    setSaving(false);
  }, [open, editing]);

  const validate = () => {
    const next = {};
    if (!form.slug.trim()) next.slug = 'Slug is required';
    else if (!/^[a-z0-9-]+$/.test(form.slug.trim())) next.slug = 'Use lowercase letters, numbers and dashes only';
    if (!form.name.trim()) next.name = 'Service name is required';
    if (!form.shortDesc.trim()) next.shortDesc = 'Short description is required';
    if (!form.longDesc.trim()) next.longDesc = 'Full description is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const formData = new FormData();
    formData.append('slug', form.slug.trim().toLowerCase().replace(/\s+/g, '-'));
    formData.append('name', form.name.trim());
    formData.append('shortDesc', form.shortDesc.trim());
    formData.append('longDesc', form.longDesc.trim());
    formData.append(
      'features',
      JSON.stringify(form.features.split(',').map((f) => f.trim()).filter(Boolean)),
    );
    if (imageFile) formData.append('image', imageFile);

    try {
      const saved = editing
        ? await updateService(editing._id, formData)
        : await createService(formData);
      toast.success(editing ? 'Service updated' : 'Service created');
      onSaved(saved);
      onClose();
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit service' : 'Add service'}
      sub={editing ? `Editing “${editing.name}”` : 'Create a new service for the website'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="service-form" loading={saving}>
            {editing ? 'Save changes' : 'Create service'}
          </Button>
        </>
      }
    >
      <form id="service-form" onSubmit={handleSubmit} noValidate>
        {errors.form && (
          <div className="a-badge a-badge-red" style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 8 }}>
            {errors.form}
          </div>
        )}

        <Field label="Slug" required hint="Used in the website URL, e.g. emergency-towing">
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="emergency-towing"
            disabled={!!editing}
            invalid={!!errors.slug}
          />
          {errors.slug && <span className="a-input-error">{errors.slug}</span>}
        </Field>

        <Field label="Service image" hint="Optional. JPEG, PNG, WebP up to 5MB.">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {imagePreview ? (
              <div style={{ position: 'relative', width: 120, height: 76 }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }}
                />
                <button
                  type="button"
                  onClick={() => { setImagePreview(''); setImageFile(null); }}
                  aria-label="Remove image"
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)', color: '#fff',
                    border: 'none', cursor: 'pointer', fontSize: 13, lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <span className="a-notif-icon tone-violet"><FiImage /></span>
            )}
            <Button type="button" variant="secondary" size="sm" icon={<FiUpload />} onClick={() => fileRef.current?.click()}>
              {imagePreview ? 'Replace image' : 'Upload image'}
            </Button>
          </div>
        </Field>

        <Field label="Service name" required>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Emergency Towing"
            invalid={!!errors.name}
          />
          {errors.name && <span className="a-input-error">{errors.name}</span>}
        </Field>

        <Field label="Short description" required hint="Shown on service cards">
          <Input
            value={form.shortDesc}
            onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
            placeholder="Quick towing for all types of vehicles"
            invalid={!!errors.shortDesc}
          />
          {errors.shortDesc && <span className="a-input-error">{errors.shortDesc}</span>}
        </Field>

        <Field label="Full description" required hint="Shown on the service detail page">
          <Textarea
            rows={4}
            value={form.longDesc}
            onChange={(e) => setForm({ ...form, longDesc: e.target.value })}
            placeholder="Describe the service in detail…"
            invalid={!!errors.longDesc}
          />
          {errors.longDesc && <span className="a-input-error">{errors.longDesc}</span>}
        </Field>

        <Field label="Features" hint="Comma separated — e.g. 24/7 Availability, Fast Response">
          <Input
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
            placeholder="24/7 Availability, Fast Response"
          />
        </Field>
      </form>
    </Modal>
  );
};

const ServicesPage = () => {
  const [services, setServices] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [importing, setImporting] = useState(false);
  const toast = useToast();

  const load = async () => {
    setError('');
    setServices(null);
    try {
      const data = await getServices();
      setServices(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteService(deleteTarget._id);
      setServices((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      toast.success('Service deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Failed to delete service', err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleImportDefaults = async () => {
    setImporting(true);
    try {
      const created = [];
      for (const s of seedServices) {
        const existing = services.some((item) => item.slug === s.slug);
        if (existing) continue;
        const service = await createService({
          slug: s.slug,
          image: '',
          name: s.name,
          shortDesc: s.shortDesc,
          longDesc: s.longDesc,
          features: s.features,
        });
        created.push(service);
      }
      toast.success(created.length ? `${created.length} default services imported` : 'Nothing to import — services already exist');
      load();
    } catch (err) {
      toast.error('Import failed', err.message);
    } finally {
      setImporting(false);
    }
  };

  const filtered = services
    ? services.filter((s) => {
        const q = search.toLowerCase();
        return (
          !q ||
          s.name?.toLowerCase().includes(q) ||
          s.slug?.toLowerCase().includes(q) ||
          s.shortDesc?.toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <div>
      <div className="a-toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search services…" />
        <Button variant="ghost" icon={<FiRefreshCw />} onClick={load} disabled={!services} aria-label="Refresh">
          Refresh
        </Button>
        <div className="a-toolbar-spacer" />
        <Button icon={<FiPlus />} onClick={() => { setEditing(null); setModalOpen(true); }}>
          Add service
        </Button>
      </div>

      {error ? (
        <div className="a-card">
          <ErrorState text={error} onRetry={load} />
        </div>
      ) : !services ? (
        <div className="a-service-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="a-card" key={i} style={{ overflow: 'hidden' }}>
              <Skeleton style={{ height: 130, borderRadius: 0 }} />
              <div style={{ padding: 16 }}>
                <Skeleton style={{ width: '60%', height: 15 }} />
                <Skeleton style={{ width: '90%', height: 12, marginTop: 10 }} />
                <Skeleton style={{ width: '70%', height: 12, marginTop: 6 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="a-card">
          <EmptyState
            title={search ? 'No services match your search' : 'No services yet'}
            text={
              search
                ? 'Try a different search term.'
                : 'Services are shown on the public website. Add your first service or import the defaults.'
            }
            icon={<FiTool />}
            action={
              !search && (
                <Button variant="secondary" onClick={handleImportDefaults} loading={importing}>
                  Import default services
                </Button>
              )
            }
          />
        </div>
      ) : (
        <>
<div className="a-service-grid" data-od-id="services-grid">
            {filtered.map((service) => (
              <div className="a-service-card" key={service._id}>
                <div className="a-service-img">
                  {service.image ? (
                    <img src={getServiceImageUrl(service)} alt={service.name} loading="lazy" />
                  ) : (
                    <FiImage />
                  )}
                </div>
                <div className="a-service-body">
                  <h4>{service.name}</h4>
                  <p>{service.shortDesc}</p>
                </div>
                <div className="a-service-foot">
                  <Button variant="secondary" size="sm" icon={<FiEdit2 />} onClick={() => { setEditing(service); setModalOpen(true); }}>
                    Edit
                  </Button>
                  <Button variant="danger-ghost" size="sm" icon={<FiTrash2 />} onClick={() => setDeleteTarget(service)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--a-faint)', marginTop: 14 }}>
            {services.length} service{services.length !== 1 ? 's' : ''} on the website
          </p>
        </>
      )}

      <ServiceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSaved={() => load()}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete “${deleteTarget?.name}”?`}
        message="This service will be removed from the website immediately. This cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ServicesPage;