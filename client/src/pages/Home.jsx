import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import WhyChooseUs from '../components/WhyChooseUs';
import ServicesGrid from '../components/ServicesGrid';
import HowItWorks from '../components/HowItWorks';
import CoverageMap from '../components/CoverageMap';
import Fleet from '../components/Fleet';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Towing Services in Dubai | Usama Car Towing</title>
        <meta name="description" content="Car towing, vehicle recovery and roadside assistance in Dubai. Contact Usama Car Towing for service details and an arrival estimate." />
        <link rel="canonical" href="https://cartowingservicedubai.com/" />
      </Helmet>
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
