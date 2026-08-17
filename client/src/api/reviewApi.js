import api from './axios';

export const getReviews = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const qs = query.toString();
  return api.get(`/reviews${qs ? `?${qs}` : ''}`);
};

export const createReview = async (reviewData) => {
  const data = await api.post('/reviews', reviewData);
  return data;
};

export const deleteReview = async (id) => {
  const data = await api.delete(`/reviews/${id}`);
  return data;
};