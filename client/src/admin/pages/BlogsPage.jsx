import { useEffect, useRef, useState } from 'react';
import {
  FiFileText, FiPlus, FiRefreshCw, FiTrash2, FiEdit2,
  FiImage, FiUpload, FiGlobe, FiClock,
} from 'react-icons/fi';
import {
  getAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  updateBlogStatus,
} from '../../api/blogApi';
import { useToast } from '../components/Toast';
import RichTextEditor from '../components/RichTextEditor';
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Modal,
  Pagination,
  RowMenu,
  SearchBox,
  Select,
  Skeleton,
  Textarea,
} from '../components/ui';
import { formatDate } from '../format';

const PAGE_SIZE = 10;

const slugify = (str) =>
  String(str || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

const emptyForm = {
  title: '',
  slug: '',
  category: '',
  author: 'Usama Car Towing',
  excerpt: '',
  content: '',
  featuredImage: '',
  status: 'draft',
  publishDate: '',
  metaTitle: '',
  metaDescription: '',
  focusKeyword: '',
  seoKeywords: '',
  canonicalUrl: '',
};

const BlogFormModal = ({ open, onClose, editing, onSaved, categories }) => {
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const actionRef = useRef('publish');
  const fileRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const dateStr = editing.publishedAt
        ? new Date(editing.publishedAt).toISOString().slice(0, 10)
        : '';
      setForm({
        title: editing.title || '',
        slug: editing.slug || '',
        category: editing.category || '',
        author: editing.author || 'Usama Car Towing',
        excerpt: editing.excerpt || '',
        content: editing.content || '',
        featuredImage: editing.featuredImage || '',
        status: editing.status || 'draft',
        publishDate: dateStr,
        metaTitle: editing.metaTitle || '',
        metaDescription: editing.metaDescription || '',
        focusKeyword: editing.focusKeyword || '',
        seoKeywords: (editing.seoKeywords || []).join(', '),
        canonicalUrl: editing.canonicalUrl || '',
      });
      setImagePreview(editing.featuredImage || '');
      setSlugEdited(true);
    } else {
      setForm(emptyForm);
      setImagePreview('');
      setSlugEdited(false);
    }
    setImageFile(null);
    setErrors({});
    setSaving(false);
    actionRef.current = 'publish';
  }, [open, editing]);

  const setField = (key, value) => setForm((f) => {
    const next = { ...f, [key]: value };
    if (key === 'title' && !slugEdited) {
      next.slug = slugify(value);
    }
    return next;
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.slug.trim()) next.slug = 'Slug is required';
    else if (!/^[a-z0-9-]+$/.test(form.slug.trim())) next.slug = 'Use lowercase letters, numbers and dashes only';
    if (!form.category.trim()) next.category = 'Category is required';
    if (!form.excerpt.trim()) next.excerpt = 'Excerpt is required';
    if (!form.content || !form.content.trim() || form.content === '<p><br></p>') next.content = 'Content is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetStatus = actionRef.current === 'publish' ? 'published' : 'draft';
    if (!validate()) return;
    setSaving(true);

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('slug', form.slug.trim().toLowerCase().replace(/\s+/g, '-'));
    formData.append('category', form.category.trim());
    formData.append('author', form.author.trim() || 'Usama Car Towing');
    formData.append('excerpt', form.excerpt.trim());
    formData.append('content', form.content);
    formData.append('status', targetStatus);
    if (form.publishDate) formData.append('publishDate', form.publishDate);
    if (form.metaTitle.trim()) formData.append('metaTitle', form.metaTitle.trim());
    if (form.metaDescription.trim()) formData.append('metaDescription', form.metaDescription.trim());
    if (form.focusKeyword.trim()) formData.append('focusKeyword', form.focusKeyword.trim());
    if (form.seoKeywords.trim()) formData.append('seoKeywords', form.seoKeywords.trim());
    if (form.canonicalUrl.trim()) formData.append('canonicalUrl', form.canonicalUrl.trim());
    if (imageFile) formData.append('featuredImage', imageFile);

    try {
      const saved = editing
        ? await updateBlog(editing._id, formData)
        : await createBlog(formData);
      if (targetStatus === 'published') {
        toast.success(editing ? 'Blog updated & published' : 'Blog created & published');
      } else {
        toast.success('Blog saved as draft');
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      setErrors({ form: err.message });
      toast.error('Failed to save blog', err.message);
      setSaving(false);
    }
    actionRef.current = 'publish';
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit blog post' : 'Add blog post'}
      sub={editing ? `Editing "${editing.title}"` : 'Create a new article for your website'}
      className="blog-form-modal"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            variant="secondary"
            form="blog-form"
            type="submit"
            loading={saving}
            onClick={() => { actionRef.current = 'draft'; }}
          >
            Save Draft
          </Button>
          <Button
            type="submit"
            form="blog-form"
            loading={saving}
            onClick={() => { actionRef.current = 'publish'; }}
          >
            {editing && editing.status === 'published' ? 'Update & Publish' : 'Publish'}
          </Button>
        </>
      }
    >
      <form id="blog-form" onSubmit={handleSubmit} noValidate>
        {errors.form && (
          <div className="a-badge a-badge-red" style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 8 }}>
            {errors.form}
          </div>
        )}

        <Field label="Featured image" hint="JPEG, PNG, WebP up to 5MB.">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {imagePreview ? (
              <div style={{ position: 'relative', width: 140, height: 90 }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                <button
                  type="button"
                  onClick={() => { setImagePreview(''); setImageFile(null); setField('featuredImage', ''); }}
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

        <Field label="Title" required>
          <Input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="How Much Does Car Towing Cost in Dubai?" invalid={!!errors.title} />
          {errors.title && <span className="a-input-error">{errors.title}</span>}
        </Field>

        <Field label="Slug" required hint="Used in the blog URL, e.g. how-much-does-car-towing-cost-in-dubai">
          <Input
            value={form.slug}
            onChange={(e) => { setSlugEdited(true); setField('slug', e.target.value); }}
            placeholder="how-much-does-car-towing-cost-in-dubai"
            invalid={!!errors.slug}
          />
          {errors.slug && <span className="a-input-error">{errors.slug}</span>}
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Category" required hint="e.g. Towing Tips, Roadside Assistance">
            <Input value={form.category} onChange={(e) => setField('category', e.target.value)} placeholder="Towing Tips" invalid={!!errors.category} list="blog-categories" />
            <datalist id="blog-categories">
              {categories?.map((c) => <option key={c} value={c} />)}
            </datalist>
            {errors.category && <span className="a-input-error">{errors.category}</span>}
          </Field>
          <Field label="Author" hint="Defaults to 'Usama Car Towing'">
            <Input value={form.author} onChange={(e) => setField('author', e.target.value)} placeholder="Usama Car Towing" />
          </Field>
        </div>

        <Field label="Excerpt" required hint="Short summary shown on blog cards (1–3 sentences)">
          <Textarea rows={2} value={form.excerpt} onChange={(e) => setField('excerpt', e.target.value)} placeholder="A brief overview of this article…" invalid={!!errors.excerpt} />
          {errors.excerpt && <span className="a-input-error">{errors.excerpt}</span>}
        </Field>

        <div style={{ height: 2, background: 'var(--a-border)', margin: '22px 0' }} />

        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Article Content</div>
        <p style={{ fontSize: 12.5, color: 'var(--a-faint)', marginBottom: 10 }}>
          Use the editor to create a complete article with headings, paragraphs, lists, images, links, tables and blockquotes.
        </p>

        <div style={{ border: errors.content ? '2px solid var(--a-danger)' : 'none', borderRadius: 'var(--a-radius)', padding: errors.content ? 2 : 0 }}>
          <RichTextEditor
            value={form.content}
            onChange={(val) => setField('content', val)}
            placeholder="Write your article here…"
          />
          {errors.content && <span className="a-input-error" style={{ display: 'block', paddingLeft: 2 }}>{errors.content}</span>}
        </div>

        <div style={{ height: 2, background: 'var(--a-border)', margin: '22px 0' }} />

        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>SEO Information</div>
        <p style={{ fontSize: 12.5, color: 'var(--a-faint)', marginBottom: 12 }}>
          Helps search engines understand and index your article. All fields are optional.
        </p>

        <Field label="Meta title" hint="Recommended: 50–60 characters. Browser tab and Google search title.">
          <Input value={form.metaTitle} onChange={(e) => setField('metaTitle', e.target.value)} placeholder="Car Towing Cost in Dubai 2025 | Usama Car Towing" />
        </Field>

        <Field label="Meta description" hint="Recommended: 140–160 characters. Shown under the title in Google results.">
          <Textarea rows={2} value={form.metaDescription} onChange={(e) => setField('metaDescription', e.target.value)} placeholder="Find out how much car towing costs in Dubai…" />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Focus keyword" hint="Primary keyword for this article.">
            <Input value={form.focusKeyword} onChange={(e) => setField('focusKeyword', e.target.value)} placeholder="car towing cost Dubai" />
          </Field>
          <Field label="SEO keywords" hint="Comma separated secondary keywords.">
            <Input value={form.seoKeywords} onChange={(e) => setField('seoKeywords', e.target.value)} placeholder="tow truck price, emergency towing Dubai" />
          </Field>
        </div>

        <Field label="Canonical URL" hint="Optional. Use only if this article was published elsewhere and should point to a different canonical.">
          <Input value={form.canonicalUrl} onChange={(e) => setField('canonicalUrl', e.target.value)} placeholder="https://cartowingservicedubai.com/blog/…" />
        </Field>

        <div style={{ height: 2, background: 'var(--a-border)', margin: '22px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Status" hint="Saving as draft hides the article from the public.">
            <select
              className="a-select"
              value={form.status}
              onChange={(e) => setField('status', e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <Field label="Publish date" hint="Used when published. Default: today.">
            <input
              type="date"
              className="a-input"
              value={form.publishDate}
              onChange={(e) => setField('publishDate', e.target.value)}
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
};

const BlogsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminBlogs({ page, limit: PAGE_SIZE, status: statusFilter, search });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search.
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 320);
    return () => window.clearTimeout(t);
  }, [search]);
  useEffect(() => { setPage(1); load(); }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBlog(deleteTarget._id);
      toast.success('Blog deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error('Failed to delete blog', err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (blog) => {
    try {
      const nextStatus = blog.status === 'published' ? 'draft' : 'published';
      await updateBlogStatus(blog._id, nextStatus);
      toast.success(nextStatus === 'published' ? 'Blog published' : 'Blog moved to draft');
      load();
    } catch (err) {
      toast.error('Failed to update status', err.message);
    }
  };

  const categories = data?.categories || [];

  return (
    <div>
      <div className="a-toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search title, category, author…" />
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
        <Button variant="ghost" icon={<FiRefreshCw />} onClick={load} disabled={loading} aria-label="Refresh">
          Refresh
        </Button>
        <div className="a-toolbar-spacer" />
        <Button icon={<FiPlus />} onClick={() => { setEditing(null); setModalOpen(true); }}>
          Add blog
        </Button>
      </div>

      {loading && !data ? (
        <div className="a-card">
          <div className="a-table-wrap">
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--a-border)' }}>
              <Skeleton style={{ width: '30%', height: 12 }} />
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="a-skel-row" key={i} style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px' }}>
                {[1, 2, 3, 4, 5, 6].map((j) => <Skeleton key={j} style={{ width: j === 1 ? '70%' : '85%' }} />)}
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="a-card">
          <ErrorState text={error} onRetry={load} />
        </div>
      ) : data?.data.length === 0 ? (
        <div className="a-card">
          <EmptyState
            title={search || statusFilter !== 'all' ? 'No blog posts match your filters' : 'No blog posts yet'}
            text={
              search || statusFilter !== 'all'
                ? 'Try adjusting the search or status filter.'
                : 'Blog posts are shown on the public website once published. Create your first article.'
            }
            icon={<FiFileText />}
            action={
              !search && statusFilter === 'all' && (
                <Button variant="secondary" onClick={() => { setEditing(null); setModalOpen(true); }}>Add your first blog</Button>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="a-table-wrap" data-od-id="blogs-table">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Author</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((blog) => (
                  <tr key={blog._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {blog.featuredImage ? (
                          <img
                            src={blog.featuredImage}
                            alt=""
                            style={{ width: 56, height: 38, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                            loading="lazy"
                          />
                        ) : (
                          <span className="a-notif-icon tone-violet" style={{ width: 56, height: 38, flexShrink: 0, display: 'flex' }}>
                            <FiImage size={14} />
                          </span>
                        )}
                        <div>
                          <div className="a-cell-main" style={{ maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {blog.title}
                          </div>
                          <div className="a-cell-sub" style={{ maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            /blog/{blog.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge tone="gray">{blog.category}</Badge>
                    </td>
                    <td>
                      {blog.status === 'published' ? (
                        <Badge tone="green" dot>Published</Badge>
                      ) : (
                        <Badge tone="amber" dot>Draft</Badge>
                      )}
                    </td>
                    <td className="a-cell-sub" style={{ whiteSpace: 'nowrap' }}>
                      {blog.status === 'published'
                        ? <><FiClock size={13} style={{ marginRight: 4, opacity: 0.6, verticalAlign: '-2px' }} />{formatDate(blog.publishedAt)}</>
                        : <><FiEdit2 size={13} style={{ marginRight: 4, opacity: 0.6, verticalAlign: '-2px' }} />{formatDate(blog.createdAt)}</>
                      }
                    </td>
                    <td className="a-cell-sub" style={{ whiteSpace: 'nowrap' }}>{blog.author}</td>
                    <td>
                      <div className="a-row-actions">
                        <RowMenu
                          items={[
                            {
                              label: blog.status === 'published' ? 'Unpublish (move to draft)' : 'Publish',
                              icon: blog.status === 'published' ? <FiClock /> : <FiGlobe />,
                              onClick: () => handleTogglePublish(blog),
                            },
                            {
                              label: 'Edit',
                              icon: <FiEdit2 />,
                              onClick: () => { setEditing(blog); setModalOpen(true); },
                            },
                            {
                              label: 'Delete',
                              icon: <FiTrash2 />,
                              danger: true,
                              onClick: () => setDeleteTarget(blog),
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={data.page}
            pages={data.pages}
            total={data.total}
            onChange={setPage}
            pageSizeLabel={`Showing ${(data.page - 1) * PAGE_SIZE + 1}–${Math.min(data.page * PAGE_SIZE, data.total)}`}
          />
        </>
      )}

      <BlogFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        categories={categories}
        onSaved={() => load()}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.title}"?`}
        message="This blog post will be permanently removed. This cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default BlogsPage;