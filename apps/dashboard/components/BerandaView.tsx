'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ActionCenterCard } from '@/components/ActionCenterCard';
import { ContextualMarketingCard } from '@/components/ContextualMarketingCard';
import { QuickActionsGrid } from '@/components/QuickActionsGrid';
import { ApplicationSummaryCard } from '@/components/ApplicationSummaryCard';
import { ApplicationChartCard } from '@/components/ApplicationChartCard';
import { UpcomingScheduleCard } from '@/components/UpcomingScheduleCard';
import { CareerReadinessCard } from '@/components/CareerReadinessCard';
import { CVATSScoreCard } from '@/components/CVATSScoreCard';
import { RecentActivityTimeline } from '@/components/RecentActivityTimeline';
import { WeeklyApplicationSprintCard } from '@/components/WeeklyApplicationSprintCard';
import { LatestJobsList } from '@/components/LatestJobsList';
import { CareerDevelopmentTabs } from '@/components/CareerDevelopmentTabs';
import { getLokerUrl } from '@/lib/urls';

export function BerandaView() {
  const router = useRouter();

  return (
    <div className="w-full space-y-3 sm:space-y-3.5 pb-6">
      {/* 1. Action Center: Top Priority Hub */}
      <section id="section-action-center" className="w-full">
        <ActionCenterCard
          onPrimaryAction={() => router.push('/loker')}
        />
      </section>

      {/* 1.5 Contextual Marketing Nudge */}
      <section id="section-contextual-marketing" className="w-full">
        <ContextualMarketingCard />
      </section>

      {/* 1.8 Pintasan Alat Karier Cepat (Khusus Mobile Hub) */}
      <section id="section-quick-actions" className="w-full md:hidden">
        <QuickActionsGrid />
      </section>

      {/* 2. Ringkasan 4 KPI Utama */}
      <section id="section-kpi-summary" className="w-full">
        <ApplicationSummaryCard onViewTracker={() => router.push('/tracker')} />
      </section>

      {/* 3. Main Focus: Funnel Progress (8 cols) & Upcoming Schedule (4 cols) */}
      <section id="section-progress-schedule" className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <ApplicationChartCard />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <UpcomingScheduleCard />
        </div>
      </section>

      {/* 4. Career Readiness & CV ATS Score (Compact Expandable 6/6 Layout) */}
      <section id="section-readiness-ats" className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 items-stretch">
        <div className="flex flex-col h-full">
          <CareerReadinessCard onBoostClick={() => router.push('/career-intelligence')} />
        </div>
        <div id="section-cv" className="flex flex-col h-full">
          <CVATSScoreCard onOptimizeClick={() => router.push('/cv')} />
        </div>
      </section>

      {/* 5. Recent Activity & Weekly Application Sprint (6/6 Layout) */}
      <section id="section-timeline-sprint" className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
        <div className="lg:col-span-6 flex flex-col">
          <RecentActivityTimeline />
        </div>
        <div id="section-weekly-sprint" className="lg:col-span-6 flex flex-col">
          <WeeklyApplicationSprintCard />
        </div>
      </section>

      {/* 6. Rekomendasi Loker Cerdas (Semantic Matching) */}
      <section id="section-recommended-jobs" className="w-full">
        <LatestJobsList />
      </section>

      {/* 7. Career Development: Single Tabbed Component */}
      <section id="section-development" className="w-full min-w-0 overflow-hidden">
        <CareerDevelopmentTabs />
      </section>
    </div>
  );
}
