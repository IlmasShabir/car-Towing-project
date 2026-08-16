import { Link } from 'react-router-dom';
import Reveal from './Reveal';
import { getImage } from '../utils/getImage';
import { getServiceImageUrl } from '../utils/imageUrl';
import truckImage from '../assets/images/tow-truck-dubai.jpg';
import { useServices } from '../context/ServicesContext';
import './ServicesGrid.css';

const ServicesGrid = ({ limit, showViewAll = false, mobileLimit }) => {
  const { services, loading } = useServices();

  const list = limit ? services.slice(0, limit) : services;
  const gridClass = mobileLimit
    ? `services-grid services-grid-mobile-limit-${mobileLimit}`
    : 'services-grid';

  if (loading) {
    return <section className="services-grid-section"><p className="services-loading">Loading services...</p></section>;
  }

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
          const photo = getServiceImageUrl(service) || getImage('services', service.slug) || truckImage;
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