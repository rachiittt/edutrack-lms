import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FloatingDock from './FloatingDock';
import MinimalTopBar from './MinimalTopBar';

const Layout: React.FC = () => {
  const location = useLocation();
  const isFocusMode = location.pathname.includes('/quiz/') && !location.pathname.includes('/results');

  if (isFocusMode) {
    return (
      <div className="workspace-layout">
        <main className="main-content overflow-y-auto">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="workspace-layout">
      <FloatingDock />
      <div className="relative flex min-h-screen flex-1 flex-col bg-primary-950 md:pl-72">
        <MinimalTopBar />
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 scroll-smooth md:px-8 md:pb-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
