import React from 'react';
import { FileText, Download, Eye, FileSpreadsheet, Sparkles, CheckCircle2 } from 'lucide-react';
import { downloadHistoryCSV, downloadHistoryExcel, downloadPredictionPDF } from '../api';

export default function Reports({ historyRecords }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <FileText size={28} color="#a7f3d0" />
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>REPORTS & DOCUMENTATION EXPORT</h2>
        </div>
        <p style={{ margin: 0, fontSize: '13.5px', color: '#a7f3d0' }}>
          Generate & Download PDF Inspection Reports • Export History in Excel (.xlsx) & CSV • Audit Certification Logs
        </p>
      </div>

      {/* Quick Export Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ borderLeft: '4px solid #059669' }}>
          <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0f172a' }}>Export CSV Dataset</h4>
          <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '12px' }}>Download full prediction history in standard raw CSV format.</p>
          <button className="btn btn-secondary" onClick={() => downloadHistoryCSV()} style={{ width: '100%', justifyContent: 'center' }}>
            <Download size={15} />
            <span>Download CSV</span>
          </button>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0f172a' }}>Export Excel Spreadsheet</h4>
          <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '12px' }}>Download itemized prediction records formatted for Excel (.xlsx).</p>
          <button className="btn btn-secondary" onClick={() => downloadHistoryExcel()} style={{ width: '100%', justifyContent: 'center', color: '#059669', borderColor: '#a7f3d0' }}>
            <FileSpreadsheet size={15} />
            <span>Download Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Prediction History PDF Generator Table */}
      <div className="card">
        <div className="card-title">
          <span>Individual Scan PDF Reports Manager</span>
        </div>

        {historyRecords.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
            No prediction records available. Upload or scan coconuts to generate PDF reports.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#334155', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '10px 12px' }}>Report ID</th>
                  <th style={{ padding: '10px 12px' }}>Date & Time</th>
                  <th style={{ padding: '10px 12px' }}>Filename</th>
                  <th style={{ padding: '10px 12px' }}>Prediction</th>
                  <th style={{ padding: '10px 12px' }}>Quality Grade</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>PDF Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyRecords.map((rec) => {
                  const recId = rec.Prediction_ID || rec.id;
                  const isH = rec.Prediction === 'HEALTHY';
                  return (
                    <tr key={recId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#64748b' }}>#{recId}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12.5px', color: '#4b5563' }}>{rec.Date} {rec.Time}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{rec.Filename}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className={isH ? 'badge-healthy' : 'badge-fungal'}>{rec.Prediction}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>Grade {rec.Quality_Grade || 'N/A'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => downloadPredictionPDF(
                            recId,
                            rec.Filename,
                            rec.Prediction,
                            rec.Confidence,
                            rec.Quality_Score,
                            rec.Quality_Grade,
                            rec.Quality_Grade_Label
                          )}
                        >
                          <FileText size={14} color="#059669" />
                          <span>Generate PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
