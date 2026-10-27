import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';
import './Contact.css';
import { Helmet } from "react-helmet-async";

const info = [
  {
    icon: '📞',
    label: 'Phone',
    value: '+971 58 672 9393',
    type: 'tel'
  },
  {
    icon: '✉️',
    label: 'Email',
    value: 'sbcarstowing@gmail.com',
    type: 'mailto'
  },
  {
    icon: '📍',
    label: 'Location',
    value: 'Dubai, United Arab Emirates'
  },
  {
    icon: '🕒',
    label: 'Availability',
    value: 'Contact us to confirm current availability'
  }
];

const Contact = () => {
  return (
    <>
     <Helmet>
            <title>Contact Us | Usama Car Towing</title>
    
            <meta
              name="description"
              content="Contact Usama Car Towing to discuss towing and vehicle recovery in Dubai."
            />
    
            <link
              rel="canonical"
              href="https://cartowingservicedubai.com/contact"
            />
          </Helmet>
      <Navbar />

      <PageHeader
        title="GET IN TOUCH"
        crumb="Contact"
      />

      <section className="contact-section">
        <div className="contact-inner">

          <Reveal
            direction="left"
            className="contact-info"
          >
            <h2>We're Here to Help You</h2>

            <p>
              Contact us about emergency towing or any inquiries.
            </p>

            <div className="contact-info-list">

              {info.map((item, index) => (
                <div
                  className="contact-info-item"
                  key={index}
                >

                  <span className="contact-info-icon">
                    {item.icon}
                  </span>

                  <div>

                    <span className="contact-info-label">
                      {item.label}
                    </span>

                    {item.type === 'tel' ? (
                      <a
                        href={`tel:${item.value.replace(/\s/g, '')}`}
                        className="contact-info-value contact-link"
                      >
                        {item.value}
                      </a>
                    ) : item.type === 'mailto' ? (
                      <a
                        href={`mailto:${item.value}`}
                        className="contact-info-value contact-link"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="contact-info-value">
                        {item.value}
                      </span>
                    )}

                  </div>

                </div>
              ))}

            </div>

          </Reveal>

          <Reveal
            direction="right"
            delay={150}
          >
            <ContactForm />
          </Reveal>

        </div>
      </section>

      <Footer />
    </>
  );
};

export default Contact;
