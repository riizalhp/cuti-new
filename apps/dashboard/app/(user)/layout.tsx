'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/ui/BottomNav';
import { useModals } from '@/context/ModalContext';
import { useRouter, usePathname } from 'next/navigation';
import { FloatingAiAssistant } from '@/components/ai/FloatingAiAssistant';
import { getStoredSession } from '@/lib/auth';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { openUpgrade } = useModals();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const session = getStoredSession();
    if (!session || !session.email) {
      const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : '/login';
      router.replace(redirectUrl);
      return;
    }

    // Check if user has completed onboarding
    if (typeof window !== 'undefined') {
      const onboardingCompleted = localStorage.getItem('cuti_onboarding_completed');
      if (!onboardingCompleted && pathname !== '/onboarding') {
        router.replace('/onboarding');
      }
    }
  }, [pathname, router]);

  const isCvPage = pathname === '/cv' || pathname?.startsWith('/cv/');

  const toggleSidebarCollapse = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => {
        const next = !prev;
        if (typeof window !== 'undefined') {
          localStorage.setItem('sidebar_collapsed', String(next));
        }
        return next;
      });
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors font-sans print:h-auto print:overflow-visible print:block print:bg-white print:p-0 print:m-0">
      <Sidebar
        onOpenUpgradeModal={openUpgrade}
        onSwitchToAdminPortal={() => router.push('/admin')}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden print:h-auto print:overflow-visible print:block print:w-[210mm] print:m-0 print:p-0">
        <Header
          onToggleSidebar={toggleSidebarCollapse}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <main
          id="main-content-scroll"
          className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 w-full no-scrollbar print:h-auto print:overflow-visible print:p-0 print:m-0 print:block print:w-[210mm]"
        >
          <div className="w-full max-w-full xl:max-w-[1500px] 2xl:max-w-[1800px] 3xl:max-w-[2200px] mx-auto space-y-6 lg:space-y-8 print:p-0 print:m-0 print:space-y-0 print:w-[210mm] print:max-w-none">
            {children}
          </div>
        </main>

        {!isCvPage && <FloatingAiAssistant />}
        <BottomNav />
      </div>
    </div>
  );
}
