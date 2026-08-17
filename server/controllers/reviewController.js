const Review = require('../models/Review.js');
const { createNotification } = require('../utils/notifications');

// @desc    Submit a new review (public - called by the "Write a Review" form)
// @route   POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { name, location, rating, text } = req.body;

    if (!name || !rating || !text) {
      return res.status(400).json({ message: 'Name, rating and review text are required' });
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = await Review.create({ name, location, rating: numericRating, text });

    createNotification({
      type: 'review',
      title: 'New customer review',
      message: `${review.name} left a ${numericRating}-star review.`,
      priority: 'low',
      targetType: 'review',
      targetId: review._id,
      actionUrl: '/admin/reviews',
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews, newest first (public - Reviews page + homepage testimonials)
// @route   GET /api/reviews
// Backward compatible: supports optional ?page=&limit=&search= for the admin
// panel; without them returns the full array as before.
const getReviews = async (req, res) => {
  try {
    const hasPagination =
      req.query.page !== undefined || req.query.search !== undefined;

    if (!hasPagination) {
      const reviews = await Review.find().sort({ createdAt: -1 });
      return res.json(reviews);
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      const search = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [{ name: search }, { text: search }, { location: search }];
    }

    const [data, total] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Review.countDocuments(filter),
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