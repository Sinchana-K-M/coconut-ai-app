import React from 'react';
import { CheckCircle2, AlertTriangle, Download, AlertCircle } from 'lucide-react';

export default function PredictionCard({ result, onDownloadCurrentCSV }) {
  if (!result) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🥥</div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>No Active Assessment</div>
        <div style={{ fontSize: '13px', marginTop: '4px' }}>
          Upload a coconut or copra image to run MobileNetV2 assessment &amp; Grad-CAM analysis.
        </div>
      </div>
    );
  }

  const isHealthy = result.prediction === 'HEALTHY';
  const confidence = result.confidence;
  const isLowConfidence = result.low_confidence_warning === true;

  return (
    <div className="card">
      <div className={`result-card ${isHealthy ? 'result-healthy' : 'result-fungal'}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span className={isHealthy ? 'badge-healthy' : 'badge-fungal'}>
            {isHealthy
              ? <><CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px' }} /> PASS - HEALTHY</>
              : <><AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px' }} /> WARNING - CONTAMINATION DETECTED</>}
          </span>
          <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>Model: {result.model || 'MobileNetV2-V2'}</span>
        </div>

        {/* Low Confidence Warning Banner */}
        {isLowConfidence && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}>
            <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div style={{ fontSize: '13px', color: '#92400e', fontWeight: 600 }}>
              LOW CONFIDENCE RESULT ({confidence.toFixed(1)}%) — This image has borderline visual features.
              The result is uncertain. Please use a clearer, well-lit image or seek expert inspection.
            </div>
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assessment Output</div>
          <div style={{ fontSize: '38px', fontWeight: 800, color: isLowConfidence ? '#d97706' : (isHealthy ? '#059669' : '#dc2626'), margin: '2px 0' }}>
            {result.prediction}
            {isLowConfidence && <span style={{ fontSize: '16px', marginLeft: '10px', color: '#d97706' }}>(Low Confidence)</span>}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
            <span>Confidence Score</span>
            <span>{confidence.toFixed(2)}%</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(Math.max(confidence, 0), 100)}%`,
                backgroundColor: isLowConfidence ? '#f59e0b' : (isHealthy ? '#059669' : '#dc2626'),
              }}
            />
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '12px 14px', border: '1px solid #e5e7eb', marginBottom: '14px', fontSize: '14px', color: '#4b5563' }}>
          <strong>Explanation:</strong> {result.explanation}
        </div>

        <div style={{ backgroundColor: '#fffbe6', borderLeft: '4px solid #f59e0b', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', color: '#92400e', marginBottom: '16px' }}>
          <strong>Disclaimer:</strong> This application provides AI-based image classification for demonstration and decision-support purposes. Results should not replace expert inspection or laboratory testing.
        </div>

        {onDownloadCurrentCSV && (
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={onDownloadCurrentCSV}>
            <Download size={16} />
            <span>Download Current Result CSV</span>
          </button>
        )}
      </div>
    </div>
  );
}
