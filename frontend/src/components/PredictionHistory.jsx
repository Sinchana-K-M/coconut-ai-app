import React, { useState } from 'react';
import { History, Download, Trash2, FileSpreadsheet } from 'lucide-react';
import { downloadHistoryCSV, downloadHistoryExcel } from '../api';

export default function PredictionHistory({ historyRecords, onClearHistory }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="card">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={20} />
          <span>Prediction History Database</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={downloadHistoryCSV}>
            <Download size={15} />
            <span>Download CSV</span>
          </button>

          <button className="btn btn-secondary" onClick={downloadHistoryExcel} style={{ color: '#059669', borderColor: '#a7f3d0' }}>
            <FileSpreadsheet size={15} />
            <span>Download Excel (.xlsx)</span>
          </button>

          <button className="btn btn-danger" onClick={() => setShowConfirm(!showConfirm)}>
            <Trash2 size={15} />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {showConfirm && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#991b1b' }}>
            Are you sure you want to clear all history records from prediction_history.csv?
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-danger"
              style={{ fontSize: '12px', padding: '4px 10px' }}
              onClick={() => {
                onClearHistory();
                setShowConfirm(false);
              }}
            >
              Yes, Clear
            </button>
            <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={() => setShowConfirm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {historyRecords && historyRecords.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date & Time</th>
                <th>Filename</th>
                <th>Source</th>
                <th>Prediction</th>
                <th>Confidence</th>
                <th>Quality Grade</th>
                <th>Model</th>
              </tr>
            </thead>
            <tbody>
              {historyRecords.slice().reverse().map((row, idx) => {
                const confNum = Number(row.Confidence);
                const confDisplay = !isNaN(confNum) && row.Confidence !== 'N/A' ? `${confNum.toFixed(1)}%` : (row.Confidence || 'N/A');
                const filenameStr = String(row.Filename || '');
                const sourceDisplay = row.Source || (filenameStr.toLowerCase().includes('camera') ? 'Camera' : 'Upload');

                return (
                  <tr key={idx}>
                    <td>#{row.Prediction_ID || row.id || idx + 1}</td>
                    <td style={{ fontSize: '12.5px' }}>{row.Date || ''} {row.Time || ''}</td>
                    <td style={{ fontWeight: 600 }}>{filenameStr || 'sample.jpg'}</td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{sourceDisplay}</td>
                    <td>
                      <span className={row.Prediction === 'HEALTHY' ? 'badge-healthy' : 'badge-fungal'}>
                        {row.Prediction || 'UNKNOWN'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{confDisplay}</td>
                    <td style={{ fontWeight: 700, color: row.Quality_Grade === 'C' ? '#dc2626' : '#059669' }}>
                      Grade {row.Quality_Grade || 'N/A'}
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{row.Model || 'MobileNetV2-V2'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
          No recorded predictions in history database yet.
        </div>
      )}
    </div>
  );
}
