
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';
import { getImage } from '../utils/getImage';
import { getServiceImageUrl } from '../utils/imageUrl';
import { normalizeFeatures } from '../utils/features';
import truckImage from '../assets/images/tow-truck-dubai.jpg';
import { useServices } from '../context/ServicesContext';
import { Helmet } from 'react-helmet-async';
import './ServiceDetail.css';

const ServiceDetail = () => {
  const { slug } = useParams();
  const { services, loading } = useServices();

  const service = services.find((s) => s.slug === slug) || services[0];

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading... | Usama Car Towing</title>
        </Helmet>
        <Navbar />
        <PageHeader title="Loading..." crumb="Services" />
        <section className="service-detail"><p>Loading...</p></section>
        <Footer />
      </>
    );
  }

  if (!service) {
    return (
      <>
        <Helmet>
          <title>Service Not Found | Usama Car Towing</title>
        </Helmet>
        <Navbar />
        <PageHeader title="Service Not Found" crumb="Services" />
        <section className="service-detail"><p>The requested service could not be found. <Link to="/services">View all services</Link></p></section>
        <Footer />
      </>
    );
  }

  // Main photo priority: admin-uploaded image -> assets/images/services/<slug>.jpg -> default
  const mainPhoto = getServiceImageUrl(service) || getImage('services', service.slug) || truckImage;
  const thumbs = ['1', '2', '3']
    .map((n) => getImage('services', `${service.slug}-${n}`))
    .filter(Boolean);

  return (
    <>
      <Helmet>
        <title>{service.seoTitle || `${service.name} | Usama Car Towing`}</title>
        <meta name="description" content={service.longDesc} />
      </Helmet>
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
            <h2 className="service-detail-title">{ service.name}</h2>
            <p className="service-detail-desc">{service.longDesc}</p>
            <ul className="service-detail-features">
              {normalizeFeatures(service.features).map((f) => (
                <li key={f}><span className="service-feature-tick">✓</span> {f}</li>
              ))}
            </ul>
            <a href="tel:+971586729393" className="service-detail-cta">
              📞 Call Now: +971586729393
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