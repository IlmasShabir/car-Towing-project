import React from 'react';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import FAQAccordion from '../components/FAQAccordion';
import Footer from '../components/Footer';
import truckImage from '../assets/images/tow-truck.jpg.jpeg';
import './FAQ.css';

const FAQ = () => {
  return (
    <>
      <Navbar />
      <PageHeader title="FREQUENTLY ASKED QUESTIONS" crumb="FAQ" />

      <section className="faq-section">
        <div className="faq-inner">
          <Reveal direction="left" className="faq-media">
            <img src={truckImage} alt="Frequently asked questions" />
          </Reveal>

          <Reveal direction="right" delay={150} className="faq-content">
            <p className="faq-subtitle">
              Find answers to common questions about our service
            </p>
            <FAQAccordion />
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default FAQ;
