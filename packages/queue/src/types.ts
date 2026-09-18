export type ScrapeJobsPayload = {
  // Empty payload for cron
};

export type ContentSyncPayload = {
  // Empty payload for cron
};

export type CvUnlockPayload = {
  // Empty payload for cron, checks database
};

export type NotificationSendPayload = {
  userId: string;
  type: 'email' | 'push';
  templateId: string;
  data: Record<string, any>;
};

export type AnalyticsAggregatePayload = {
  // Empty payload for cron
};

export type BuildUserProfilesPayload = {
  // Empty payload for cron
};

export type OutcomeCorrelationPayload = {
  // Empty payload for cron
};

export type ChurnDetectionPayload = {
  // Empty payload for cron
};

export const JOB_NAMES = {
  SCRAPE_JOBS: 'scrape-jobs',
  CONTENT_SYNC: 'content-sync',
  CV_UNLOCK: 'cv-unlock',
  NOTIFICATION_SEND: 'notification-send',
  ANALYTICS_AGGREGATE: 'analytics-aggregate',
  BUILD_USER_PROFILES: 'build-user-profiles',
  OUTCOME_CORRELATION: 'outcome-correlation',
  CHURN_DETECTION: 'churn-detection',
} as const;
