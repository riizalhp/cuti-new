import crypto from 'crypto';

let extractorPromise: Promise<any> | null = null;

/**
 * Initializes and caches the ONNX feature extraction pipeline for multilingual-e5-small.
 * Uses int8 quantized model for optimal CPU execution speed and minimal RAM footprint (~200MB).
 */
export async function getEmbeddingPipeline() {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline, env } = await import('@xenova/transformers');
      // Set cache directory to avoid re-downloading weights across app restarts
      env.cacheDir = './.cache/transformers';
      
      const pipe = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small', {
        quantized: true,
      });
      return pipe;
    })();
  }
  return extractorPromise;
}

/**
 * Generates a normalized 384-dimensional dense vector embedding.
 * - For user queries or candidate profiles: use type 'query'
 * - For documents or job descriptions: use type 'passage'
 */
export async function generateEmbedding(
  text: string,
  type: 'query' | 'passage' = 'passage'
): Promise<number[]> {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return new Array(384).fill(0);
  }

  const extractor = await getEmbeddingPipeline();
  // Standardize whitespace and limit text length to ~1500 chars (512 tokens max for E5)
  const cleaned = text.replace(/\s+/g, ' ').trim().slice(0, 1500);
  const prompt = `${type}: ${cleaned}`;

  const output = await extractor(prompt, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Computes a deterministic SHA-256 fingerprint for caching or change detection.
 */
export function computeEmbeddingHash(text: string): string {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
}

/**
 * In-memory Cosine Similarity calculation between two normalized vectors.
 * Returns a value between -1.0 and 1.0 (typically 0.0 to 1.0 for normalized text).
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dotProduct));
}
