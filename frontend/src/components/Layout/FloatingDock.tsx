import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  LogOut,
  FolderPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import classNames from 'classnames';
const FloatingDock: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const navItems = isTeacher
    ? [
        { name: 'Workspace', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Browse', path: '/courses', icon: BookOpen },
        { name: 'My Projects', path: '/my-courses', icon: FolderPlus },
        { name: 'Studio', path: '/create-course', icon: FolderPlus },
      ]
    : [
        { name: 'Workspace', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Browse', path: '/courses', icon: BookOpen },
        { name: 'My Learning', path: '/my-courses', icon: GraduationCap },
        { name: 'Achievements', path: '/my-results', icon: Award },
      ];
  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex flex-col items-center py-6 px-3 bg-[#09090b] border-r border-[#27272a] w-[72px] transition-all duration-300 group hover:w-[240px] overflow-hidden">
      {}
      <div className="flex items-center justify-start w-full px-2 mb-10 h-10 overflow-hidden shrink-0">
        <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-bold text-xl shrink-0">
          E
        </div>
        <span className="ml-4 font-semibold text-white tracking-tight whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          EduTrack
        </span>
      </div>
      {}
      <nav className="flex-1 w-full space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              classNames(
                'flex items-center w-full p-2.5 rounded-lg transition-all duration-200 group/item relative',
                {
                  'bg-[#27272a] text-white': isActive,
                  'text-primary-400 hover:bg-[#1d1d20] hover:text-white': !isActive,
                }
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="ml-4 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {item.name}
            </span>
            {}
            <div className="absolute left-14 bg-white text-black px-2 py-1 rounded text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover/item:opacity-100 group-hover:hidden transition-opacity z-50">
              {item.name}
            </div>
          </NavLink>
        ))}
      </nav>
      {}
      <div className="w-full pt-4 border-t border-[#27272a]">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-2.5 rounded-lg transition-all duration-200 text-primary-400 hover:bg-red-500/10 hover:text-red-500 group/item relative"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="ml-4 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Sign out
          </span>
          <div className="absolute left-14 bg-white text-black px-2 py-1 rounded text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover/item:opacity-100 group-hover:hidden transition-opacity z-50">
            Sign out
          </div>
        </button>
      </div>
    </aside>
  );
};
export default FloatingDock;
