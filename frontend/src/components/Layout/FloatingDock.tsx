import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import classNames from 'classnames';
import { useAuth } from '../../context/AuthContext';
import { resolveApiUrl } from '../../utils/urlResolver';
import { getNavigationItems } from './navigation';
import AboutModal from './AboutModal';

const FloatingDock: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const navItems = getNavigationItems(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-[#27272a] bg-[#09090b] md:flex">
        <div className="border-b border-[#27272a] px-6 py-6">
          <button 
            onClick={() => setIsAboutOpen(true)}
            className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity w-full"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111111] overflow-hidden shadow-lg border border-[#27272a]">
              <img src="/app-favicon.png" alt="EduTrack Logo" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = '/favicon.ico' }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-500">
                EduTrack
              </p>
              <p className="truncate text-lg font-semibold text-white">Learning Portal</p>
            </div>
          </button>
          <Link to="/profile" className="group mt-6 flex items-center gap-3 rounded-2xl border border-[#27272a] bg-[#09090b] p-4 transition-all hover:bg-[#111111] hover:border-primary-500/30 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/5 blur-[20px] rounded-full -mr-10 -mt-10" />
            <div className="relative z-10 h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[#1d1d20] shadow-sm group-hover:border-primary-500/40 transition-all">
              <img
                src={resolveApiUrl(user?.avatar) || `https://api.dicebear.com/9.x/miniavs/svg?seed=${encodeURIComponent(user?.name || 'user')}`}
                alt={user?.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="min-w-0 flex-1 relative z-10">
              <p className="truncate text-sm font-bold text-white tracking-tight">{user?.name}</p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-primary-500">{user?.role}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                classNames(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  {
                    'bg-white text-black': isActive,
                    'text-primary-300 hover:bg-[#1d1d20] hover:text-white': !isActive,
                  }
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#27272a] p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-primary-300 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#27272a] bg-[#09090b]/95 px-2 py-2 backdrop-blur md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              classNames(
                'flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors',
                {
                  'bg-white text-black': isActive,
                  'text-primary-400 hover:bg-[#1d1d20] hover:text-white': !isActive,
                }
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
};

export default FloatingDock;
