const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/', createBooking);            // public - website forms submit here
router.get('/', protect, getBookings);      // admin only
router.put('/:id', protect, updateBookingStatus);
router.delete('/:id', protect, deleteBooking);

module.exports = router;