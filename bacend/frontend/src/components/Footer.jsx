import React from 'react';
import { BookOpen, GitBranch, Globe, Heart } from 'lucide-react';

export default function Footer({ onViewChange }) {
  return (
    <footer style={footerStyle}>
      <div className="container" style={footerContainer}>
        <div style={footerMain}>
          <div style={brandCol}>
            <div style={logoStyle}>
              <div style={logoIcon}>
                <BookOpen size={16} color="#8b5cf6" />
              </div>
              <span className="gradient-text" style={logoText}>Al-Aziz</span>
            </div>
            <p style={brandDescription}>
              Zamonaviy texnologiyalar va ilg'or o'qitish metodologiyasi yordamida kelajak mutaxassislarini tayyorlash platformasi.
            </p>
          </div>
          
          <div style={linksCol}>
            <h4 style={colTitle}>Platforma</h4>
            <a href="#features" onClick={() => onViewChange('landing')} style={footerLink}>Imkoniyatlar</a>
            <a href="#courses" onClick={() => onViewChange('landing')} style={footerLink}>Kurslar</a>
            <a href="#testimonials" onClick={() => onViewChange('landing')} style={footerLink}>Fikrlar</a>
          </div>

          <div style={linksCol}>
            <h4 style={colTitle}>Bog'lanish</h4>
            <span style={contactInfo}>Email: info@al-aziz.uz</span>
            <span style={contactInfo}>Tel: +998 90 123 45 67</span>
            <span style={contactInfo}>Manzil: Toshkent sh., Chilonzor</span>
          </div>
        </div>

        <div style={footerDivider}></div>

        <div style={footerBottom}>
          <p style={copyright}>
            &copy; {new Date().getFullYear()} Al-Aziz Platformasi. Barcha huquqlar himoyalangan.
          </p>
          <div style={footerSocials}>
            <a href="#" style={socialLink}><GitBranch size={16} /></a>
            <a href="#" style={socialLink}><Globe size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const footerStyle = {
  background: '#050507',
  borderTop: '1px solid var(--border-color)',
  padding: '60px 0 30px 0',
  color: 'var(--text-secondary)',
  marginTop: 'auto',
};

const footerContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '40px',
};

const footerMain = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr',
  gap: '40px',
};

// Handle mobile grid responsiveness via CSS classes later
const brandCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const logoIcon = {
  width: '30px',
  height: '30px',
  borderRadius: '8px',
  background: 'rgba(139, 92, 246, 0.1)',
  border: '1px solid rgba(139, 92, 246, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const logoText = {
  fontSize: '18px',
  fontWeight: '700',
  fontFamily: 'var(--font-heading)',
};

const brandDescription = {
  fontSize: '14px',
  lineHeight: '1.6',
  maxWidth: '320px',
};

const linksCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const colTitle = {
  color: 'var(--text-primary)',
  fontSize: '15px',
  fontWeight: '600',
  marginBottom: '4px',
  fontFamily: 'var(--font-heading)',
};

const footerLink = {
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  fontSize: '14px',
  transition: 'color 0.2s ease',
  alignSelf: 'flex-start',
};

// Hover: hover effects will be added via stylesheet selectors

const contactInfo = {
  fontSize: '14px',
};

const footerDivider = {
  height: '1px',
  background: 'var(--border-color)',
};

const footerBottom = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '20px',
};

const copyright = {
  fontSize: '13px',
};

const footerSocials = {
  display: 'flex',
  gap: '12px',
};

const socialLink = {
  color: 'var(--text-secondary)',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid var(--border-color)',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  transition: 'all 0.2s ease',
};
