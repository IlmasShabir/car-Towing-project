import React from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import Reveal from "../components/Reveal";
import StatsBar from "../components/StatsBar";
import Footer from "../components/Footer";
import team from "../assets/images/team.jpg";
import { Helmet } from "react-helmet-async";
import "./About.css";

const points = [
  "24/7 Premium Towing Service",
  "Modern Fleet & Equipment",
  "Experienced & Trained Team",
  "Affordable & Transparent Pricing",
  "Customer Satisfaction Guaranteed",
];

const About = () => {
  return (
    <>
      <Helmet>
        <title>Trusted Towing Services in Dubai | Usama Car Towing</title>
        <meta name="description" content="Learn about Usama Car Towing - Dubai's most trusted 24/7 towing service with a modern fleet and experienced team." />
        <link rel="canonical" href="https://cartowingservicedubai.com/about" />
      </Helmet>
      <Navbar />
      <PageHeader title="ABOUT US" crumb="About Us" />

      <section className="about-section">
        <div className="about-inner">
          <Reveal direction="left" className="about-text">
            <span className="about-eyebrow">ABOUT US</span>
            <h2>Dubai's Most Trusted Towing Service</h2>
            <p>
              We are a team of professional tow truck operators dedicated to
              providing fast, reliable and affordable towing services across
              Dubai.
            </p>
            <ul className="about-checklist">
              {points.map((p) => (
                <li key={p}>✓ {p}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal direction="right" delay={150}>
            <img src={team} alt="Our team" className="about-img" />
          </Reveal>
        </div>

        <StatsBar />
      </section>

      <Footer />
    </>
  );
};

export default About;
