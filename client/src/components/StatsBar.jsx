import Reveal from './Reveal';
import './StatsBar.css';

const stats = [
  { label: 'Towing Assistance' },
  { label: 'Vehicle Recovery' },
  { label: 'Roadside Assistance' },
  { label: 'Dubai Service Area' },
];

const StatsBar = () => (
  <div className="stats-bar">
    {stats.map((stat, i) => (
      <Reveal key={stat.label} delay={i * 90} className="stats-bar-item">
        {stat.number && <span className="stats-bar-number">{stat.number}</span>}
        <span className="stats-bar-label">{stat.label}</span>
      </Reveal>
    ))}
  </div>
);

export default StatsBar;
