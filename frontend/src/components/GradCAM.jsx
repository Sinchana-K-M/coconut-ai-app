import React from 'react';
import { Flame, Sliders } from 'lucide-react';

export default function GradCAM({ gradcamViews, opacity, setOpacity, threshold, setThreshold, colormap, setColormap, onUpdateGradCAM, isLoading }) {
  if (!gradcamViews) {
    return (
      <div className="card">
        <div className="card-title">
          <Flame size={20} color="#dc2626" />
          <span>🔥 Explainable AI — Grad-CAM</span>
        </div>
        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
          Upload an image under <strong>Analyze Coconut</strong> to compute and visualize Grad-CAM activation maps.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">
        <Flame size={20} color="#dc2626" />
        <span>🔥 Explainable AI — Grad-CAM (4 Views)</span>
      </div>

      {/* Interactive Controls (Section 6 Requirement) */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ fontWeight: 700, fontSize: '14px', color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sliders size={16} />
          <span>Interactive Visualization Controls</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '4px' }}>
              Heatmap Opacity (Alpha): {opacity.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '4px' }}>
              Activation Threshold: {threshold.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '4px' }}>
              Heatmap Colormap:
            </label>
            <select
              value={colormap}
              onChange={(e) => setColormap(e.target.value)}
              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            >
              <option value="jet">jet (Classic Spectrum)</option>
              <option value="turbo">turbo (Vibrant High Contrast)</option>
              <option value="hot">hot (Thermal)</option>
              <option value="inferno">inferno (Dark Thermal)</option>
            </select>
          </div>
        </div>

        {onUpdateGradCAM && (
          <div style={{ marginTop: '12px', textAlign: 'right' }}>
            <button className="btn btn-secondary" onClick={onUpdateGradCAM} disabled={isLoading} style={{ fontSize: '13px', padding: '6px 14px' }}>
              Update Heatmap
            </button>
          </div>
        )}
      </div>

      {/* 2 x 2 Visual Layout (Section 5 Requirement) */}
      <div className="grid-2">
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#334155', marginBottom: '8px' }}>1. Original Image</div>
          <img src={gradcamViews.view1_original} alt="View 1" style={{ width: '100%', borderRadius: '6px', maxHeight: '220px', objectFit: 'contain' }} />
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#334155', marginBottom: '8px' }}>2. Grad-CAM Heatmap</div>
          <img src={gradcamViews.view2_heatmap} alt="View 2" style={{ width: '100%', borderRadius: '6px', maxHeight: '220px', objectFit: 'contain' }} />
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#334155', marginBottom: '8px' }}>3. Grad-CAM Overlay</div>
          <img src={gradcamViews.view3_overlay} alt="View 3" style={{ width: '100%', borderRadius: '6px', maxHeight: '220px', objectFit: 'contain' }} />
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#334155', marginBottom: '8px' }}>4. Important Regions</div>
          <img src={gradcamViews.view4_important} alt="View 4" style={{ width: '100%', borderRadius: '6px', maxHeight: '220px', objectFit: 'contain' }} />
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '12px', fontStyle: 'italic' }}>
        Grad-CAM visualizes image regions that influenced the model prediction. It does not independently confirm fungal contamination.
      </div>
    </div>
  );
}
