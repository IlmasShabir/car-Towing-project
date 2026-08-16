import api from './axios';

export const createBooking = async (bookingData) => {
  const data = await api.post('/bookings', bookingData);
  return data;
};

export const getBookings = async () => {
  const data = await api.get('/bookings');
  return data;
};

export const updateBookingStatus = async (id, status) => {
  const data = await api.put(`/bookings/${id}`, { status });
  return data;
};