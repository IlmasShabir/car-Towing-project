import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';
import './CoverageMap.css';

// Short list shown on the homepage preview
const primaryAreas = [
  'Downtown Dubai',
  'Dubai Marina',
  'JBR & JLT',
  'Sheikh Zayed Road',
  'Al Quoz',
  'Al Barsha',
  'Deira & Bur Dubai',
  'All Dubai Areas',
];

// Full list shown on the Coverage Areas page
const allAreas = [
  'Downtown Dubai', 'Dubai Marina', 'JBR & JLT', 'Sheikh Zayed Road',
  'Al Quoz', 'Al Barsha', 'Deira & Bur Dubai', 'Jumeirah', 'Business Bay',
  'JVC', 'Dubai Silicon Oasis', 'Qusais', 'Nahda', 'Al Warqa', 'Khawaneej',
  'Al Rashidiya', 'Mirdif', 'International City', 'Palm Jumeirah',
  'Damac Hills', 'Mudon', 'Nad Al Hamar', 'Nad Al Sheba', 'All Dubai Areas',
];

// Decorative SVG "coverage radius" map - illustrative, not a real geographic
// map. Uses the site's gold/navy brand colors instead of a literal map.
const CoverageMapVisual = () => (
  <svg viewBox="0 0 500 400" className="coverage-map-svg" role="img" aria-label="Dubai service coverage map">
    <rect x="0" y="0" width="500" height="400" rx="24" className="map-bg" />

    {/* Faint road lines for map texture */}
    <line x1="20" y1="70" x2="460" y2="140" className="map-road" />
    <line x1="10" y1="260" x2="480" y2="200" className="map-road" />
    <line x1="60" y1="380" x2="420" y2="30" className="map-road" />
    <text x="30" y="62" className="map-road-label">Al Khail Road</text>
    <text x="330" y="24" className="map-road-label">Sheikh Zayed Road</text>
    <text x="300" y="392" className="map-road-label">Emirates Road</text>

    {/* Coverage zone blob */}
    <path
      d="M150,90 L270,70 Q320,95 305,140 L345,165 Q390,155 405,195
         L385,270 Q360,315 300,330 L210,345 Q150,335 118,290
         L95,210 Q80,150 150,90 Z"
      className="map-coverage-zone"
    />

    {/* Concentric "service radius" rings */}
    <circle cx="245" cy="215" r="42" className="map-ring" />
    <circle cx="245" cy="215" r="74" className="map-ring" />
    <circle cx="245" cy="215" r="106" className="map-ring" />
    <circle cx="245" cy="215" r="138" className="map-ring" />

    <text x="245" y="219" textAnchor="middle" className="map-center-label">
      SERVICE RADIUS
    </text>

    {/* Area labels */}
    <text x="150" y="150" className="map-area-label">DOWNTOWN</text>
    <text x="120" y="255" className="map-area-label">DUBAI MARINA</text>
    <text x="340" y="120" className="map-area-label">DEIRA</text>
    <text x="290" y="300" className="map-area-label">JUMEIRAH</text>
    <text x="330" y="230" className="map-area-label">BUSINESS BAY</text>
    <text x="200" y="190" className="map-area-label">AL QUOZ</text>
    <text x="270" y="260" className="map-area-label">AL BARSHA</text>
    <text x="180" y="280" className="map-area-label">AL RIGGAL</text>
    <text x="220" y="330" className="map-area-label">AL WARQA</text>
    <text x="300" y="180" className="map-area-label">JVC</text>
    <text x="360" y="160" className="map-area-label">JBR</text> 
    <text x="400" y="220" className="map-area-label">SHEIKH ZAYED ROAD</text>
    <text x="100" y="200" className="map-area-label">AL KHAIL ROAD</text>
    <text x="50" y="300" className="map-area-label">EMIRATES ROAD</text>
   <text x="150" y="350" className="map-area-label">Al Rashidiya</text>
    <text x="250" y="350" className="map-area-label">Mirdif</text>

    {/* Small location markers */}
    {[
      [150, 150], [120, 255], [340, 120], [290, 300], [330, 230],
      [245, 215], [200, 190], [270, 260],
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="4.5" className="map-marker-dot" />
    ))}
  </svg>
);

const CoverageMap = ({ full = false }) => {
  const areas = full ? allAreas : primaryAreas;

  return (
    <section className="coverage-section">
      <div className="coverage-inner">
        <Reveal direction="left" className="coverage-map-wrapper">
          <CoverageMapVisual />
        </Reveal>

        <Reveal direction="right" delay={150} className="coverage-text">
          <h2 className="section-title coverage-title">
            {full ? (
              <>
                AREAS WE <span className="highlight">SERVE</span>
              </>
            ) : (
              <>
                OUR <span className="highlight">COVERAGE</span> AREA
              </>
            )}
          </h2>

          <ul className="coverage-list">
            {areas.map((area) => (
              <li key={area}>
                <span className="coverage-pin">📍</span> {area}
              </li>
            ))}
          </ul>

          <div className="coverage-outside-cta">
            <h3>Need Service Outside Dubai?</h3>
            <p>We also serve Sharjah, Abu Dhabi, and Northern Emirates</p>
            <Link to="/contact" className="coverage-outside-btn">
              Contact Us for Details
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CoverageMap;
