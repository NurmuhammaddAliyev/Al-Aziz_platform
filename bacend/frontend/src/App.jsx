import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import CourseInfoView from './components/CourseInfoView';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { Api, clearTokens } from './services/Api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'dashboard'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [pendingCourse, setPendingCourse] = useState(null);

  // Auth Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const handleLogout = useCallback(() => {
    clearTokens();
    setUser(null);
    setCurrentView('landing');
    setSelectedCourse(null);
    setPendingCourse(null);
    setAuthModalOpen(false);
  }, []);

  useEffect(() => {
    // Try to load user profile on startup
    async function loadUser() {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const userData = await Api.auth.me();
          setUser(userData);
          setCurrentView('dashboard');
        }
      } catch (err) {
        console.log('No valid session on load');
        clearTokens();
      } finally {
        setLoading(false);
      }
    }
    loadUser();

    // Listen for global auth-logout events
    const handleGlobalLogout = () => {
      handleLogout();
    };
    window.addEventListener('auth-logout', handleGlobalLogout);
    return () => window.removeEventListener('auth-logout', handleGlobalLogout);
  }, [handleLogout]);

  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    if (pendingCourse) {
      try {
        const subjects = await Api.subjects.list();
        const enrichedCourse = Array.isArray(subjects)
          ? subjects.find((item) => Number(item.id) === Number(pendingCourse.id)) || pendingCourse
          : pendingCourse;
        setSelectedCourse(enrichedCourse);
      } catch (err) {
        setSelectedCourse(pendingCourse);
      }
      setCurrentView('course');
    } else {
      setCurrentView('dashboard');
    }
    setPendingCourse(null);
    setAuthModalOpen(false);
  };

  const handleSelectCourse = (course) => {
    if (user) {
      setSelectedCourse(course);
      setCurrentView('course');
      setPendingCourse(null);
      return;
    }

    setPendingCourse(course);
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  const handleBackToLanding = () => {
    setSelectedCourse(null);
    setPendingCourse(null);
    setCurrentView('landing');
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view !== 'course') {
      setSelectedCourse(null);
      setPendingCourse(null);
    }
  };

  const handleOpenLogin = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthModalTab('register');
    setAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div style={appLoaderStyle}>
        <span className="spinner"></span>
        <h2 style={{ marginTop: '16px', fontFamily: 'var(--font-heading)', color: '#fff' }}>Al-Aziz Platformasi</h2>
      </div>
    );
  }

  return (
    <div style={appWrapperStyle}>
      <Header
        user={user}
        onLogout={handleLogout}
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
        onViewChange={handleViewChange}
        currentView={currentView}
      />

      <main style={mainContentStyle}>
        {currentView === 'landing' ? (
          <LandingPage
            onOpenLogin={handleOpenLogin}
            onOpenRegister={handleOpenRegister}
            onEnterDashboard={() => setCurrentView('dashboard')}
            onSelectCourse={handleSelectCourse}
            user={user}
          />
        ) : currentView === 'course' && selectedCourse ? (
          <CourseInfoView
            course={selectedCourse}
            user={user}
            onBack={handleBackToLanding}
            onOpenLogin={handleOpenLogin}
            onEnterDashboard={() => setCurrentView('dashboard')}
          />
        ) : (
          user ? (
            user.role === 'student' ? (
              <StudentDashboard user={user} />
            ) : (
              <TeacherDashboard user={user} />
            )
          ) : (
            <LandingPage
              onOpenLogin={handleOpenLogin}
              onOpenRegister={handleOpenRegister}
              onEnterDashboard={() => setCurrentView('dashboard')}
              user={user}
            />
          )
        )}
      </main>

      <Footer onViewChange={handleViewChange} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialTab={authModalTab}
      />
    </div>
  );
}

const appLoaderStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  background: 'var(--bg-primary)',
};

const appWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: 'var(--bg-primary)',
  position: 'relative',
};

const mainContentStyle = {
  flex: 1,
  width: '100%',
};

export default App;
