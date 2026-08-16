import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';
import ReviewCard from './ReviewCard';
import CTABanner from './CTABanner';
import { getReviews } from '../api/reviewApi';
import seedReviews from '../data/reviews';
import './Testimonials.css';

const Testimonials = () => {
  const [reviews, setReviews] = useState(seedReviews);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    getReviews()
      .then((data) => {
        if (data.length > 0) setReviews(data.slice(0, 5));
      })
      .catch(() => {
        // Backend not reachable yet - keep showing the seed reviews
      });
  }, []);

  return (
    <section className="testimonials-section">
      <div className="testimonials-inner">
        <Reveal direction="left" className="testimonials-slider">
          <div className="testimonials-header">
            <h2 className="testimonials-title">
              WHAT OUR <span className="highlight">CLIENTS</span> SAY
            </h2>
            <Link to="/reviews" className="testimonials-view-all">
              View All Reviews →
            </Link>
          </div>
          <div className="testimonial-card-wrapper">
  <ReviewCard review={reviews[index]} dark />

  <div className="testimonial-arrows">
    <button
      type="button"
      onClick={() =>
        setIndex((index - 1 + reviews.length) % reviews.length)
      }
      aria-label="Previous review"
    >
      ←
    </button>

    <button
      type="button"
      onClick={() =>
        setIndex((index + 1) % reviews.length)
      }
      aria-label="Next review"
    >
      →
    </button>
  </div>
</div>
        </Reveal>

        <Reveal direction="right" delay={150}>
          <CTABanner
            title="Need Emergency Towing?"
            subtitle="We are available 24/7"
            bullets={['Fast Response', 'Professional Team', 'Affordable Pricing']}
            variant="card"
          />
        </Reveal>
      </div>
    </section>
  );
};

export default Testimonials;

