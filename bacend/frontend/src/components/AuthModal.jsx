import React, { useEffect, useState } from 'react';
import { X, Key, User, Phone, Mail, FileText } from 'lucide-react';
import { Api } from '../services/Api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login State
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // Register State
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    // ClassGroups ni yuklanish kerak emas
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await Api.auth.login(loginData.username, loginData.password);
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Login xato! Iltimos qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await Api.auth.register(registerData);
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={modalCustomStyle}>
        <button onClick={onClose} style={closeBtnStyle} className="btn-icon">
          <X size={18} />
        </button>

        <div style={tabHeaderStyle}>
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            style={activeTab === 'login' ? activeTabStyle : tabStyle}
          >
            Kirish
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); }}
            style={activeTab === 'register' ? activeTabStyle : tabStyle}
          >
            Ro'yxatdan o'tish
          </button>
        </div>

        {error && <div style={errorAlertStyle}>{error}</div>}

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={formStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Foydalanuvchi nomi (Username)</label>
              <div style={inputWrapperStyle}>
                <User size={16} style={inputIconStyle} />
                <input
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  className="glass-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="admin, student1..."
                  required
                />
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Maxfiy so'z (Password)</label>
              <div style={inputWrapperStyle}>
                <Key size={16} style={inputIconStyle} />
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="glass-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={submitBtnStyle} disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Kirish'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={formStyle}>
            <div style={gridStyle}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Ism</label>
                <input
                  type="text"
                  name="first_name"
                  value={registerData.first_name}
                  onChange={handleRegisterChange}
                  className="glass-input"
                  placeholder="Ali"
                  required
                />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Familiya</label>
                <input
                  type="text"
                  name="last_name"
                  value={registerData.last_name}
                  onChange={handleRegisterChange}
                  className="glass-input"
                  placeholder="Valiyev"
                  required
                />
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Foydalanuvchi nomi (Username)</label>
              <div style={inputWrapperStyle}>
                <User size={16} style={inputIconStyle} />
                <input
                  type="text"
                  name="username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  className="glass-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="ali_valiyev"
                  required
                />
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Telefon raqami</label>
              <div style={inputWrapperStyle}>
                <Phone size={16} style={inputIconStyle} />
                <input
                  type="text"
                  name="phone"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  className="glass-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="+998 90 123 45 67"
                />
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Elektron pochta</label>
              <div style={inputWrapperStyle}>
                <Mail size={16} style={inputIconStyle} />
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  className="glass-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Maxfiy so'z (kamida 8 ta belgi)</label>
              <div style={inputWrapperStyle}>
                <Key size={16} style={inputIconStyle} />
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  className="glass-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={submitBtnStyle} disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Ro\'yxatdan o\'tish'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const modalCustomStyle = {
  padding: '40px 32px 32px 32px',
};

const closeBtnStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  width: '32px',
  height: '32px',
};

const tabHeaderStyle = {
  display: 'flex',
  borderBottom: '1px solid var(--border-color)',
  marginBottom: '28px',
};

const tabStyle = {
  flex: 1,
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  color: 'var(--text-secondary)',
  paddingBottom: '12px',
  fontSize: '16px',
  fontWeight: '600',
  fontFamily: 'var(--font-heading)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const activeTabStyle = {
  ...tabStyle,
  color: 'var(--accent-purple)',
  borderBottomColor: 'var(--accent-purple)',
};

const errorAlertStyle = {
  background: 'rgba(239, 68, 68, 0.1)',
  color: 'var(--accent-red)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  borderRadius: '8px',
  padding: '12px 16px',
  fontSize: '14px',
  marginBottom: '20px',
  lineHeight: '1.4',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelStyle = {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  fontWeight: '500',
};

const inputWrapperStyle = {
  position: 'relative',
  width: '100%',
};

const inputIconStyle = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)',
};

const submitBtnStyle = {
  width: '100%',
  justifyContent: 'center',
  marginTop: '10px',
  height: '46px',
};
