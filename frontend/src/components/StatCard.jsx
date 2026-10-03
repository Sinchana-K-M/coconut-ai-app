import React from 'react';

export default function StatCard({ label, value, isAccuracy = false, color = null }) {
  return (
    <div className={`stat-card ${isAccuracy ? 'stat-accuracy' : ''}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>{value}</div>
    </div>
  );
}
