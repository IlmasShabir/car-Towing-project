const express = require('express');
const router = express.Router();
const { createReview, getReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', createReview);          // public - Write a Review form
router.get('/', getReviews);              // public - Reviews page + homepage
router.delete('/:id', protect, deleteReview); // admin only - moderation

module.exports = router;
