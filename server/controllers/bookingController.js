const Booking = require('../models/Booking');
const { sendBookingEmail } = require('../utils/sendEmail');
const { createNotification } = require('../utils/notifications');

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

    // Notify the admin panel about the new request
    createNotification({
      type: 'booking',
      title: 'New tow request received',
      message: `${booking.name} requested "${booking.service || 'a tow'}"${booking.location ? ` at ${booking.location}` : ''}`,
      priority: 'high',
      targetType: 'booking',
      targetId: booking._id,
      actionUrl: '/admin/bookings',
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings with server-side pagination, search, filter & sort
// @route   GET /api/bookings
// Backward compatible: without pagination params returns the full array as before.
const getBookings = async (req, res) => {
  try {
    const hasPagination =
      req.query.page !== undefined ||
      req.query.limit !== undefined ||
      req.query.search !== undefined ||
      req.query.status !== undefined ||
      req.query.sort !== undefined;

    if (!hasPagination) {
      const bookings = await Booking.find().sort({ createdAt: -1 });
      return res.json(bookings);
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    if (req.query.search) {
      const search = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { name: search },
        { phone: search },
        { email: search },
        { location: search },
        { service: search },
        { vehicleType: search },
      ];
    }

    const sortable = ['createdAt', 'name', 'status', 'updatedAt'];
    const sortField = sortable.includes(req.query.sort) ? req.query.sort : 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      Booking.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
      Booking.countDocuments(filter),
    ]);

    res.json({
      data,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      limit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single booking by id
// @route   GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
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

    const allowedStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    const status = req.body.status;
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    booking.status = status;
    const updated = await booking.save();

    if (status === 'completed' || status === 'cancelled') {
      createNotification({
        type: 'booking',
        title: `Booking ${status}`,
        message: `${updated.name}'s booking (${updated.service || 'tow'}) was marked as ${status}.`,
        priority: 'medium',
        targetType: 'booking',
        targetId: updated._id,
        actionUrl: '/admin/bookings',
      });
    }

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

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};