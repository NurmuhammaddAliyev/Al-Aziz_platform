import React, { useState } from 'react';
import { Menu, X, BookOpen, LogOut, User } from 'lucide-react';

export default function Header({ user, onLogout, onOpenLogin, onOpenRegister, onViewChange, currentView }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (view, e) => {
    e.preventDefault();
    onViewChange(view);
    setIsOpen(false);
    
    // Smooth scroll for hash links if on landing page
    if (view === 'landing') {
      const href = e.currentTarget.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <header style={headerStyle}>
      <div className="container" style={navContainerStyle}>
        <a href="#hero" onClick={(e) => handleNavClick('landing', e)} style={logoStyle}>
          <div style={logoIconContainer}>
            <BookOpen size={20} color="#8b5cf6" />
          </div>
          <span className="gradient-text" style={logoTextStyle}>Al-Aziz</span>
        </a>

        {/* Desktop Nav */}
        <nav style={desktopNavStyle}>
          {currentView === 'landing' ? (
            <>
              <a href="#features" onClick={(e) => handleNavClick('landing', e)} style={navLinkStyle}>Imkoniyatlar</a>
              <a href="#courses" onClick={(e) => handleNavClick('landing', e)} style={navLinkStyle}>Kurslar</a>
              <a href="#testimonials" onClick={(e) => handleNavClick('landing', e)} style={navLinkStyle}>Fikrlar</a>
              <a href="#faq" onClick={(e) => handleNavClick('landing', e)} style={navLinkStyle}>FAQ</a>
            </>
          ) : (
            <a href="#home" onClick={(e) => handleNavClick('landing', e)} style={navLinkStyle}>Bosh Sahifa</a>
          )}
        </nav>

        <div style={authButtonsContainer}>
          {user ? (
            <>
              <button 
                onClick={() => onViewChange('dashboard')} 
                className="btn-secondary" 
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                <User size={16} />
                Kabinet ({user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'O\'qituvchi' : 'O\'quvchi'})
              </button>
              <button 
                onClick={onLogout} 
                className="btn-icon" 
                title="Chiqish"
                style={{ width: '38px', height: '38px' }}
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <button onClick={onOpenLogin} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                Kirish
              </button>
              <button onClick={onOpenRegister} className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                Ro'yxatdan o'tish
              </button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setIsOpen(!isOpen)} style={mobileToggleStyle}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {isOpen && (
        <div style={mobileMenuDrawerStyle}>
          {currentView === 'landing' ? (
            <>
              <a href="#features" onClick={(e) => handleNavClick('landing', e)} style={mobileNavLinkStyle}>Imkoniyatlar</a>
              <a href="#courses" onClick={(e) => handleNavClick('landing', e)} style={mobileNavLinkStyle}>Kurslar</a>
              <a href="#testimonials" onClick={(e) => handleNavClick('landing', e)} style={mobileNavLinkStyle}>Fikrlar</a>
              <a href="#faq" onClick={(e) => handleNavClick('landing', e)} style={mobileNavLinkStyle}>FAQ</a>
            </>
          ) : (
            <a href="#home" onClick={(e) => handleNavClick('landing', e)} style={mobileNavLinkStyle}>Bosh Sahifa</a>
          )}
          
          <div style={mobileAuthContainer}>
            {user ? (
              <>
                <button 
                  onClick={() => { onViewChange('dashboard'); setIsOpen(false); }} 
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <User size={16} /> Kabinet
                </button>
                <button 
                  onClick={() => { onLogout(); setIsOpen(false); }} 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', background: 'var(--accent-red)' }}
                >
                  <LogOut size={16} /> Chiqish
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { onOpenLogin(); setIsOpen(false); }} 
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Kirish
                </button>
                <button 
                  onClick={() => { onOpenRegister(); setIsOpen(false); }} 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Ro'yxatdan o'tish
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

const headerStyle = {
  position: 'sticky',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 100,
  background: 'rgba(3, 3, 3, 0.7)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderBottom: '1px solid var(--border-color)',
};

const navContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '70px',
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  textDecoration: 'none',
};

const logoIconContainer = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  background: 'rgba(139, 92, 246, 0.1)',
  border: '1px solid rgba(139, 92, 246, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const logoTextStyle = {
  fontSize: '22px',
  fontFamily: 'var(--font-heading)',
  fontWeight: '800',
};

const desktopNavStyle = {
  display: 'flex',
  gap: '24px',
};

const navLinkStyle = {
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'color 0.2s ease',
};

// Inject custom responsive hover rule to global styles or handle in JS
const authButtonsContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const mobileToggleStyle = {
  display: 'none',
  background: 'none',
  border: 'none',
  color: 'var(--text-primary)',
  cursor: 'pointer',
};

const mobileMenuDrawerStyle = {
  position: 'absolute',
  top: '70px',
  left: 0,
  width: '100%',
  background: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 24px',
  gap: '16px',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
};

const mobileNavLinkStyle = {
  color: 'var(--text-primary)',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '500',
  padding: '8px 0',
  borderBottom: '1px solid rgba(255,255,255,0.03)',
};

const mobileAuthContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginTop: '10px',
};

// Responsive styling will be handled by class names and index.css rules.
