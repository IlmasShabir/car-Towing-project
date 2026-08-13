import React from 'react';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import CoverageMap from '../components/CoverageMap';
import CTABanner from '../components/CTABanner';
import Reveal from '../components/Reveal';
import Footer from '../components/Footer';

const CoverageAreas = () => {
  return (
    <>
      <Navbar />
      <PageHeader title="COVERAGE AREAS" crumb="Coverage Areas" />
      <CoverageMap full />
      <Reveal>
        <CTABanner
          title="Need Towing Service in Dubai?"
          subtitle="Call us now or send your location"
        />
      </Reveal>
      <Footer />
    </>
  );
};

export default CoverageAreas;
