const Booking = require('../models/Booking');
const { sendBookingEmail } = require('../utils/sendEmail');

// @desc    Create a new booking (public - called by BookingForm / ContactForm)
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { name, phone, email, location, vehicleType, service, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const booking = await Booking.create({
      name,
      phone,
      email,
      location,
      vehicleType,
      service,
      message,
    });

    // Fire the notification email but don't let it block or fail the request
    // if email isn't configured yet or Gmail has a hiccup.
    sendBookingEmail(booking).catch((err) =>
      console.error('Failed to send notification email:', err.message)
    );

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (admin dashboard)
// @route   GET /api/bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a booking's status (admin dashboard)
// @route   PUT /api/bookings/:id
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = req.body.status || booking.status;
    const updated = await booking.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a booking (admin dashboard)
// @route   DELETE /api/bookings/:id
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    await booking.deleteOne();
    res.json({ message: 'Booking removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getBookings, updateBookingStatus, deleteBooking };
