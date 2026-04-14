import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CommandPalette from './CommandPalette';
import { getRouteMeta } from './navigation';

const MinimalTopBar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const routeMeta = getRouteMeta(location.pathname);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const initials = user?.name
    ?.split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#27272a] bg-[#09090b]/85 px-4 backdrop-blur md:px-8">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-500">
            {routeMeta.section}
          </p>
          <p className="truncate text-lg font-semibold text-white">{routeMeta.title}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden items-center gap-2 rounded-xl border border-[#27272a] bg-[#111111] px-3 py-2 text-sm text-primary-400 transition-colors hover:bg-[#1d1d20] md:flex md:w-64"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search courses or pages</span>
            <kbd className="hidden rounded bg-[#27272a] px-1.5 py-0.5 font-mono text-[10px] text-primary-300 sm:inline-block">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="btn-icon md:hidden"
            aria-label="Open command palette"
          >
            <Search className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-3 rounded-full border border-[#27272a] bg-[#111111] px-3 py-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15 text-xs font-semibold text-blue-300">
              {initials || 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs capitalize text-primary-500">{user?.role}</p>
            </div>
          </div>

          <button onClick={handleLogout} className="btn-secondary gap-2 px-3 py-2" title="Sign out of your account">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {isCommandPaletteOpen ? (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      ) : null}
    </>
  );
};

export default MinimalTopBar;
