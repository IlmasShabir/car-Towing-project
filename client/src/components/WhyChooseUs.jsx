import Reveal from './Reveal';
import './WhyChooseUs.css';

const items = [
  { icon: '⚡', title: 'Arrival Estimates', desc: 'Contact our team for a current arrival estimate' },
  { icon: '📍', title: 'Dubai Service', desc: 'Contact us to confirm availability in your area' },
  { icon: '💬', title: 'Clear Quotes', desc: 'Ask our team for pricing before booking' },
  { icon: '🚚', title: 'Towing & Recovery', desc: 'Contact our team to discuss your vehicle needs' },
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
