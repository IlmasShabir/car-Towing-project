import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getServices } from '../api/serviceApi';
import seedServices from '../data/services';
import './Navbar.css';
import logo from '../assets/images/logo.png';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [services, setServices] = useState(seedServices);
  const { pathname } = useLocation();

  useEffect(() => {
    getServices()
      .then((data) => {
        if (data.length > 0) setServices(data);
      })
      .catch(() => {
        // Backend not reachable - keep showing the built-in service list
      });
  }, []);

  return (
    <nav className="navbar-custom">
     <Link to="/" className="navbar-logo">
  <div className="navbar-logo-wrapper">
    <img
      src={logo}
      alt="Usama Car Towing"
      className="navbar-logo-img"
    />
  </div>
</Link>

      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <li className={pathname === '/' ? 'active' : ''}>
          <Link to="/">Home</Link>
        </li>
        <li
          className="dropdown"
          onMouseEnter={() => setServicesOpen(true)}
          onMouseLeave={() => setServicesOpen(false)}
        >
          <Link to="/services">Services ▾</Link>
          {servicesOpen && (
            <ul className="dropdown-menu">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link to={`/services/${s.slug}`}>{s.name}</Link>
                </li>
              ))}
            </ul>
          )}
        </li>
        <li className={pathname === '/coverage-areas' ? 'active' : ''}>
          <Link to="/coverage-areas">Coverage Areas</Link>
        </li>
        <li className={pathname === '/reviews' ? 'active' : ''}>
          <Link to="/reviews">Reviews</Link>
        </li>
         <li className={pathname === '/FAQ' ? 'active' : ''}>
          <Link to="/FAQ">FAQ</Link>
        </li>
        <li className={pathname === '/contact' ? 'active' : ''}>
          <Link to="/contact">Contact</Link>
        </li>
         <li className={pathname === '/about' ? 'active' : ''}>
          <Link to="/about">About Us</Link>
        </li>
      </ul>

      <a href="tel:+971586729393" className="navbar-call-btn">
        📞 +971 58 672 9393
      </a>

      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
    </nav>
  );
};

export default Navbar;
