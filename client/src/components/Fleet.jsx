import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';
import { getImage } from '../utils/getImage';
import truckImage from '../assets/images/tow-truck-dubai.jpg';
import './Fleet.css';

// Add photos to: src/assets/images/fleet/<slug>.jpg
// e.g. src/assets/images/fleet/flatbed.jpg, .../motorcycle-towing.jpg
const fleet = [
  { slug: 'flatbed',  name: 'Flatbed Tow Truck' },
  { slug: 'wheel-lift', name: 'Wheel Lift Tow Truck' },
  { slug: 'heavy-duty', name: 'Heavy Duty Tow Truck' },
  { slug: 'motorcycle-towing', name: 'Motorcycle Towing' },
];

const Fleet = () => (
  <section className="fleet-section">
    <Reveal>
      <div className="fleet-header">
        <h2 className="section-title">
          OUR <span className="highlight">FLEET</span>
        </h2>
        <Link to="/services" className="view-all-link">
          View All Fleet →
        </Link>
      </div>
    </Reveal>

    <div className="fleet-grid">
      {fleet.map((truck, i) => {
        const photo = getImage('fleet', truck.slug) || truckImage;
        return (
          <Reveal key={truck.name} delay={i * 90}>
            <div className="fleet-card">
              <div
                className="fleet-card-img"
                style={{ backgroundImage: `url(${photo})` }}
              >
                <span className="fleet-card-icon">{truck.icon}</span>
              </div>
              <h4>{truck.name}</h4>
            </div>
          </Reveal>
        );
      })}
    </div>
  </section>
);

export default Fleet;

