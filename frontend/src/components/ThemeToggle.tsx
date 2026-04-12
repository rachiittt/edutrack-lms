import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const stored = localStorage.getItem('edutrack_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return stored === 'dark' || (!stored && prefersDark);
};

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('edutrack_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = () => {
    setIsDark((current) => !current);
  };

  return (
    <button
      onClick={toggle}
      className="group relative rounded-xl border border-[#27272a] bg-[#111111] p-2 transition-all duration-300 hover:bg-[#1d1d20]"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`w-5 h-5 text-amber-500 absolute inset-0 transition-all duration-300 ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        <Moon
          className={`w-5 h-5 text-primary-400 absolute inset-0 transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
