import api from './axios';

export const getNotifications = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const qs = query.toString();
  return api.get(`/admin/notifications${qs ? `?${qs}` : ''}`);
};

export const getUnreadCount = async () => {
  const data = await api.get('/admin/notifications/unread-count');
  return data;
};

export const markNotificationRead = async (id) => {
  const data = await api.patch(`/admin/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const data = await api.patch('/admin/notifications/read-all');
  return data;
};

export const deleteNotification = async (id) => {
  const data = await api.delete(`/admin/notifications/${id}`);
  return data;
};

export const deleteNotifications = async (ids) => {
  const data = await api.delete('/admin/notifications', { data: { ids } });
  return data;
};