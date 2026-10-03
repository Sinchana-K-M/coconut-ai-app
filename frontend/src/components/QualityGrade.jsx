import React from 'react';
import { Award, CheckCircle, AlertCircle, HelpCircle, ShieldAlert } from 'lucide-react';

export default function QualityGrade({ result }) {
  // Accept the full result object for access to all fields
  const qualityScore    = result?.quality_score;
  const grade           = result?.quality_grade;
  const gradeLabel      = result?.quality_grade_label;
  const factors         = result?.quality_factors;
  const explanation     = result?.quality_explanation;
  const fungalOverride  = result?.quality_grade === 'C' && result?.prediction === 'FUNGAL';
  const imageGrade      = result?.image_grade || grade;
  const imageScore      = result?.image_quality_score ?? qualityScore;

  if (qualityScore === undefined || qualityScore === null) return null;

  const scoreNum = Number(qualityScore);

  // Colour theme based on FINAL grade
  let badgeColor  = '#059669'; // green = A
  let badgeBg     = '#dcfce7';
  let badgeBorder = '#86efac';
  let icon = <CheckCircle size={16} style={{ display: 'inline', marginRight: '4px' }} />;

  if (grade === 'B') {
    badgeColor = '#d97706'; badgeBg = '#fef3c7'; badgeBorder = '#fcd34d';
    icon = <Award size={16} style={{ display: 'inline', marginRight: '4px' }} />;
  } else if (grade === 'C') {
    badgeColor = '#dc2626'; badgeBg = '#fee2e2'; badgeBorder = '#fca5a5';
    icon = <AlertCircle size={16} style={{ display: 'inline', marginRight: '4px' }} />;
  }

  return (
    <div className="card" style={{ marginTop: '20px' }}>

      {/* Title row */}
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} color={badgeColor} />
          <span>Coconut Quality Grading</span>
        </div>
        <span style={{
          backgroundColor: badgeBg, color: badgeColor,
          border: `1px solid ${badgeBorder}`,
          padding: '4px 14px', borderRadius: '20px',
          fontWeight: 700, fontSize: '13px',
          display: 'flex', alignItems: 'center',
        }}>
          {icon} GRADE {grade} — {gradeLabel}
        </span>
      </div>

      {/* Fungal override notice */}
      {fungalOverride && (
        <div style={{
          backgroundColor: '#fee2e2', border: '2px solid #fca5a5',
          borderRadius: '8px', padding: '10px 14px', marginBottom: '14px',
          display: 'flex', alignItems: 'flex-start', gap: '8px',
        }}>
          <ShieldAlert size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: 600 }}>
            Coconut Quality Grade forced to C — Fungal contamination detected by the AI model.
            A contaminated coconut is always Low Quality regardless of image clarity.
            {imageGrade && imageGrade !== 'C' && (
              <span style={{ fontWeight: 400, display: 'block', marginTop: '4px', color: '#b91c1c' }}>
                (Image clarity score: {imageScore}/100 — Image grade: {imageGrade} — but coconut quality = C due to contamination)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Score panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {fungalOverride ? 'Image Quality Score' : 'Quality Score'}
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: badgeColor, margin: '4px 0' }}>
            {scoreNum.toFixed(1)} <span style={{ fontSize: '18px', color: '#94a3b8' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            {fungalOverride ? 'Image Clarity Only' : 'Visual Image Score'}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
            <span>Overall Quality</span>
            <span>{scoreNum.toFixed(1)}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{
              width: `${Math.min(Math.max(scoreNum, 0), 100)}%`,
              backgroundColor: badgeColor,
            }} />
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            Grade A (≥72) | Grade B (45–71) | Grade C (&lt;45 or Fungal)
          </div>
        </div>
      </div>

      {/* Quality factors breakdown */}
      {factors && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#334155', marginBottom: '12px' }}>
            Image Quality Factors Breakdown:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {Object.entries(factors).map(([name, val]) => {
              const label = name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
              const v = Number(val);
              const barColor = v >= 75 ? '#059669' : v >= 50 ? '#d97706' : '#dc2626';
              return (
                <div key={name} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>
                    <span>{label}</span><span>{v.toFixed(0)}%</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#e5e7eb', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(Math.max(v, 0), 100)}%`, backgroundColor: barColor, height: '100%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div style={{
        backgroundColor: fungalOverride ? '#fee2e2' : '#f0fdf4',
        border: `1px solid ${fungalOverride ? '#fca5a5' : '#bbf7d0'}`,
        borderRadius: '8px', padding: '14px 16px', marginBottom: '12px',
      }}>
        <div style={{ fontWeight: 700, fontSize: '13px', color: fungalOverride ? '#991b1b' : '#166534', marginBottom: '4px' }}>
          Quality Assessment Explanation ({gradeLabel}):
        </div>
        <div style={{ fontSize: '13px', color: fungalOverride ? '#b91c1c' : '#15803d', lineHeight: '1.5' }}>
          {explanation || (
            grade === 'A' ? 'Grade A: Image has good brightness, strong sharpness, clear surface visibility, and consistent color.' :
            grade === 'B' ? 'Grade B: Image has moderate visual quality. Some lighting or sharpness limitations are present.' :
            'Grade C: Low quality — either due to poor image clarity or fungal contamination detected.'
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '12px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
        <HelpCircle size={14} style={{ flexShrink: 0 }} />
        <span><strong>Notice:</strong> Visual quality assessment based on image characteristics and AI prediction. Does not certify internal edible safety or replace expert agricultural testing.</span>
      </div>
    </div>
  );
}
