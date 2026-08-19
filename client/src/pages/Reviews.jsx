import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import Footer from '../components/Footer';
import { getReviews } from '../api/reviewApi';
import seedReviews from '../data/reviews';
import { Helmet } from 'react-helmet-async';
import './Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState(seedReviews);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getReviews()
      .then((data) => {
        // Show live submitted reviews first, keep the seed reviews after them
        // so the page never looks empty while the database is still new.
        setReviews(data.length > 0 ? data : seedReviews);
      })
      .catch(() => {
        // Backend not reachable yet (e.g. still in local dev) - fall back to seed data
        setReviews(seedReviews);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmitted = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
    setShowForm(false);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <>
      <Helmet>
        <title>Customer Reviews | Usama Car Towing</title>
        <meta name="description" content="Read reviews from our customers about Usama Car Towing's fast, reliable 24/7 towing service in Dubai." />
      </Helmet>
      <Navbar />
      <PageHeader title="WHAT OUR CLIENTS SAY" crumb="Reviews" />

      <section className="reviews-section">
        <Reveal className="reviews-summary">
          <div>
            <span className="reviews-score">{avgRating}</span>
            <span className="reviews-stars">★★★★★</span>
            <span className="reviews-count">
              (Based on {reviews.length}{reviews.length >= 50 ? '+' : ''} Reviews)
            </span>
          </div>
          <button className="reviews-write-btn" onClick={() => setShowForm(true)}>
            ✎ Write a Review
          </button>
        </Reveal>

        {loading ? (
          <p className="reviews-loading">Loading reviews...</p>
        ) : (
          <div className="reviews-grid">
            {reviews.map((review, i) => (
              <Reveal key={review._id || review.name + i} delay={(i % 4) * 90}>
                <ReviewCard review={review} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <ReviewForm onClose={() => setShowForm(false)} onSubmitted={handleSubmitted} />
      )}

      <Footer />
    </>
  );
};

export default Reviews;
