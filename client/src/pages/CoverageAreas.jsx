import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import CoverageMap from "../components/CoverageMap";
import CTABanner from "../components/CTABanner";
import Reveal from "../components/Reveal";
import Footer from "../components/Footer";
import { Helmet } from "react-helmet-async";

const CoverageAreas = () => {
  return (
    <>
      <Helmet>
        <title>Best Towing Services Near Me in Dubai | Usama Car Towing</title>
        <meta name="description" content="Check the areas we cover across Dubai for fast, 24/7 car towing and roadside assistance." />
        <link rel="canonical" href="https://cartowingservicedubai.com/coverage-areas" />
      </Helmet>
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
