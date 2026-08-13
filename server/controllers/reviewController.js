const Review = require('../models/Review.js');

// @desc    Submit a new review (public - called by the "Write a Review" form)
// @route   POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { name, location, rating, text } = req.body;

    if (!name || !rating || !text) {
      return res.status(400).json({ message: 'Name, rating and review text are required' });
    }

    const review = await Review.create({ name, location, rating, text });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews, newest first (public - Reviews page + homepage testimonials)
// @route   GET /api/reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review (admin only - moderation)
// @route   DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    await review.deleteOne();
    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getReviews, deleteReview };
