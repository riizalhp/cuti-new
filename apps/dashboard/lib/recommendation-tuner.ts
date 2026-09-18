import { prisma } from '@employr/db';

interface RecommendationWeights {
  skills: number;
  experience: number;
  location: number;
  salary: number;
  recency: number;
}

const DEFAULT_WEIGHTS: RecommendationWeights = {
  skills: 0.45,
  experience: 0.30,
  location: 0.15,
  salary: 0.10,
  recency: 0,
};

export async function getOptimizedWeights(): Promise<RecommendationWeights> {
  try {
    // Get CTR data from last 14 days
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    const impressions = await prisma.visitorActivity.count({
      where: {
        activity_type: 'RECOMMENDATION_IMPRESSION',
        created_at: { gte: fourteenDaysAgo },
      },
    });
    
    const clicks = await prisma.visitorActivity.count({
      where: {
        activity_type: 'RECOMMENDATION_CLICK',
        created_at: { gte: fourteenDaysAgo },
      },
    });
    
    // Not enough data to tune - need at least 500 impressions
    if (impressions < 500) return DEFAULT_WEIGHTS;
    
    const ctr = clicks / impressions;
    
    // Get click metadata to understand what users prefer
    const clickEvents = await prisma.visitorActivity.findMany({
      where: {
        activity_type: 'RECOMMENDATION_CLICK',
        created_at: { gte: fourteenDaysAgo },
      },
      select: { metadata: true },
      take: 200,
    });
    
    // Analyze position bias - clicks at lower positions mean ranking is good
    const positions = clickEvents
      .map((e: any) => e.metadata?.position)
      .filter((p: any): p is number => typeof p === 'number');
    
    const avgClickPosition = positions.length > 0
      ? positions.reduce((a: number, b: number) => a + b, 0) / positions.length
      : 3;
    
    // If users are clicking items high in the list (position < 3), ranking is good
    // If clicking lower items (position > 5), ranking needs adjustment
    const weights = { ...DEFAULT_WEIGHTS };
    
    if (avgClickPosition > 5) {
      // Users are finding good matches lower down - boost recency and location
      weights.recency = 0.10;
      weights.skills = 0.35;
      weights.location = 0.20;
    } else if (ctr < 0.05) {
      // Very low CTR - try emphasizing location more (local jobs)
      weights.location = 0.25;
      weights.skills = 0.35;
      weights.experience = 0.25;
      weights.salary = 0.05;
      weights.recency = 0.10;
    }
    
    // Normalize weights to sum to 1.0
    const total = weights.skills + weights.experience + weights.location + weights.salary + weights.recency;
    if (total > 0 && Math.abs(total - 1.0) > 0.01) {
      weights.skills /= total;
      weights.experience /= total;
      weights.location /= total;
      weights.salary /= total;
      weights.recency /= total;
    }
    
    return weights;
  } catch {
    return DEFAULT_WEIGHTS;
  }
}

export function getDefaultWeights(): RecommendationWeights {
  return { ...DEFAULT_WEIGHTS };
}
