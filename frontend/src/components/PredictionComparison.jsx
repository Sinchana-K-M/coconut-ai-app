import React, { useState } from 'react';
import { GitCompare, CheckCircle2, AlertTriangle, ArrowRightLeft, Sparkles } from 'lucide-react';

export default function PredictionComparison({ historyRecords }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) {
        alert('You can select up to 4 items for side-by-side comparison.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedItems = historyRecords.filter((rec) => selectedIds.includes(rec.Prediction_ID || rec.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <GitCompare size={28} color="#a7f3d0" />
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>PREDICTION COMPARISON</h2>
        </div>
        <p style={{ margin: 0, fontSize: '13.5px', color: '#a7f3d0' }}>
          Select & Compare Multiple Coconut Scans Side-by-Side • Confidence Metrics • Quality Score Benchmarks
        </p>
      </div>

      {/* Selection Panel */}
      <div className="card">
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <span>Select Scans to Compare (Selected {selectedIds.length} / 4)</span>
          {selectedIds.length > 0 && (
            <button className="btn btn-secondary" onClick={() => setSelectedIds([])} style={{ fontSize: '12px', padding: '4px 10px' }}>
              Clear Selection
            </button>
          )}
        </div>

        {historyRecords.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
            No prediction history available yet. Upload or scan coconuts to compare results.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', maxHeight: '240px', overflowY: 'auto' }}>
            {historyRecords.map((rec) => {
              const recId = rec.Prediction_ID || rec.id;
              const isSelected = selectedIds.includes(recId);
              const isH = rec.Prediction === 'HEALTHY';
              return (
                <div
                  key={recId}
                  onClick={() => toggleSelect(recId)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: `2px solid ${isSelected ? '#059669' : '#e2e8f0'}`,
                    backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b' }}>#{recId}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isH ? '#059669' : '#dc2626' }}>{rec.Prediction}</span>
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rec.Filename}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Conf: {rec.Confidence}%</span>
                    <span>Grade: {rec.Quality_Grade || 'N/A'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison View */}
      {selectedItems.length > 0 ? (
        <div className="card">
          <div className="card-title">
            <span>Side-by-Side Feature Matrix</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#334155', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '12px', textAlign: 'left', width: '180px' }}>Attribute</th>
                  {selectedItems.map((item) => (
                    <th key={item.Prediction_ID || item.id} style={{ padding: '12px', minWidth: '160px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.Filename}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>ID: #{item.Prediction_ID || item.id}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontWeight: 700, textAlign: 'left', color: '#4b5563' }}>Fungal Status</td>
                  {selectedItems.map((item) => {
                    const isH = item.Prediction === 'HEALTHY';
                    return (
                      <td key={item.Prediction_ID || item.id} style={{ padding: '12px' }}>
                        <span className={isH ? 'badge-healthy' : 'badge-fungal'}>
                          {isH ? <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '4px' }} /> : <AlertTriangle size={13} style={{ display: 'inline', marginRight: '4px' }} />}
                          {item.Prediction}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontWeight: 700, textAlign: 'left', color: '#4b5563' }}>Confidence Score</td>
                  {selectedItems.map((item) => (
                    <td key={item.Prediction_ID || item.id} style={{ padding: '12px', fontWeight: 800, color: '#2563eb', fontSize: '16px' }}>
                      {item.Confidence}%
                    </td>
                  ))}
                </tr>

                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontWeight: 700, textAlign: 'left', color: '#4b5563' }}>Quality Score</td>
                  {selectedItems.map((item) => (
                    <td key={item.Prediction_ID || item.id} style={{ padding: '12px', fontWeight: 800, color: '#059669', fontSize: '16px' }}>
                      {item.Quality_Score || 'N/A'} / 100
                    </td>
                  ))}
                </tr>

                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontWeight: 700, textAlign: 'left', color: '#4b5563' }}>Quality Grade</td>
                  {selectedItems.map((item) => (
                    <td key={item.Prediction_ID || item.id} style={{ padding: '12px', fontWeight: 700 }}>
                      <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '12px' }}>
                        Grade {item.Quality_Grade || 'N/A'}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontWeight: 700, textAlign: 'left', color: '#4b5563' }}>Model Name</td>
                  {selectedItems.map((item) => (
                    <td key={item.Prediction_ID || item.id} style={{ padding: '12px', fontSize: '12.5px', color: '#64748b' }}>
                      {item.Model || 'MobileNetV2-V2'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={{ padding: '12px', fontWeight: 700, textAlign: 'left', color: '#4b5563' }}>Scan Timestamp</td>
                  {selectedItems.map((item) => (
                    <td key={item.Prediction_ID || item.id} style={{ padding: '12px', fontSize: '12px', color: '#64748b' }}>
                      {item.Date} {item.Time}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          <ArrowRightLeft size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
          <div style={{ fontWeight: 600, fontSize: '15px' }}>No items selected for comparison</div>
          <div style={{ fontSize: '12.5px', marginTop: '4px' }}>Click on 2 or more scan cards above to generate a side-by-side comparison matrix.</div>
        </div>
      )}
    </div>
  );
}
