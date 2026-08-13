import React from 'react';
import Reveal from './Reveal';
import './WhyChooseUs.css';

const items = [
  { icon: '⚡', title: 'Fast Arrival', desc: 'We reach you in 15–20 minutes' },
  { icon: '🛡️', title: 'Fully Insured', desc: 'Your vehicle is safe with us' },
  { icon: '📍', title: 'All Dubai Coverage', desc: 'We cover all areas in Dubai' },
  { icon: '💰', title: 'Affordable Prices', desc: 'Best prices with no hidden fees' },
  { icon: '🚚', title: 'Modern Fleet', desc: 'Well maintained tow trucks' },
  { icon: '🎧', title: '24/7 Support', desc: 'We are available anytime' },
];

const WhyChooseUs = () => (
  <section className="why-choose-us">
    <Reveal>
      <h2 className="section-title">
        WHY <span className="highlight">CHOOSE</span> US?
      </h2>
    </Reveal>

    <div className="why-choose-grid">
      {items.map((item, i) => (
        <Reveal key={item.title} delay={i * 80}>
          <div className="why-choose-item">
            <span className="why-choose-icon">{item.icon}</span>
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);

export default WhyChooseUs;
