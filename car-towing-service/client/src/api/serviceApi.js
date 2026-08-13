import { getAdminToken } from './adminApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAdminToken()}`,
});

export const getServices = async () => {
  const res = await fetch(`${API_URL}/services`);
  if (!res.ok) throw new Error('Failed to load services');
  return res.json();
};

export const createService = async (data) => {
  const res = await fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create service');
  }
  return res.json();
};

export const updateService = async (id, data) => {
  const res = await fetch(`${API_URL}/services/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update service');
  }
  return res.json();
};

export const deleteService = async (id) => {
  const res = await fetch(`${API_URL}/services/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to delete service');
  }
  return res.json();
};
