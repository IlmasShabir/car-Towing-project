import api from './axios';

export const adminLogin = async (username, password) => {
  const data = await api.post('/admin/login', { username, password });
  return data;
};

export const getAdminToken = () => localStorage.getItem('adminToken');
export const setAdminToken = (token) => localStorage.setItem('adminToken', token);
export const clearAdminToken = () => localStorage.removeItem('adminToken');
export const isAdminLoggedIn = () => !!getAdminToken();