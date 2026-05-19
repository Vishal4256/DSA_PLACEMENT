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
  const [authView, setAuthView] = useState('login'); // login, signup, forgot, reset
  const [resetToken, setResetToken] = useState('');
  
  const [completedProblems, setCompletedProblems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  // Load progress from user object when logged in
  useEffect(() => {
    if (user && user.completedProblems) {
      // If completedProblems is a Map, convert it to a standard JS object
      const progressObj = user.completedProblems instanceof Map 
        ? Object.fromEntries(user.completedProblems)
        : user.completedProblems;
      setCompletedProblems(progressObj || {});
    } else {
      setCompletedProblems({});
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
      
      // Sync progress with backend MongoDB database asynchronously
      syncProgress(newState);
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

  // Auth pages view routing if not logged in
  if (!user) {
    switch (authView) {
      case 'signup':
        return <Signup setView={setAuthView} />;
      case 'forgot':
        return <ForgotPassword setView={setAuthView} setResetToken={setResetToken} />;
      case 'reset':
        return <ResetPassword setView={setAuthView} resetToken={resetToken} />;
      case 'login':
      default:
        return <Login setView={setAuthView} />;
    }
  }

  return (
    <div className="container">
      <PracticeTimer />

      <header className="fade-in">
        <div className="header-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div className="header-content">
            <h1>DSA Mastery</h1>
            <p className="subtitle">Premium placement preparation platform for mastering algorithms.</p>
          </div>

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
        </div>

        <div className="glass overall-progress-card">
          <div className="progress-info">
            <span className="progress-label">Total Progress</span>
            <span className="progress-value">{progressPercent}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <p className="progress-subtext">{completedCount} / {totalProblems} problems completed</p>
        </div>
      </header>

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
