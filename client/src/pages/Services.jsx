import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import ServicesGrid from '../components/ServicesGrid';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

const Services = () => {
  return (
    <>
      <Helmet>
        <title>Towing & Recovery Services in Dubai | Usama Car Towing</title>
        <meta name="description" content="Explore towing and roadside assistance services in Dubai." />
        <link rel="canonical" href="https://cartowingservicedubai.com/services" />
      </Helmet>
      <Navbar />
      <PageHeader title="OUR SERVICES" crumb="Services" />
      <ServicesGrid />
      <Footer />
    </>
  );
};

export default Services;
