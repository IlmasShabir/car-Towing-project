import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiClipboard,
  FiStar,
  FiTool,
  FiBell,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiChevronRight,
  FiTrendingUp,
} from 'react-icons/fi';
import { getDashboardStats } from '../../api/adminApi';
import { AreaChart, DonutChart, BarChart } from '../components/charts';
import {
  Button,
  Card,
  CardBody,
  CardHead,
  EmptyState,
  ErrorState,
  Skeleton,
  StatCard,
  BookingStatusBadge,
} from '../components/ui';
import { timeAgo, formatDateTime } from '../format';const STATUS_COLORS = {
  pending: '#d97706',
  'in-progress': '#2563eb',
  completed: '#16a34a',
  cancelled: '#dc2626',
};

const QuickAction = ({ icon, label, to, tone }) => (
  <Link
    to={to}
    className="a-menu-item"
    style={{ padding: '11px 14px', border: '1px solid var(--a-border)', justifyContent: 'flex-start' }}
  >
    <span className={`a-notif-icon ${tone}`}>{icon}</span>
    {label}
    <FiChevronRight style={{ marginLeft: 'auto', color: 'var(--a-faint)' }} />
  </Link>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    setStats(null);
    try {
      setStats(await getDashboardStats());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return <ErrorState text={error} onRetry={load} />;
  }

  if (!stats) {
    return (
      <div>
        <div className="a-stat-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="a-card a-stat-card" key={i}>
              <Skeleton style={{ width: 44, height: 44, borderRadius: 12 }} />
              <div style={{ flex: 1 }}>
                <Skeleton style={{ width: 90, height: 12 }} />
                <Skeleton style={{ width: 60, height: 26, marginTop: 8 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="a-grid-2" style={{ marginTop: 16 }}>
          <div className="a-card" style={{ height: 300 }}>
            <Skeleton style={{ height: '100%', borderRadius: 16 }} />
          </div>
          <div className="a-card" style={{ height: 300 }}>
            <Skeleton style={{ height: '100%', borderRadius: 16 }} />
          </div>
        </div>
      </div>
    );
  }

  const { totals, bookingStatus, bookingsTrend, ratingDistribution, averageRating, recentBookings, recentReviews } = stats;

  const statusDonut = [
    { label: 'Pending', value: bookingStatus.pending, color: STATUS_COLORS.pending },
    { label: 'In Progress', value: bookingStatus['in-progress'], color: STATUS_COLORS['in-progress'] },
    { label: 'Completed', value: bookingStatus.completed, color: STATUS_COLORS.completed },
    { label: 'Cancelled', value: bookingStatus.cancelled, color: STATUS_COLORS.cancelled },
  ];

  const ratingBars = [5, 4, 3, 2, 1].map((r) => ({
    label: String(r),
    value: ratingDistribution[r] || 0,
  }));

  const activity = [
    ...(stats.recentNotifications || []).map((n) => ({
      key: `n${n._id}`,
      title: n.title,
      text: n.message,
      time: n.createdAt,
      icon: n.type === 'booking' ? <FiClipboard /> : <FiStar />,
      tone: n.type === 'booking' ? 'tone-blue' : 'tone-orange',
      to: n.actionUrl,
    })),
    ...recentReviews.map((r) => ({
      key: `r${r._id}`,
      title: `New ${r.rating}-star review from ${r.name}`,
      text: r.text,
      time: r.createdAt,
      icon: <FiStar />,
      tone: 'tone-orange',
      to: '/admin/reviews',
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 8);

  return (
    <div>
      {/* KPI cards */}
      <div className="a-stat-grid">
        <StatCard
          label="Total bookings"
          value={totals.bookings}
          icon={<FiClipboard />}
          tone="blue"
          foot={
            <>
              <span className="up"><FiTrendingUp style={{ verticalAlign: -1 }} /> {bookingStatus.completed} completed</span>
            </>
          }
        />
        <StatCard
          label="Pending requests"
          value={bookingStatus.pending}
          icon={<FiClock />}
          tone="orange"
          foot={
            <Link to="/admin/bookings?status=pending" style={{ color: 'var(--a-info)', fontWeight: 600 }}>
              Review now
            </Link>
          }
        />
        <StatCard
          label="Completed jobs"
          value={bookingStatus.completed}
          icon={<FiCheckCircle />}
          tone="green"
          foot={`${bookingStatus['in-progress']} in progress`}
        />
        <StatCard
          label="Customer reviews"
          value={totals.reviews}
          icon={<FiStar />}
          tone="accent"
          foot={averageRating ? `Average ${averageRating} / 5` : 'No ratings yet'}
        />
      </div>

      <div className="a-stat-grid" style={{ marginTop: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <StatCard label="Services" value={totals.services} icon={<FiTool />} tone="violet" />
        <StatCard label="Unread notifications" value={totals.unreadNotifications} icon={<FiBell />} tone="red" />
        <StatCard label="Admin accounts" value={totals.admins} icon={<FiUsers />} tone="blue" />
      </div>

      {/* Charts + quick actions */}
      <div className="a-grid-2" style={{ marginTop: 16, alignItems: 'start' }}>
        <Card className="a-chart-card">
          <CardHead
            title="Bookings — last 14 days"
            sub={bookingsTrend.reduce((s, d) => s + d.count, 0) ? 'Requests received per day' : 'No bookings in this window yet'}
          />
          <AreaChart data={bookingsTrend} />
        </Card>

        <Card>
          <CardHead title="Booking status" sub="Current distribution" />
          <CardBody>
            <DonutChart data={statusDonut} size={140} centerLabel="bookings" />
          </CardBody>
        </Card>
      </div>

      <div className="a-grid-2" style={{ marginTop: 16, alignItems: 'start' }}>
        <Card>
          <CardHead
            title="Recent bookings"
            action={
              <Button variant="secondary" size="sm" onClick={() => navigate('/admin/bookings')}>
                View all
              </Button>
            }
          />
          <CardBody flush>
            {recentBookings.length === 0 ? (
              <EmptyState
                title="No bookings yet"
                text="Customer requests will appear here as soon as they come in."
                icon={<FiClipboard />}
              />
            ) : (
              <div className="a-list">
                {recentBookings.map((b) => (
                  <div className="a-list-item" key={b._id}>
                    <div className="a-list-item-main">
                      <div className="a-list-item-title">{b.name}</div>
                      <div className="a-list-item-sub">
                        {[b.service, b.vehicleType, b.location].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <BookingStatusBadge status={b.status} />
                      <span style={{ fontSize: 11, color: 'var(--a-faint)' }}>{timeAgo(b.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardHead title="Ratings" sub={averageRating ? `${averageRating} average` : 'No reviews yet'} />
            <CardBody>
              {totals.reviews === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--a-muted)', fontSize: 12.5, padding: '16px 0' }}>
                  No reviews yet.
                </div>
              ) : (
                <BarChart data={ratingBars} />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHead title="Quick actions" />
            <CardBody>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <QuickAction icon={<FiPlus />} label="Add service" to="/admin/services" tone="tone-violet" />
                <QuickAction icon={<FiClipboard />} label="New booking" to="/admin/bookings" tone="tone-blue" />
                <QuickAction icon={<FiStar />} label="Moderate reviews" to="/admin/reviews" tone="tone-orange" />
                <QuickAction icon={<FiBell />} label="Notifications" to="/admin/notifications" tone="tone-accent" />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Activity feed */}
      <Card style={{ marginTop: 16 }}>
        <CardHead title="Recent activity" sub="Latest requests, reviews and system events" />
        <CardBody flush>
          {activity.length === 0 ? (
            <EmptyState
              title="No activity yet"
              text="Booking requests and customer reviews will show up here."
            />
          ) : (
            <div style={{ padding: '6px 22px 14px' }}>
              {activity.map((item) => (
                <div className="a-feed-item" key={item.key}>
                  <span className={`a-feed-dot ${item.tone}`}>{item.icon}</span>
                  <div className="a-feed-body">
                    <div className="a-feed-title">{item.title}</div>
                    {item.text && <div className="a-feed-text">{item.text}</div>}
                    <div className="a-feed-time">{formatDateTime(item.time)}</div>
                  </div>
                  {item.to && (
                    <Link to={item.to} style={{ alignSelf: 'center', color: 'var(--a-faint)' }}>
                      <FiChevronRight />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default DashboardPage;