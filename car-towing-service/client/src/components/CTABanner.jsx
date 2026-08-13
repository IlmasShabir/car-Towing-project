import React from 'react';
import './CTABanner.css';

const CTABanner = ({
  title = 'Need Immediate Assistance?',
  subtitle = 'We are just one call away!',
  bullets = [],
  variant = 'bar',
}) => {
  if (variant === 'card') {
    return (
      <div className="cta-banner cta-card">
        <h3>{title}</h3>
        <p>{subtitle}</p>
        {bullets.length > 0 && (
          <ul className="cta-bullets">
            {bullets.map((b) => (
              <li key={b}>✓ {b}</li>
            ))}
          </ul>
        )}
        <a href="tel:+971 58 672 9393" className="cta-btn-primary">
          📞 Call Now: +971 58 672 9393
        </a>
      </div>
    );
  }

  return (
    <div className="cta-banner cta-bar">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <div className="cta-bar-actions">
        <a href="tel:+971 58 672 9393" className="cta-btn-primary">
          📞 Call Now
        </a>
        <a href="https://wa.me/971586729393" className="cta-btn-outline">
          💬 WhatsApp Us
        </a>
      </div>
    </div>
  );
};

export default CTABanner;
