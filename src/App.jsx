import React, { useState, useEffect, useMemo } from 'react';
import { topics } from './data/problemsData';
import TopicCard from './components/TopicCard';
import StatsDashboard from './components/StatsDashboard';
import SearchBar from './components/SearchBar';
import PracticeTimer from './components/PracticeTimer';

function App() {
  const [completedProblems, setCompletedProblems] = useState(() => {
    const saved = localStorage.getItem('dsaCheckedState');
    return saved ? JSON.parse(saved) : {};
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  useEffect(() => {
    localStorage.setItem('dsaCheckedState', JSON.stringify(completedProblems));
  }, [completedProblems]);

  const handleToggle = (tIdx, pIdx) => {
    const key = `t${tIdx}p${pIdx}`;
    setCompletedProblems(prev => {
      const newState = { ...prev };
      if (newState[key]) {
        delete newState[key];
      } else {
        newState[key] = true;
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

  return (
    <div className="container">
      <PracticeTimer />
      
      <header className="fade-in">
        <div className="header-content">
          <h1>DSA Mastery</h1>
          <p className="subtitle">Premium placement preparation platform for mastering algorithms.</p>
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

export default App;
