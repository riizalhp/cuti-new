import type PgBoss from 'pg-boss';
import { prisma } from '@employr/db';
import { JOB_NAMES } from '../types.ts';

export const ANALYTICS_CRON = '0 19 * * *'; // 02:00 WIB

async function checkAnomaly(
  metricName: string,
  todayValue: number
): Promise<{ isAnomaly: boolean; avg7d: number; ratio: number }> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  try {
    const recent = await prisma.$queryRaw<any[]>`
      SELECT AVG(value::float) as avg_val, COUNT(*)::int as count
      FROM analytics_daily_summary
      WHERE metric_name = ${metricName}
      AND date >= ${sevenDaysAgo}
    `;
    const avg7d = recent[0]?.avg_val || 0;
    const count = recent[0]?.count || 0;
    
    if (count < 3 || avg7d === 0) {
      return { isAnomaly: false, avg7d, ratio: 0 };
    }
    
    const ratio = todayValue / avg7d;
    return { isAnomaly: ratio > 3.0, avg7d, ratio };
  } catch {
    return { isAnomaly: false, avg7d: 0, ratio: 0 };
  }
}

export async function registerAnalyticsAggregate(boss: PgBoss) {
  await boss.schedule(JOB_NAMES.ANALYTICS_AGGREGATE, ANALYTICS_CRON, null, { tz: 'UTC' });
  
  await boss.work(JOB_NAMES.ANALYTICS_AGGREGATE, async (job) => {
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      
      // 1. DAU
      const dauResult = await prisma.$queryRaw<any[]>`
        SELECT COUNT(DISTINCT user_id)::int as count 
        FROM visitor_activities 
        WHERE created_at >= NOW() - INTERVAL '1 day'
      `;
      const dau = dauResult[0]?.count || 0;

      // 2. Page Views
      const pvResult = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*)::int as count 
        FROM visitor_activities 
        WHERE activity_type = 'PAGE_VIEW' AND created_at >= NOW() - INTERVAL '1 day'
      `;
      const pageViews = pvResult[0]?.count || 0;

      // 3. Feature usage
      const featureResult = await prisma.$queryRaw<any[]>`
        SELECT metadata->>'feature_name' as feature_name, COUNT(*)::int as count 
        FROM visitor_activities 
        WHERE activity_type = 'FEATURE_USAGE' AND created_at >= NOW() - INTERVAL '1 day'
        GROUP BY metadata->>'feature_name'
      `;

      // 4. Avg Session duration
      const sessionResult = await prisma.$queryRaw<any[]>`
        SELECT COALESCE(AVG(duration_sec), 0)::float as avg_sec 
        FROM visitor_sessions 
        WHERE ended_at >= NOW() - INTERVAL '1 day'
      `;
      const avgDuration = sessionResult[0]?.avg_sec || 0;

      // 5. Feedback
      const feedbackResult = await prisma.$queryRaw<any[]>`
        SELECT rating, COUNT(*)::int as count 
        FROM user_feedback 
        WHERE created_at >= NOW() - INTERVAL '1 day'
        GROUP BY rating
      `;
      let positiveFeedback = 0;
      let negativeFeedback = 0;
      for (const row of feedbackResult) {
        if (row.rating > 0) positiveFeedback += row.count;
        else if (row.rating < 0) negativeFeedback += row.count;
      }

      // 6. Applications
      const appsResult = await prisma.$queryRaw<any[]>`
        SELECT status, COUNT(*)::int as count 
        FROM applications 
        WHERE created_at >= NOW() - INTERVAL '1 day'
        GROUP BY status
      `;

      // Save results
      const metrics: { name: string; value: number }[] = [
        { name: 'dau', value: dau },
        { name: 'total_page_views', value: pageViews },
        { name: 'avg_session_duration_sec', value: avgDuration },
        { name: 'feedback_positive_count', value: positiveFeedback },
        { name: 'feedback_negative_count', value: negativeFeedback },
      ];

      for (const f of featureResult) {
        if (f.feature_name) {
          metrics.push({ name: \`feature_usage_\${f.feature_name.toLowerCase()}\`, value: f.count });
        }
      }

      for (const a of appsResult) {
        if (a.status) {
          metrics.push({ name: `applications_${a.status.toLowerCase()}`, value: a.count });
        }
      }

      for (const m of metrics) {
        let dimensions = null;
        if (m.name === 'dau' || m.name === 'total_page_views') {
          const anomaly = await checkAnomaly(m.name, m.value);
          if (anomaly.isAnomaly) {
            dimensions = { flagged: true, avg7d: anomaly.avg7d, ratio: anomaly.ratio };
            console.warn(`[analytics] ANOMALY: ${m.name}=${m.value} is ${anomaly.ratio.toFixed(1)}x the 7-day avg (${anomaly.avg7d.toFixed(0)})`);
          }
        }

        if (dimensions) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO analytics_daily_summary (date, metric_name, value, dimensions) 
            VALUES ($1::date, $2, $3, $4::jsonb) 
            ON CONFLICT (date, metric_name) 
            DO UPDATE SET value = EXCLUDED.value, dimensions = EXCLUDED.dimensions
          `, todayDate, m.name, m.value, dimensions);
        } else {
          await prisma.$executeRawUnsafe(`
            INSERT INTO analytics_daily_summary (date, metric_name, value) 
            VALUES ($1::date, $2, $3) 
            ON CONFLICT (date, metric_name) 
            DO UPDATE SET value = EXCLUDED.value
          `, todayDate, m.name, m.value);
        }
      }
    } catch (err) {
      console.error('Error in analytics aggregate job:', err);
      throw err;
    }
  });
}
