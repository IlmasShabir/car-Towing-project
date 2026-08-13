import React from 'react';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import ServicesGrid from '../components/ServicesGrid';
import Footer from '../components/Footer';

const Services = () => {
  return (
    <>
      <Navbar />
      <PageHeader title="OUR SERVICES" crumb="Services" />
      <ServicesGrid />
      <Footer />
    </>
  );
};

export default Services;
