import React from 'react';
import { Info, GitBranch } from 'lucide-react';

export default function About() {
  return (
    <div>
      <div className="card">
        <div className="card-title">
          <GitBranch size={20} />
          <span>Visual System Workflow Pipeline</span>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', textAlign: 'center', lineHeight: '2' }}>
          <span style={{ background: '#ffffff', padding: '6px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', fontWeight: 700 }}>📷 Image Upload</span>
          <span style={{ margin: '0 8px', color: '#059669', fontWeight: 800 }}>➔</span>
          <span style={{ background: '#ffffff', padding: '6px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', fontWeight: 700 }}>🖼 RGB Conversion</span>
          <span style={{ margin: '0 8px', color: '#059669', fontWeight: 800 }}>➔</span>
          <span style={{ background: '#ffffff', padding: '6px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', fontWeight: 700 }}>📐 Resize 224 × 224</span>
          <span style={{ margin: '0 8px', color: '#059669', fontWeight: 800 }}>➔</span>
          <span style={{ background: '#ffffff', padding: '6px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', fontWeight: 700 }}>⚙ MobileNetV2 Preprocessing</span>
          <br /><br />
          <span style={{ color: '#059669', fontWeight: 800, fontSize: '20px' }}>↓</span>
          <br /><br />
          <span style={{ background: '#ecfdf5', padding: '6px 14px', borderRadius: '20px', border: '1px solid #10b981', fontWeight: 700, color: '#047857' }}>🤖 MobileNetV2 Model Inference</span>
          <span style={{ margin: '0 8px', color: '#059669', fontWeight: 800 }}>➔</span>
          <span style={{ background: '#ffffff', padding: '6px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', fontWeight: 700 }}>🔍 Binary Classification</span>
          <span style={{ margin: '0 8px', color: '#059669', fontWeight: 800 }}>➔</span>
          <span style={{ background: '#ffffff', padding: '6px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', fontWeight: 700 }}>📊 Confidence Score</span>
          <span style={{ margin: '0 8px', color: '#059669', fontWeight: 800 }}>➔</span>
          <span style={{ background: '#fef2f2', padding: '6px 14px', borderRadius: '20px', border: '1px solid #ef4444', fontWeight: 700, color: '#b91c1c' }}>🔥 Grad-CAM 4-View Visualizer</span>
          <br /><br />
          <span style={{ color: '#059669', fontWeight: 800, fontSize: '20px' }}>↓</span>
          <br /><br />
          <span style={{ background: '#ffffff', padding: '6px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', fontWeight: 700 }}>💾 CSV History Database</span>
          <span style={{ margin: '0 8px', color: '#059669', fontWeight: 800 }}>➔</span>
          <span style={{ background: '#ffffff', padding: '6px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', fontWeight: 700 }}>📈 Live Recharts Dashboard</span>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <Info size={20} />
          <span>About Project</span>
        </div>

        <h3 style={{ color: '#064e3b', marginBottom: '8px' }}>
          AI-Powered Coconut Quality Assessment and Fungal Contamination Detection System Using Computer Vision
        </h3>
        <p style={{ color: '#4b5563', lineHeight: '1.7', marginBottom: '16px' }}>
          This full-stack agricultural AI system combines deep transfer learning via MobileNetV2 with explainable AI (Grad-CAM) to provide transparent, high-precision screening for fungal contamination in copra and whole coconuts.
        </p>

        <h4 style={{ color: '#0f172a', marginBottom: '6px' }}>Tech Stack:</h4>
        <ul style={{ color: '#334155', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li><strong>Frontend:</strong> React 18, Vite 5, Recharts, Lucide Icons</li>
          <li><strong>Backend:</strong> Python 3.13, FastAPI, Uvicorn, Pandas, Pillow</li>
          <li><strong>Deep Learning Engine:</strong> TensorFlow 2.21.0, Keras MobileNetV2</li>
          <li><strong>Explainable AI:</strong> TensorFlow GradientTape Grad-CAM (Target Layer: Conv_1)</li>
        </ul>
      </div>
    </div>
  );
}
