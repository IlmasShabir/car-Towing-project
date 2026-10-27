import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import Reveal from "../components/Reveal";
import StatsBar from "../components/StatsBar";
import Footer from "../components/Footer";
import team from "../assets/images/team.jpg";
import { Helmet } from "react-helmet-async";
import "./About.css";

const points = [
  "Towing and vehicle recovery assistance",
  "Roadside assistance for common vehicle issues",
  "Service requests across Dubai",
  "Contact us to discuss your vehicle and location",
];

const About = () => {
  return (
    <>
      <Helmet>
        <title>Trusted Towing Services in Dubai | Usama Car Towing</title>
        <meta name="description" content="Learn about Usama Car Towing and the towing and roadside assistance services offered in Dubai." />
        <link rel="canonical" href="https://cartowingservicedubai.com/about" />
      </Helmet>
      <Navbar />
      <PageHeader title="ABOUT US" crumb="About Us" />

      <section className="about-section">
        <div className="about-inner">
          <Reveal direction="left" className="about-text">
            <span className="about-eyebrow">ABOUT US</span>
            <h2>Towing Assistance in Dubai</h2>
            <p>
              We provide towing and roadside assistance across Dubai. Contact
              our team with your vehicle details and location to discuss service.
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
