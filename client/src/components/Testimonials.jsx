import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';
import ReviewCard from './ReviewCard';
import CTABanner from './CTABanner';
import { getReviews } from '../api/reviewApi';
import './Testimonials.css';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    getReviews()
      .then((data) => {
        setReviews(data.slice(0, 5));
      })
      .catch(() => {
        setReviews([]);
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
          {reviews.length > 0 && <div className="testimonial-card-wrapper">
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
          </div>}
        </Reveal>

        <Reveal direction="right" delay={150}>
          <CTABanner
            title="Need Emergency Towing?"
            subtitle="Call or message our team to discuss the help you need."
            bullets={['Towing', 'Vehicle Recovery', 'Roadside Assistance']}
            variant="card"
          />
        </Reveal>
      </div>
    </section>
  );
};

export default Testimonials;

