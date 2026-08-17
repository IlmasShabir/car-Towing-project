import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiClipboard,
  FiStar,
  FiTool,
  FiInbox,
} from 'react-icons/fi';
import { getBookings } from '../../api/bookingApi';
import { getReviews } from '../../api/reviewApi';
import { getServices } from '../../api/serviceApi';
import { useDebounce } from '../hooks/useDebounce';
import { Modal } from '../components/ui';
import { formatDate, titleCase } from '../format';

const GlobalSearch = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query, 300);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults(null);
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !debounced.trim()) {
      setResults(null);
      return;
    }
    let mounted = true;
    setLoading(true);
    Promise.allSettled([
      getBookings({ search: debounced, limit: 5 }),
      getServices(),
      getReviews({ search: debounced, limit: 5 }),
    ]).then(([bookings, services, reviews]) => {
      if (!mounted) return;
      const servicesAll = services.status === 'fulfilled' ? services.value : [];
      const filteredServices = (Array.isArray(servicesAll) ? servicesAll : servicesAll.data || [])
        .filter((s) => {
          const q = debounced.toLowerCase();
          return (
            s.name?.toLowerCase().includes(q) ||
            s.slug?.toLowerCase().includes(q) ||
            s.shortDesc?.toLowerCase().includes(q)
          );
        })
        .slice(0, 5);

      setResults({
        bookings: bookings.status === 'fulfilled' ? bookings.value.data : [],
        services: filteredServices,
        reviews: reviews.status === 'fulfilled' ? reviews.value.data : [],
      });
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [debounced, open]);

  const go = (path) => {
    onClose();
    navigate(path);
  };

  const group = (label, icon, items, render) => {
    if (!items || items.length === 0) return null;
    return (
      <>
        <div className="a-search-group-label">{label}</div>
        {items.map(render)}
      </>
    );
  };

  return (
    <Modal open={open} onClose={onClose} className="a-search-dialog" wide>
      <div className="a-search-dialog" data-od-id="global-search">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 18px', borderBottom: '1px solid var(--a-border)' }}>
          <span style={{ color: 'var(--a-faint)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </span>
          <input
            ref={inputRef}
            className="a-input"
            style={{ border: 'none', boxShadow: 'none', fontSize: 15, padding: '14px 6px' }}
            placeholder="Search bookings, services, reviews..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />
          <span className="a-kbd-hint">ESC</span>
        </div>

        <div className="a-search-results">
          {loading && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--a-muted)', fontSize: 13 }}>
              Searching…
            </div>
          )}

          {!loading && results && (
            <>
              {group('Bookings', FiClipboard, results.bookings, (b) => (
                <button
                  key={b._id}
                  className="a-search-result-item"
                  onClick={() => go(`/admin/bookings`)}
                >
                  <span className="a-notif-icon tone-blue"><FiClipboard /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="a-search-result-item-title" style={{ fontWeight: 600 }}>{b.name}</span>
                    <div className="a-search-result-sub">
                      {[b.service, b.vehicleType, b.location].filter(Boolean).join(' · ')}
                    </div>
                  </span>
                  <span className="a-search-result-sub">{formatDate(b.createdAt)}</span>
                </button>
              ))}

              {group('Services', FiTool, results.services, (s) => (
                <button key={s._id} className="a-search-result-item" onClick={() => go('/admin/services')}>
                  <span className="a-notif-icon tone-violet"><FiTool /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                    <div className="a-search-result-sub">{titleCase(s.slug)}</div>
                  </span>
                </button>
              ))}

              {group('Reviews', FiStar, results.reviews, (r) => (
                <button key={r._id} className="a-search-result-item" onClick={() => go('/admin/reviews')}>
                  <span className="a-notif-icon tone-orange"><FiStar /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 600 }}>{r.name}</span>
                    <div className="a-search-result-sub">{'★'.repeat(r.rating)} · {r.location || '—'}</div>
                  </span>
                </button>
              ))}

              {results.bookings.length === 0 &&
                results.services.length === 0 &&
                results.reviews.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 30, color: 'var(--a-muted)', fontSize: 13 }}>
                    <FiInbox size={26} style={{ marginBottom: 8, color: 'var(--a-faint)' }} />
                    <div>No matches for “{query}”</div>
                  </div>
                )}
            </>
          )}

          {!loading && !results && (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--a-muted)', fontSize: 13 }}>
              Type to search bookings, services, and customer reviews.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default GlobalSearch;