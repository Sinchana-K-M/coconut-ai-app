import React from 'react';
import { Award, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

export default function QualityGrade({ qualityScore, grade, gradeLabel, factors }) {
  if (qualityScore === undefined || qualityScore === null) {
    return null;
  }

  const scoreNum = Number(qualityScore);

  // Badge & Theme styling based on Grade
  let badgeColor = '#059669';
  let badgeBg = '#dcfce7';
  let badgeBorder = '#86efac';
  let icon = <CheckCircle size={16} style={{ display: 'inline', marginRight: '4px' }} />;

  if (grade === 'B') {
    badgeColor = '#d97706';
    badgeBg = '#fef3c7';
    badgeBorder = '#fcd34d';
    icon = <Award size={16} style={{ display: 'inline', marginRight: '4px' }} />;
  } else if (grade === 'C') {
    badgeColor = '#dc2626';
    badgeBg = '#fee2e2';
    badgeBorder = '#fca5a5';
    icon = <AlertCircle size={16} style={{ display: 'inline', marginRight: '4px' }} />;
  }

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} color={badgeColor} />
          <span>Coconut Image Quality Grading</span>
        </div>

        <span
          style={{
            backgroundColor: badgeBg,
            color: badgeColor,
            border: `1px solid ${badgeBorder}`,
            padding: '4px 14px',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon} GRADE {grade} — {gradeLabel}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quality Score</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: badgeColor, margin: '4px 0' }}>
            {scoreNum.toFixed(1)} <span style={{ fontSize: '18px', color: '#94a3b8' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Visual Image Score</div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
            <span>Overall Visual Quality</span>
            <span>{scoreNum.toFixed(1)}%</span>
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
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            Grade Thresholds: Grade A (80-100) | Grade B (60-79) | Grade C (0-59)
          </div>
        </div>
      </div>

      {factors && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#334155', marginBottom: '12px' }}>
            Measurable Quality Factors Breakdown:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {Object.entries(factors).map(([factorName, factorVal]) => {
              const formattedName = factorName.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
              const valNum = Number(factorVal);
              return (
                <div key={factorName} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>
                    <span>{formattedName}</span>
                    <span>{valNum.toFixed(0)}%</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#e5e7eb', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(Math.max(valNum, 0), 100)}%`, backgroundColor: valNum >= 75 ? '#059669' : valNum >= 50 ? '#d97706' : '#dc2626', height: '100%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quality Assessment Explanation Section (Feature 1 Requirement) */}
      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px 16px', marginBottom: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '13px', color: '#166534', marginBottom: '4px' }}>
          Quality Assessment Explanation ({gradeLabel}):
        </div>
        <div style={{ fontSize: '13px', color: '#15803d', lineHeight: '1.5' }}>
          {grade === 'A' && 'Grade A: Image has good brightness, strong sharpness, clear surface visibility, and consistent color characteristics.'}
          {grade === 'B' && 'Grade B: Image has moderate visual quality. Some lighting, sharpness, or contrast limitations are present.'}
          {grade === 'C' && 'Grade C: Image quality is low due to factors such as poor lighting, blur, low contrast, or inconsistent visual characteristics.'}
        </div>
      </div>

      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '12px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
        <HelpCircle size={14} style={{ flexShrink: 0 }} />
        <span><strong>Notice:</strong> Visual quality assessment based on image characteristics. Does not certify internal edible safety or replace expert testing.</span>
      </div>
    </div>
  );
}
