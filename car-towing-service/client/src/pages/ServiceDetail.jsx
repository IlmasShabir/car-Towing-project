import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';
import { getImage } from '../utils/getImage';
import { getServices } from '../api/serviceApi';
import seedServices from '../data/services';
import truckImage from '../assets/images/tow-truck-dubai.jpg';
import './ServiceDetail.css';

const ServiceDetail = () => {
  const { slug } = useParams();
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

  const service = services.find((s) => s.slug === slug) || services[0];

  // Main photo priority: admin-uploaded image -> assets/images/services/<slug>.jpg -> default
  const mainPhoto = service.image || getImage('services', service.slug) || truckImage;
  const thumbs = ['1', '2', '3']
    .map((n) => getImage('services', `${service.slug}-${n}`))
    .filter(Boolean);

  return (
    <>
      <Navbar />
      <PageHeader title={service.name} crumb={`Services / ${service.name}`} />

      <section className="service-detail">
        <div className="service-detail-inner">
          <Reveal direction="left" className="service-detail-media">
            <img src={mainPhoto} alt={service.name} className="service-detail-main-img" />
            {thumbs.length > 0 && (
              <div className="service-detail-thumbs">
                {thumbs.map((t) => (
                  <img key={t} src={t} alt="" />
                ))}
              </div>
            )}
          </Reveal>

          <Reveal direction="right" delay={150} className="service-detail-content">
            <h2>{service.name}</h2>
            <p className="service-detail-desc">{service.longDesc}</p>
            <ul className="service-detail-features">
              {(service.features || []).map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <a href="tel:+971524242587" className="service-detail-cta">
              📞 Call Now: +971 52 424 2587
            </a>
          </Reveal>
        </div>

        <Reveal>
          <CTABanner />
        </Reveal>

        <Reveal>
          <p className="service-detail-more">
            Looking for something else?{' '}
            <Link to="/services">View all services →</Link>
          </p>
        </Reveal>
      </section>

      <Footer />
    </>
  );
};

export default ServiceDetail;

