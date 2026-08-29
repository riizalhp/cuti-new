'use client';

import { useState, useEffect, useCallback } from 'react';
import { cvApi, trackerApi } from '@/lib/api';
import {
  calculateReadinessScore,
  getStoredReadinessScore,
  setStoredReadinessScore,
  clearStoredReadinessScore,
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
  const [isDiagnosticStored, setIsDiagnosticStored] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [cvs, apps] = await Promise.all([
        cvApi.getAll().catch(() => []),
        trackerApi.getAll().catch(() => []),
      ]);

      const evalResult = calculateReadinessScore(cvs, apps);
      setChecklist(evalResult.checklist);
      setAvgAtsScore(evalResult.avgAtsScore);
      setCompletedCount(evalResult.completedCount);
      setTotalItems(evalResult.totalItems);

      const stored = getStoredReadinessScore();
      if (stored !== null) {
        setScore(stored);
        setIsDiagnosticStored(true);
      } else {
        setScore(evalResult.score);
        setIsDiagnosticStored(false);
      }
    } catch {
      // Fallback in case of network or API error
      const stored = getStoredReadinessScore();
      if (stored !== null) {
        setScore(stored);
        setIsDiagnosticStored(true);
      }
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
        setIsDiagnosticStored(true);
      } else {
        // If cleared, recalculate
        loadData();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cuti_career_readiness_score') {
        if (e.newValue !== null && !isNaN(Number(e.newValue))) {
          setScore(Number(e.newValue));
          setIsDiagnosticStored(true);
        } else {
          loadData();
        }
      }
    };

    window.addEventListener(READINESS_EVENT_NAME, handleReadinessEvent);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(READINESS_EVENT_NAME, handleReadinessEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadData]);

  const updateScore = useCallback((newScore: number) => {
    setStoredReadinessScore(newScore);
    setScore(newScore);
    setIsDiagnosticStored(true);
  }, []);

  const resetScore = useCallback(() => {
    clearStoredReadinessScore();
    loadData();
  }, [loadData]);

  return {
    score,
    checklist,
    avgAtsScore,
    completedCount,
    totalItems,
    isLoaded,
    isDiagnosticStored,
    updateScore,
    resetScore,
    reload: loadData,
  };
}
