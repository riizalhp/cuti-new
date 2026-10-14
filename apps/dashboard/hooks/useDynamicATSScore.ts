'use client';

import { useMemo, useState, useEffect } from 'react';
import { calculatePurposeAwareAtsScore } from '@/lib/cv-purpose-ats-score';
import { CvPurpose } from '@/lib/cv-purpose-scoring-engine';
import { DynamicATSResult, ATSIssue } from '@/lib/ats-score-types';

export function useDynamicATSScore(cvData: any, debounceMs = 300, purpose?: CvPurpose) {
  const [debouncedCvData, setDebouncedCvData] = useState(cvData);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCvData(cvData);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [cvData, debounceMs]);

  const resolvedPurpose: CvPurpose = (purpose || cvData?.purpose || 'job') as CvPurpose;

  const atsResult: DynamicATSResult = useMemo(() => {
    return calculatePurposeAwareAtsScore(debouncedCvData, resolvedPurpose);
  }, [debouncedCvData, resolvedPurpose]);

  const getSectionIssues = (section: string): ATSIssue[] => {
    return atsResult.issues.filter((i) => i.section === section);
  };

  return {
    atsResult,
    getSectionIssues,
  };
}
