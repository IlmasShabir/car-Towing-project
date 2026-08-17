const express = require('express');
const router = express.Router();
const { createReview, getReviews, deleteReview } = require('../controllers/reviewController');
const { protectAdmin } = require('../middleware/adminAuth');

router.post('/', createReview);          // public - Write a Review form
router.get('/', getReviews);              // public - Reviews page + homepage
router.delete('/:id', protectAdmin, deleteReview); // admin only - moderation

module.exports = router;