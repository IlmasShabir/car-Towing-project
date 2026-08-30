import { useEffect, useRef, useState } from 'react';
import { FiTool, FiTrash2, FiEdit2, FiPlus, FiRefreshCw, FiImage, FiUpload } from 'react-icons/fi';
import { getServices, createService, updateService, deleteService } from '../../api/serviceApi';
import { getServiceImageUrl } from '../../utils/imageUrl';
import { serviceContentList as seedServices } from '../../data/serviceContent';
import { normalizeFeatures } from '../../utils/features';
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

const emptyForm = {
  slug: '',
  name: '',
  seoTitle: '',
  shortDesc: '',
  features: '',
  h1: '',
  metaDescription: '',
  intro: [''],
  primaryKeyword: '',
  semanticKeywords: '',
  related: '',
  sections: [],
};

const freshSection = () => ({ heading: '', paragraphs: [''], bullets: [''], afterList: '', steps: [''] });

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
      const sections = Array.isArray(editing.sections) && editing.sections.length
        ? editing.sections.map((s) => ({
            heading: s.heading || '',
            paragraphs: Array.isArray(s.paragraphs) && s.paragraphs.length ? s.paragraphs : [''],
            bullets: Array.isArray(s.bullets) && s.bullets.length ? s.bullets : [''],
            afterList: s.afterList || '',
            steps: Array.isArray(s.steps) && s.steps.length ? s.steps : [''],
          }))
        : [];
      setForm({
        slug: editing.slug,
        name: editing.name,
        seoTitle: editing.seoTitle || '',
        shortDesc: editing.shortDesc,
        features: normalizeFeatures(editing.features).join(', '),
        h1: editing.h1 || '',
        metaDescription: editing.metaDescription || '',
        intro: Array.isArray(editing.intro) && editing.intro.length ? editing.intro : [''],
        primaryKeyword: editing.primaryKeyword || '',
        semanticKeywords: (editing.semanticKeywords || []).join(', '),
        related: (editing.related || []).join(', '),
        sections,
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

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const setItem = (key, index, value) =>
    setForm((f) => {
      const arr = [...(f[key] || [])];
      arr[index] = value;
      return { ...f, [key]: arr };
    });

  const addItem = (key) => setForm((f) => ({ ...f, [key]: [...(f[key] || []), ''] }));

  const removeItem = (key, index) =>
    setForm((f) => ({ ...f, [key]: (f[key] || []).filter((_, i) => i !== index) }));

  const setSection = (index, patch) =>
    setForm((f) => ({
      ...f,
      sections: f.sections.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));

  const setSectionItem = (index, key, fieldIndex, value) =>
    setForm((f) => ({
      ...f,
      sections: f.sections.map((s, i) => {
        if (i !== index) return s;
        const arr = [...(s[key] || [])];
        arr[fieldIndex] = value;
        return { ...s, [key]: arr };
      }),
    }));

  const addSectionItem = (index, key) =>
    setForm((f) => ({
      ...f,
      sections: f.sections.map((s, i) => (i === index ? { ...s, [key]: [...(s[key] || []), ''] } : s)),
    }));

  const removeSectionItem = (index, key, fieldIndex) =>
    setForm((f) => ({
      ...f,
      sections: f.sections.map((s, i) =>
        i === index ? { ...s, [key]: (s[key] || []).filter((_, fi) => fi !== fieldIndex) } : s
      ),
    }));

  const addSection = () => setForm((f) => ({ ...f, sections: [...f.sections, freshSection()] }));
  const removeSection = (index) =>
    setForm((f) => ({ ...f, sections: f.sections.filter((_, i) => i !== index) }));

  const validate = () => {
    const next = {};
    if (!form.slug.trim()) next.slug = 'Slug is required';
    else if (!/^[a-z0-9-]+$/.test(form.slug.trim())) next.slug = 'Use lowercase letters, numbers and dashes only';
    if (!form.name.trim()) next.name = 'Service name is required';
    if (!form.shortDesc.trim()) next.shortDesc = 'Short description is required';
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
    if (form.seoTitle.trim()) formData.append('seoTitle', form.seoTitle.trim());
    formData.append('shortDesc', form.shortDesc.trim());
    formData.append(
      'features',
      JSON.stringify(form.features.split(',').map((f) => f.trim()).filter(Boolean)),
    );
    if (form.h1.trim()) formData.append('h1', form.h1.trim());
    if (form.metaDescription.trim()) formData.append('metaDescription', form.metaDescription.trim());
    formData.append('intro', JSON.stringify(form.intro.map((s) => s.trim()).filter(Boolean)));
    if (form.primaryKeyword.trim()) formData.append('primaryKeyword', form.primaryKeyword.trim());
    formData.append(
      'semanticKeywords',
      JSON.stringify(form.semanticKeywords.split(',').map((s) => s.trim()).filter(Boolean)),
    );
    formData.append(
      'related',
      JSON.stringify(form.related.split(',').map((s) => s.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean)),
    );
    formData.append(
      'sections',
      JSON.stringify(
        form.sections
          .filter((s) => s.heading.trim() || s.paragraphs.some((p) => p.trim()) || s.bullets.some((b) => b.trim()) || s.steps.some((st) => st.trim()))
          .map((s) => ({
            heading: s.heading.trim(),
            paragraphs: s.paragraphs.map((p) => p.trim()).filter(Boolean),
            bullets: s.bullets.map((b) => b.trim()).filter(Boolean),
            afterList: s.afterList.trim(),
            steps: s.steps.map((st) => st.trim()).filter(Boolean),
          })),
      ),
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

  const sectionStyle = {
    border: '1px solid var(--a-border)',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    background: 'var(--a-card)',
  };
  const groupLabel = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--a-faint)',
    margin: '12px 0 6px',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  };
  const rowBtnStyle = { marginTop: 6 };

  return (
    <Modal
      wide
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

        <Field label="SEO Title" hint="Optional. Used as the browser tab title for this service page.">
          <Input
            value={form.seoTitle}
            onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
            placeholder="Emergency Towing Dubai | 24/7 Usama Car Towing"
          />
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

        <Field label="Features" hint="Comma separated, no quotes — e.g. 24/7 Availability, Fast Response. Shown on the website with a tick.">
          <Input
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
            placeholder="24/7 Availability, Fast Response"
          />
        </Field>

        <div style={{ height: 2, background: 'var(--a-border)', margin: '22px 0' }} />

        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Detail Page Content</div>
        <p style={{ fontSize: 12.5, color: 'var(--a-faint)', marginBottom: 12 }}>
          This content appears on the public service detail page, so it overwrites the built-in default content for this slug.
        </p>

        <Field label="H1 heading" hint="Main heading shown at the top of the detail page.">
          <Input
            value={form.h1}
            onChange={(e) => setField('h1', e.target.value)}
            placeholder="Emergency Towing in Dubai"
          />
        </Field>

        <Field label="Meta description" hint="SEO meta description for this page.">
          <Textarea
            rows={3}
            value={form.metaDescription}
            onChange={(e) => setField('metaDescription', e.target.value)}
            placeholder="24/7 emergency towing service in Dubai…"
          />
        </Field>

        <Field label="Intro paragraphs" hint="Opening paragraphs above the section highlights.">
          {form.intro.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
              <Textarea
                rows={2}
                style={{ flex: 1 }}
                value={p}
                onChange={(e) => setItem('intro', i, e.target.value)}
                placeholder={`Intro paragraph ${i + 1}`}
              />
              <Button
                type="button"
                variant="danger-ghost"
                size="sm"
                disabled={form.intro.length === 1}
                onClick={() => removeItem('intro', i)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => addItem('intro')}>
            + Add intro paragraph
          </Button>
        </Field>

        <Field label="Primary keyword" hint="Main SEO keyword for this service.">
          <Input
            value={form.primaryKeyword}
            onChange={(e) => setField('primaryKeyword', e.target.value)}
            placeholder="emergency towing Dubai"
          />
        </Field>

        <Field label="Semantic keywords" hint="Comma separated additional SEO keywords.">
          <Input
            value={form.semanticKeywords}
            onChange={(e) => setField('semanticKeywords', e.target.value)}
            placeholder="24/7 towing Dubai, tow truck Dubai"
          />
        </Field>

        <Field label="Related services" hint="Comma separated slugs shown as related cards at the bottom of the page.">
          <Input
            value={form.related}
            onChange={(e) => setField('related', e.target.value)}
            placeholder="emergency-towing, accident-recovery"
          />
        </Field>

        <div style={{ height: 2, background: 'var(--a-border)', margin: '22px 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Sections</div>
            <p style={{ fontSize: 12.5, color: 'var(--a-faint)', margin: 0 }}>
              Each section has a heading and paragraphs. Use the button to add more.
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" icon={<FiPlus />} onClick={addSection}>
            Add section
          </Button>
        </div>

        {form.sections.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--a-faint)', padding: '14px 0' }}>
            No sections yet. Click "Add section" to add a heading and paragraphs block.
          </p>
        )}

        {form.sections.map((section, si) => (
          <div key={si} style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Section {si + 1}</span>
              <Button type="button" variant="danger-ghost" size="sm" onClick={() => removeSection(si)}>
                Remove section
              </Button>
            </div>

            <Field label="Heading">
              <Input
                value={section.heading}
                onChange={(e) => setSection(si, { heading: e.target.value })}
                placeholder="e.g. When Do You Need Emergency Towing?"
              />
            </Field>

            <div style={groupLabel}>Paragraphs</div>
            {section.paragraphs.map((p, pi) => (
              <div key={pi} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                <Textarea
                  rows={2}
                  style={{ flex: 1 }}
                  value={p}
                  onChange={(e) => setSectionItem(si, 'paragraphs', pi, e.target.value)}
                  placeholder={`Paragraph ${pi + 1}`}
                />
                <Button
                  type="button"
                  variant="danger-ghost"
                  size="sm"
                  disabled={section.paragraphs.length === 1}
                  onClick={() => removeSectionItem(si, 'paragraphs', pi)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" style={rowBtnStyle} onClick={() => addSectionItem(si, 'paragraphs')}>
              + Add paragraph
            </Button>

            <div style={groupLabel}>Bullets (tick list)</div>
            {section.bullets.map((b, bi) => (
              <div key={bi} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <Input
                  style={{ flex: 1 }}
                  value={b}
                  onChange={(e) => setSectionItem(si, 'bullets', bi, e.target.value)}
                  placeholder={`Bullet ${bi + 1}`}
                />
                <Button
                  type="button"
                  variant="danger-ghost"
                  size="sm"
                  disabled={section.bullets.length === 1}
                  onClick={() => removeSectionItem(si, 'bullets', bi)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" style={rowBtnStyle} onClick={() => addSectionItem(si, 'bullets')}>
              + Add bullet
            </Button>

            {section.afterList !== undefined && section.bullets.some((b) => b.trim()) && (
              <Field label="Text after list" hint="Optional paragraph shown after the bullets.">
                <Textarea
                  rows={2}
                  value={section.afterList}
                  onChange={(e) => setSection(si, { afterList: e.target.value })}
                  placeholder="Text shown below the bullet list…"
                />
              </Field>
            )}

            <div style={groupLabel}>Steps (numbered list)</div>
            {section.steps.map((st, sti) => (
              <div key={sti} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <Input
                  style={{ flex: 1 }}
                  value={st}
                  onChange={(e) => setSectionItem(si, 'steps', sti, e.target.value)}
                  placeholder={`Step ${sti + 1}`}
                />
                <Button
                  type="button"
                  variant="danger-ghost"
                  size="sm"
                  disabled={section.steps.length === 1}
                  onClick={() => removeSectionItem(si, 'steps', sti)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" style={rowBtnStyle} onClick={() => addSectionItem(si, 'steps')}>
              + Add step
            </Button>
          </div>
        ))}
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
      const updated = [];
      for (const s of seedServices) {
        const existing = services.find((item) => item.slug === s.slug);
        if (existing) {
          const patch = {};
          if (!existing.seoTitle && s.seoTitle) patch.seoTitle = s.seoTitle;
          if (!existing.h1 && s.h1) patch.h1 = s.h1;
          if (!existing.metaDescription && s.metaDescription) patch.metaDescription = s.metaDescription;
          if ((!existing.intro || !existing.intro.length) && s.intro?.length) patch.intro = s.intro;
          if ((!existing.sections || !existing.sections.length) && s.sections?.length) patch.sections = s.sections;
          if (!existing.primaryKeyword && s.primaryKeyword) patch.primaryKeyword = s.primaryKeyword;
          if ((!existing.semanticKeywords || !existing.semanticKeywords.length) && s.semanticKeywords?.length) patch.semanticKeywords = s.semanticKeywords;
          if ((!existing.related || !existing.related.length) && s.related?.length) patch.related = s.related;
          if (Object.keys(patch).length) {
            const formData = new FormData();
            Object.entries(patch).forEach(([k, v]) => formData.append(k, Array.isArray(v) ? JSON.stringify(v) : v));
            await updateService(existing._id, formData);
            updated.push(existing.name);
          }
          continue;
        }
        const service = await createService({
          slug: s.slug,
          image: '',
          name: s.name,
          seoTitle: s.seoTitle || '',
          shortDesc: s.shortDesc,
          features: s.features,
          h1: s.h1 || '',
          metaDescription: s.metaDescription || '',
          intro: s.intro || [],
          primaryKeyword: s.primaryKeyword || '',
          semanticKeywords: s.semanticKeywords || [],
          related: s.related || [],
          sections: s.sections || [],
        });
        created.push(service);
      }
      const msgs = [];
      if (created.length) msgs.push(`${created.length} imported`);
      if (updated.length) msgs.push(`${updated.length} updated with detail content`);
      toast.success(msgs.length ? msgs.join(', ') : 'All services up to date');
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