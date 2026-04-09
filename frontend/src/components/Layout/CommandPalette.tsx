import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import classNames from 'classnames';
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}
const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const commands = [
    { title: 'Go to Workspace', icon: LayoutDashboard, path: '/dashboard', category: 'Navigation' },
    { title: 'Browse Courses', icon: BookOpen, path: '/courses', category: 'Navigation' },
    { title: 'My Learning', icon: GraduationCap, path: '/my-courses', category: 'Navigation' },
  ];
  let filteredCommands = query === ''
    ? commands
    : commands.filter(cmd => cmd.title.toLowerCase().includes(query.toLowerCase()));

  if (query !== '' && filteredCommands.length === 0) {
    filteredCommands = [{
       title: `Search catalog for "${query}"`,
       icon: Search,
       path: `/courses?search=${encodeURIComponent(query)}`,
       category: 'Search'
    }];
  }
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[activeIndex]) {
            handleSelect(filteredCommands[activeIndex].path);
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, activeIndex, onClose]);
  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {}
      <div className="relative w-full max-w-xl bg-[#111111] rounded-xl shadow-palette border border-[#27272a] overflow-hidden animate-command-enter">
        {}
        <div className="flex items-center px-4 border-b border-[#27272a]">
          <Search className="w-5 h-5 text-primary-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full px-4 py-4 bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-primary-500 font-medium"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
          />
          <kbd className="hidden sm:inline-block text-[10px] bg-[#27272a] px-1.5 py-0.5 rounded font-mono text-primary-400">
            ESC
          </kbd>
        </div>
        {}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-primary-500 text-sm">
              No results found.
            </div>
          ) : (
            <div>
              <div className="px-2 py-1 text-xs font-semibold text-primary-500 mb-1">
                Navigation
              </div>
              {filteredCommands.map((cmd, idx) => (
                <button
                  key={cmd.title}
                  onClick={() => handleSelect(cmd.path)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={classNames(
                    "w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors",
                    {
                      "bg-[#1d1d20] text-white": activeIndex === idx,
                      "text-primary-300 hover:bg-[#1d1d20]/50 hover:text-white": activeIndex !== idx
                    }
                  )}
                >
                  <cmd.icon className="w-4 h-4 mr-3 shrink-0" />
                  <span className="flex-1 text-sm">{cmd.title}</span>
                  {activeIndex === idx && (
                    <ArrowRight className="w-4 h-4 text-primary-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        {}
        <div className="px-4 py-3 bg-[#09090b] border-t border-[#27272a] flex items-center justify-between text-xs text-primary-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="bg-[#27272a] px-1 rounded">↑</kbd>
              <kbd className="bg-[#27272a] px-1 rounded">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-[#27272a] px-1 rounded">↵</kbd>
              to select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CommandPalette;
