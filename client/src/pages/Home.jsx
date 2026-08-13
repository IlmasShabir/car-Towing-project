import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import WhyChooseUs from '../components/WhyChooseUs';
import ServicesGrid from '../components/ServicesGrid';
import HowItWorks from '../components/HowItWorks';
import CoverageMap from '../components/CoverageMap';
import Fleet from '../components/Fleet';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <WhyChooseUs />
      <ServicesGrid limit={8} showViewAll mobileLimit={4} />
      <HowItWorks />
      <CoverageMap />
      <Fleet />
      <Testimonials />
      <Footer />
    </>
  );
};

export default Home;
