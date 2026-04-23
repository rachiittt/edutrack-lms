import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FloatingDock from './FloatingDock';
import MinimalTopBar from './MinimalTopBar';
import Footer from './Footer';

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
      <div className="relative flex h-screen flex-1 flex-col bg-primary-950 md:pl-72 overflow-y-auto overflow-x-hidden">
        <MinimalTopBar />
        <main className="flex-1 px-4 py-6 pb-12 md:px-8 shrink-0">
          <div className="mx-auto w-full max-w-7xl animate-fade-in min-h-[calc(100vh-200px)]">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
