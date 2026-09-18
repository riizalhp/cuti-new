import { prisma } from '@employr/db';

/**
 * Sistem saran tuning yang aman. Alih-alih langsung mengubah
 * scoring weights, hasil analisis disimpan sebagai "pending suggestion"
 * di system_settings. Admin harus review dan approve via admin panel.
 *
 * Flow:
 *  outcome-correlation job → saveTuningSuggestion()
 *    → system_settings key: `pending_ats_content_quality` etc.
 *    → Admin lihat di panel → approve/reject
 *    → Kalau approve, admin copy value ke key utama
 */

export interface TuningSuggestion {
  key: string;
  currentValue: number;
  suggestedValue: number;
  reason: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  sampleSize: number;
  createdAt: string;
}

const MIN_SAMPLE_FOR_SUGGESTION = 500;
const MAX_WEIGHT_CHANGE = 0.10; // max 10% shift per suggestion

export async function saveTuningSuggestion(
  suggestion: TuningSuggestion
): Promise<boolean> {
  if (suggestion.sampleSize < MIN_SAMPLE_FOR_SUGGESTION) {
    console.log(
      `[tuning] Skipped suggestion for ${suggestion.key}: sample ${suggestion.sampleSize} < ${MIN_SAMPLE_FOR_SUGGESTION}`
    );
    return false;
  }

  const delta = Math.abs(suggestion.suggestedValue - suggestion.currentValue);
  const clampedValue =
    delta > MAX_WEIGHT_CHANGE
      ? suggestion.currentValue +
        Math.sign(suggestion.suggestedValue - suggestion.currentValue) *
          MAX_WEIGHT_CHANGE
      : suggestion.suggestedValue;

  const pendingKey = `pending_${suggestion.key}`;
  const payload = JSON.stringify({
    current: suggestion.currentValue,
    suggested: Number(clampedValue.toFixed(4)),
    original_suggested: Number(suggestion.suggestedValue.toFixed(4)),
    reason: suggestion.reason,
    confidence: suggestion.confidence,
    sample_size: suggestion.sampleSize,
    clamped: delta > MAX_WEIGHT_CHANGE,
    created_at: suggestion.createdAt || new Date().toISOString(),
    status: 'PENDING',
  });

  try {
    await prisma.system_settings.upsert({
      where: { key: pendingKey },
      update: {
        value: payload,
        updated_at: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        key: pendingKey,
        value: payload,
        group: 'tuning_suggestions',
        description: `Auto-tuning suggestion: ${suggestion.reason}`,
        updated_at: new Date(),
      },
    });

    console.log(
      `[tuning] Saved suggestion: ${pendingKey} = ${clampedValue.toFixed(4)} (confidence: ${suggestion.confidence}, samples: ${suggestion.sampleSize})`
    );
    return true;
  } catch (err) {
    console.error(`[tuning] Failed to save suggestion for ${pendingKey}:`, err);
    return false;
  }
}

export async function getPendingSuggestions(): Promise<TuningSuggestion[]> {
  try {
    const settings = await prisma.system_settings.findMany({
      where: { group: 'tuning_suggestions' },
    });

    return settings
      .map((s) => {
        try {
          const parsed = JSON.parse(s.value);
          if (parsed.status !== 'PENDING') return null;
          return {
            key: s.key.replace('pending_', ''),
            currentValue: parsed.current,
            suggestedValue: parsed.suggested,
            reason: parsed.reason,
            confidence: parsed.confidence,
            sampleSize: parsed.sample_size,
            createdAt: parsed.created_at,
          } as TuningSuggestion;
        } catch {
          return null;
        }
      })
      .filter((s): s is TuningSuggestion => s !== null);
  } catch {
    return [];
  }
}

export async function approveSuggestion(key: string): Promise<boolean> {
  const pendingKey = `pending_${key}`;
  try {
    const setting = await prisma.system_settings.findUnique({
      where: { key: pendingKey },
    });
    if (!setting) return false;

    const parsed = JSON.parse(setting.value);
    if (parsed.status !== 'PENDING') return false;

    await prisma.system_settings.upsert({
      where: { key },
      update: {
        value: String(parsed.suggested),
        updated_at: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        key,
        value: String(parsed.suggested),
        group: 'scoring_weights',
        description: `Auto-tuned: ${parsed.reason}`,
        updated_at: new Date(),
      },
    });

    parsed.status = 'APPROVED';
    parsed.approved_at = new Date().toISOString();
    await prisma.system_settings.update({
      where: { key: pendingKey },
      data: { value: JSON.stringify(parsed), updated_at: new Date() },
    });

    return true;
  } catch {
    return false;
  }
}

export async function rejectSuggestion(key: string): Promise<boolean> {
  const pendingKey = `pending_${key}`;
  try {
    const setting = await prisma.system_settings.findUnique({
      where: { key: pendingKey },
    });
    if (!setting) return false;

    const parsed = JSON.parse(setting.value);
    parsed.status = 'REJECTED';
    parsed.rejected_at = new Date().toISOString();

    await prisma.system_settings.update({
      where: { key: pendingKey },
      data: { value: JSON.stringify(parsed), updated_at: new Date() },
    });

    return true;
  } catch {
    return false;
  }
}
