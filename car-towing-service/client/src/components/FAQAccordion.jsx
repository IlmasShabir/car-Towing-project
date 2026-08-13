import React, { useState } from 'react';
import Reveal from './Reveal';
import './FAQAccordion.css';

const faqs = [
  {
    q: 'How much does towing cost?',
    a: 'Towing prices depend on the type of vehicle, distance and service required. Contact us for an instant quote.',
  },
  {
    q: 'How quickly can you arrive?',
    a: 'In most areas of Dubai, our team reaches you within 15–20 minutes of your call.',
  },
  {
    q: 'Do you tow luxury cars?',
    a: 'Yes, we have specialised equipment and trained staff for luxury and exotic vehicles.',
  },
  {
    q: 'Do you provide roadside assistance?',
    a: 'Yes — battery jump starts, flat tyre changes, and minor repairs are all available.',
  },
  {
    q: 'Is your service available 24/7?',
    a: 'Yes, our team is available 24 hours a day, 7 days a week.',
  },
  {
    q: 'Do you operate outside Dubai?',
    a: 'Our core coverage is across Dubai — contact us to check availability for nearby emirates.',
  },
];

const FAQAccordion = () => {
  const [open, setOpen] = useState(0);

  return (
    <div className="faq-accordion">
      {faqs.map((faq, i) => (
        <Reveal key={faq.q} delay={i * 60}>
          <div className={`faq-item ${open === i ? 'open' : ''}`}>
            <button className="faq-question" onClick={() => setOpen(open === i ? -1 : i)}>
              {faq.q}
              <span className="faq-toggle">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <p className="faq-answer">{faq.a}</p>}
          </div>
        </Reveal>
      ))}
    </div>
  );
};

export default FAQAccordion;
