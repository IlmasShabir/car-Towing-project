const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');
const { protectAdmin } = require('../middleware/adminAuth');

router.post('/', createBooking);            // public - website forms submit here
router.get('/', protectAdmin, getBookings); // admin only (list, paginated)
router.get('/:id', protectAdmin, getBookingById); // admin only (detail)
router.put('/:id', protectAdmin, updateBookingStatus);
router.delete('/:id', protectAdmin, deleteBooking);

module.exports = router;