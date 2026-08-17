import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiClipboard,
  FiStar,
  FiTool,
  FiUsers,
  FiZap,
  FiCheckSquare,
  FiTrash2,
  FiRefreshCw,
  FiCheck,
} from 'react-icons/fi';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteNotifications,
} from '../../api/notificationApi';
import { useDebounce } from '../hooks/useDebounce';
import { useNotifications } from '../NotificationsContext';
import { useToast } from '../components/Toast';
import {
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Pagination,
  PriorityBadge,
  RowMenu,
  SearchBox,
  Select,
  TableSkeleton,
} from '../components/ui';
import { timeAgo, formatDateTime } from '../format';

const PAGE_SIZE = 15;

const TYPE_META = {
  booking: { icon: FiClipboard, label: 'Booking', tone: 'tone-blue' },
  review: { icon: FiStar, label: 'Review', tone: 'tone-orange' },
  service: { icon: FiTool, label: 'Service', tone: 'tone-violet' },
  admin: { icon: FiUsers, label: 'Admin', tone: 'tone-green' },
  system: { icon: FiZap, label: 'System', tone: 'tone-accent' },
};

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'booking', label: 'Booking' },
  { value: 'review', label: 'Review' },
  { value: 'service', label: 'Service' },
  { value: 'admin', label: 'Admin' },
  { value: 'system', label: 'System' },
];

const TYPE_BADGE_TONE = {
  booking: 'blue',
  review: 'amber',
  service: 'gray',
  admin: 'green',
  system: 'accent',
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actingId, setActingId] = useState(null);
  const debouncedSearch = useDebounce(search, 350);
  const { setUnreadCount, refreshUnread } = useNotifications();
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getNotifications({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        read: readFilter === 'all' ? undefined : readFilter === 'unread' ? 'false' : 'true',
        type: typeFilter,
      });
      setData(res);
      setUnreadCount(res.unread);
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
  }, [page, debouncedSearch, readFilter, typeFilter]);

  const allSelected = useMemo(
    () => !!data?.data?.length && data.data.every((n) => selected.includes(n._id)),
    [data, selected],
  );

  const toggleAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(data.data.map((n) => n._id));
  };

  const handleMarkRead = async (item) => {
    if (item.read) return;
    setActingId(item._id);
    try {
      await markNotificationRead(item._id);
      setData((prev) => ({
        ...prev,
        data: prev.data.map((n) => (n._id === item._id ? { ...n, read: true } : n)),
      }));
      refreshUnread();
    } catch (err) {
      toast.error('Failed to mark as read', err.message);
    } finally {
      setActingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setData((prev) => ({
        ...prev,
        data: prev.data.map((n) => ({ ...n, read: true })),
        unread: 0,
      }));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read', err.message);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (deleteTarget === 'bulk') {
        await deleteNotifications(selected);
        toast.success(`${selected.length} notifications deleted`);
      } else {
        await deleteNotification(deleteTarget._id);
        toast.success('Notification deleted');
      }
      setDeleteTarget(null);
      refreshUnread();
      if (page > 1 && (deleteTarget === 'bulk' ? selected.length : 1) >= (data?.data?.length || 0)) {
        setPage((p) => p - 1);
      } else {
        load();
      }
    } catch (err) {
      toast.error('Failed to delete notifications', err.message);
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="a-toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search notifications…" />
        <Select
          value={readFilter}
          onChange={(e) => { setReadFilter(e.target.value); setPage(1); }}
          aria-label="Filter by read state"
        >
          <option value="all">All notifications</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </Select>
        <Select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          aria-label="Filter by type"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        <Button variant="ghost" icon={<FiRefreshCw />} onClick={load} disabled={loading} aria-label="Refresh">
          Refresh
        </Button>
        <div className="a-toolbar-spacer" />
        <Button variant="secondary" icon={<FiCheckSquare />} onClick={handleMarkAllRead} disabled={!data?.unread}>
          Mark all read
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="a-bulk-bar">
          {selected.length} selected
          <div className="a-bulk-actions">
            <Button variant="danger-ghost" size="sm" onClick={() => setDeleteTarget('bulk')}>
              <FiTrash2 /> Delete selected
            </Button>
          </div>
        </div>
      )}

      {loading && !data ? (
        <TableSkeleton rows={10} cols={5} />
      ) : error ? (
        <ErrorState text={error} onRetry={load} />
      ) : data?.data.length === 0 ? (
        <div className="a-card">
          <EmptyState
            title="No notifications"
            text="New booking requests, reviews and system events will appear here."
            icon={<FiBell />}
          />
        </div>
      ) : (
        <>
          <div className="a-table-wrap" data-od-id="notifications-table">
            <table className="a-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <Checkbox checked={allSelected} onChange={toggleAll} aria-label="Select all notifications" />
                  </th>
                  <th>Notification</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Received</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((item) => {
                  const meta = TYPE_META[item.type] || TYPE_META.system;
                  const Icon = meta.icon;
                  return (
                    <tr key={item._id} className={`${selected.includes(item._id) ? 'selected' : ''}${!item.read ? ' a-row-unread' : ''}`}>
                      <td>
                        <Checkbox
                          checked={selected.includes(item._id)}
                          onChange={() =>
                            setSelected((prev) =>
                              prev.includes(item._id) ? prev.filter((id) => id !== item._id) : [...prev, item._id],
                            )
                          }
                          aria-label="Select notification"
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                          <span className={`a-notif-icon ${meta.tone}`}><Icon /></span>
                          <div style={{ minWidth: 0 }}>
                            <div className="a-cell-main">
                              {item.title}
                              {!item.read && <Badge tone="accent" style={{ marginLeft: 8, padding: '1px 7px', fontSize: 10 }}>New</Badge>}
                            </div>
                            {item.message && (
                              <div className="a-cell-sub" title={item.message} style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 480 }}>
                                {item.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge tone={TYPE_BADGE_TONE[item.type] || 'gray'}>
                          {meta.label}
                        </Badge>
                      </td>
                      <td><PriorityBadge priority={item.priority} /></td>
                      <td className="a-cell-sub" title={formatDateTime(item.createdAt)}>
                        {timeAgo(item.createdAt)}
                      </td>
                      <td>
                        <div className="a-row-actions">
                          <RowMenu
                            items={[
                              ...(!item.read
                                ? [{ label: 'Mark as read', icon: <FiCheck />, onClick: () => handleMarkRead(item) }]
                                : []),
                              ...(item.actionUrl
                                ? [{ label: 'Open related page', icon: <FiBell />, onClick: () => navigate(item.actionUrl) }]
                                : []),
                              { label: 'Delete', icon: <FiTrash2 />, danger: true, onClick: () => setDeleteTarget(item) },
                            ]}
                          />
                          {actingId === item._id && <span className="a-spinner" style={{ width: 13, height: 13 }} />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={deleteTarget === 'bulk' ? `Delete ${selected.length} notifications?` : 'Delete this notification?'}
        message="This cannot be undone."
        confirmLabel={deleteTarget === 'bulk' ? 'Delete notifications' : 'Delete'}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default NotificationsPage;