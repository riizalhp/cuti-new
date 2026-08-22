'use client';

import { useMemo, useState, useEffect } from 'react';
import { calculateDynamicAtsScore } from '@/lib/ats-score-engine';
import { DynamicATSResult, ATSIssue } from '@/lib/ats-score-types';

export function useDynamicATSScore(cvData: any, debounceMs = 300) {
  const [debouncedCvData, setDebouncedCvData] = useState(cvData);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCvData(cvData);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [cvData, debounceMs]);

  const atsResult: DynamicATSResult = useMemo(() => {
    return calculateDynamicAtsScore(debouncedCvData);
  }, [debouncedCvData]);

  const getSectionIssues = (section: string): ATSIssue[] => {
    return atsResult.issues.filter((i) => i.section === section);
  };

  return {
    atsResult,
    getSectionIssues,
  };
}
