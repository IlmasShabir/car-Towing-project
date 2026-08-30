
// import { useParams, Link } from 'react-router-dom';
// import Navbar from '../components/Navbar';
// import PageHeader from '../components/PageHeader';
// import Reveal from '../components/Reveal';
// import CTABanner from '../components/CTABanner';
// import Footer from '../components/Footer';
// import { getImage } from '../utils/getImage';
// import { getServiceImageUrl } from '../utils/imageUrl';
// import { normalizeFeatures } from '../utils/features';
// import truckImage from '../assets/images/tow-truck-dubai.jpg';
// import { useServices } from '../context/ServicesContext';
// import { Helmet } from 'react-helmet-async';
// import './ServiceDetail.css';

// const ServiceDetail = () => {
//   const { slug } = useParams();
//   const { services, loading } = useServices();

//   const service = services.find((s) => s.slug === slug) || services[0];

//   if (loading) {
//     return (
//       <>
//         <Helmet>
//           <title>Loading... | Usama Car Towing</title>
//         </Helmet>
//         <Navbar />
//         <PageHeader title="Loading..." crumb="Services" />
//         <section className="service-detail"><p>Loading...</p></section>
//         <Footer />
//       </>
//     );
//   }

//   if (!service) {
//     return (
//       <>
//         <Helmet>
//           <title>Service Not Found | Usama Car Towing</title>
//         </Helmet>
//         <Navbar />
//         <PageHeader title="Service Not Found" crumb="Services" />
//         <section className="service-detail"><p>The requested service could not be found. <Link to="/services">View all services</Link></p></section>
//         <Footer />
//       </>
//     );
//   }

//   // Main photo priority: admin-uploaded image -> assets/images/services/<slug>.jpg -> default
//   const mainPhoto = getServiceImageUrl(service) || getImage('services', service.slug) || truckImage;
//   const thumbs = ['1', '2', '3']
//     .map((n) => getImage('services', `${service.slug}-${n}`))
//     .filter(Boolean);

//   return (
//     <>
//       <Helmet>
//         <title>{service.seoTitle || `${service.name} | Usama Car Towing`}</title>
//         <meta name="description" content={service.longDesc} />
//       </Helmet>
//       <Navbar />
//       <PageHeader title={service.name} crumb={`Services / ${service.name}`} />

//       <section className="service-detail">
//         <div className="service-detail-inner">
//           <Reveal direction="left" className="service-detail-media">
//             <img src={mainPhoto} alt={service.name} className="service-detail-main-img" />
//             {thumbs.length > 0 && (
//               <div className="service-detail-thumbs">
//                 {thumbs.map((t) => (
//                   <img key={t} src={t} alt="" />
//                 ))}
//               </div>
//             )}
//           </Reveal>

//           <Reveal direction="right" delay={150} className="service-detail-content">
//             <h2 className="service-detail-title">{ service.name}</h2>
//             <p className="service-detail-desc">{service.longDesc}</p>
//             <ul className="service-detail-features">
//               {normalizeFeatures(service.features).map((f) => (
//                 <li key={f}><span className="service-feature-tick">✓</span> {f}</li>
//               ))}
//             </ul>
//             <a href="tel:+971586729393" className="service-detail-cta">
//               📞 Call Now: +971586729393
//             </a>
//           </Reveal>
//         </div>

//         <Reveal>
//           <CTABanner />
//         </Reveal>

//         <Reveal>
//           <p className="service-detail-more">
//             Looking for something else?{' '}
//             <Link to="/services">View all services →</Link>
//           </p>
//         </Reveal>
//       </section>

//       <Footer />
//     </>
//   );
// };

// export default ServiceDetail;

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
import serviceContent from '../data/serviceContent';
import './ServiceDetail.css';

// Renders **bold** markdown segments as <strong>
const renderText = (text) => {
  const parts = String(text).split('**');
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
};

