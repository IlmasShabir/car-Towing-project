import { useEffect, useState } from 'react';
import { FiRefreshCw, FiUsers, FiTrash2, FiUserPlus, FiKey, FiCheck, FiShield } from 'react-icons/fi';
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../../api/adminApi';
import { useAdminSession } from '../SessionContext';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../components/Toast';
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
  TableSkeleton,
} from '../components/ui';
import { formatDateTime } from '../format';

const PAGE_SIZE = 10;

const emptyForm = { username: '', email: '', name: '', password: '', role: 'admin', status: 'approved' };

const AdminFormModal = ({ open, onClose, editing, onSaved }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        username: editing.username,
        email: editing.email,
        name: editing.name || '',
        password: '',
        role: editing.role,
        status: editing.status,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.username.trim()) next.username = 'Username is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email';
    if (!editing && form.password.length < 6) next.password = 'Password must be at least 6 characters';
    if (editing && form.password && form.password.length < 6) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        name: form.name.trim(),
        role: form.role,
        status: form.status,
      };
      if (form.password) payload.password = form.password;

      if (editing) {
        await updateAdmin(editing.id, payload);
        toast.success('Admin account updated');
      } else {
        await createAdmin(payload);
        toast.success('Admin account created');
      }
      onSaved();
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
      title={editing ? 'Edit admin account' : 'Create admin account'}
      sub={
        editing
          ? `Managing ${editing.username}`
          : 'Give a trusted person access to the admin panel'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="admin-user-form" loading={saving}>
            <FiCheck /> {editing ? 'Save changes' : 'Create account'}
          </Button>
        </>
      }
    >
      <form id="admin-user-form" onSubmit={handleSubmit} noValidate>
        {errors.form && (
          <div className="a-badge a-badge-red" style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 8 }}>
            {errors.form}
          </div>
        )}

        <Field label="Username" required>
          <Input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="e.g. dispatcher"
            disabled={!!editing}
            invalid={!!errors.username}
          />
          {errors.username && <span className="a-input-error">{errors.username}</span>}
        </Field>

        <Field label="Full name">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Ahmed Khan"
          />
        </Field>

        <Field label="Email" required>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="name@example.com"
            invalid={!!errors.email}
          />
          {errors.email && <span className="a-input-error">{errors.email}</span>}
        </Field>

        <Field
          label={editing ? 'New password' : 'Password'}
          required={!editing}
          hint={editing ? 'Leave blank to keep the current password' : 'Minimum 6 characters'}
        >
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
            invalid={!!errors.password}
          />
          {errors.password && <span className="a-input-error">{errors.password}</span>}
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Role">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="superadmin">Owner (superadmin)</option>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </Select>
          </Field>
        </div>
      </form>
    </Modal>
  );
};

