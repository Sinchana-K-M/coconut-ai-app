import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Download, Info, ChevronDown, ChevronUp } from 'lucide-react';

export default function PredictionCard({ result, onDownloadCurrentCSV }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!result) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          margin: '0 auto 16px'
        }}>
          🥥
        </div>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Ready for Scan</h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          Upload a coconut image to run real-time assessment.
        </p>
      </div>
    );
  }

  const isHealthy = result.prediction === 'HEALTHY';
  const confidence = result.confidence;
  const isLowConfidence = result.low_confidence_warning === true;

  return (
    <div className="card animate-fade-in" style={{ padding: '24px' }}>
      <div
        style={{
          borderRadius: '16px',
          padding: '24px',
          background: isHealthy
            ? 'linear-gradient(135deg, #ecfdf5 0%, #dcfce7 100%)'
            : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: `2px solid ${isHealthy ? '#10b981' : '#ef4444'}`,
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
        }}
      >
        {/* Status Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span className={isHealthy ? 'badge-healthy' : 'badge-fungal'}>
            {isHealthy
              ? <><CheckCircle2 size={15} /> HEALTHY SAMPLE</>
              : <><AlertTriangle size={15} /> CONTAMINATION DETECTED</>}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', backgroundColor: 'rgba(255,255,255,0.7)', padding: '4px 10px', borderRadius: '12px' }}>
            MobileNetV2
          </span>
        </div>

        {/* Prediction Main Result */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            AI Assessment Output
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 800,
            color: isLowConfidence ? '#d97706' : (isHealthy ? '#059669' : '#dc2626'),
            letterSpacing: '-0.02em',
            margin: '4px 0'
          }}>
            {result.prediction}
          </div>
        </div>

        {/* Confidence Meter */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
            <span>AI Confidence Meter</span>
            <span>{confidence.toFixed(1)}%</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(Math.max(confidence, 0), 100)}%`,
                backgroundColor: isLowConfidence ? '#f59e0b' : (isHealthy ? '#10b981' : '#ef4444'),
              }}
            />
          </div>
        </div>

        {/* Collapsible Details Toggle for Clean Production App Feel */}
        <div style={{ marginTop: '16px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '14px' }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: 0
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={15} color="#059669" />
              <span>{showDetails ? 'Hide Assessment Details' : 'View Assessment Details'}</span>
            </span>
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showDetails && (
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#475569', lineHeight: '1.5' }} className="animate-fade-in">
              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '12px 14px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                <strong>Explanation:</strong> {result.explanation}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                Classification generated by MobileNetV2 Transfer Learning CNN with 92.65% validation accuracy.
              </div>
            </div>
          )}
        </div>

        {/* Download CSV button */}
        {onDownloadCurrentCSV && (
          <button
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '16px', backgroundColor: '#ffffff', fontSize: '13px' }}
            onClick={onDownloadCurrentCSV}
          >
            <Download size={15} />
            <span>Export Result CSV</span>
          </button>
        )}
      </div>
    </div>
  );
}
