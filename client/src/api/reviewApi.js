import { getAdminToken } from './adminApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getReviews = async () => {
  const res = await fetch(`${API_URL}/reviews`);
  if (!res.ok) throw new Error('Failed to load reviews');
  return res.json();
};

export const createReview = async (reviewData) => {
  const res = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong. Please try again.');
  }

  return res.json();
};

export const deleteReview = async (id) => {
  const res = await fetch(`${API_URL}/reviews/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getAdminToken()}` },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to delete review');
  }

  return res.json();
};
