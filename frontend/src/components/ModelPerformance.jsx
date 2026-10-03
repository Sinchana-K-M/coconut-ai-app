import React from 'react';
import { Cpu } from 'lucide-react';

export default function ModelPerformance({ modelInfo }) {
  const accuracy = modelInfo?.test_accuracy || 92.65;
  const testImages = modelInfo?.test_images || 68;
  const correct = modelInfo?.correct_predictions || 63;
  const incorrect = modelInfo?.incorrect_predictions || 5;

  return (
    <div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            <Cpu size={20} />
            <span>Model Specifications & Evaluation</span>
          </div>

          <table className="data-table">
            <tbody>
              <tr>
                <td><strong>Model Architecture:</strong></td>
                <td>MobileNetV2 (Pre-trained ImageNet)</td>
              </tr>
              <tr>
                <td><strong>Technique:</strong></td>
                <td>Transfer Learning + Fine-Tuning (Final 30 Layers)</td>
              </tr>
              <tr>
                <td><strong>Test Set Accuracy:</strong></td>
                <td><strong style={{ color: '#059669', fontSize: '16px' }}>{accuracy}%</strong></td>
              </tr>
              <tr>
                <td><strong>Held-Out Test Images:</strong></td>
                <td>{testImages} images (37 Fungal, 31 Healthy)</td>
              </tr>
              <tr>
                <td><strong>Correct Classifications:</strong></td>
                <td><span style={{ color: '#059669', fontWeight: 700 }}>{correct}</span> / {testImages}</td>
              </tr>
              <tr>
                <td><strong>Incorrect Classifications:</strong></td>
                <td><span style={{ color: '#dc2626', fontWeight: 700 }}>{incorrect}</span> / {testImages}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-title">
            <span>🎯 Precision, Recall & F1 Classification Report</span>
          </div>

          <table className="data-table" style={{ textAlign: 'center' }}>
            <thead>
              <tr>
                <th>Class</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1-Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Fungal (0)</strong></td>
                <td>0.97</td>
                <td>0.89</td>
                <td>0.93</td>
              </tr>
              <tr>
                <td><strong>Healthy (1)</strong></td>
                <td>0.88</td>
                <td>0.97</td>
                <td>0.92</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>Confusion Matrix (Test Evaluation):</div>
            <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#334155' }}>
              [[ 33 (TP),  4 (FN) ],<br />
              &nbsp;[  1 (FP), 30 (TN) ]]
            </div>
          </div>
        </div>
      </div>

      {/* Graph Visualizations */}
      <div className="card">
        <div className="card-title">
          <span>📷 Fine-Tuning & Evaluation Graphs</span>
        </div>

        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ textAlignment: 'center' }}>
            <img src="/static/graphs/accuracy_graph_v2.png" alt="Accuracy Graph" style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px', textAlign: 'center' }}>Accuracy Graph V2</div>
          </div>

          <div style={{ textAlignment: 'center' }}>
            <img src="/static/graphs/loss_graph_v2.png" alt="Loss Graph" style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px', textAlign: 'center' }}>Loss Graph V2</div>
          </div>

          <div style={{ textAlignment: 'center' }}>
            <img src="/static/graphs/confusion_matrix_v2.png" alt="Confusion Matrix" style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px', textAlign: 'center' }}>Confusion Matrix V2</div>
          </div>
        </div>
      </div>
    </div>
  );
}
