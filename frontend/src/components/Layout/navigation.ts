import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BookOpen,
  FolderPlus,
  GraduationCap,
  LayoutDashboard,
} from 'lucide-react';
import type { User } from '../../types';

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const getNavigationItems = (role?: User['role']): NavigationItem[] => {
  const canManageCourses = role === 'teacher' || role === 'admin';

  if (canManageCourses) {
    return [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Courses', path: '/courses', icon: BookOpen },
      { label: 'My Courses', path: '/my-courses', icon: GraduationCap },
      { label: 'Create Course', path: '/create-course', icon: FolderPlus },
    ];
  }

  return [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Courses', path: '/courses', icon: BookOpen },
    { label: 'My Courses', path: '/my-courses', icon: GraduationCap },
    { label: 'My Results', path: '/my-results', icon: Award },
  ];
};

export const getRouteMeta = (pathname: string) => {
  if (pathname.startsWith('/quiz/') && pathname.endsWith('/results')) {
    return { section: 'Assessments', title: 'Quiz Results' };
  }

  if (pathname.startsWith('/quiz/')) {
    return { section: 'Assessments', title: 'Take Quiz' };
  }

  if (pathname.startsWith('/courses/') && pathname !== '/courses/create') {
    return { section: 'Courses', title: 'Course Details' };
  }

  const routeMap: Record<string, { section: string; title: string }> = {
    '/dashboard': { section: 'Overview', title: 'Dashboard' },
    '/courses': { section: 'Catalog', title: 'Courses' },
    '/my-courses': { section: 'Learning', title: 'My Courses' },
    '/my-results': { section: 'Performance', title: 'My Results' },
    '/create-course': { section: 'Course Management', title: 'Create Course' },
    '/login': { section: 'Authentication', title: 'Sign In' },
    '/register': { section: 'Authentication', title: 'Create Account' },
  };

  return routeMap[pathname] || { section: 'EduTrack LMS', title: 'Dashboard' };
};
