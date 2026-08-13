import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';
import { getImage } from '../utils/getImage';
import { getServices } from '../api/serviceApi';
import seedServices from '../data/services';
import truckImage from '../assets/images/tow-truck-dubai.jpg';
import './ServicesGrid.css';

// Every service always shows a real photo (no icons):
// 1. An image uploaded via the admin dashboard (service.image), or
// 2. A photo placed at src/assets/images/services/<slug>.jpg, or
// 3. The default truck photo as a last resort.
//
// mobileLimit: on small screens, only show this many cards (rest are hidden via CSS,
// not removed from the DOM) - pair it with showViewAll so users can still reach the rest.
const ServicesGrid = ({ limit, showViewAll = false, mobileLimit }) => {
  const [services, setServices] = useState(seedServices);

  useEffect(() => {
    getServices()
      .then((data) => {
        if (data.length > 0) setServices(data);
      })
      .catch(() => {
        // Backend not reachable - keep showing the built-in service list
      });
  }, []);

  const list = limit ? services.slice(0, limit) : services;
  const gridClass = mobileLimit
    ? `services-grid services-grid-mobile-limit-${mobileLimit}`
    : 'services-grid';

  return (
    <section className="services-grid-section">
      <Reveal>
        <div className="services-grid-header">
          <h2 className="section-title">
            OUR <span className="highlight">SERVICES</span>
          </h2>
          {showViewAll && (
            <Link to="/services" className="view-all-link">
              View All Services →
            </Link>
          )}
        </div>
      </Reveal>

      <div className={gridClass}>
        {list.map((service, i) => {
          const photo = service.image || getImage('services', service.slug) || truckImage;
          return (
            <Reveal key={service.slug} delay={(i % 4) * 90}>
              <Link to={`/services/${service.slug}`} className="service-card">
                <div className="service-card-img" style={{ backgroundImage: `url(${photo})` }} />
                <h4>{service.name}</h4>
                <p>{service.shortDesc}</p>
                <span className="service-card-link">Read More →</span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};

export default ServicesGrid;