const ServiceDetail = () => {
  const { slug } = useParams();
  const { services, loading } = useServices();

  const service = services.find((s) => s.slug === slug) || services[0];
  const fallback = serviceContent[service?.slug] || serviceContent[services[0]?.slug] || null;
  const content = service
    ? {
        h1: service.h1 || fallback?.h1 || service.name,
        metaDescription: service.metaDescription || fallback?.metaDescription || service.shortDesc,
        intro:
          service.intro && service.intro.length
            ? service.intro
            : fallback?.intro?.length
            ? fallback.intro
            : [service.shortDesc].filter(Boolean),
        sections:
          service.sections && service.sections.length
            ? service.sections
            : fallback?.sections || [],
        primaryKeyword: service.primaryKeyword || fallback?.primaryKeyword || '',
        semanticKeywords:
          service.semanticKeywords && service.semanticKeywords.length
            ? service.semanticKeywords
            : fallback?.semanticKeywords || [],
        related:
          service.related && service.related.length
            ? service.related
            : fallback?.related || [],
      }
    : null;

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

  if (!service || !content) {
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
  const features = normalizeFeatures(service.features);
  const keywordList = content.primaryKeyword
    ? [content.primaryKeyword, ...(content.semanticKeywords || [])]
    : [];

  const relatedServices = (content.related || [])
    .map((rslug) => services.find((s) => s.slug === rslug))
    .filter(Boolean);

  return (
    <>
      <Helmet>
        <title>{service.seoTitle || `${service.name} | Usama Car Towing`}</title>
        <meta name="description" content={content.metaDescription || service.shortDesc} />
        {keywordList.length > 0 && <meta name="keywords" content={keywordList.join(', ')} />}
      </Helmet>

      <Navbar />
      <PageHeader title={content.h1} crumb={`Services / ${service.name}`} />

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
            <h2 className="service-detail-title">{service.name}</h2>
            {content.intro.map((p, i) => (
              <p key={i} className="service-detail-desc">{renderText(p)}</p>
            ))}
            <div className="service-detail-actions">
              <a href="tel:+971586729393" className="service-detail-cta">
                📞 Call Now: +971586729393
              </a>
              <a
                href="https://wa.me/971586729393"
                className="service-detail-cta-wa"
                target="_blank"
                rel="noreferrer"
              >
                💬 WhatsApp Us
              </a>
            </div>
          </Reveal>
        </div>

        {features.length > 0 && (
          <Reveal>
            <div className="service-features-strip">
              <h3 className="service-features-heading">Service Highlights</h3>
              <ul className="service-detail-features">
                {features.map((f) => (
                  <li key={f}>
                    <span className="service-feature-tick">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        <div className="service-detail-sections">
          {content.sections.map((section, si) => (
            <Reveal key={section.heading} delay={si * 40}>
              <div className="service-section">
                <h2 className="service-section-heading">{section.heading}</h2>
                {section.paragraphs &&
                  section.paragraphs.map((p, i) => (
                    <p key={i}>{renderText(p)}</p>
                  ))}
                {section.bullets && (
                  <ul className="service-section-list">
                    {section.bullets.map((b, i) => (
                      <li key={i}>
                        <span className="service-feature-tick">✓</span> {renderText(b)}
                      </li>
                    ))}
                  </ul>
                )}
                {section.afterList && <p>{renderText(section.afterList)}</p>}
                {section.steps && (
                  <ol className="service-section-steps">
                    {section.steps.map((s, i) => (
                      <li key={i}>
                        <span className="step-num">{i + 1}</span>
                        {renderText(s)}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {relatedServices.length > 0 && (
          <Reveal>
            <div className="service-related">
              <h2 className="service-related-title">Related Services</h2>
              <div className="service-related-grid">
                {relatedServices.map((r) => {
                  const rPhoto =
                    getServiceImageUrl(r) || getImage('services', r.slug) || truckImage;
                  return (
                    <Link key={r.slug} to={`/services/${r.slug}`} className="service-related-card">
                      <div className="service-related-img" style={{ backgroundImage: `url(${rPhoto})` }} />
                      <div className="service-related-body">
                        <h4>{r.name}</h4>
                        <span>View Service →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Reveal>
        )}

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
