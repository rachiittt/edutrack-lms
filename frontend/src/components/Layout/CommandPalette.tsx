import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import classNames from 'classnames';
import { useAuth } from '../../context/AuthContext';
import { getNavigationItems } from './navigation';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const commands = useMemo(
    () =>
      getNavigationItems(user?.role).map((item) => ({
        title: item.label,
        icon: item.icon,
        path: item.path,
      })),
    [user?.role]
  );

  const filteredCommands = useMemo(() => {
    const filtered =
      query === ''
        ? commands
        : commands.filter((command) =>
            command.title.toLowerCase().includes(query.toLowerCase())
          );

    if (query !== '' && filtered.length === 0) {
      return [
        {
          title: `Search courses for "${query}"`,
          icon: Search,
          path: `/courses?search=${encodeURIComponent(query)}`,
        },
      ];
    }

    return filtered;
  }, [commands, query]);

  const handleSelect = useCallback(
    (path: string) => {
      navigate(path);
      onClose();
    },
    [navigate, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => inputRef.current?.focus(), 10);
    document.body.style.overflow = 'hidden';

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen || filteredCommands.length === 0) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setActiveIndex((current) => (current + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex(
            (current) => (current - 1 + filteredCommands.length) % filteredCommands.length
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredCommands[activeIndex]) {
            handleSelect(filteredCommands[activeIndex].path);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, filteredCommands, handleSelect, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-palette animate-command-enter">
        <div className="flex items-center border-b border-[#27272a] px-4">
          <Search className="h-5 w-5 shrink-0 text-primary-400" />
          <input
            ref={inputRef}
            type="text"
            className="w-full border-none bg-transparent px-4 py-4 font-medium text-white placeholder:text-primary-500 focus:outline-none focus:ring-0"
            placeholder="Type a page name or search term"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
          />
          <kbd className="hidden rounded bg-[#27272a] px-1.5 py-0.5 font-mono text-[10px] text-primary-400 sm:inline-block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-sm text-primary-500">No results found.</div>
          ) : (
            <div>
              <div className="mb-1 px-2 py-1 text-xs font-semibold text-primary-500">
                Navigation
              </div>
              {filteredCommands.map((command, index) => (
                <button
                  key={command.title}
                  onClick={() => handleSelect(command.path)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={classNames(
                    'flex w-full items-center rounded-lg px-3 py-3 text-left transition-colors',
                    {
                      'bg-[#1d1d20] text-white': activeIndex === index,
                      'text-primary-300 hover:bg-[#1d1d20]/50 hover:text-white':
                        activeIndex !== index,
                    }
                  )}
                >
                  <command.icon className="mr-3 h-4 w-4 shrink-0" />
                  <span className="flex-1 text-sm">{command.title}</span>
                  {activeIndex === index && <ArrowRight className="h-4 w-4 text-primary-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#27272a] bg-[#09090b] px-4 py-3 text-xs text-primary-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-[#27272a] px-1">↑</kbd>
              <kbd className="rounded bg-[#27272a] px-1">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-[#27272a] px-1">↵</kbd>
              to select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
