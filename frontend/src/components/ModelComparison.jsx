import React, { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';
import { getModelComparison } from '../api';

export default function ModelComparison() {
  const [comparisonData, setComparisonData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getModelComparison()
      .then((data) => setComparisonData(data))
      .catch((err) => {
        console.error('Failed to fetch model comparison:', err);
        setError('Failed to load model comparison data from backend.');
      });
  }, []);

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: '#dc2626' }}>
        ⚠️ {error}
      </div>
    );
  }

  if (!comparisonData || !comparisonData.models) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
        ⏳ Loading Model Comparison Metrics...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Cpu size={28} color="#a7f3d0" />
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>MODEL COMPARISON & BENCHMARKS</h2>
        </div>
        <p style={{ margin: 0, fontSize: '13.5px', color: '#a7f3d0' }}>
          Objective Evaluation: MobileNetV2 (Production CNN) vs Random Forest (Ensemble) vs SVM (Kernel Classifier)
        </p>
      </div>

      {/* Models Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {comparisonData.models.map((model) => {
          const isProduction = model.id === 'mobilenetv2' || model.is_primary;
          const precision = model.metrics?.fungal?.precision ?? model.precision ?? 0;
          const recall = model.metrics?.fungal?.recall ?? model.recall ?? 0;
          const f1 = model.metrics?.fungal?.f1 ?? model.f1_score ?? 0;

          return (
            <div key={model.id || model.name} className="card" style={{ borderTop: `4px solid ${isProduction ? '#059669' : '#64748b'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{model.name}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{model.type}</span>
                </div>
                <span className={isProduction ? 'badge-healthy' : 'badge-fungal'} style={{ backgroundColor: isProduction ? '#dcfce7' : '#f1f5f9', color: isProduction ? '#059669' : '#475569' }}>
                  {isProduction ? '★ PRODUCTION' : 'BENCHMARK'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Test Accuracy</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: isProduction ? '#059669' : '#2563eb' }}>{model.test_accuracy || model.accuracy}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Latency</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706' }}>{model.inference_time_ms} ms</div>
                </div>
              </div>

              <div style={{ fontSize: '12.5px', color: '#334155', marginBottom: '10px' }}>
                <strong>Fungal Metrics:</strong> Precision {(precision * 100).toFixed(0)}% | Recall {(recall * 100).toFixed(0)}% | F1 {(f1 * 100).toFixed(0)}%
              </div>

              <div style={{ fontSize: '12px', color: '#4b5563', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '6px', marginBottom: '8px' }}>
                <strong>Strengths:</strong> {Array.isArray(model.strengths) ? model.strengths.join(', ') : model.strengths}
              </div>

              <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                <strong>Limitations:</strong> {Array.isArray(model.limitations || model.weaknesses) ? (model.limitations || model.weaknesses).join(', ') : (model.limitations || model.weaknesses || 'N/A')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="card">
        <div className="card-title">
          <span>Detailed Objective Benchmark Matrix</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', color: '#334155', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Model</th>
                <th style={{ padding: '10px 12px' }}>Test Accuracy</th>
                <th style={{ padding: '10px 12px' }}>Fungal F1-Score</th>
                <th style={{ padding: '10px 12px' }}>Healthy F1-Score</th>
                <th style={{ padding: '10px 12px' }}>Inference Latency</th>
                <th style={{ padding: '10px 12px' }}>Grad-CAM Support</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.models.map((m) => {
                const fungalF1 = m.metrics?.fungal?.f1 ?? m.f1_score ?? 0;
                const healthyF1 = m.metrics?.healthy?.f1 ?? m.f1_score ?? 0;
                const isProduction = m.id === 'mobilenetv2' || m.is_primary;

                return (
                  <tr key={m.id || m.name} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#0f172a' }}>{m.name}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#059669' }}>{m.test_accuracy || m.accuracy}%</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{(fungalF1 * 100).toFixed(0)}%</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{(healthyF1 * 100).toFixed(0)}%</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#d97706' }}>{m.inference_time_ms} ms</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: isProduction ? '#059669' : '#94a3b8' }}>
                      {isProduction ? '✓ YES (4 Views)' : '✕ NO'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {comparisonData.summary && (
          <div style={{ backgroundColor: '#ecfdf5', borderLeft: '4px solid #059669', padding: '12px 14px', borderRadius: '6px', fontSize: '13px', color: '#064e3b', marginTop: '16px' }}>
            <strong>Summary:</strong> {comparisonData.summary}
          </div>
        )}
      </div>
    </div>
  );
}
