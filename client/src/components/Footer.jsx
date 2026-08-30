import { Link } from 'react-router-dom';
import { FaFacebookF } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import { serviceContentList as seedServices } from '../data/serviceContent';
import { useServices } from '../context/ServicesContext';
import './Footer.css';

const Footer = () => {
  const { services, loading } = useServices();
  const displayServices = loading ? seedServices : services;

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-col footer-brand">
          <div className="footer-logo">
            <span>USAMA CAR TOWING </span>
          </div>
          <p>
            Professional towing services across Dubai. Fast, reliable and
            affordable towing available 24/7.
          </p>
        </div>

        <div className="footer-col">
          <h5>Quick Links</h5>
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/coverage-areas">Coverage Areas</Link>
          <Link to="/booking">Book Now</Link>
          <Link to="/reviews">Reviews</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/FAQ">FAQ</Link>
          <a href="/sitemap.html">Sitemap</a>
        </div>

        <div className="footer-col">
          <h5>Our Services</h5>
          {displayServices.map((s) => (
            <Link key={s.slug} to={`/services/${s.slug}`}>
              {s.name}
            </Link>
          ))}
        </div>

        <div className="footer-col">
          <h5>Contact Us</h5>
           <a href="tel:+971586729393">
        📞 +971 58 672 9393
      </a>
       <a href="mailto:sbcarstowing@gmail.com">
        ✉️ sbcarstowing@gmail.com
      </a>
          <p>📍 Dubai, United Arab Emirates</p>
          <h5 className="footer-hours-title">Working Hours</h5>
          <p>24 Hours / 7 Days a Week</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Usama Car Towing . All Rights Reserved.</p>
         <div className="footer-socials">
          <a href="https://www.facebook.com/share/1JZygL2Fr1/" aria-label="Facebook">
            <FaFacebookF />
          </a>
          <a href="https://www.tiktok.com/@cars.towing.servi" aria-label="TikTok">
            <FaTiktok />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;