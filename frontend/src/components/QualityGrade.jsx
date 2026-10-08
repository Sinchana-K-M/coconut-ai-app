import React, { useState } from 'react';
import { Award, CheckCircle, AlertCircle, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

export default function QualityGrade({ result }) {
  const [showFactors, setShowFactors] = useState(false);

  const qualityScore   = result?.quality_score;
  const grade          = result?.quality_grade;
  const gradeLabel     = result?.quality_grade_label;
  const factors        = result?.quality_factors;
  const fungalOverride = result?.quality_grade === 'C' && result?.prediction === 'FUNGAL';

  if (qualityScore === undefined || qualityScore === null) return null;

  const scoreNum = Number(qualityScore);

  let badgeColor  = '#059669';
  let badgeBg     = '#dcfce7';
  let badgeBorder = '#86efac';

  if (grade === 'B') {
    badgeColor = '#d97706'; badgeBg = '#fef3c7'; badgeBorder = '#fcd34d';
  } else if (grade === 'C') {
    badgeColor = '#dc2626'; badgeBg = '#fee2e2'; badgeBorder = '#fca5a5';
  }

  return (
    <div className="card animate-fade-in" style={{ marginTop: '20px' }}>
      {/* Title row */}
      <div className="card-title" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} color={badgeColor} />
          <span>Quality Grading & Classification</span>
        </div>
        <span style={{
          backgroundColor: badgeBg, color: badgeColor,
          border: `1px solid ${badgeBorder}`,
          padding: '6px 14px', borderRadius: '20px',
          fontWeight: 700, fontSize: '13px',
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          Grade {grade} — {gradeLabel}
        </span>
      </div>

      {/* Fungal override notice */}
      {fungalOverride && (
        <div style={{
          backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
          borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <ShieldAlert size={18} color="#dc2626" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: 600 }}>
            <strong>Safety Classification Override:</strong> Contaminated sample assigned Grade C disallowance.
          </div>
        </div>
      )}

      {/* Quality Score Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
          <span>Overall Quality Index</span>
          <span>{scoreNum.toFixed(1)} / 100</span>
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(Math.max(scoreNum, 0), 100)}%`,
              backgroundColor: badgeColor,
            }}
          />
        </div>
      </div>

      {/* Collapsible Factor Breakdown */}
      {factors && (
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
          <button
            onClick={() => setShowFactors(!showFactors)}
            style={{
              background: 'none', border: 'none', color: '#475569',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '4px 0'
            }}
          >
            <span>Image Quality Factor Metrics</span>
            {showFactors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showFactors && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginTop: '12px' }} className="animate-fade-in">
              {Object.entries(factors).map(([key, val]) => (
                <div key={key} style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'capitalize' }}>
                    {key.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {Number(val).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
