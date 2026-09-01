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
  const [page, setPage] = useState(1);
  const perPage = 4;

  useEffect(() => {
    getReviews()
      .then((data) => {
        // Show live submitted reviews first, keep the seed reviews after them
        // so the page never looks empty while the database is still new.
        setReviews(data.length > 0 ? data : seedReviews);
        setPage(1);
      })
      .catch(() => {
        // Backend not reachable yet (e.g. still in local dev) - fall back to seed data
        setReviews(seedReviews);
        setPage(1);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmitted = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
    setShowForm(false);
    setPage(1);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const pageCount = Math.max(1, Math.ceil(reviews.length / perPage));
  const safePage = Math.min(page, pageCount);
  const pageReviews = reviews.slice((safePage - 1) * perPage, safePage * perPage);

  return (
    <>
      <Helmet>
        <title>Best Towing Services in Dubai | Usama Car Towing</title>
        <meta name="description" content="Read reviews from our customers about Usama Car Towing's fast, reliable 24/7 towing service in Dubai." />
        <link rel="canonical" href="https://cartowingservicedubai.com/reviews" />
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
            {pageReviews.map((review, i) => (
              <Reveal key={review._id || review.name + i} delay={(i % 4) * 90}>
                <ReviewCard review={review} />
              </Reveal>
            ))}
          </div>
        )}

        {!loading && pageCount > 1 && (
          <nav className="reviews-pagination" aria-label="Reviews pagination">
            <button
              className="reviews-page-btn"
              onClick={() => setPage(safePage - 1)}
              disabled={safePage <= 1}
              aria-label="Previous page"
            >
              ‹
            </button>
            <span className="reviews-page-btn active">
              {safePage}
            </span>
            <button
              className="reviews-page-btn"
              onClick={() => setPage(safePage + 1)}
              disabled={safePage >= pageCount}
              aria-label="Next page"
            >
              ›
            </button>
          </nav>
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
