'use client';

import { useState, useEffect, useCallback } from 'react';
import { cvApi, trackerApi } from '@/lib/api';
import {
  calculateHolisticReadiness,
  calculateReadinessScore,
  ChecklistItem,
  READINESS_EVENT_NAME,
} from '@/lib/readiness';

export function useCareerReadiness() {
  const [score, setScore] = useState<number>(0);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [avgAtsScore, setAvgAtsScore] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(5);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [diagnosticScore, setDiagnosticScore] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [cvs, apps] = await Promise.all([
        cvApi.getAll().catch(() => []),
        trackerApi.getAll().catch(() => []),
      ]);

      const holistic = calculateHolisticReadiness(cvs, apps);
      setScore(holistic.score);
      setChecklist(holistic.checklist);
      setAvgAtsScore(holistic.avgAtsScore);
      setCompletedCount(holistic.completedCount);
      setTotalItems(holistic.totalItems);

      // Check if diagnostic self-assessment was stored
      if (typeof window !== 'undefined') {
        const storedDiag = localStorage.getItem('employr_diagnostic_quiz_score');
        if (storedDiag !== null && !isNaN(Number(storedDiag))) {
          setDiagnosticScore(Number(storedDiag));
        }
      }
    } catch {
      // Fallback
      setScore(0);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleReadinessEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ score: number | null }>;
      if (customEvent.detail && typeof customEvent.detail.score === 'number') {
        setScore(customEvent.detail.score);
      } else {
        loadData();
      }
    };

    window.addEventListener(READINESS_EVENT_NAME, handleReadinessEvent);

    return () => {
      window.removeEventListener(READINESS_EVENT_NAME, handleReadinessEvent);
    };
  }, [loadData]);

  const updateDiagnosticScore = useCallback((newScore: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('employr_diagnostic_quiz_score', String(newScore));
    }
    setDiagnosticScore(newScore);
  }, []);

  const resetDiagnosticScore = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('employr_diagnostic_quiz_score');
      // Clean legacy keys if any
      localStorage.removeItem('employr_career_readiness_score');
      localStorage.removeItem('cuti_career_readiness_score');
    }
    setDiagnosticScore(null);
  }, []);

  return {
    score,
    checklist,
    avgAtsScore,
    completedCount,
    totalItems,
    isLoaded,
    diagnosticScore,
    updateDiagnosticScore,
    resetDiagnosticScore,
    reload: loadData,
  };
}
