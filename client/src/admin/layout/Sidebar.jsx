import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiClipboard,
  FiTool,
  FiStar,
  FiUsers,
  FiBell,
} from 'react-icons/fi';
import { useNotifications } from '../NotificationsContext';
import { useAdminSession } from '../SessionContext';
import { Avatar, Badge } from '../components/ui';
import { initials } from '../format';
import logo from '../../assets/images/logo (1).webp';

const NAV = [
  {
    section: 'Overview',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid, end: true },
    ],
  },
  {
    section: 'Management',
    items: [
      { to: '/admin/bookings', label: 'Bookings', icon: FiClipboard },
      { to: '/admin/services', label: 'Services', icon: FiTool },
      { to: '/admin/reviews', label: 'Reviews', icon: FiStar },
    ],
  },
  {
    section: 'System',
    items: [
      { to: '/admin/admins', label: 'Admin Users', icon: FiUsers },
      { to: '/admin/notifications', label: 'Notifications', icon: FiBell },
    ],
  },
];

const Sidebar = ({ mobileOpen, onNavigate }) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { user } = useAdminSession();

  const handleClick = (to) => {
    navigate(to);
    onNavigate?.();
  };

  return (
    <aside className={`a-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="a-brand" onClick={() => handleClick('/admin/dashboard')} style={{ cursor: 'pointer' }}>
        <img src={logo} alt="Usama Car Towing" />
        <div className="a-brand-text">
          <span className="a-brand-name">Usama Towing</span>
          <span className="a-brand-sub">Admin Panel</span>
        </div>
      </div>

      <nav className="a-sidebar-nav" aria-label="Admin navigation">
        {NAV.map((group) => (
          <div key={group.section}>
            <div className="a-nav-section">{group.section}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const showBadge = item.to === '/admin/notifications' && unreadCount > 0;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => onNavigate?.()}
                  className={({ isActive }) => `a-nav-link${isActive ? ' active' : ''}`}
                >
                  <span className="a-nav-icon"><Icon /></span>
                  <span className="a-nav-label">{item.label}</span>
                  {showBadge && <span className="a-nav-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="a-sidebar-footer">
        <div className="a-sidebar-user">
          <Avatar name={initials(user?.name || user?.username)} title={user?.name || user?.username} />
          <div className="a-sidebar-user-info">
            <div className="a-sidebar-user-name">{user?.name || user?.username || 'Admin'}</div>
            <div className="a-sidebar-user-role">
              <Badge tone={user?.role === 'superadmin' ? 'accent' : 'gray'}>
                {user?.role === 'superadmin' ? 'Owner' : 'Admin'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;