import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If the admin token expired or was revoked, clear it and send the
    // admin back to the login screen.
    if (
      error.response?.status === 401 &&
      localStorage.getItem('adminToken') &&
      !window.location.pathname.startsWith('/admin/login')
    ) {
      localStorage.removeItem('adminToken');
      if (!window.location.pathname.startsWith('/admin/')) {
        window.location.assign('/admin/login');
      }
    }
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    throw new Error(message);
  }
);

export default api;