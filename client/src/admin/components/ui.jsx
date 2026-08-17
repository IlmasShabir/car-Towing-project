import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
  FiInbox,
  FiX,
} from 'react-icons/fi';

/* ---------------------------------------------------------------
   Card
   --------------------------------------------------------------- */

export const Card = ({ className = '', children, ...rest }) => (
  <div className={`a-card ${className}`} {...rest}>
    {children}
  </div>
);

export const CardHead = ({ title, sub, action }) => (
  <div className="a-card-head">
    <div>
      <div className="a-card-title">{title}</div>
      {sub && <div className="a-card-sub">{sub}</div>}
    </div>
    {action}
  </div>
);

export const CardBody = ({ flush = false, className = '', children }) => (
  <div className={`a-card-body${flush ? ' flush' : ''} ${className}`}>{children}</div>
);

/* ---------------------------------------------------------------
   Button
   --------------------------------------------------------------- */

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}) => (
  <button
    type="button"
    className={`a-btn a-btn-${variant} ${size !== 'md' ? `a-btn-${size}` : ''} ${className}`}
    disabled={disabled || loading}
    {...rest}
  >
    {loading ? <span className="a-spinner" style={{ width: 14, height: 14 }} /> : icon}
    {children}
  </button>
);

export const IconButton = ({ className = '', children, label, ...rest }) => (
  <button className={`a-icon-btn ${className}`} aria-label={label} title={label} {...rest}>
    {children}
  </button>
);

/* ---------------------------------------------------------------
   Badge
   --------------------------------------------------------------- */

export const Badge = ({ tone = 'gray', dot = false, children }) => (
  <span className={`a-badge a-badge-${tone}`}>
    {dot && <span className="dot" />}
    {children}
  </span>
);

export const BookingStatusBadge = ({ status }) => {
  const map = {
    pending: { tone: 'amber', label: 'Pending' },
    'in-progress': { tone: 'blue', label: 'In Progress' },
    completed: { tone: 'green', label: 'Completed' },
    cancelled: { tone: 'red', label: 'Cancelled' },
  };
  const item = map[status] || { tone: 'gray', label: status };
  return <Badge tone={item.tone} dot>{item.label}</Badge>;
};

export const PriorityBadge = ({ priority }) => {
  const map = {
    high: { tone: 'red', label: 'High' },
    medium: { tone: 'amber', label: 'Medium' },
    low: { tone: 'gray', label: 'Low' },
  };
  const item = map[priority] || { tone: 'gray', label: priority };
  return <Badge tone={item.tone}>{item.label}</Badge>;
};

/* ---------------------------------------------------------------
   Forms
   --------------------------------------------------------------- */

export const Field = ({ label, required, hint, error, children, className = '' }) => (
  <div className={`a-field ${className}`}>
    {label && (
      <label className="a-label">
        {label}
        {required && <span className="req"> *</span>}
      </label>
    )}
    {children}
    {hint && <span className="a-hint">{hint}</span>}
    {error && <span className="a-input-error">{error}</span>}
  </div>
);

export const Input = ({ invalid, className = '', ...rest }) => (
  <input className={`a-input ${invalid ? 'invalid' : ''} ${className}`} {...rest} />
);

export const Select = ({ className = '', children, ...rest }) => (
  <select className={`a-select ${className}`} {...rest}>
    {children}
  </select>
);

export const Textarea = ({ className = '', ...rest }) => (
  <textarea className={`a-textarea ${className}`} {...rest} />
);

export const SearchBox = ({ value, onChange, placeholder = 'Search...', className = '', ...rest }) => (
  <div className={`a-search-box ${className}`} {...rest}>
    <span className="a-search-icon">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
    </span>
    <input
      className="a-input"
      type="search"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <button className="a-search-clear" onClick={() => onChange('')} aria-label="Clear search">
        <FiX />
      </button>
    )}
  </div>
);

export const Checkbox = ({ className = '', ...rest }) => (
  <input type="checkbox" className={`a-checkbox ${className}`} {...rest} />
);

/* ---------------------------------------------------------------
   Modal / Drawer
   --------------------------------------------------------------- */

const useEscape = (onClose) => {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
};

