import { useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const W = 640;
const H = 220;
const PAD = { top: 14, right: 12, bottom: 26, left: 34 };

const GRID = '#e8ecf4';
const AXIS = '#9aa8bd';

/* ---------------------------------------------------------------
   Area / line chart — real data only, renders whatever points
   it is given ({ label, value }).
   --------------------------------------------------------------- */

export const AreaChart = ({ data, color = '#f5b400', formatValue }) => {
  const [tip, setTip] = useState(null);
  const gradId = useId();

  const { points, max, min, areaPath, linePath } = useMemo(() => {
    if (!data || data.length === 0) {
      return { points: [], max: 0, min: 0, areaPath: '', linePath: '' };
    }
    const values = data.map((d) => Number(d.value) || 0);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const step = innerW / Math.max(data.length - 1, 1);

    const pts = data.map((d, i) => ({
      x: PAD.left + step * i,
      y: PAD.top + innerH - ((Number(d.value) || 0) - min) * (innerH / range),
      label: d.label,
      value: Number(d.value) || 0,
    }));

    const line = pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');
    const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${pts[0].x.toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;

    return { points: pts, max, min, areaPath: area, linePath: line };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="a-chart-canvas" style={{ color: 'var(--a-muted)', fontSize: 12.5, textAlign: 'center', paddingBottom: 30 }}>
        No data yet — bookings will appear here once requests come in.
      </div>
    );
  }

  const ticks = [0, 1, 2, 3].map((i) => {
    const value = Math.round(min + (max - min) * (i / 3));
    return { y: PAD.top + (H - PAD.top - PAD.bottom) * (1 - i / 3), value };
  });

  return (
    <div className="a-chart-canvas">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Trend chart">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.26" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t.y}>
            <line x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y} stroke={GRID} strokeWidth="1" />
            <text x={PAD.left - 8} y={t.y + 3.5} textAnchor="end" fontSize="10" fill={AXIS}>
              {formatValue ? formatValue(t.value) : t.value}
            </text>
          </g>
        ))}

        {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((p) => (
          <circle
            key={p.x}
            cx={p.x}
            cy={p.y}
            r="4.5"
            fill="#fff"
            stroke={color}
            strokeWidth="2.2"
            style={{ cursor: 'pointer' }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
              const scale = rect.width / W;
              const x = Math.min(Math.max(rect.left + p.x * scale, 70), window.innerWidth - 70);
              setTip({ x, y: rect.top + p.y * scale, label: p.label, value: p.value });
            }}
            onMouseLeave={() => setTip(null)}
          />
        ))}

        <g>
          {points.map((p, i) =>
            i % Math.ceil(points.length / 7) === 0 || i === points.length - 1 ? (
              <text key={p.x} x={p.x} y={H - 8} textAnchor="middle" fontSize="9.5" fill={AXIS}>
                {p.label.split(',').slice(-1)[0].trim()}
              </text>
            ) : null,
          )}
        </g>
      </svg>

      {tip &&
        createPortal(
          <div className="a-chart-tooltip" style={{ left: tip.x, top: tip.y }}>
            <strong>{tip.label}</strong> · {formatValue ? formatValue(tip.value) : tip.value}
          </div>,
          document.body,
        )}
    </div>
  );
};

/* ---------------------------------------------------------------
   Donut chart — distribution of { label, value, color }
   --------------------------------------------------------------- */

export const DonutChart = ({ data, size = 150, thickness = 20, centerLabel, centerValue }) => {
  const total = useMemo(() => data.reduce((sum, d) => sum + (Number(d.value) || 0), 0), [data]);

  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--a-muted)', fontSize: 12.5, padding: '34px 0 40px' }}>
        No data yet.
      </div>
    );
  }

  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  const segments = data.reduce((acc, d) => {
    const fraction = (Number(d.value) || 0) / total;
    const prevOffset = acc.reduce((sum, seg) => sum + seg.fraction, 0);
    const gap = acc.length ? 3 : 0;
    const dash = `${Math.max(0, fraction * circumference - gap)} ${circumference}`;
    acc.push({ ...d, fraction, dash, offset: -prevOffset * circumference });
    return acc;
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribution chart">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#edf0f6" strokeWidth={thickness} />
        {segments.map((seg) => (
          <circle
            key={seg.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={seg.dash}
            strokeDashoffset={seg.offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="butt"
          >
            <title>{`${seg.label}: ${seg.value} (${Math.round(seg.fraction * 100)}%)`}</title>
          </circle>
        ))}
        {centerLabel && (
          <text x="50%" y="47%" textAnchor="middle" fontSize={size * 0.1} fontWeight="700" fill="#0f172a">
            {centerValue ?? total}
          </text>
        )}
        {centerLabel && (
          <text x="50%" y="58%" textAnchor="middle" fontSize={size * 0.055} fill={AXIS}>
            {centerLabel}
          </text>
        )}
      </svg>
      <div className="a-chart-legend" style={{ padding: 0, flexDirection: 'column', gap: 8 }}>
        {segments.map((seg) => (
          <div className="a-chart-legend-item" key={seg.label}>
            <span className="a-chart-legend-swatch" style={{ background: seg.color }} />
            {seg.label}
            <strong style={{ marginLeft: 'auto', color: 'var(--a-text)' }}>{seg.value}</strong>
            <span style={{ minWidth: 38, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {Math.round(seg.fraction * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------
   Vertical bars
   --------------------------------------------------------------- */

export const BarChart = ({ data, color = '#f5b400' }) => {
  const max = useMemo(() => Math.max(...data.map((d) => Number(d.value) || 0), 1), [data]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 110 }}>
      {data.map((d) => {
        const value = Number(d.value) || 0;
        const h = (value / max) * 100;
        return (
          <div
            key={d.label}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              height: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <span style={{ fontSize: 10.5, fontWeight: 650, color: 'var(--a-text)', fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </span>
            <div
              title={`${d.label}: ${value}`}
              style={{
                width: '100%',
                maxWidth: 34,
                height: `${h}%`,
                minHeight: value ? 5 : 2,
                borderRadius: '7px 7px 2px 2px',
                background: value ? `linear-gradient(180deg, ${color}, ${color}88)` : '#e8ecf3',
                transition: 'filter 0.15s ease, transform 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!value) return;
                e.currentTarget.style.filter = 'brightness(1.06)';
                e.currentTarget.style.transform = 'scaleY(1.03)';
                e.currentTarget.style.transformOrigin = 'bottom';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = '';
                e.currentTarget.style.transform = '';
              }}
            />
            <span style={{ fontSize: 10, color: 'var(--a-faint)' }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
};