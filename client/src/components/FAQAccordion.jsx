import { useState } from 'react';
import Reveal from './Reveal';
import './FAQAccordion.css';

const faqs = [
  {
    q: 'How much does towing cost?',
    a: 'Towing prices depend on the type of vehicle, distance and service required. Contact us to request a quote.',
  },
  {
    q: 'How quickly can you arrive?',
    a: 'Arrival time varies with your location and road conditions. Contact us for a current estimate.',
  },
  {
    q: 'Do you tow luxury cars?',
    a: 'Contact us with your vehicle details to discuss suitable transport options.',
  },
  {
    q: 'Do you provide roadside assistance?',
    a: 'Yes — battery jump starts, flat tyre changes, and minor repairs are all available.',
  },
  {
    q: 'How can I check current availability?',
    a: 'Call or message us with your location and vehicle details to confirm current availability.',
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
