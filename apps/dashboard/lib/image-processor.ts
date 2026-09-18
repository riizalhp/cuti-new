// ============================================================================
// Image Processor — Download, Resize, Compress Logo ke WebP
// ----------------------------------------------------------------------------
// Digunakan oleh job-scraper untuk download company logo dari URL eksternal,
// resize ke max 200x200px, compress ke WebP (~5-10KB), dan simpan ke storage.
// ============================================================================

import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

const STORAGE_BASE_PATH = process.env.LOGO_STORAGE_PATH || 'public/uploads/logos';
const CDN_BASE_URL = process.env.CDN_BASE_URL || '/uploads/logos';
const FETCH_TIMEOUT_MS = 10000; // 10s timeout per image
const MAX_DIMENSION = 200; // Max width/height in pixels
const WEBP_QUALITY = 85; // WebP quality (80-85 untuk ~5-10KB)

/**
 * Hash pendek dari URL untuk deduplikasi + unique filename
 */
function hashUrl(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex').slice(0, 12);
}

/**
 * Sanitize company slug untuk filename
 */
function sanitizeFilename(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/**
 * Download gambar dari URL eksternal dengan timeout & validasi tipe
 */
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EmployrBot/1.0)',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[image-processor] HTTP ${response.status} from ${url}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];

    if (!validTypes.some((type) => contentType.includes(type))) {
      console.warn(`[image-processor] Invalid content-type ${contentType} from ${url}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn(`[image-processor] Timeout downloading ${url}`);
    } else {
      console.warn(`[image-processor] Error downloading ${url}:`, error.message);
    }
    return null;
  }
}

/**
 * Resize & compress image ke WebP dengan Sharp
 */
async function processImage(buffer: Buffer): Promise<Buffer | null> {
  try {
    const processed = await sharp(buffer)
      .resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: 'inside', // maintain aspect ratio
        withoutEnlargement: true, // don't upscale small logos
      })
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toBuffer();

    return processed;
  } catch (error: any) {
    console.warn('[image-processor] Error processing image:', error.message);
    return null;
  }
}

/**
 * Simpan buffer ke filesystem (fallback jika SeaweedFS tidak tersedia)
 */
async function saveToLocalStorage(buffer: Buffer, filename: string): Promise<string | null> {
  try {
    const fullPath = path.join(process.cwd(), STORAGE_BASE_PATH);

    // Ensure directory exists
    if (!existsSync(fullPath)) {
      await mkdir(fullPath, { recursive: true });
    }

    const filePath = path.join(fullPath, filename);
    await writeFile(filePath, buffer);

    // Return public URL (bisa diganti dengan CDN URL kalau sudah ada)
    return `${CDN_BASE_URL}/${filename}`;
  } catch (error: any) {
    console.error('[image-processor] Error saving to local storage:', error.message);
    return null;
  }
}

/**
 * Main function: Download, process, dan save logo company
 *
 * @param url - URL eksternal logo dari portal scraping
 * @param companySlug - Slug company untuk filename
 * @returns URL internal logo yang sudah diproses, atau null jika gagal
 *
 * @example
 * const logoUrl = await downloadAndProcessLogo(
 *   'https://logo.clearbit.com/tokopedia.com',
 *   'tokopedia'
 * );
 * // Returns: "/uploads/logos/tokopedia-a1b2c3d4e5f6.webp"
 */
export async function downloadAndProcessLogo(
  url: string,
  companySlug: string
): Promise<string | null> {
  // Skip jika URL kosong atau bukan HTTP/HTTPS
  if (!url || !url.startsWith('http')) {
    return null;
  }

  // Skip jika sudah URL internal (sudah diproses sebelumnya)
  if (url.includes(CDN_BASE_URL) || url.includes('/uploads/logos/')) {
    return url;
  }

  try {
    console.log(`[image-processor] Processing logo for ${companySlug} from ${url.slice(0, 60)}...`);

    // 1. Download image
    const downloadedBuffer = await downloadImage(url);
    if (!downloadedBuffer) {
      return null;
    }

    // 2. Resize & compress ke WebP
    const processedBuffer = await processImage(downloadedBuffer);
    if (!processedBuffer) {
      return null;
    }

    // 3. Generate unique filename
    const urlHash = hashUrl(url);
    const safeSlug = sanitizeFilename(companySlug);
    const filename = `${safeSlug}-${urlHash}.webp`;

    // 4. Save to storage (local filesystem fallback)
    // TODO: Implement SeaweedFS upload jika sudah tersedia
    const savedUrl = await saveToLocalStorage(processedBuffer, filename);

    if (savedUrl) {
      const sizeKB = (processedBuffer.length / 1024).toFixed(1);
      console.log(`[image-processor] ✅ Saved ${filename} (${sizeKB} KB)`);
    }

    return savedUrl;
  } catch (error: any) {
    console.error(`[image-processor] Unexpected error processing ${url}:`, error.message);
    return null;
  }
}

/**
 * Batch processing untuk multiple logos (digunakan saat refresh database)
 */
export async function batchProcessLogos(
  logos: Array<{ url: string; companySlug: string }>
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();

  // Process sequentially untuk avoid overload
  for (const logo of logos) {
    const processedUrl = await downloadAndProcessLogo(logo.url, logo.companySlug);
    results.set(logo.url, processedUrl);

    // Small delay antar processing untuk avoid rate limit
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}
