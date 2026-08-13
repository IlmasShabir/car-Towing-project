import React from 'react';
import './ReviewCard.css';

const ReviewCard = ({ review, dark = false }) => (
  <div className={`review-card ${dark ? 'review-card-dark' : ''}`}>
    <div className="review-stars">{'★'.repeat(review.rating)}</div>
    <p className="review-text">"{review.text}"</p>
    <div className="review-author">
      <span className="review-name">{review.name}</span>
      <span className="review-location">{review.location}</span>
    </div>
  </div>
);

export default ReviewCard;
