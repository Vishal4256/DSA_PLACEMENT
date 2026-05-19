import React, { useState } from 'react';

const HighlightText = ({ text, highlight }) => {
  if (!highlight.trim()) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => (
        part.toLowerCase() === highlight.toLowerCase() ? 
          <mark key={i} className="highlight">{part}</mark> : 
          <span key={i}>{part}</span>
      ))}
    </span>
  );
};

const ProblemRow = ({ problem, topicIdx, probIdx, isCompleted, onToggle, searchQuery }) => {
  return (
    <div className={`problem-row ${isCompleted ? 'completed' : ''}`}>
      <div className="problem-left">
        <label className="checkbox-container">
          <input 
            type="checkbox" 
            checked={isCompleted} 
            onChange={() => onToggle(topicIdx, probIdx)}
          />
          <span className="checkmark"></span>
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="problem-name">
            <HighlightText text={problem.name} highlight={searchQuery} />
          </span>
          {(problem.companies || problem.remarks) && (
            <div className="problem-meta-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
              {problem.companies && problem.companies.split(' ').map((company, idx) => {
                const trimmed = company.trim();
                return trimmed ? (
                  <span key={idx} className="company-badge">
                    {trimmed}
                  </span>
                ) : null;
              })}
              {problem.remarks && (
                <span className="remark-badge">
                  💡 {problem.remarks}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="problem-right">
        <span className={`difficulty-badge difficulty-${problem.difficulty.toLowerCase()}`}>
          {problem.difficulty}
        </span>
        {problem.link ? (
          <a href={problem.link} target="_blank" rel="noopener noreferrer" className="practice-btn">
            Solve
          </a>
        ) : (
          <span className="practice-btn disabled">N/A</span>
        )}
      </div>
    </div>
  );
};

const TopicCard = ({ topic, topicIdx, completedProblems, onToggle, searchQuery }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const completedCount = topic.problems.filter((_, idx) => 
    completedProblems[`t${topicIdx}p${idx}`]
  ).length;

  // Auto-open if searching
  const shouldBeOpen = isOpen || (searchQuery && topic.problems.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className={`glass glass-hover topic-card fade-in ${(isOpen || shouldBeOpen) ? 'active' : ''}`}>
      <div className="topic-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="topic-info">
          <span className="topic-icon">{topic.icon}</span>
          <div>
            <h3 className="topic-name">{topic.name}</h3>
            <span className="topic-count">{completedCount} / {topic.problems.length} Solved</span>
          </div>
        </div>
        <div className="header-right">
          <div className="topic-progress-mini">
             <div className="mini-bar-bg">
                <div className="mini-bar-fill" style={{ width: `${(completedCount / topic.problems.length) * 100}%` }}></div>
             </div>
          </div>
          <svg 
            style={{ transform: (isOpen || shouldBeOpen) ? 'rotate(180deg)' : 'rotate(0)', transition: '0.3s' }} 
            width="20" height="20" viewBox="0 0 20 20" fill="none"
          >
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      
      {(isOpen || shouldBeOpen) && (
        <div className="problem-list">
          {topic.problems.map((problem, pIdx) => (
            <ProblemRow 
              key={pIdx}
              problem={problem}
              topicIdx={topicIdx}
              probIdx={pIdx}
              isCompleted={!!completedProblems[`t${topicIdx}p${pIdx}`]}
              onToggle={onToggle}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicCard;
