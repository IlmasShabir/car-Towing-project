import React from 'react';
import Reveal from './Reveal';
import './HowItWorks.css';

const steps = [
  { num: '1', icon: '📞', title: 'Call', desc: 'Call or WhatsApp our team' },
  { num: '2', icon: '📍', title: 'Location', desc: 'Share your location with us' },
  { num: '3', icon: '🚛', title: 'Dispatched', desc: 'Nearest tow truck is dispatched' },
  { num: '4', icon: '✅', title: 'Delivery', desc: 'Your vehicle is safely delivered' },
];

const HowItWorks = () => (
  <section className="how-it-works">
    <Reveal>
      <h2 className="section-title">
        HOW IT <span className="highlight">WORKS</span>
      </h2>
    </Reveal>

    <div className="how-it-works-steps">
      {steps.map((step, i) => (
        <Reveal key={step.num} delay={i * 120} className="how-it-works-step-wrapper">
          <div className="how-it-works-step">
            <div className="step-circle">{step.icon}</div>
            <span className="step-num">{step.num}</span>
            <h4>{step.title}</h4>
            <p>{step.desc}</p>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);

export default HowItWorks;
