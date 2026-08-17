import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiEye,
  FiTrash2,
  FiRefreshCw,
  FiClipboard,
  FiDownload,
} from 'react-icons/fi';
import { getBookings, updateBookingStatus, deleteBooking } from '../../api/bookingApi';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../components/Toast';
import {
  Badge,
  BookingStatusBadge,
  Button,
  Checkbox,
  ConfirmDialog,
  Drawer,
  EmptyState,
  ErrorState,
  Field,
  Pagination,
  RowMenu,
  SearchBox,
  Select,
  TableSkeleton,
} from '../components/ui';
import { formatDateTime } from '../format';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAGE_SIZE = 12;

const BookingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const debouncedSearch = useDebounce(search, 350);

  const [selected, setSelected] = useState([]);
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const toast = useToast();

  useEffect(() => {
    if (status === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getBookings({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        status,
        sort: sortField,
        order: sortOrder,
      });
      setData(res);
      setSelected([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, status, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'name' ? 'asc' : 'desc');
    }
  };

  const handleStatusChange = async (booking, newStatus) => {
    if (booking.status === newStatus) return;
    setUpdatingId(booking._id);
    try {
      const updated = await updateBookingStatus(booking._id, newStatus);
      setData((prev) => ({
        ...prev,
        data: prev.data.map((b) => (b._id === updated._id ? updated : b)),
      }));
      setDetail((d) => (d && d._id === updated._id ? updated : d));
      toast.success(`Booking marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update booking', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkStatus = async (newStatus) => {
    try {
      await Promise.all(selected.map((id) => updateBookingStatus(id, newStatus)));
      toast.success(`${selected.length} bookings marked as ${newStatus}`);
      load();
    } catch (err) {
      toast.error('Failed to update bookings', err.message);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const ids = deleteTarget === 'bulk' ? selected : [deleteTarget._id];
      await Promise.all(ids.map((id) => deleteBooking(id)));
      toast.success(ids.length > 1 ? `${ids.length} bookings deleted` : 'Booking deleted');
      setDeleteTarget(null);
      if (detail && ids.includes(detail._id)) setDetail(null);
      if (page > 1 && ids.length === data?.data?.length) {
        setPage((p) => p - 1);
      } else {
        load();
      }
    } catch (err) {
      toast.error('Failed to delete booking', err.message);
      setDeleting(false);
    }
  };

  const allSelected = useMemo(
    () => !!data?.data?.length && data.data.every((b) => selected.includes(b._id)),
    [data, selected],
  );

  const toggleAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(data.data.map((b) => b._id));
  };

  const exportCsv = () => {
    if (!data?.data?.length) return;
    const rows = [
      ['Name', 'Phone', 'Email', 'Service', 'Vehicle', 'Location', 'Status', 'Message', 'Created'],
      ...data.data.map((b) => [
        b.name,
        b.phone,
        b.email || '',
        b.service || '',
        b.vehicleType || '',
        b.location || '',
        b.status,
        (b.message || '').replace(/[\n,]/g, ' '),
        new Date(b.createdAt).toISOString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="a-toolbar">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search name, phone, email, service, location…"
        />
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status">
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        <Button variant="ghost" icon={<FiRefreshCw />} onClick={load} disabled={loading} aria-label="Refresh">
          Refresh
        </Button>
        {data?.data?.length > 0 && (
          <Button variant="ghost" icon={<FiDownload />} onClick={exportCsv}>
            Export CSV
          </Button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="a-bulk-bar">
          {selected.length} selected
          <div className="a-bulk-actions">
            {['pending', 'in-progress', 'completed', 'cancelled'].map((s) => (
              <Button key={s} variant="secondary" size="sm" onClick={() => handleBulkStatus(s)}>
                Mark {s}
              </Button>
            ))}
            <Button variant="danger-ghost" size="sm" onClick={() => setDeleteTarget('bulk')}>
              <FiTrash2 /> Delete
            </Button>
          </div>
        </div>
      )}

      {loading && !data ? (
        <TableSkeleton rows={8} cols={6} />
      ) : error ? (
        <ErrorState text={error} onRetry={load} />
      ) : data?.data.length === 0 ? (
        <div className="a-card">
          <EmptyState
            title={debouncedSearch || status !== 'all' ? 'No bookings match your filters' : 'No bookings yet'}
            text={
              debouncedSearch || status !== 'all'
                ? 'Try adjusting the search or status filter.'
                : 'New tow requests submitted on the website will appear here.'
            }
            icon={<FiClipboard />}
          />
        </div>
      ) : (
        <>
          <div className="a-table-wrap" data-od-id="bookings-table">
            <table className="a-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <Checkbox checked={allSelected} onChange={toggleAll} aria-label="Select all bookings" />
                  </th>
                  <th className="sortable" onClick={() => handleSort('name')}>
                    Customer
                    {sortField === 'name' && <span className="sort-arrow">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th>Service</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th className="sortable" onClick={() => handleSort('createdAt')}>
                    Received
                    {sortField === 'createdAt' && <span className="sort-arrow">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((b) => (
                  <tr key={b._id} className={selected.includes(b._id) ? 'selected' : ''}>
                    <td>
                      <Checkbox
                        checked={selected.includes(b._id)}
                        onChange={() =>
                          setSelected((prev) =>
                            prev.includes(b._id) ? prev.filter((id) => id !== b._id) : [...prev, b._id],
                          )
                        }
                        aria-label={`Select booking from ${b.name}`}
                      />
                    </td>
                    <td>
                      <div className="a-cell-main">{b.name}</div>
                      <div className="a-cell-sub">{b.phone}</div>
                    </td>
                    <td>
                      {b.service ? (
                        <>
                          <div style={{ fontWeight: 600 }}>{b.service}</div>
                          {b.vehicleType && <div className="a-cell-sub">{b.vehicleType}</div>}
                        </>
                      ) : (
                        <span className="a-cell-sub">—</span>
                      )}
                    </td>
                    <td className="a-cell-sub">{b.location || '—'}</td>
                    <td>
                      {updatingId === b._id ? (
                        <Badge tone="gray">Updating…</Badge>
                      ) : (
                        <BookingStatusBadge status={b.status} />
                      )}
                    </td>
                    <td className="a-cell-sub">{formatDateTime(b.createdAt)}</td>
                    <td>
                      <div className="a-row-actions">
                        <RowMenu
                          items={[
                            {
                              label: 'View details',
                              icon: <FiEye />,
                              onClick: () => setDetail(b),
                            },
                            {
                              label: 'Delete',
                              icon: <FiTrash2 />,
                              danger: true,
                              onClick: () => setDeleteTarget(b),
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

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Booking — ${detail.name}` : ''}
        sub={detail ? `Received ${formatDateTime(detail.createdAt)}` : ''}
      >
        {detail && (
          <div>
            <div className="a-detail-row">
              <span className="a-detail-label">Status</span>
              <span>
                <Select
                  value={detail.status}
                  onChange={(e) => handleStatusChange(detail, e.target.value)}
                  style={{ width: 'auto', padding: '6px 10px', fontSize: 12.5 }}
                  disabled={updatingId === detail._id}
                  aria-label="Change booking status"
                >
                  {STATUS_OPTIONS.slice(1).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </span>
            </div>
            <div className="a-detail-row">
              <span className="a-detail-label">Phone</span>
              <span className="a-detail-value">
                <a href={`tel:${detail.phone}`} style={{ color: 'var(--a-info)' }}>{detail.phone}</a>
              </span>
            </div>
            {detail.email && (
              <div className="a-detail-row">
                <span className="a-detail-label">Email</span>
                <span className="a-detail-value">
                  <a href={`mailto:${detail.email}`} style={{ color: 'var(--a-info)' }}>{detail.email}</a>
                </span>
              </div>
            )}
            {detail.service && (
              <div className="a-detail-row">
                <span className="a-detail-label">Service</span>
                <span className="a-detail-value">{detail.service}</span>
              </div>
            )}
            {detail.vehicleType && (
              <div className="a-detail-row">
                <span className="a-detail-label">Vehicle type</span>
                <span className="a-detail-value">{detail.vehicleType}</span>
              </div>
            )}
            {detail.location && (
              <div className="a-detail-row">
                <span className="a-detail-label">Location</span>
                <span className="a-detail-value">{detail.location}</span>
              </div>
            )}
            <div className="a-detail-row">
              <span className="a-detail-label">Last updated</span>
              <span className="a-detail-value">{formatDateTime(detail.updatedAt)}</span>
            </div>

            {detail.message && (
              <Field label="Customer message" style={{ marginTop: 18 }}>
                <div className="a-message-box">{detail.message}</div>
              </Field>
            )}

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="danger-ghost" icon={<FiTrash2 />} onClick={() => setDeleteTarget(detail)}>
                Delete booking
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={deleteTarget === 'bulk' ? `Delete ${selected.length} bookings?` : 'Delete this booking?'}
        message={
          deleteTarget === 'bulk'
            ? 'The selected booking requests will be permanently removed. This cannot be undone.'
            : `The booking from ${deleteTarget?.name} will be permanently removed. This cannot be undone.`
        }
        confirmLabel={deleteTarget === 'bulk' ? 'Delete bookings' : 'Delete'}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default BookingsPage;