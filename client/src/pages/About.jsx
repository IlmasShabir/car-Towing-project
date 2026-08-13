import React from 'react';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import StatsBar from '../components/StatsBar';
import Footer from '../components/Footer';
import team from '../assets/images/team.jpg.jpeg';
import './About.css';

const points = [
  '24/7 Premium Towing Service',
  'Modern Fleet & Equipment',
  'Experienced & Trained Team',
  'Affordable & Transparent Pricing',
  'Customer Satisfaction Guaranteed',
];

const About = () => {
  return (
    <>
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
