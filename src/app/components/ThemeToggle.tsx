
'use client';

import { useState, useEffect, useRef } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark'); // Default to dark theme
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();
    audioRef.current.volume = 0.3;
    
    // Try to load the toggle sound
    try {
      // We'll need to create this sound file or use an alternative approach
      const soundUrl = '/sounds/toggle.mp3';
      fetch(soundUrl, { method: 'HEAD' })
        .then(res => {
          if (res.ok) {
            if (audioRef.current) audioRef.current.src = soundUrl;
          } else {
            console.log('Toggle sound not available');
          }
        })
        .catch(e => console.log('Sound check error:', e));
    } catch (e) {
      console.log('Sound initialization error:', e);
    }

    // Initialize theme
    const storedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(storedTheme);
    document.documentElement.setAttribute('data-theme', storedTheme);

    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleTheme = () => {
    const currentTheme = theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Play sound effect
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Sound could not be played:', e));
      }
    } catch (e) {
      console.log('Sound error:', e);
    }

    // Add switching animation
    if (toggleButtonRef.current) {
      toggleButtonRef.current.classList.add('switching');
      
      setTimeout(() => {
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
      }, 300);

      setTimeout(() => {
        if (toggleButtonRef.current) {
          toggleButtonRef.current.classList.remove('switching');
        }
      }, 600);
    }
  };

  return (
    <button 
      ref={toggleButtonRef}
      className="theme-toggle" 
      onClick={toggleTheme}
      title="Toggle dark mode"
    >
      <svg className="sun-icon" viewBox="0 0 24 24" fill="none" style={{ display: theme === 'light' ? 'block' : 'none' }}>
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2"/>
        <path d="M12 20v2"/>
        <path d="m4.93 4.93 1.41 1.41"/>
        <path d="m17.66 17.66 1.41 1.41"/>
        <path d="M2 12h2"/>
        <path d="M20 12h2"/>
        <path d="m6.34 17.66-1.41 1.41"/>
        <path d="m19.07 4.93-1.41 1.41"/>
      </svg>
      <svg className="moon-icon" viewBox="0 0 24 24" fill="none" style={{ display: theme === 'dark' ? 'block' : 'none' }}>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        <path d="M19 3v4"/>
        <path d="M21 5h-4"/>
      </svg>
    </button>
  );
}
