import type PgBoss from 'pg-boss';
import { prisma } from '@employr/db';
import { JOB_NAMES } from '../types.ts';

export const BUILD_PROFILES_CRON = '0 20 * * *'; // 03:00 WIB

export async function registerBuildUserProfiles(boss: PgBoss) {
  await boss.schedule(JOB_NAMES.BUILD_USER_PROFILES, BUILD_PROFILES_CRON, null, { tz: 'UTC' });
  
  await boss.work(JOB_NAMES.BUILD_USER_PROFILES, async (job) => {
    try {
      // 1. Get all users active in last 30 days
      const activeUsers = await prisma.$queryRaw<any[]>`
        SELECT DISTINCT user_id 
        FROM visitor_activities 
        WHERE created_at >= NOW() - INTERVAL '30 days' AND user_id IS NOT NULL
      `;

      const userIds = activeUsers.map((u) => u.user_id);
      const BATCH_SIZE = 50;

      for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
        const batch = userIds.slice(i, i + BATCH_SIZE);
        
        for (const userId of batch) {
          // top features
          const features = await prisma.$queryRaw<any[]>`
            SELECT metadata->>'feature_name' as feature, COUNT(*)::int as count
            FROM visitor_activities
            WHERE user_id = ${userId} AND activity_type = 'FEATURE_USAGE'
            GROUP BY metadata->>'feature_name'
            ORDER BY count DESC
            LIMIT 5
          `;
          const topFeatures = features.map((f) => f.feature).filter(Boolean);

          // preferred industries - checking if the column exists by catching the error if it fails
          let preferredIndustries: string[] = [];
          try {
            const industries = await prisma.$queryRaw<any[]>`
              SELECT DISTINCT industry 
              FROM applications 
              WHERE user_id = ${userId} AND industry IS NOT NULL
            `;
            preferredIndustries = industries.map((ind) => ind.industry);
          } catch (e) {
            // column might not exist, silently ignore
          }

          // avg session duration
          const sessions = await prisma.$queryRaw<any[]>`
            SELECT COALESCE(AVG(duration_sec), 0)::float as avg_sec
            FROM visitor_sessions
            WHERE user_id = ${userId}
          `;
          const avgSessionMinutes = (sessions[0]?.avg_sec || 0) / 60;

          // last active
          const lastActiveResult = await prisma.$queryRaw<any[]>`
            SELECT MAX(created_at) as last_active
            FROM visitor_activities
            WHERE user_id = ${userId}
          `;
          const lastActiveAt = lastActiveResult[0]?.last_active || null;

          // applications
          const apps = await prisma.$queryRaw<any[]>`
            SELECT status 
            FROM applications 
            WHERE user_id = ${userId}
          `;
          const totalApplications = apps.length;
          const interviewCount = apps.filter(a => ['INTERVIEW', 'OFFERING', 'ACCEPTED'].includes(a.status)).length;
          const interviewRate = totalApplications > 0 ? interviewCount / totalApplications : 0;

          // check CV
          let hasCv = false;
          try {
            const cvs = await prisma.$queryRaw<any[]>`
              SELECT id FROM cvs WHERE user_id = ${userId} LIMIT 1
            `;
            hasCv = cvs.length > 0;
          } catch (e) {
            // ignore if table doesn't exist yet
          }

          // lifecycle stage
          let lifecycleStage = 'NEW';
          
          let daysSinceActive = 0;
          if (lastActiveAt) {
            const diff = Date.now() - new Date(lastActiveAt).getTime();
            daysSinceActive = Math.floor(diff / (1000 * 60 * 60 * 24));
          }

          if (daysSinceActive > 30) {
            lifecycleStage = 'CHURNED';
          } else if (apps.some(a => a.status === 'ACCEPTED')) {
            lifecycleStage = 'HIRED';
          } else if (apps.some(a => a.status === 'INTERVIEW')) {
            lifecycleStage = 'INTERVIEWING';
          } else if (totalApplications > 0) {
            lifecycleStage = 'APPLYING';
          } else if (hasCv) {
            lifecycleStage = 'BUILDING';
          }

          // churn risk
          let churnRisk = 'LOW';
          if (daysSinceActive > 21) {
            churnRisk = 'HIGH';
          } else if (daysSinceActive > 7) {
            churnRisk = 'MEDIUM';
          }

          // Upsert profile
          await prisma.$executeRawUnsafe(\`
            INSERT INTO user_behavior_profiles (
              user_id, 
              top_features_used, 
              preferred_industries, 
              avg_session_minutes, 
              total_applications, 
              interview_rate, 
              lifecycle_stage, 
              last_active_at, 
              churn_risk
            ) VALUES ($1, $2::jsonb, $3::jsonb, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (user_id) DO UPDATE SET 
              top_features_used = EXCLUDED.top_features_used,
              preferred_industries = EXCLUDED.preferred_industries,
              avg_session_minutes = EXCLUDED.avg_session_minutes,
              total_applications = EXCLUDED.total_applications,
              interview_rate = EXCLUDED.interview_rate,
              lifecycle_stage = EXCLUDED.lifecycle_stage,
              last_active_at = EXCLUDED.last_active_at,
              churn_risk = EXCLUDED.churn_risk
          \`, 
            userId, 
            JSON.stringify(topFeatures), 
            JSON.stringify(preferredIndustries), 
            avgSessionMinutes, 
            totalApplications, 
            interviewRate, 
            lifecycleStage, 
            lastActiveAt, 
            churnRisk
          );
        }
      }
    } catch (err) {
      console.error('Error in build user profiles job:', err);
      throw err;
    }
  });
}
