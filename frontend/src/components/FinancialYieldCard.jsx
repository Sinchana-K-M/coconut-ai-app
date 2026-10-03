import React, { useState } from 'react';
import { DollarSign, TrendingDown, Droplet, Scale, Coins, AlertTriangle } from 'lucide-react';

export default function FinancialYieldCard({ yieldData }) {
  const [currency, setCurrency] = useState('INR');

  if (!yieldData) return null;

  const isINR = currency === 'INR';
  const symbol = isINR ? '₹' : '$';
  const val = isINR ? yieldData.market_value_inr : yieldData.market_value_usd;
  const loss = isINR ? yieldData.economic_loss_inr : yieldData.economic_loss_usd;

  return (
    <div className="card" style={{ marginTop: '20px', borderTop: '4px solid #059669' }}>
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Coins size={20} color="#059669" />
          <span>Financial Value & Copra Yield Calculator</span>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => setCurrency(isINR ? 'USD' : 'INR')}
          style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <span>Currency: <strong>{currency} ({symbol})</strong></span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
        {/* Market Value */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px' }}>
          <div style={{ fontSize: '11.5px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Est. Market Value</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669', margin: '2px 0' }}>
            {symbol}{val.toFixed(2)}
          </div>
          <div style={{ fontSize: '11.5px', color: '#15803d' }}>Based on kernel grade & oil ratio</div>
        </div>

        {/* Economic Loss */}
        <div style={{ background: loss > 0 ? '#fef2f2' : '#f8fafc', border: `1px solid ${loss > 0 ? '#fca5a5' : '#e2e8f0'}`, borderRadius: '10px', padding: '14px' }}>
          <div style={{ fontSize: '11.5px', color: loss > 0 ? '#991b1b' : '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {loss > 0 && <TrendingDown size={14} color="#dc2626" />}
            <span>Fungal Economic Loss</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: loss > 0 ? '#dc2626' : '#64748b', margin: '2px 0' }}>
            {symbol}{loss.toFixed(2)}
          </div>
          <div style={{ fontSize: '11.5px', color: loss > 0 ? '#b91c1c' : '#64748b' }}>
            {loss > 0 ? 'Value lost due to contamination' : 'Zero economic loss'}
          </div>
        </div>

        {/* Usable Copra */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
          <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Scale size={14} color="#2563eb" />
            <span>Usable Copra Weight</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563eb', margin: '2px 0' }}>
            {yieldData.usable_copra_weight_g} <span style={{ fontSize: '16px', color: '#64748b' }}>g</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b' }}>Kernel mass yield</div>
        </div>

        {/* Oil Extraction */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
          <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Droplet size={14} color="#d97706" />
            <span>Oil Extraction</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#d97706', margin: '2px 0' }}>
            {yieldData.oil_extraction_pct}% <span style={{ fontSize: '14px', color: '#64748b' }}>({yieldData.estimated_oil_ml} mL)</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b' }}>Commercial extraction ratio</div>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#4b5563', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
        <strong>Summary:</strong> {yieldData.yield_grade_summary}
      </div>
    </div>
  );
}
