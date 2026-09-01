import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal';
import './NotFound.css';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>404 Page Not Found | Usama Car Towing</title>
        <meta
          name="description"
          content="The page you're looking for doesn't exist or may have been moved. Usama Car Towing provides 24/7 towing and roadside assistance across Dubai. Return home or call +971 58 672 9393."
        />
      </Helmet>

      <Navbar />

      <main className="notfound-wrap">
        <div className="notfound" id="notfound">
          <Reveal direction="up">
            <div className="notfound-visual" aria-hidden="true">
              <svg
                viewBox="0 0 640 340"
                className="tow-illustration"
                role="img"
                aria-label="Tow truck recovering a car"
              >
                <defs>
                  <linearGradient id="tow-glow" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f5b400" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#f5b400" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="tow-body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2a3a5e" />
                    <stop offset="100%" stopColor="#141d33" />
                  </linearGradient>
                </defs>

                {/* road */}
                <ellipse cx="320" cy="305" rx="300" ry="14" fill="rgba(245,180,0,0.06)" />

                {/* ground line */}
                <line
                  x1="30"
                  y1="310"
                  x2="610"
                  y2="310"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="2"
                />

                {/* tow truck cab */}
                <path
                  d="M60 250 L60 300 L130 300 L130 255 L160 255 L160 210 L120 210 L105 185 L80 185 L75 210 L60 210 Z"
                  fill="url(#tow-body)"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                />
                {/* windshields */}
                <path
                  d="M82 192 L106 192 L118 215 L86 215 Z"
                  fill="rgba(6,9,20,0.85)"
                />
                {/* headlight */}
                <circle cx="152" cy="242" r="6" fill="#f5b400" />
                <circle cx="152" cy="242" r="10" fill="url(#tow-glow)" />

                {/* boom arm */}
                <line
                  x1="140"
                  y1="225"
                  x2="300"
                  y2="150"
                  stroke="#f5b400"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                <line
                  x1="300"
                  y1="150"
                  x2="300"
                  y2="252"
                  stroke="#f5b400"
                  strokeWidth="7"
                  strokeLinecap="round"
                />

                {/* car being towed */}
                <g>
                  <path
                    d="M300 230 C310 215 375 215 385 230 L395 250 L300 250 Z"
                    fill="#22304f"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="2"
                  />
                  <path
                    d="M312 222 C322 213 368 213 376 222 L380 232 L310 232 Z"
                    fill="rgba(6,9,20,0.7)"
                  />
                  <circle cx="322" cy="268" r="16" fill="#0a0e1a" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                  <circle cx="322" cy="268" r="7" fill="#f5b400" />
                  <circle cx="392" cy="268" r="16" fill="#0a0e1a" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                  <circle cx="392" cy="268" r="7" fill="#f5b400" />
                  {/* tow hook */}
                  <circle cx="300" cy="222" r="5" fill="#f5b400" />
                </g>

                {/* front wheels of truck */}
                <circle cx="92" cy="300" r="17" fill="#0a0e1a" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                <circle cx="92" cy="300" r="8" fill="#f5b400" />
                <circle cx="122" cy="300" r="17" fill="#0a0e1a" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                <circle cx="122" cy="300" r="8" fill="#f5b400" />

                {/* dust / motion lines */}
                <path
                  d="M180 270 q10 -8 22 -4 M200 280 q14 -10 30 -6"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </Reveal>

          <div className="notfound-code">404</div>

          <Reveal direction="up" delay={120}>
            <h1 className="notfound-title">
              Looks Like This Page Took a <span className="highlight">Wrong Turn</span>
            </h1>
          </Reveal>

          <Reveal direction="up" delay={220}>
            <p className="notfound-text">
              The page you're looking for doesn't exist or may have been moved.
              Don't worry — we're here to get you back on the road.
            </p>
          </Reveal>

          <Reveal direction="up" delay={320}>
            <div className="notfound-actions">
              <Link to="/" className="nf-btn nf-btn-primary">
                Back to Home
              </Link>
              <Link to="/services" className="nf-btn nf-btn-outline">
                View Our Services
              </Link>
              <a href="tel:+971586729393" className="nf-btn nf-btn-phone">
                📞 Call Us 24/7
              </a>
            </div>
          </Reveal>

          <Reveal direction="up" delay={420}>
            <div className="notfound-trust">
              <p className="notfound-trust-title">
                Need immediate roadside assistance in Dubai?
              </p>
              <p className="notfound-trust-sub">
                Available 24/7 across Dubai. <a href="tel:+971586729393">+971 58 672 9393</a>
              </p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={520}>
            <ul className="notfound-links" aria-label="Popular services">
              <li>
                <Link to="/services/emergency-towing">Emergency Towing</Link>
              </li>
              <li>
                <Link to="/services/roadside-assistance">Roadside Assistance</Link>
              </li>
              <li>
                <Link to="/services/accident-recovery">Accident Recovery</Link>
              </li>
              <li>
                <Link to="/services/battery-jump-start">Battery Jump Start</Link>
              </li>
            </ul>
          </Reveal>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default NotFound;
