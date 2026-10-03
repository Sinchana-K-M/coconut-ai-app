import React from 'react';
import { Layers } from 'lucide-react';

export default function ProcessingPipeline({ pipelineStages }) {
  if (!pipelineStages) {
    return (
      <div className="card">
        <div className="card-title">
          <Layers size={20} />
          <span>Image Processing Pipeline (4 Stages)</span>
        </div>
        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
          Upload an image under <strong>Analyze Coconut</strong> to view the 4 preprocessing pipeline stages.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">
        <Layers size={20} />
        <span>Image Processing Pipeline (4 Stages)</span>
      </div>

      <div className="grid-4">
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#334155', marginBottom: '8px' }}>Stage 1: Original Image</div>
          <img src={pipelineStages.stage1_original} alt="Stage 1" style={{ width: '100%', borderRadius: '6px', maxHeight: '180px', objectFit: 'cover' }} />
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Raw uploaded file</div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#334155', marginBottom: '8px' }}>Stage 2: RGB Converted</div>
          <img src={pipelineStages.stage2_rgb} alt="Stage 2" style={{ width: '100%', borderRadius: '6px', maxHeight: '180px', objectFit: 'cover' }} />
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Converted to 3 channels</div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#334155', marginBottom: '8px' }}>Stage 3: Resized (224 × 224)</div>
          <img src={pipelineStages.stage3_resized} alt="Stage 3" style={{ width: '100%', borderRadius: '6px', maxHeight: '180px', objectFit: 'cover' }} />
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Bilinear 224×224 input</div>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#166534', marginBottom: '8px' }}>Stage 4: Preprocessed Tensor</div>
          <img src={pipelineStages.stage3_resized} alt="Stage 4" style={{ width: '100%', borderRadius: '6px', maxHeight: '180px', objectFit: 'cover', opacity: 0.9 }} />
          <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600, marginTop: '6px' }}>
            MobileNetV2 Preprocessing Applied [-1, 1]
          </div>
        </div>
      </div>
    </div>
  );
}
