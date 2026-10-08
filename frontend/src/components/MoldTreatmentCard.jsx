import React from 'react';
import { Bug, AlertOctagon, ShieldAlert } from 'lucide-react';

export default function MoldTreatmentCard({ moldData, isFungal }) {
  if (!moldData || !isFungal) return null;

  const riskColor = moldData.risk_level.includes('CRITICAL') ? '#dc2626' : moldData.risk_level.includes('HIGH') ? '#d97706' : '#2563eb';
  const riskBg = moldData.risk_level.includes('CRITICAL') ? '#fef2f2' : moldData.risk_level.includes('HIGH') ? '#fffbe6' : '#eff6ff';
  const riskBorder = moldData.risk_level.includes('CRITICAL') ? '#fca5a5' : moldData.risk_level.includes('HIGH') ? '#fde68a' : '#bfdbfe';

  return (
    <div className="card animate-fade-in" style={{ marginTop: '20px' }}>
      <div className="card-title" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bug size={20} color={riskColor} />
          <span>Fungal Contamination Protocol</span>
        </div>

        <span
          style={{
            backgroundColor: riskBg,
            color: riskColor,
            border: `1px solid ${riskBorder}`,
            padding: '4px 12px',
            borderRadius: '16px',
            fontWeight: 700,
            fontSize: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <AlertOctagon size={13} />
          {moldData.risk_level}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div style={{ background: riskBg, border: `1px solid ${riskBorder}`, borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Detected Strain</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: riskColor, margin: '2px 0', fontStyle: 'italic' }}>
            {moldData.scientific_name}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{moldData.common_name}</div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Storage Guidance</div>
          <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600, lineHeight: '1.4' }}>
            {moldData.treatment_recommendations?.[0] || 'Isolate contaminated batch immediately and sun-dry.'}
          </div>
        </div>
      </div>
    </div>
  );
}
