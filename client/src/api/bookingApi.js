import api from './axios';

export const createBooking = async (bookingData) => {
  const data = await api.post('/bookings', bookingData);
  return data;
};

export const getBookings = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const qs = query.toString();
  return api.get(`/bookings${qs ? `?${qs}` : ''}`);
};

export const getBooking = async (id) => {
  const data = await api.get(`/bookings/${id}`);
  return data;
};

export const updateBookingStatus = async (id, status) => {
  const data = await api.put(`/bookings/${id}`, { status });
  return data;
};

export const deleteBooking = async (id) => {
  const data = await api.delete(`/bookings/${id}`);
  return data;
};