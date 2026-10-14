'use client';

import { useState, useEffect, useCallback } from 'react';
import { cvApi, trackerApi } from '@/lib/api';
import {
  calculateHolisticReadiness,
  ChecklistItem,
  PillarEvaluation,
  READINESS_EVENT_NAME,
  DIAGNOSTIC_QUIZ_STORAGE_KEY,
} from '@/lib/readiness';

export function useCareerReadiness() {
  const [score, setScore] = useState<number>(0);
  const [objectiveScore, setObjectiveScore] = useState<number>(0);
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<PillarEvaluation[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [avgAtsScore, setAvgAtsScore] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(4);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [diagnosticScore, setDiagnosticScore] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      // Check stored diagnostic quiz score first
      let currentDiag: number | null = null;
      if (typeof window !== 'undefined') {
        const storedDiag = localStorage.getItem(DIAGNOSTIC_QUIZ_STORAGE_KEY);
        if (storedDiag !== null && !isNaN(Number(storedDiag))) {
          currentDiag = Number(storedDiag);
          setDiagnosticScore(currentDiag);
        }
      }

      const [cvs, apps] = await Promise.all([
        cvApi.getAll().catch(() => []),
        trackerApi.getAll().catch(() => []),
      ]);

      const holistic = calculateHolisticReadiness(cvs, apps, currentDiag);
      setScore(holistic.score);
      setObjectiveScore(holistic.objectiveScore);
      setIsCalibrated(holistic.isCalibrated);
      setDimensions(holistic.dimensions);
      setChecklist(holistic.checklist);
      setAvgAtsScore(holistic.avgAtsScore);
      setCompletedCount(holistic.completedCount);
      setTotalItems(holistic.totalItems);
    } catch {
      // Fallback
      setScore(0);
      setObjectiveScore(0);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleReadinessEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ score?: number | null }>;
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

  const updateDiagnosticScore = useCallback(
    (newScore: number) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(DIAGNOSTIC_QUIZ_STORAGE_KEY, String(newScore));
      }
      setDiagnosticScore(newScore);
      // Re-trigger calculation with new diagnostic score
      loadData();
    },
    [loadData]
  );

  const resetDiagnosticScore = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DIAGNOSTIC_QUIZ_STORAGE_KEY);
      localStorage.removeItem('employr_career_readiness_score');
      localStorage.removeItem('cuti_career_readiness_score');
    }
    setDiagnosticScore(null);
    loadData();
  }, [loadData]);

  return {
    score,
    objectiveScore,
    isCalibrated,
    dimensions,
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
