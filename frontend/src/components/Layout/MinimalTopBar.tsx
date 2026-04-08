import React, { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CommandPalette from './CommandPalette';

const MinimalTopBar: React.FC = () => {
  const { user } = useAuth();
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Focus simulation for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-16 border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 pl-[96px] md:pl-[96px]">
        {/* Breadcrumb / Title Area */}
        <div className="flex items-center">
          <span className="text-primary-400 text-sm font-medium">Workspace</span>
          <span className="mx-2 text-primary-600">/</span>
          <span className="text-white text-sm font-medium truncate">Overview</span>
        </div>

        {/* Global Search & Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 bg-[#111111] hover:bg-[#1d1d20] border border-[#27272a] rounded-lg px-3 py-1.5 text-sm text-primary-400 transition-colors w-64"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search anything...</span>
            <kbd className="hidden sm:inline-block text-[10px] bg-[#27272a] px-1.5 py-0.5 rounded font-mono text-primary-300">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-2">
             <button className="btn-icon relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
             </button>
             
             <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 pl-0.5 pt-0.5 cursor-pointer hover:ring-2 hover:ring-white/20 transition-all">
                <img 
                  src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} 
                  alt="Profile" 
                  className="w-full h-full rounded-full bg-[#1111] object-cover"
                />
             </div>
          </div>
        </div>
      </header>

      {/* Command Palette Overlay */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />
    </>
  );
};

export default MinimalTopBar;
