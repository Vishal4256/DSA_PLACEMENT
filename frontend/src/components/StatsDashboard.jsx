import React from 'react';

const StatsDashboard = ({ topics, completedProblems }) => {
  const stats = {
    Easy: { total: 0, completed: 0, color: '#10b981' },
    Medium: { total: 0, completed: 0, color: '#f59e0b' },
    Hard: { total: 0, completed: 0, color: '#ef4444' },
  };

  topics.forEach((topic, tIdx) => {
    topic.problems.forEach((problem, pIdx) => {
      const difficulty = problem.difficulty;
      if (stats[difficulty]) {
        stats[difficulty].total++;
        if (completedProblems[`t${tIdx}p${pIdx}`]) {
          stats[difficulty].completed++;
        }
      }
    });
  });

  return (
    <div className="glass stats-grid fade-in" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Performance Analytics</h3>
      <div className="stats-container">
        {Object.entries(stats).map(([diff, data]) => {
          const percent = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
          return (
            <div key={diff} className="stat-card">
              <div className="stat-info">
                <span className="stat-label">{diff}</span>
                <span className="stat-value">{data.completed} / {data.total}</span>
              </div>
              <div className="stat-bar-bg">
                <div 
                  className="stat-bar-fill" 
                  style={{ 
                    width: `${percent}%`, 
                    backgroundColor: data.color,
                    boxShadow: `0 0 10px ${data.color}44`
                  }}
                ></div>
              </div>
              <span className="stat-percent">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsDashboard;
