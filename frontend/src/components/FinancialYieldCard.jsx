import React, { useState } from 'react';
import { TrendingDown, Scale, Coins, Droplet } from 'lucide-react';

export default function FinancialYieldCard({ yieldData }) {
  const [currency, setCurrency] = useState('INR');

  if (!yieldData) return null;

  const isINR = currency === 'INR';
  const symbol = isINR ? '₹' : '$';
  const val = isINR ? yieldData.market_value_inr : yieldData.market_value_usd;
  const loss = isINR ? yieldData.economic_loss_inr : yieldData.economic_loss_usd;

  return (
    <div className="card animate-fade-in" style={{ marginTop: '20px' }}>
      <div className="card-title" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Coins size={20} color="#059669" />
          <span>Financial Value & Yield Metrics</span>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => setCurrency(isINR ? 'USD' : 'INR')}
          style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '16px' }}
        >
          <span>Currency: <strong>{currency} ({symbol})</strong></span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {/* Est Market Value */}
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Est. Market Value
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', margin: '2px 0' }}>
            {symbol}{val.toFixed(2)}
          </div>
          <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 500 }}>
            Commercial yield rating
          </div>
        </div>

        {/* Economic Loss */}
        <div style={{
          background: loss > 0 ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : '#f8fafc',
          border: `1px solid ${loss > 0 ? '#fca5a5' : '#e2e8f0'}`,
          borderRadius: '12px', padding: '16px'
        }}>
          <div style={{ fontSize: '11px', color: loss > 0 ? '#991b1b' : '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {loss > 0 && <TrendingDown size={13} color="#dc2626" />}
            <span>Fungal Loss</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: loss > 0 ? '#dc2626' : '#64748b', margin: '2px 0' }}>
            {symbol}{loss.toFixed(2)}
          </div>
          <div style={{ fontSize: '11px', color: loss > 0 ? '#b91c1c' : '#64748b', fontWeight: 500 }}>
            {loss > 0 ? 'Contamination reduction' : 'Zero loss'}
          </div>
        </div>

        {/* Usable Copra */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Scale size={13} color="#2563eb" />
            <span>Usable Copra</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
            {yieldData.usable_copra_weight_g}g
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
            Kernel weight ratio
          </div>
        </div>

        {/* Oil Potential */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Droplet size={13} color="#0284c7" />
            <span>Oil Extraction</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0284c7', margin: '2px 0' }}>
            {yieldData.oil_extraction_pct}%
          </div>
          <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: 500 }}>
            Est. {yieldData.estimated_oil_ml} mL volume
          </div>
        </div>
      </div>
    </div>
  );
}
