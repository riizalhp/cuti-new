'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useModals } from '@/context/ModalContext';
import { ActionCenterCard } from '@/components/ActionCenterCard';
import { ApplicationSummaryCard } from '@/components/ApplicationSummaryCard';
import { ApplicationChartCard } from '@/components/ApplicationChartCard';
import { UpcomingScheduleCard } from '@/components/UpcomingScheduleCard';
import { CareerReadinessCard } from '@/components/CareerReadinessCard';
import { CVATSScoreCard } from '@/components/CVATSScoreCard';
import { LatestJobsList } from '@/components/LatestJobsList';
import { RecentActivityTimeline } from '@/components/RecentActivityTimeline';
import { AICareerAssistantCard } from '@/components/AICareerAssistantCard';
import { CareerDevelopmentTabs } from '@/components/CareerDevelopmentTabs';

export default function BerandaPage() {
  const router = useRouter();
  const { openUpgrade } = useModals();

  return (
    <div className="space-y-6 pb-8 max-w-7xl mx-auto">
      {/* 1. Action Center: Top Priority Hub */}
      <section id="section-action-center" className="w-full">
        <ActionCenterCard
          userName="Andi"
          onPrimaryAction={() => router.push('/interview')}
        />
      </section>

      {/* 2. Ringkasan 4 KPI Utama */}
      <section id="section-kpi-summary" className="w-full">
        <ApplicationSummaryCard onViewTracker={() => router.push('/tracker')} />
      </section>

      {/* 3. Main Focus: Funnel Progress (8 cols) & Upcoming Schedule (4 cols) */}
      <section id="section-progress-schedule" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <ApplicationChartCard />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <UpcomingScheduleCard />
        </div>
      </section>

      {/* 4. Career Readiness & CV ATS Score (Compact Expandable 6/6 Layout) */}
      <section id="section-readiness-ats" className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="flex flex-col h-full">
          <CareerReadinessCard onBoostClick={() => router.push('/readiness')} />
        </div>
        <div id="section-cv" className="flex flex-col h-full">
          <CVATSScoreCard onOptimizeClick={() => router.push('/cv')} />
        </div>
      </section>

      {/* 5. Recommended Jobs: Top 3 Matching Jobs */}
      <section id="section-jobs" className="w-full">
        <LatestJobsList />
      </section>

      {/* 6. Recent Activity & AI Personal Insight (6/6 Layout) */}
      <section id="section-timeline-ai" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 flex flex-col">
          <RecentActivityTimeline />
        </div>
        <div id="section-ai-assistant" className="lg:col-span-6 flex flex-col">
          <AICareerAssistantCard />
        </div>
      </section>

      {/* 7. Career Development: Single Tabbed Component */}
      <section id="section-development" className="w-full">
        <CareerDevelopmentTabs />
      </section>
    </div>
  );
}
