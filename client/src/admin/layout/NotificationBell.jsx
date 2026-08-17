import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiCheckSquare,
  FiClipboard,
  FiStar,
  FiTool,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import { getNotifications } from '../../api/notificationApi';
import { useNotifications } from '../NotificationsContext';
import { useToast } from '../components/Toast';
import { EmptyState, Spinner } from '../components/ui';
import { timeAgo } from '../format';

const TYPE_META = {
  booking: { icon: FiClipboard, tone: 'tone-blue' },
  review: { icon: FiStar, tone: 'tone-orange' },
  service: { icon: FiTool, tone: 'tone-violet' },
  admin: { icon: FiUsers, tone: 'tone-green' },
  system: { icon: FiZap, tone: 'tone-accent' },
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();
  const { unreadCount, markRead, markAllRead } = useNotifications();
  const toast = useToast();

  useEffect(() => {
    if (!open) return undefined;
    let mounted = true;
    setLoading(true);
    getNotifications({ limit: 6 })
      .then((res) => {
        if (mounted) setItems(res.data);
      })
      .catch(() => {
        if (mounted) toast.error('Failed to load notifications');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  const handleItemClick = async (item) => {
    if (!item.read) {
      try {
        await markRead(item._id);
      } catch {
        // Non-critical failure
      }
    }
    setOpen(false);
    if (item.actionUrl) navigate(item.actionUrl);
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Could not mark notifications as read');
    }
  };

  return (
    <div className="a-icon-menu-wrap" ref={wrapRef} data-od-id="notification-bell">
      <button
        className="a-icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
      >
        <FiBell />
        {unreadCount > 0 && <span className="a-bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="a-popover">
          <div className="a-popover-header">
            <strong>Notifications</strong>
            <button className="a-link-btn" onClick={handleMarkAll}>
              <FiCheckSquare style={{ marginRight: 4, verticalAlign: -2 }} />
              Mark all read
            </button>
          </div>

          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <EmptyState
              title="You're all caught up"
              text="New bookings and reviews will show up here."
              icon={<FiBell />}
            />
          ) : (
            <div className="a-notif-list">
              {items.map((item) => {
                const meta = TYPE_META[item.type] || TYPE_META.system;
                const Icon = meta.icon;
                return (
                  <button
                    key={item._id}
                    className={`a-notif-item${item.read ? '' : ' unread'}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <span className={`a-notif-icon ${meta.tone}`}><Icon /></span>
                    <div className="a-notif-body">
                      <div className="a-notif-title">{item.title}</div>
                      {item.message && <div className="a-notif-msg">{item.message}</div>}
                      <div className="a-notif-meta">
                        <span className="a-notif-time">{timeAgo(item.createdAt)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--a-border)', textAlign: 'center' }}>
            <button className="a-link-btn" onClick={() => { setOpen(false); navigate('/admin/notifications'); }}>
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;