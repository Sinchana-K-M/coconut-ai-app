import React, { useState } from 'react';
import { User, LogIn, LogOut, AlertTriangle, Smartphone } from 'lucide-react';
import InstallAppModal from './InstallAppModal';

export default function Header({ currentUser, onOpenAuthModal, onLogout, fungalAlertCount = 0 }) {
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  return (
    <>
      <header className="header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>🥥 AI-Powered Coconut Quality Assessment</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#a7f3d0' }}>
            Computer Vision • Fungal Contamination Detection • Explainable AI (Grad-CAM)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Install Mobile App Button */}
          <button
            onClick={() => setIsInstallModalOpen(true)}
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: '1px solid #34d399',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(16,185,129,0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <Smartphone size={15} />
            <span>Install Mobile App</span>
          </button>

          {/* Fungal Alerts Badge */}
          {fungalAlertCount > 0 && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <AlertTriangle size={15} />
              <span>{fungalAlertCount} Fungal Alerts</span>
            </div>
          )}

          {/* User Auth Widget */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '20px' }}>
              <User size={16} color="#a7f3d0" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{currentUser.name}</span>
              <button
                onClick={onLogout}
                title="Sign Out"
                style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={onOpenAuthModal}
              style={{ backgroundColor: '#ffffff', color: '#064e3b', fontWeight: 700, fontSize: '13px', padding: '6px 14px' }}
            >
              <LogIn size={15} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </header>

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </>
  );
}
