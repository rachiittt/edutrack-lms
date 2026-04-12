import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, GraduationCap } from 'lucide-react';
import classNames from 'classnames';
import { useAuth } from '../../context/AuthContext';
import { getNavigationItems } from './navigation';

const FloatingDock: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = getNavigationItems(user?.role);
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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-[#27272a] bg-[#09090b] md:flex">
        <div className="border-b border-[#27272a] px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-base font-bold text-black">
              E
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-500">
                EduTrack
              </p>
              <p className="text-lg font-semibold text-white">Learning Portal</p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#27272a] bg-[#111111] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-sm font-semibold text-blue-300">
              {initials || <GraduationCap className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
              <p className="truncate text-xs text-primary-500">{user?.email}</p>
            </div>
          </div>
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

        <div className="border-t border-[#27272a] p-4">
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
    </>
  );
};

export default FloatingDock;
