import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { serviceContentList as seedServices } from "../data/serviceContent";
import { useServices } from "../context/ServicesContext";
import "./Navbar.css";
import logo from "../assets/images/logo (1).webp";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { services, loading, isShowDropdown, setIsShowDropDown } =
    useServices();
  const { pathname } = useLocation();

  const displayServices = loading ? seedServices : services;

  return (
    <nav className="navbar-custom">
      <Link to="/" className="navbar-logo">
        <div className="navbar-logo-wrapper">
          <img src={logo} alt="Usama Car Towing" className="navbar-logo-img" />
        </div>
      </Link>

      <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <li className={pathname === "/" ? "active" : ""}>
          <Link to="/">Home</Link>
        </li>
        <li className="dropdown">
          <Link
            to="/services"
            onClick={() => {
              setIsShowDropDown(true);
            }}
          >
            Services ▾
          </Link>
          {isShowDropdown && (
            <ul className="dropdown-menu">
              {displayServices.map((s) => (
                <li key={s.slug}>
                  <Link
                    onClick={() => setIsShowDropDown(false)}
                    to={`/services/${s.slug}`}
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
        <li className={pathname === "/coverage-areas" ? "active" : ""}>
          <Link to="/coverage-areas">Coverage Areas</Link>
        </li>
        <li className={pathname === "/reviews" ? "active" : ""}>
          <Link to="/reviews">Reviews</Link>
        </li>
        <li className={pathname === "/FAQ" ? "active" : ""}>
          <Link to="/FAQ">FAQ</Link>
        </li>
        <li className={pathname === "/contact" ? "active" : ""}>
          <Link to="/contact">Contact</Link>
        </li>
        <li className={pathname === "/about" ? "active" : ""}>
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
