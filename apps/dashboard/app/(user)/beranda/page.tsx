'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useModals } from '@/context/ModalContext';
import { ProgressOnboarding } from '@/components/ProgressOnboarding';
import { ApplicationSummaryCard } from '@/components/ApplicationSummaryCard';
import { CareerReadinessCard } from '@/components/CareerReadinessCard';
import { CVATSScoreCard } from '@/components/CVATSScoreCard';
import { UpgradePremiumCard } from '@/components/UpgradePremiumCard';
import { ApplicationChartCard } from '@/components/ApplicationChartCard';
import { TodayMissionsCard } from '@/components/TodayMissionsCard';
import { RecentActivityTimeline } from '@/components/RecentActivityTimeline';
import { ReferralProgramCard } from '@/components/ReferralProgramCard';
import { AICareerAssistantCard } from '@/components/AICareerAssistantCard';
import { TipsAndInsightCard } from '@/components/TipsAndInsightCard';
import { CareerToolsGrid } from '@/components/CareerToolsGrid';
import { LatestJobsList } from '@/components/LatestJobsList';
import { LatestMissionsList } from '@/components/LatestMissionsList';
import { LatestArticlesList } from '@/components/LatestArticlesList';
import { LatestCoursesList } from '@/components/LatestCoursesList';
import { LatestCertificationsList } from '@/components/LatestCertificationsList';
import { LatestEventsList } from '@/components/LatestEventsList';

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};

export default function BerandaPage() {
  const router = useRouter();
  const { openUpgrade } = useModals();

  return (
    <>
      {/* 1. Progress Onboarding */}
      <section id="section-onboarding">
        <ProgressOnboarding
          onActionClick={(stepId) => {
            if (stepId === 'premium') openUpgrade();
            else if (stepId === 'cv') router.push('/cv');
            else if (stepId === 'lamar') scrollToSection('section-jobs');
            else router.push('/cv');
          }}
          onOpenUpgradeModal={openUpgrade}
        />
      </section>

      {/* 2. Ringkasan Lamaran */}
      <section id="section-summary" className="w-full">
        <ApplicationSummaryCard onViewTracker={() => router.push('/tracker')} />
      </section>

      {/* 3. BENTO GRID UTAMA DASHBOARD */}
      <div className="space-y-6">
        {/* Bento Row 1: Status & ATS Score & Upgrade Pass */}
        <section
          id="section-readiness"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch"
        >
          <div className="lg:col-span-4 flex flex-col">
            <CareerReadinessCard
              onBoostClick={() => scrollToSection('section-ai-assistant')}
            />
          </div>
          <div id="section-cv" className="lg:col-span-4 flex flex-col">
            <CVATSScoreCard
              onOptimizeClick={() => router.push('/cv')}
              onSendApplyClick={() => scrollToSection('section-jobs')}
            />
          </div>
          <div className="lg:col-span-4 flex flex-col">
            <UpgradePremiumCard onUpgradeClick={openUpgrade} />
          </div>
        </section>

        {/* Bento Row 2: Analytics Chart & Daily Quests */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <ApplicationChartCard />
          </div>
          <div className="lg:col-span-5 flex flex-col">
            <TodayMissionsCard />
          </div>
        </section>

        {/* Bento Row 3: Realtime Timeline & Referral Program */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-6 flex flex-col">
            <RecentActivityTimeline />
          </div>
          <div id="section-referral" className="lg:col-span-6 flex flex-col">
            <ReferralProgramCard />
          </div>
        </section>

        {/* Bento Row 4: AI Career Co-Pilot & Tips */}
        <section
          id="section-ai-assistant"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          <div className="lg:col-span-8 flex flex-col">
            <AICareerAssistantCard />
          </div>
          <div className="lg:col-span-4 flex flex-col">
            <TipsAndInsightCard />
          </div>
        </section>

        {/* Bento Row 5: Quick-Access Career Tools */}
        <section id="section-tools" className="w-full">
          <CareerToolsGrid />
        </section>
      </div>

      {/* 4. REKOMENDASI & FEEDS */}
      <div className="space-y-8 pt-4 border-t border-slate-200/80 dark:border-slate-800">
        <section id="section-jobs">
          <LatestJobsList />
        </section>
        <section id="section-missions">
          <LatestMissionsList />
        </section>
        <section>
          <LatestArticlesList />
        </section>
        <section>
          <LatestCoursesList />
        </section>
        <section>
          <LatestCertificationsList />
        </section>
        <section>
          <LatestEventsList />
        </section>
      </div>
    </>
  );
}
