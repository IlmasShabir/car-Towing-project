import api from './axios';

export const adminLogin = async (username, password) => {
  const data = await api.post('/admin/login', { username, password });
  return data;
};

export const getAdminToken = () => localStorage.getItem('adminToken');
export const setAdminToken = (token) => localStorage.setItem('adminToken', token);
export const clearAdminToken = () => localStorage.removeItem('adminToken');
export const isAdminLoggedIn = () => !!getAdminToken();

export const getCurrentAdmin = async () => {
  return api.get('/admin/me');
};

export const updateAdminProfile = async (payload) => {
  return api.put('/admin/me', payload);
};

export const getDashboardStats = async () => {
  return api.get('/admin/stats');
};

export const getAdmins = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const qs = query.toString();
  return api.get(`/admin/admins${qs ? `?${qs}` : ''}`);
};

export const createAdmin = async (payload) => {
  return api.post('/admin/admins', payload);
};

export const updateAdmin = async (id, payload) => {
  return api.put(`/admin/admins/${id}`, payload);
};

export const deleteAdmin = async (id) => {
  return api.delete(`/admin/admins/${id}`);
};