import React from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import Reveal from "../components/Reveal";
import FAQAccordion from "../components/FAQAccordion";
import Footer from "../components/Footer";
import truckImage from "../assets/images/tow-truck-dubai.jpg";
import { Helmet } from "react-helmet-async";
import "./FAQ.css";

const FAQ = () => {
  return (
    <>
      <Helmet>
        <title>Towing Service FAQs | Usama Car Towing</title>
        <meta name="description" content="Answers to common questions about our 24/7 car towing and roadside assistance service in Dubai." />
      </Helmet>
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
