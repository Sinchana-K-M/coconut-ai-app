import React from 'react';
import { Bug, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function MoldTreatmentCard({ moldData, isFungal }) {
  if (!moldData || !isFungal) return null;

  const riskColor = moldData.risk_level.includes('CRITICAL') ? '#dc2626' : moldData.risk_level.includes('HIGH') ? '#d97706' : '#2563eb';
  const riskBg = moldData.risk_level.includes('CRITICAL') ? '#fef2f2' : moldData.risk_level.includes('HIGH') ? '#fffbe6' : '#eff6ff';
  const riskBorder = moldData.risk_level.includes('CRITICAL') ? '#fca5a5' : moldData.risk_level.includes('HIGH') ? '#fde68a' : '#bfdbfe';

  return (
    <div className="card" style={{ marginTop: '20px', borderTop: `4px solid ${riskColor}` }}>
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bug size={20} color={riskColor} />
          <span>Fungal Micro-Classification & Storage Protocol</span>
        </div>

        <span
          style={{
            backgroundColor: riskBg,
            color: riskColor,
            border: `1px solid ${riskBorder}`,
            padding: '4px 12px',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <AlertOctagon size={14} />
          {moldData.risk_level}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ background: riskBg, border: `1px solid ${riskBorder}`, borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Detected Mold Sub-Type</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: riskColor, margin: '4px 0', fontStyle: 'italic' }}>
            {moldData.scientific_name}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>{moldData.common_name}</div>
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#334155', marginBottom: '4px' }}>
            Visual Indicators Detected:
          </div>
          <div style={{ fontSize: '13px', color: '#4b5563', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            {moldData.visual_indicators}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '6px', display: 'flex', gap: '12px' }}>
            <span>Dark Rot Ratio: <strong>{moldData.dark_rot_ratio}%</strong></span>
            <span>Yellow-Green Index: <strong>{moldData.yellow_green_index}</strong></span>
          </div>
        </div>
      </div>

      {moldData.recommended_treatments && moldData.recommended_treatments.length > 0 && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={16} color="#059669" />
            <span>Targeted Storage & Anti-Fungal Treatment Recommendations:</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {moldData.recommended_treatments.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#334155', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #059669' }}>
                <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
