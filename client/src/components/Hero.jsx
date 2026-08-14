import React from 'react';
import './Hero.css';
import BookingForm from './BookingForm';


const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-left">
        <p className="hero-eyebrow anim-item delay-1">
          Fast Response • Professional Team • Affordable Prices
        </p>

        <h1 className="hero-heading anim-item delay-2">
          24/7 EMERGENCY <span className="highlight">TOWING</span> SERVICE
          <br />
          ACROSS DUBAI
        </h1>

        <p className="hero-subtext anim-item delay-2">
          We'll reach you in under 15 minutes, anywhere in Dubai.
        </p>

      
       

        <div className="hero-cta-group anim-item delay-3">
          <a href="tel:+971586729393" className="btn-call">📞 Call Now</a>
          <a href="https://wa.me/+971586729393" className="btn-whatsapp">💬 WhatsApp Us</a>
        </div>

        <div className="hero-stats anim-item delay-4">
          <div className="stat-item">
            <span className="stat-number">15 MIN</span>
            <span className="stat-label">Fast Response</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Service</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">FULLY</span>
            <span className="stat-label">Insured</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5000+</span>
            <span className="stat-label">Happy Clients</span>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-booking-wrapper">
          <BookingForm />
        </div>
      </div>
    </section>
  );
};

export default Hero;

