import { prisma } from "@cuti/db";
import crypto from "crypto";

export const semanticCache = {
  /**
   * Get cached response if exists and increment hit count
   */
  async get(cacheKey: string): Promise<string | null> {
    try {
      const cached = await (prisma as any).ai_semantic_cache.findUnique({
        where: { cache_key: cacheKey },
      });

      if (cached) {
        // Increment hit counter asynchronously
        (prisma as any).ai_semantic_cache.update({
          where: { cache_key: cacheKey },
          data: { hits: { increment: 1 } },
        }).catch(() => {});

        return cached.response;
      }
    } catch (err) {
      console.warn("[Semantic Cache] GET Error:", err);
    }
    return null;
  },

  /**
   * Save LLM response to semantic cache table
   */
  async set(cacheKey: string, inputHash: string, responseText: string): Promise<void> {
    try {
      await (prisma as any).ai_semantic_cache.upsert({
        where: { cache_key: cacheKey },
        update: { response: responseText, hits: { increment: 1 } },
        create: {
          id: crypto.randomUUID(),
          cache_key: cacheKey,
          input_hash: inputHash,
          response: responseText,
          hits: 1,
          created_at: new Date(),
        },
      });
    } catch (err) {
      console.warn("[Semantic Cache] SET Error:", err);
    }
  },
};
