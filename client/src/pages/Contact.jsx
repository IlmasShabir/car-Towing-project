import React from 'react';
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
    label: 'Working Hours',
    value: '24 Hours / 7 Days a Week'
  }
];

const Contact = () => {
  return (
    <>
     <Helmet>
            <title>Car Towing in Dubai | 24/7 Tow Truck Service</title>
    
            <meta
              name="description"
              content="Need car towing in Dubai? Get fast 24/7 towing and emergency vehicle recovery with Usama Car Towing."
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
              Contact us anytime for emergency towing or any inquiries.
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
