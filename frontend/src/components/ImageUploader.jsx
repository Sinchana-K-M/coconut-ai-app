import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, RotateCcw } from 'lucide-react';

export default function ImageUploader({ onFileSelect, onReset, selectedFile, previewUrl, isLoading }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <Upload size={20} />
        <span>Upload Image</span>
      </div>

      <div
        style={{
          border: '2px dashed #cbd5e1',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          cursor: 'pointer',
          marginBottom: '16px',
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/jpg,image/png"
          style={{ display: 'none' }}
        />

        {previewUrl ? (
          <div>
            <img
              src={previewUrl}
              alt="Preview"
              style={{ maxHeight: '240px', maxWidth: '100%', borderRadius: '8px', marginBottom: '8px' }}
            />
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>
              Selected: {selectedFile?.name}
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px 0' }}>
            <ImageIcon size={48} color="#94a3b8" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#334155' }}>
              Drag & Drop or Click to Upload
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Supports JPG, JPEG, and PNG images
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Upload size={16} />
          <span>{selectedFile ? 'Change Image' : 'Select Image'}</span>
        </button>

        {selectedFile && (
          <button className="btn btn-secondary" onClick={onReset} disabled={isLoading}>
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
