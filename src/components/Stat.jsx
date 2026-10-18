import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function Stat({ title, value, change, up, icon: Icon, color, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className={`stat-icon ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <strong>{value}</strong>
      <div className="stat-bottom">
        <span className={up ? 'trend-up' : 'trend-neutral'}>
          {up ? <ArrowUpRight size={13} /> : null}
          {change}
        </span>
        <span>{sub}</span>
      </div>
    </div>
  );
}
