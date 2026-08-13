const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const createBooking = async (bookingData) => {
  const res = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong. Please try again.');
  }

  return res.json();
};

// --- Admin-only calls (used by the Admin dashboard, needs a login token) ---

export const loginAdmin = async (email, password) => {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Login failed');
  }

  return res.json(); // { _id, name, email, token }
};

export const getBookings = async (token) => {
  const res = await fetch(`${API_URL}/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to load bookings');
  return res.json();
};

export const updateBookingStatus = async (id, status, token) => {
  const res = await fetch(`${API_URL}/bookings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error('Failed to update booking');
  return res.json();
};
