import { useEffect, useState } from 'react';
import { FiRefreshCw, FiStar, FiTrash2, FiEye } from 'react-icons/fi';
import { getReviews, deleteReview } from '../../api/reviewApi';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../components/Toast';
import {
  Button,
  ConfirmDialog,
  Drawer,
  EmptyState,
  ErrorState,
  Pagination,
  RowMenu,
  SearchBox,
  Stars,
  TableSkeleton,
} from '../components/ui';
import { formatDateTime } from '../format';

const PAGE_SIZE = 12;

const ReviewsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search, 350);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getReviews({ page, limit: PAGE_SIZE, search: debouncedSearch });
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteReview(deleteTarget._id);
      toast.success('Review deleted');
      setDeleteTarget(null);
      if (detail?._id === deleteTarget._id) setDetail(null);
      if (page > 1 && data?.data?.length === 1) {
        setPage((p) => p - 1);
      } else {
        load();
      }
    } catch (err) {
      toast.error('Failed to delete review', err.message);
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="a-toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search name, location, review text…" />
        <Button variant="ghost" icon={<FiRefreshCw />} onClick={load} disabled={loading} aria-label="Refresh">
          Refresh
        </Button>
      </div>

      {loading && !data ? (
        <TableSkeleton rows={8} cols={5} />
      ) : error ? (
        <ErrorState text={error} onRetry={load} />
      ) : data?.data.length === 0 ? (
        <div className="a-card">
          <EmptyState
            title={debouncedSearch ? 'No reviews match your search' : 'No reviews yet'}
            text={
              debouncedSearch
                ? 'Try a different search term.'
                : 'Customer reviews submitted on the website will appear here.'
            }
            icon={<FiStar />}
          />
        </div>
      ) : (
        <>
          <div className="a-table-wrap" data-od-id="reviews-table">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((review) => (
                  <tr key={review._id}>
                    <td>
                      <div className="a-cell-main">{review.name}</div>
                      {review.location && <div className="a-cell-sub">{review.location}</div>}
                    </td>
                    <td>
                      <Stars rating={review.rating} />
                    </td>
                    <td style={{ maxWidth: 380 }}>
                      <span
                        title={review.text}
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                      >
                        {review.text}
                      </span>
                    </td>
                    <td className="a-cell-sub">{formatDateTime(review.createdAt)}</td>
                    <td>
                      <div className="a-row-actions">
                        <RowMenu
                          items={[
                            { label: 'View full review', icon: <FiEye />, onClick: () => setDetail(review) },
                            { label: 'Delete review', icon: <FiTrash2 />, danger: true, onClick: () => setDeleteTarget(review) },
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

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Review — ${detail.name}` : ''}
        sub={detail ? formatDateTime(detail.createdAt) : ''}
      >
        {detail && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Stars rating={detail.rating} />
              {detail.location && <span className="a-cell-sub">{detail.location}</span>}
            </div>
            <div className="a-message-box">{detail.text}</div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="danger-ghost" icon={<FiTrash2 />} onClick={() => setDeleteTarget(detail)}>
                Delete review
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete this review?"
        message={`The review from ${deleteTarget?.name} will be removed from the website. This cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ReviewsPage;