import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { topics } from './data/problemsData';
import TopicCard from './components/TopicCard';
import StatsDashboard from './components/StatsDashboard';
import SearchBar from './components/SearchBar';
import PracticeTimer from './components/PracticeTimer';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function AppContent() {
  const { user, loading, logout, syncProgress } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(null); // 'login', 'signup', 'forgot', 'reset', or null
  const [resetToken, setResetToken] = useState('');
  
  const [completedProblems, setCompletedProblems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  // Load progress dynamically:
  // - If LOGGED IN: load progress from the user's synced database map.
  // - If GUEST (logged out): load progress from standard localStorage so they get a working demonstration!
  useEffect(() => {
    if (user) {
      const progressObj = user.completedProblems instanceof Map 
        ? Object.fromEntries(user.completedProblems)
        : user.completedProblems;
      setCompletedProblems(progressObj || {});
    } else {
      const localProgress = localStorage.getItem('dsa_guest_completed_problems');
      try {
        setCompletedProblems(localProgress ? JSON.parse(localProgress) : {});
      } catch (err) {
        setCompletedProblems({});
      }
    }
  }, [user]);

  const handleToggle = (tIdx, pIdx) => {
    const key = `t${tIdx}p${pIdx}`;
    setCompletedProblems(prev => {
      const newState = { ...prev };
      if (newState[key]) {
        delete newState[key];
      } else {
        newState[key] = true;
      }
      
      if (user) {
        // Sync with MongoDB backend in real-time
        syncProgress(newState);
      } else {
        // Guest mode fallback persistence in localStorage
        localStorage.setItem('dsa_guest_completed_problems', JSON.stringify(newState));
      }
      
      return newState;
    });
  };

  const totalProblems = topics.reduce((acc, topic) => acc + topic.problems.length, 0);
  const completedCount = Object.keys(completedProblems).length;
  const progressPercent = totalProblems > 0 ? Math.round((completedCount / totalProblems) * 100) : 0;

  const filteredTopics = useMemo(() => {
    return topics.map((topic, tIdx) => {
      const filteredProblems = topic.problems.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = filterDifficulty === 'All' || p.difficulty === filterDifficulty;
        return matchesSearch && matchesDifficulty;
      });

      return {
        ...topic,
        originalIdx: tIdx,
        filteredProblems
      };
    }).filter(topic => topic.filteredProblems.length > 0);
  }, [searchQuery, filterDifficulty]);

  // Loading state fallback
  if (loading) {
    return (
      <div className="auth-container">
        <div className="glass auth-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
            DSA Mastery
          </h2>
          <div className="pulse-dot" style={{ margin: '2rem auto', width: '20px', height: '20px' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading Secure Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <PracticeTimer />

      {/* Sticky Navigation Bar */}
      <nav className="glass navbar fade-in">
        <div className="nav-brand">
          <h2 onClick={() => setShowAuthModal(null)}>DSA Mastery</h2>
        </div>

        <div className="nav-actions">
          {user ? (
            // Logged in Navigation View
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="user-profile-badge">
                <div className="user-avatar">
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                </div>
                <span className="user-name">{user.username}</span>
              </div>
              <button className="logout-btn-header" onClick={logout}>
                Sign Out
              </button>
            </div>
          ) : (
            // Guest Navigation View
            <>
              <button className="nav-link-btn" onClick={() => setShowAuthModal('login')}>
                Sign In
              </button>
              <button className="nav-action-btn-primary" onClick={() => setShowAuthModal('signup')}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Header and overall progress */}
      <header className="fade-in">
        <div className="header-top-row" style={{ marginBottom: '2rem' }}>
          <div className="header-content">
            <h1>Apna College DSA Dashboard</h1>
            <p className="subtitle">Master Shradha Ma'am's curated Apna College question bank of 375 placement problems.</p>
          </div>
        </div>

        <div className="glass overall-progress-card">
          <div className="progress-info">
            <span className="progress-label">Total Progress {user ? '(Synced)' : '(Guest)'}</span>
            <span className="progress-value">{progressPercent}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <p className="progress-subtext">{completedCount} / {totalProblems} problems completed</p>
        </div>
      </header>

      {/* Main Interactive Workspace */}
      <main className="dashboard-layout">
        <aside className="sidebar">
          <StatsDashboard topics={topics} completedProblems={completedProblems} />
        </aside>

        <section className="main-content">
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            filterDifficulty={filterDifficulty}
            setFilterDifficulty={setFilterDifficulty}
          />

          <div className="grid">
            {filteredTopics.map((topic) => (
              <TopicCard 
                key={topic.originalIdx}
                topic={{
                  ...topic,
                  problems: topic.filteredProblems
                }}
                topicIdx={topic.originalIdx}
                completedProblems={completedProblems}
                onToggle={handleToggle}
                searchQuery={searchQuery}
              />
            ))}
            {filteredTopics.length === 0 && (
              <div className="no-results glass fade-in">
                <p>No problems found matching your criteria.</p>
                <button className="reset-btn" onClick={() => {setSearchQuery(''); setFilterDifficulty('All');}}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Global Glassmorphic Auth Modal Overlay System */}
      {showAuthModal && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-content">
            {/* Close Button */}
            <button className="modal-close-btn" onClick={() => setShowAuthModal(null)}>
              &times;
            </button>
            
            {/* Active Authentication Screen */}
            {showAuthModal === 'login' && <Login setView={setShowAuthModal} />}
            {showAuthModal === 'signup' && <Signup setView={setShowAuthModal} />}
            {showAuthModal === 'forgot' && <ForgotPassword setView={setShowAuthModal} setResetToken={setResetToken} />}
            {showAuthModal === 'reset' && <ResetPassword setView={setShowAuthModal} resetToken={resetToken} />}
          </div>
        </div>
      )}

      <footer className="footer">
        <p>© 2026 DSA Mastery Platform. Engineered for top-tier placements.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
