import React, { useState } from 'react';
import { createReview } from '../api/reviewApi';
import './ReviewForm.css';

const ReviewForm = ({ onClose, onSubmitted }) => {
  const [form, setForm] = useState({ name: '', location: '', text: '' });
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const newReview = await createReview({ ...form, rating });
      onSubmitted(newReview);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="review-form-overlay" onClick={onClose}>
      <form
        className="review-form-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <button type="button" className="review-form-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h3>Write a Review</h3>
        <p className="review-form-subtitle">Tell us about your experience</p>

        <div className="review-form-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className={`star-btn ${(hoverRating || rating) >= star ? 'filled' : ''}`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              aria-label={`Rate ${star} stars`}
            >
              ★
            </button>
          ))}
        </div>

        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Area (e.g. Dubai Marina)"
          value={form.location}
          onChange={handleChange}
        />
        <textarea
          name="text"
          placeholder="Share your experience..."
          rows="4"
          value={form.text}
          onChange={handleChange}
          required
        />

        {status === 'error' && <p className="review-form-error">{errorMsg}</p>}

        <button type="submit" className="review-form-submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
