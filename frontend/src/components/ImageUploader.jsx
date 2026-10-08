import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, RotateCcw, Sparkles } from 'lucide-react';

export default function ImageUploader({ onFileSelect, onReset, selectedFile, previewUrl, isLoading }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.target.files?.[0] || e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="card animate-fade-in">
      <div className="card-title">
        <Upload size={22} color="#059669" />
        <span>Upload Coconut Image</span>
      </div>

      <div
        style={{
          border: isDragging ? '2px dashed #10b981' : '2px dashed #cbd5e1',
          borderRadius: '16px',
          padding: '28px 20px',
          textAlign: 'center',
          backgroundColor: isDragging ? '#ecfdf5' : '#f8fafc',
          cursor: 'pointer',
          marginBottom: '20px',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isDragging ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none'
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
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
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxHeight: '260px',
                  maxWidth: '100%',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  border: '2px solid #e2e8f0'
                }}
              />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#10b981" />
              <span>Selected: {selectedFile?.name}</span>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#059669',
              boxShadow: '0 4px 10px rgba(5, 150, 105, 0.15)'
            }}>
              <ImageIcon size={32} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Drag & Drop or Click to Upload
            </h4>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Supports JPG, JPEG, and PNG images
            </p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1, padding: '12px' }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Upload size={18} />
          <span>{selectedFile ? 'Change Image' : 'Select Image'}</span>
        </button>

        {selectedFile && (
          <button className="btn btn-secondary" onClick={onReset} disabled={isLoading}>
            <RotateCcw size={18} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
