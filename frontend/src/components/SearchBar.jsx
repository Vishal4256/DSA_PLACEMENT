import React from 'react';

const SearchBar = ({ searchQuery, setSearchQuery, filterDifficulty, setFilterDifficulty }) => {
  return (
    <div className="search-wrapper fade-in">
      <div className="glass search-container">
        <div className="search-input-group">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="search-icon">
            <path d="M19 19L14.65 14.65M17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search problems..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setFilterDifficulty(diff)}
              className={`filter-btn ${filterDifficulty === diff ? 'active' : ''}`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
