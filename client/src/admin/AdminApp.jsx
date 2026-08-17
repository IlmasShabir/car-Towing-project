import { Navigate, Route, Routes } from 'react-router-dom';
import './admin.css';
import { ToastProvider } from './components/Toast';
import { AdminSessionProvider } from './SessionContext';
import { NotificationsProvider } from './NotificationsContext';
import AdminLayout from './layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import BookingsPage from './pages/BookingsPage';
import ServicesPage from './pages/ServicesPage';
import ReviewsPage from './pages/ReviewsPage';
import AdminsPage from './pages/AdminsPage';
import NotificationsPage from './pages/NotificationsPage';

const AdminApp = () => {
  return (
    <div className="admin-app">
      <AdminSessionProvider>
        <NotificationsProvider>
          <ToastProvider>
            <AdminLayout>
              <Routes>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="reviews" element={<ReviewsPage />} />
                <Route path="admins" element={<AdminsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </AdminLayout>
          </ToastProvider>
        </NotificationsProvider>
      </AdminSessionProvider>
    </div>
  );
};

export default AdminApp;