const AdminsPage = () => {
  const { user: currentUser } = useAdminSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const debouncedSearch = useDebounce(search, 350);
  const toast = useToast();

  const isSuper = currentUser?.role === 'superadmin';

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdmins({ page, limit: PAGE_SIZE, search: debouncedSearch });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  const handleStatusToggle = async (admin, status) => {
    try {
      await updateAdmin(admin.id, { status });
      toast.success(`Account ${status === 'approved' ? 'approved' : 'marked as ' + status}`);
      load();
    } catch (err) {
      toast.error('Failed to update account', err.message);
    }
  };

  const handleRoleToggle = async (admin, role) => {
    try {
      await updateAdmin(admin.id, { role });
      toast.success(`Role updated to ${role}`);
      load();
    } catch (err) {
      toast.error('Failed to update role', err.message);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAdmin(deleteTarget.id);
      toast.success('Admin account deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error('Failed to delete account', err.message);
      setDeleting(false);
    }
  };

  const handleResetPassword = async () => {
    if (resetPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResetting(true);
    try {
      await updateAdmin(resetTarget.id, { password: resetPassword });
      toast.success('Password updated');
      setResetTarget(null);
      setResetPassword('');
    } catch (err) {
      toast.error('Failed to reset password', err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div>
      {!isSuper && (
        <div className="a-badge a-badge-blue" style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10 }}>
          <FiShield style={{ marginRight: 6 }} />
          You have read-only access to admin accounts. Only the owner (superadmin) can create, edit or delete accounts.
        </div>
      )}

      <div className="a-toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search by username, name or email…" />
        <Button variant="ghost" icon={<FiRefreshCw />} onClick={load} disabled={loading} aria-label="Refresh">
          Refresh
        </Button>
        <div className="a-toolbar-spacer" />
        {isSuper && (
          <Button icon={<FiUserPlus />} onClick={() => { setEditing(null); setModalOpen(true); }}>
            Add admin
          </Button>
        )}
      </div>

      {loading && !data ? (
        <TableSkeleton rows={8} cols={5} />
      ) : error ? (
        <ErrorState text={error} onRetry={load} />
      ) : data?.data.length === 0 ? (
        <div className="a-card">
          <EmptyState
            title="No admin accounts found"
            text="Admin accounts let trusted people sign in to this panel."
            icon={<FiUsers />}
          />
        </div>
      ) : (
        <>
          <div className="a-table-wrap" data-od-id="admins-table">
            <table className="a-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last login</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((admin) => (
                  <tr key={admin.id} className={admin.id === currentUser?.id ? 'selected' : ''}>
                    <td>
                      <div className="a-cell-main">
                        {admin.name || admin.username}
                        {admin.id === currentUser?.id && <Badge tone="accent" style={{ marginLeft: 8 }}>You</Badge>}
                      </div>
                      <div className="a-cell-sub">{admin.username} · {admin.email}</div>
                    </td>
                    <td>
                      {admin.role === 'superadmin' ? (
                        <Badge tone="accent">Owner</Badge>
                      ) : (
                        <Badge tone="gray">Admin</Badge>
                      )}
                    </td>
                    <td>
                      {admin.status === 'approved' ? (
                        <Badge tone="green" dot>Approved</Badge>
                      ) : admin.status === 'pending' ? (
                        <Badge tone="amber" dot>Pending</Badge>
                      ) : (
                        <Badge tone="red" dot>Rejected</Badge>
                      )}
                    </td>
                    <td className="a-cell-sub">{admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : 'Never'}</td>
                    <td>
                      {isSuper ? (
                        <div className="a-row-actions">
                          <RowMenu
                            items={[
                              {
                                label: 'Edit account',
                                icon: <FiUsers />,
                                onClick: () => { setEditing(admin); setModalOpen(true); },
                              },
                              ...(admin.status !== 'approved'
                                ? [{ label: 'Approve account', icon: <FiCheck />, onClick: () => handleStatusToggle(admin, 'approved') }]
                                : [{ label: 'Reject account', icon: <FiUsers />, danger: true, onClick: () => handleStatusToggle(admin, 'rejected') }]),
                              {
                                label: 'Reset password',
                                icon: <FiKey />,
                                onClick: () => { setResetTarget(admin); setResetPassword(''); },
                              },
                              {
                                label: admin.role === 'superadmin' ? 'Make admin' : 'Make owner',
                                icon: <FiShield />,
                                onClick: () => handleRoleToggle(admin, admin.role === 'superadmin' ? 'admin' : 'superadmin'),
                              },
                              ...(admin.id !== currentUser?.id
                                ? [{ label: 'Delete account', icon: <FiTrash2 />, danger: true, onClick: () => setDeleteTarget(admin) }]
                                : []),
                            ]}
                          />
                        </div>
                      ) : (
                        <span className="a-cell-sub">—</span>
                      )}
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

      {isSuper && (
        <AdminFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          editing={editing}
          onSaved={load}
        />
      )}

      <Modal
        open={!!resetTarget}
        onClose={() => setResetTarget(null)}
        title={`Reset password — ${resetTarget?.username}`}
        sub="The account holder will need the new password to sign in."
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetTarget(null)} disabled={resetting}>Cancel</Button>
            <Button onClick={handleResetPassword} loading={resetting}>
              <FiKey /> Reset password
            </Button>
          </>
        }
      >
        <Field label="New password" required hint="Minimum 6 characters">
          <Input
            type="text"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            placeholder="Enter a new password"
          />
        </Field>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name || deleteTarget?.username}?`}
        message="This account will lose access to the admin panel immediately. This cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminsPage;