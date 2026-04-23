import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import CommandPalette from './CommandPalette';
import NotificationBell from '../NotificationBell';
import { getRouteMeta } from './navigation';
import AboutModal from './AboutModal';

const MinimalTopBar: React.FC = () => {
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const location = useLocation();
  const routeMeta = getRouteMeta(location.pathname);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  return (
    <>
      <header className="sticky top-0 z-30 flex h-24 items-center justify-between border-b border-[#27272a] bg-[#09090b] px-8 md:px-12 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-4 min-w-0">
          {/* Mobile Logo */}
          <button onClick={() => setIsAboutOpen(true)} className="flex md:hidden items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] overflow-hidden shadow-lg border border-[#27272a]">
              <img src="/app-favicon.png" alt="EduTrack Logo" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = '/favicon.ico' }} />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">EduTrack</span>
          </button>
          
          {/* Desktop Titles / Breadcrumb */}
          <div className="hidden md:flex items-center gap-6 ml-4">
            <div className="h-8 w-px bg-[#27272a]" />
            <div className="flex items-center gap-4 h-12 text-sm font-bold bg-[#111111]/50 px-6 rounded-2xl border border-[#27272a]/50">
              <span className="text-primary-600 uppercase tracking-[0.25em] text-[10px]">{routeMeta.section}</span>
              <span className="text-[#27272a] text-sm font-normal">/</span>
              <span className="text-white truncate max-w-[250px] text-base tracking-tight">{routeMeta.title}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden items-center gap-4 rounded-2xl border border-[#27272a] bg-[#0c0c0e] px-6 h-12 text-base text-primary-400 transition-all hover:bg-[#111111] hover:border-primary-500/40 md:flex md:w-96 shadow-lg shadow-black/40 group"
          >
            <Search className="h-5 w-5 text-primary-500/70 group-hover:text-primary-400 transition-colors" />
            <span className="flex-1 text-left font-medium text-primary-400/80 group-hover:text-primary-300">Search courses or pages</span>
            <kbd className="hidden rounded-xl bg-[#1a1a1c] px-3 py-1 font-mono text-xs text-primary-500 border border-[#27272a] sm:inline-block shadow-sm group-hover:text-primary-400 transition-colors">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="btn-icon h-12 w-12 rounded-2xl border border-[#27272a] bg-[#111111] md:hidden flex items-center justify-center text-primary-400 hover:text-white"
            aria-label="Open command palette"
          >
            <Search className="h-5 w-5" />
          </button>

          <div className="h-8 w-px bg-[#27272a] hidden md:block" />

          <NotificationBell />
        </div>
      </header>

      {isCommandPaletteOpen ? (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      ) : null}

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
};

export default MinimalTopBar;
