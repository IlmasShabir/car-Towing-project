import React from 'react';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import ServicesGrid from '../components/ServicesGrid';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

const Services = () => {
  return (
    <>
      <Helmet>
        <title>Our Services | Usama Car Towing</title>
        <meta name="description" content="Explore our full range of towing and roadside assistance services in Dubai, available 24/7." />
      </Helmet>
      <Navbar />
      <PageHeader title="OUR SERVICES" crumb="Services" />
      <ServicesGrid />
      <Footer />
    </>
  );
};

export default Services;
