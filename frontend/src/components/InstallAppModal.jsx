import React from 'react';
import { Smartphone, Download, CheckCircle, QrCode, X, Sparkles } from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const appUrl = 'https://coconut-ai-app.vercel.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(appUrl)}&color=064e3b&bgcolor=f0fdf4`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #d1fae5'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
            padding: '20px 24px',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px' }}>
              <Smartphone size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Install Coconut AI Mobile App</h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#a7f3d0' }}>Free • No App Store Account Needed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Method 1: Instant Mobile PWA Installation */}
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '16px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={18} color="#047857" />
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#064e3b' }}>
                Option 1: 1-Tap Mobile Install (Instant PWA)
              </h4>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
              Open on any smartphone browser (Chrome/Safari) and tap <b>"Add to Home Screen"</b> or scan this QR Code with your phone:
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '10px' }}>
              <div style={{ padding: '8px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #d1fae5', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <img src={qrCodeUrl} alt="Scan QR Code to Open on Mobile" style={{ width: '130px', height: '130px', display: 'block' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <CheckCircle size={14} color="#059669" /> <span>Real-time Camera Access</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <CheckCircle size={14} color="#059669" /> <span>Offline Cache Support</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={14} color="#059669" /> <span>Custom Coconut Icon</span>
                </div>
              </div>
            </div>
          </div>

          {/* Method 2: Download APK File */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Download size={18} color="#0284c7" />
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Option 2: Download Android APK
              </h4>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>
              Directly download the compiled Android package from your repository actions.
            </p>
            <a
              href="https://github.com/Sinchana-K-M/coconut-ai-app/actions"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 16px',
                backgroundColor: '#064e3b',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '13px',
                boxShadow: '0 2px 4px rgba(6,78,59,0.2)'
              }}
            >
              <Download size={16} />
              <span>Get APK from GitHub Builds</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 24px',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
