import React from 'react';
import Reveal from './Reveal';
import './StatsBar.css';

const stats = [
  { number: '10+', label: 'Years Experience' },
  { number: '5000+', label: 'Happy Clients' },
  { number: '50+', label: 'Tow Trucks' },
  { number: '24/7', label: 'Service Available' },
];

const StatsBar = () => (
  <div className="stats-bar">
    {stats.map((stat, i) => (
      <Reveal key={stat.label} delay={i * 90} className="stats-bar-item">
        <span className="stats-bar-number">{stat.number}</span>
        <span className="stats-bar-label">{stat.label}</span>
      </Reveal>
    ))}
  </div>
);

export default StatsBar;
