'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';

interface LayoutWrapperProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({
  children,
  showSidebar = true,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div
      id="dashboard-root-layout"
      className="h-full min-h-full max-h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors font-sans print:h-auto print:overflow-visible print:block print:bg-white print:p-0 print:m-0"
    >
      {showSidebar && (
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden print:h-auto print:overflow-visible print:block print:w-[210mm] print:m-0 print:p-0">
        <Navbar
          onToggleSidebar={showSidebar ? toggleSidebar : undefined}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <main
          id="main-content-scroll"
          className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 pb-24 md:pb-5 w-full no-scrollbar print:h-auto print:overflow-visible print:p-0 print:m-0 print:block print:w-[210mm]"
        >
          <div className="w-full mx-auto space-y-3 sm:space-y-3.5 print:p-0 print:m-0 print:space-y-0 print:w-[210mm] print:max-w-none">
            {children}
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};
