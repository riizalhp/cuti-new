import { prisma } from '@employr/db';

export interface Experiment {
  key: string;
  enabled: boolean;
  variant: string;
  metadata?: Record<string, any>;
}

let flagCache: Map<string, Experiment> = new Map();
let flagCacheExpiry = 0;

async function loadFlags(): Promise<Map<string, Experiment>> {
  if (flagCache.size > 0 && Date.now() < flagCacheExpiry) return flagCache;
  
  try {
    const settings = await prisma.system_settings.findMany({
      where: { group: 'experiments' },
    });
    
    const flags = new Map<string, Experiment>();
    for (const s of settings) {
      try {
        const parsed = JSON.parse(s.value);
        flags.set(s.key, {
          key: s.key,
          enabled: parsed.enabled ?? false,
          variant: parsed.variant ?? 'control',
          metadata: parsed.metadata,
        });
      } catch {
        flags.set(s.key, {
          key: s.key,
          enabled: s.value === 'true' || s.value === '1',
          variant: 'control',
        });
      }
    }
    
    flagCache = flags;
    flagCacheExpiry = Date.now() + 60 * 1000; // 1 min cache
    return flags;
  } catch {
    return flagCache;
  }
}

export async function isFeatureEnabled(key: string): Promise<boolean> {
  const flags = await loadFlags();
  return flags.get(key)?.enabled ?? false;
}

export async function getExperiment(key: string): Promise<Experiment> {
  const flags = await loadFlags();
  return flags.get(key) ?? { key, enabled: false, variant: 'control' };
}

export function assignVariant(userId: string, experimentKey: string, variants: string[]): string {
  // Deterministic hash-based assignment so user always gets same variant
  let hash = 0;
  const seed = `${userId}:${experimentKey}`;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % variants.length;
  return variants[index];
}

export function clearFlagCache() {
  flagCache.clear();
  flagCacheExpiry = 0;
}
