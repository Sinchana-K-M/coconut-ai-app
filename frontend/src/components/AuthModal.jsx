import React, { useState } from 'react';
import { User, Mail, Lock, X, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { registerUser, loginUser } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      let result;
      if (isLoginView) {
        result = await loginUser(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Please provide your full name.');
        }
        result = await registerUser(name, email, password);
      }

      onAuthSuccess(result);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Authentication request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, backdropFilter: 'blur(4px)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '28px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '36px', marginBottom: '4px' }}>🥥</div>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#064e3b' }}>
            {isLoginView ? 'Welcome Back' : 'Create Account'}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            {isLoginView ? 'Sign in to access your saved coconut scans & reports' : 'Register to manage personalized analytics & database records'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: '6px', color: '#991b1b', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!isLoginView && (
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sinchana"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', backgroundColor: '#059669', padding: '12px', marginTop: '6px', fontSize: '14px', fontWeight: 700 }}
          >
            {isLoginView ? <><LogIn size={18} /><span>{isLoading ? 'Signing In...' : 'Sign In'}</span></> : <><UserPlus size={18} /><span>{isLoading ? 'Registering...' : 'Create Account'}</span></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '13px', color: '#64748b' }}>
          {isLoginView ? (
            <span>Don't have an account? <button onClick={() => setIsLoginView(false)} style={{ color: '#059669', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Register here</button></span>
          ) : (
            <span>Already registered? <button onClick={() => setIsLoginView(true)} style={{ color: '#059669', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Sign in here</button></span>
          )}
        </div>
      </div>
    </div>
  );
}