export const Modal = ({ open, onClose, title, sub, children, footer, wide = false }) => {
  useEscape(onClose);

  if (!open) return null;

  return createPortal(
    <div className="a-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`a-modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} data-od-id="admin-modal">
        {(title || sub) && (
          <div className="a-modal-head">
            <div>
              <div className="a-modal-title">{title}</div>
              {sub && <div className="a-modal-sub">{sub}</div>}
            </div>
            <button className="a-modal-close" onClick={onClose} aria-label="Close dialog">
              <FiX />
            </button>
          </div>
        )}
        <div className="a-modal-body">{children}</div>
        {footer && <div className="a-modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};

export const Drawer = ({ open, onClose, title, sub, children }) => {
  useEscape(onClose);

  if (!open) return null;

  return createPortal(
    <>
      <div className="a-drawer-overlay" onClick={onClose} />
      <div className="a-drawer" role="dialog" aria-modal="true" aria-label={title} data-od-id="detail-drawer">
        <div className="a-drawer-head">
          <div>
            <div className="a-modal-title">{title}</div>
            {sub && <div className="a-modal-sub">{sub}</div>}
          </div>
          <button className="a-modal-close" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>
        <div className="a-drawer-body">{children}</div>
      </div>
    </>,
    document.body,
  );
};

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  tone = 'danger',
  onConfirm,
  onClose,
}) => {
  useEscape(onClose);

  if (!open) return null;

  return createPortal(
    <div className="a-overlay" onMouseDown={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="a-modal" style={{ maxWidth: 420 }} role="alertdialog" aria-modal="true" data-od-id="confirm-dialog">
        <div className="a-modal-body" style={{ paddingTop: 24 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <span
              className="a-stat-icon"
              style={
                tone === 'danger'
                  ? { background: 'var(--a-danger-soft)', color: 'var(--a-danger)' }
                  : { background: 'var(--a-accent-soft)', color: '#b07f00' }
              }
            >
              <FiAlertTriangle size={20} />
            </span>
            <div>
              <div className="a-modal-title" style={{ fontSize: 15.5 }}>{title}</div>
              {message && (
                <div className="a-modal-sub" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.55 }}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="a-modal-foot">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

/* ---------------------------------------------------------------
   States
   --------------------------------------------------------------- */

export const Spinner = ({ large = false }) => (
  <div className="a-loading-center">
    <span className={`a-spinner${large ? ' lg' : ''}`} />
  </div>
);

export const EmptyState = ({ title = 'Nothing here yet', text, action, icon }) => (
  <div className="a-state-box">
    <span className="a-state-icon">{icon || <FiInbox />}</span>
    <div className="a-state-title">{title}</div>
    {text && <div className="a-state-text">{text}</div>}
    {action && <div className="a-state-action">{action}</div>}
  </div>
);

export const ErrorState = ({ title = 'Something went wrong', text, onRetry }) => (
  <div className="a-state-box">
    <span className="a-state-icon" style={{ color: 'var(--a-danger)' }}>
      <FiAlertTriangle />
    </span>
    <div className="a-state-title">{title}</div>
    {text && <div className="a-state-text">{text}</div>}
    {onRetry && (
      <div className="a-state-action">
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      </div>
    )}
  </div>
);

export const Skeleton = ({ className = '', style }) => (
  <div className={`a-skeleton ${className}`} style={style} />
);

export const TableSkeleton = ({ rows = 6, cols = 5 }) => (
  <div className="a-table-wrap" aria-hidden="true">
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--a-border)' }}>
      <Skeleton style={{ width: '30%', height: 12 }} />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div className="a-skel-row" key={i} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((__, j) => (
          <Skeleton key={j} style={{ width: j === 0 ? '70%' : '85%' }} />
        ))}
      </div>
    ))}
  </div>
);

/* ---------------------------------------------------------------
   Pagination
   --------------------------------------------------------------- */

const pageItems = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const withEllipsis = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) withEllipsis.push('...');
    withEllipsis.push(p);
  });
  return withEllipsis;
};

export const Pagination = ({ page, pages, total, onChange, pageSizeLabel }) => {
  if (pages <= 1) return null;

  return (
    <div className="a-pagination" data-od-id="pagination">
      <span className="a-pagination-info">
        {pageSizeLabel || `Page ${page} of ${pages}`}
        {typeof total === 'number' && ` · ${total} total`}
      </span>
      <div className="a-pagination-btns">
        <button
          className="a-page-btn"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <FiChevronLeft />
        </button>
        {pageItems(page, pages).map((item, i) =>
          item === '...' ? (
            <span className="a-page-ellipsis" key={`e${i}`}>…</span>
          ) : (
            <button
              key={item}
              className={`a-page-btn${item === page ? ' active' : ''}`}
              onClick={() => onChange(item)}
              aria-label={`Go to page ${item}`}
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </button>
          ),
        )}
        <button
          className="a-page-btn"
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------
   Misc
   --------------------------------------------------------------- */

export const Avatar = ({ name, size, title }) => {
  const text = String(name || '').trim() || 'A';
  const dim = size || 36;
  const fontSize = Math.round(dim * (text.length > 1 ? 0.42 : 0.52));
  return (
    <span
      className="a-avatar"
      title={title}
      style={{ width: dim, height: dim, fontSize }}
    >
      {text}
    </span>
  );
};

export const Stars = ({ rating }) => (
  <span className="a-stars" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} className={n <= rating ? '' : 'off'}>★</span>
    ))}
  </span>
);

export const StatCard = ({ label, value, foot, icon, tone = 'blue', loading, ...rest }) => (
  <div className="a-card a-stat-card" {...rest}>
    <span className={`a-stat-icon tone-${tone}`}>{icon}</span>
    <div style={{ minWidth: 0 }}>
      <div className="a-stat-label">{label}</div>
      {loading ? (
        <Skeleton style={{ width: 60, height: 26, marginTop: 4 }} />
      ) : (
        <div className="a-stat-value">{value}</div>
      )}
      {foot && <div className="a-stat-foot">{foot}</div>}
    </div>
  </div>
);

export const RowMenu = ({ items }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const wrapRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setPos(null);
      return undefined;
    }

    const updatePos = () => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const menuHeight = items.filter(Boolean).length * 40 + 12;
      let top = rect.bottom + 6;
      if (top + menuHeight > window.innerHeight - 8) {
        top = Math.max(8, rect.top - menuHeight - 6);
      }
      setPos({
        top,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    };

    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);

    const handler = (e) => {
      if (wrapRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('mousedown', handler);
    };
  }, [open, items]);

  return (
    <div className="a-icon-menu-wrap" ref={wrapRef}>
      <IconButton label="Row actions" onClick={() => setOpen((v) => !v)} data-od-id="row-actions">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="19" cy="12" r="1.7" />
        </svg>
      </IconButton>
      {open &&
        pos &&
        createPortal(
          <div className="a-icon-menu" ref={menuRef} style={{ top: pos.top, right: pos.right }}>
            {items
              .filter(Boolean)
              .map((item) => (
                <button
                  key={item.label}
                  className={`a-menu-item${item.danger ? ' danger' : ''}`}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
          </div>,
          document.body,
        )}
    </div>
  );
};