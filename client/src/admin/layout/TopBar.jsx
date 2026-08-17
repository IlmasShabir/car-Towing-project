import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiMinimize2,
  FiMaximize2,
  FiChevronRight,
  FiSearch,
} from "react-icons/fi";
import NotificationBell from "./NotificationBell";
import ProfileMenu from "./ProfileMenu";
import GlobalSearch from "./GlobalSearch";

const TITLES = {
  dashboard: "Dashboard",
  bookings: "Bookings",
  services: "Services",
  reviews: "Reviews",
  admins: "Admin Users",
  notifications: "Notifications",
};

const TopBar = ({ collapsed, onToggleSidebar, onToggleMobile }) => {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target;
        const isTyping =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target?.isContentEditable;
        if (!isTyping) {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const segments = location.pathname.split("/").filter(Boolean);
  const current = segments[segments.length - 1] || "dashboard";
  const title = TITLES[current] || "Dashboard";

  return (
    <header className="a-topbar" data-od-id="admin-topbar">
      <div className="a-topbar-left">
        <button
          className="a-hamburger"
          onClick={onToggleMobile}
          aria-label="Open navigation menu"
        >
          <FiMenu />
        </button>
        <button
          className="a-icon-btn"
          onClick={onToggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{ display: "inline-flex" }}
        >
          {collapsed ? <FiMaximize2 /> : <FiMinimize2 />}
        </button>
        <div className="a-page-title">
          <h1>{title}</h1>
          <div className="a-breadcrumb">
            <Link to="/admin/dashboard">Admin</Link>
            <FiChevronRight size={11} />
            <span>{title}</span>
          </div>
        </div>
      </div>

      <div className="a-topbar-right">
        <button
          className="a-icon-btn"
          onClick={() => setSearchOpen(true)}
          aria-label="Global search"
          title="Search ( / )"
        >
          <FiSearch />
          <span
            className="a-kbd-hint"
            style={{
              position: "absolute",

              bottom: -8,
              right: 3,
              fontSize: 8.5,
              lineHeight: 1,
              padding: "2px 4px",
            }}
          >
            /
          </span>
        </button>
        <NotificationBell />
        <ProfileMenu />
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default TopBar;
