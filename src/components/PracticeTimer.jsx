import React, { useState, useEffect, useRef } from 'react';

const PracticeTimer = () => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setTime(0);
    setIsActive(false);
  };

  if (isMinimized) {
    return (
      <div className="timer-minimized glass" onClick={() => setIsMinimized(false)}>
        <span className="pulse-dot"></span>
        {formatTime(time)}
      </div>
    );
  }

  return (
    <div className="timer-expanded glass fade-in">
      <div className="timer-header">
        <span>Practice Session</span>
        <button className="close-btn" onClick={() => setIsMinimized(true)}>×</button>
      </div>
      <div className="timer-display">{formatTime(time)}</div>
      <div className="timer-controls">
        <button 
          className={`timer-btn ${isActive ? 'pause' : 'start'}`} 
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button className="timer-btn reset" onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};

export default PracticeTimer;
