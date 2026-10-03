import React, { useState } from 'react';
import { Layers, UploadCloud, Play, Download, FileSpreadsheet, FileText, CheckCircle2, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { predictBatchImages, downloadBatchPDF, downloadBatchExcel, downloadHistoryCSV } from '../api';

export default function BatchAnalysis({ onBatchComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSelectedFiles(files);
    setErrorMsg(null);
    setBatchResult(null);

    // Create thumbnail previews (max 12 for grid display)
    const previewUrls = files.slice(0, 12).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    setPreviews(previewUrls);
  };

  const handleStartBatch = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select at least one coconut image file for batch analysis.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await predictBatchImages(selectedFiles);
      setBatchResult(res);
      if (onBatchComplete) {
        onBatchComplete();
      }
    } catch (err) {
      console.error('Batch analysis error:', err);
      setErrorMsg(err.response?.data?.detail || 'Multi-coconut batch analysis failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setBatchResult(null);
    setErrorMsg(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Layers size={28} color="#a7f3d0" />
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>MULTI-COCONUT BATCH ANALYSIS</h2>
        </div>
        <p style={{ margin: 0, fontSize: '13.5px', color: '#a7f3d0' }}>
          Batch Process Multiple Coconut Samples • FIFO Queue Pipeline • Aggregated Statistics • PDF & Excel Reports
        </p>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', padding: '14px', borderRadius: '8px', color: '#991b1b' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Upload & Controls Bar */}
      <div className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <label htmlFor="batch-upload-input" className="btn btn-primary" style={{ cursor: 'pointer', backgroundColor: '#059669' }}>
              <UploadCloud size={18} />
              <span>Select Multiple Coconut Images ({selectedFiles.length} Selected)</span>
            </label>
            <input
              id="batch-upload-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {selectedFiles.length > 0 && !batchResult && (
              <button className="btn btn-primary" onClick={handleStartBatch} disabled={isLoading} style={{ backgroundColor: '#2563eb' }}>
                <Play size={18} />
                <span>{isLoading ? 'Processing Queue...' : `Start Batch Analysis (${selectedFiles.length} Items)`}</span>
              </button>
            )}

            {selectedFiles.length > 0 && (
              <button className="btn btn-secondary" onClick={handleReset} disabled={isLoading}>
                <RefreshCw size={18} />
                <span>Clear / Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Previews Grid */}
        {previews.length > 0 && !batchResult && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
              Selected Batch Queue Previews ({selectedFiles.length} Total):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
              {previews.map((p, idx) => (
                <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', height: '80px' }}>
                  <img src={p.url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', padding: '2px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading Progress State */}
      {isLoading && (
        <div className="card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '24px', textAlign: 'center' }}>
          <Sparkles size={32} className="spin" color="#059669" style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#15803d' }}>
            Processing FIFO Prediction Queue...
          </div>
          <div style={{ fontSize: '13.5px', color: '#166534', marginTop: '6px' }}>
            Running MobileNetV2 inference & quality grading sequentially across {selectedFiles.length} coconut images.
          </div>
        </div>
      )}

      {/* Batch Results Overview */}
      {batchResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top KPI Cards Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
            <div className="stat-card">
              <div className="stat-label">Total Batch Images</div>
              <div className="stat-value">{batchResult.total_images}</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #059669' }}>
              <div className="stat-label">Healthy Samples</div>
              <div className="stat-value" style={{ color: '#059669' }}>{batchResult.healthy_count}</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #dc2626' }}>
              <div className="stat-label">Fungal Samples</div>
              <div className="stat-value" style={{ color: '#dc2626' }}>{batchResult.fungal_count}</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #10b981' }}>
              <div className="stat-label">Grade A (High)</div>
              <div className="stat-value">{batchResult.grade_a_count}</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
              <div className="stat-label">Grade B (Medium)</div>
              <div className="stat-value">{batchResult.grade_b_count}</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #ef4444' }}>
              <div className="stat-label">Grade C (Low)</div>
              <div className="stat-value">{batchResult.grade_c_count}</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #2563eb' }}>
              <div className="stat-label">Avg Confidence</div>
              <div className="stat-value" style={{ color: '#2563eb' }}>{batchResult.avg_confidence}%</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
              <div className="stat-label">Avg Quality Score</div>
              <div className="stat-value" style={{ color: '#8b5cf6' }}>{batchResult.avg_quality_score}/100</div>
            </div>
          </div>

          {/* Action Export Buttons Bar */}
          <div className="card">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => downloadHistoryCSV()}>
                <Download size={16} />
                <span>Export CSV</span>
              </button>

              <button className="btn btn-secondary" onClick={() => downloadBatchExcel(batchResult)}>
                <FileSpreadsheet size={16} color="#059669" />
                <span>Export Excel (.xlsx)</span>
              </button>

              <button className="btn btn-primary" onClick={() => downloadBatchPDF(batchResult)} style={{ backgroundColor: '#064e3b' }}>
                <FileText size={16} />
                <span>Download Batch PDF Report</span>
              </button>
            </div>
          </div>

          {/* Itemized Batch Results Table */}
          <div className="card">
            <div className="card-title">
              <span>Itemized Batch Results Breakdown</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', color: '#334155', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 12px' }}>#</th>
                    <th style={{ padding: '10px 12px' }}>Filename</th>
                    <th style={{ padding: '10px 12px' }}>Prediction</th>
                    <th style={{ padding: '10px 12px' }}>Confidence</th>
                    <th style={{ padding: '10px 12px' }}>Quality Score</th>
                    <th style={{ padding: '10px 12px' }}>Quality Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {batchResult.results.map((item, idx) => {
                    const isH = item.prediction === 'HEALTHY';
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{item.filename}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className={isH ? 'badge-healthy' : 'badge-fungal'}>
                            {isH ? <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '4px' }} /> : <AlertTriangle size={13} style={{ display: 'inline', marginRight: '4px' }} />}
                            {item.prediction}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#334155' }}>{item.confidence.toFixed(1)}%</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#059669' }}>{item.quality_score}/100</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>Grade {item.quality_grade}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
