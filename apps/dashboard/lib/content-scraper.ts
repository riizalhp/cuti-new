// ============================================================================
// Content Scraper — artikel blog, event/job fair, sertifikasi (server-side)
// ----------------------------------------------------------------------------
// Melengkapi job-scraper: menyimpan konten berbasis artikel lain ke DB sesuai
// aturan di docs/scraping-sources.md:
//   - Sumber hanya halaman/feed publik, tanpa bypass login/anti-bot.
//   - Dedupe by `source` + `external_url`.
//   - Hanya konten aktif yang disimpan; event lewat → auto-nonaktif.
//
// Sumber aktif (terverifikasi Sep 2026):
//   - Kalibrr blog        → SSR HTML (https://www.kalibrr.com/blog/id) — tips karier
//   - BNSP                → SSR HTML (https://bnsp.go.id) — skema sertifikasi
// Event: jobfair.kemnaker.go.id hanya SPA (data via API internal), jadi
// scraper event menunggu pola yang stabil — kolomnya sudah siap di DB.
// ============================================================================

import { prisma } from '@employr/db';

export interface ContentSyncResult {
  articles: { created: number; updated: number };
  certifications: { created: number; updated: number };
  events: { created: number; updated: number };
  logs: string[];
}

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': BROWSER_UA,
      'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} dari ${url}`);
  return res.text();
}

function stripCdata(s: string): string {
  return s.replace(/^<!\[CDATA\[|\]\]>$/g, '');
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;|&#8220;|&#8221;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function timeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const diffHours = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Baru saja';
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const days = Math.floor(diffHours / 24);
    if (days === 1) return 'Kemarin';
    if (days < 30) return `${days} hari lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function hashUrl(url: string): string {
  let h = 5381;
  for (let i = 0; i < url.length; i++) {
    h = ((h << 5) + h + url.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36).slice(0, 8);
}

// ---------------------------------------------------------------------------
// ARTIKEL — WordPress RSS (Disnakerja kategori lowongan-kerja)
// ---------------------------------------------------------------------------

const ARTICLE_FEEDS = [
  {
    source: 'Kalibrr',
    label: 'Kalibrr Blog (tips karier)',
    url: 'https://neo-blog.kalibrr.com/blog/id/feed',
    author: 'Kalibrr Blog',
  },
];

async function syncArticles(): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;
  const now = new Date();

  for (const feed of ARTICLE_FEEDS) {
    try {
      const xml = await fetchText(feed.url);
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 20);
      for (const m of items) {
        const raw = m[1];
        const title = stripCdata(raw.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '')
          .replace(/\s+/g, ' ')
          .trim();
        // Skip judul channel feed (item pertama kadang channel meta)
        if (!title || title === feed.label.split(' (')[0]) continue;
        const link = raw.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || '';
        const pubDate = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || '';
        const contentEncoded = raw.match(
          /<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/
        );
        const content = contentEncoded ? stripHtml(contentEncoded[1]) : stripCdata(raw.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '');

        if (!title || !link) continue;

        const existing = await prisma.articles.findFirst({
          where: { source: feed.source, external_url: link },
          select: { id: true },
        });

        if (existing) {
          await prisma.articles.update({
            where: { id: existing.id },
            data: { title, content, last_synced_at: now },
          });
          updated++;
        } else {
          await prisma.articles.create({
            data: {
              id: crypto.randomUUID(),
              title,
              slug: `${slugify(title)}-${hashUrl(link)}`,
              content: content || title,
              author: feed.author,
              is_published: true,
              published_at: pubDate ? new Date(pubDate) : now,
              source: feed.source,
              external_url: link,
              last_synced_at: now,
            },
          });
          created++;
        }
      }
    } catch {
      // satu feed gagal tidak menghentikan sumber lain
    }
  }

  return { created, updated };
}

// ---------------------------------------------------------------------------
// SERTIFIKASI — BNSP (SSR HTML, daftar skema sertifikasi)
// ---------------------------------------------------------------------------

async function syncCertifications(): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;
  const now = new Date();
  const SOURCE = 'BNSP';

  try {
    const html = await fetchText('https://bnsp.go.id');
    // Kartu/link skema sertifikasi di beranda BNSP (href mengandung skema)
    const anchors = [...html.matchAll(/<a[^>]+href="([^"]*(?:skema|sertifikasi)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)];
    const seen = new Set<string>();

    for (const a of anchors.slice(0, 30)) {
      const href = a[1].startsWith('http') ? a[1] : `https://bnsp.go.id${a[1]}`;
      const title = stripHtml(a[2]);
      if (!title || title.length < 8 || seen.has(href)) continue;
      seen.add(href);

      const existing = await prisma.certifications.findFirst({
        where: { source: SOURCE, external_url: href },
        select: { id: true },
      });

      if (existing) {
        await prisma.certifications.update({
          where: { id: existing.id },
          data: { title, last_synced_at: now },
        });
        updated++;
      } else {
        await prisma.certifications.create({
          data: {
            id: crypto.randomUUID(),
            title,
            slug: `${slugify(title)}-${hashUrl(href)}`,
            description: `Skema sertifikasi profesi dari BNSP. ${title}`,
            provider: 'BNSP',
            price: 0,
            duration_hours: 0,
            external_url: href,
            source: SOURCE,
            last_synced_at: now,
          },
        });
        created++;
      }
    }
  } catch {
    // BNSP gagal → skip, jangan blok sumber lain
  }

  return { created, updated };
}

// ---------------------------------------------------------------------------
// Orkestrasi
// ---------------------------------------------------------------------------

export async function runContentSync(): Promise<ContentSyncResult> {
  const logs: string[] = [];
  const ts = () => new Date().toLocaleTimeString('id-ID', { hour12: false });

  logs.push(`[${ts()}] 📰 Sinkronisasi konten dimulai (artikel, sertifikasi)...`);

  const [articles, certifications] = await Promise.all([syncArticles(), syncCertifications()]);

  logs.push(
    `[${ts()}] 📰 Artikel: ${articles.created} baru, ${articles.updated} diperbarui.`
  );
  logs.push(
    `[${ts()}] 🎓 Sertifikasi: ${certifications.created} baru, ${certifications.updated} diperbarui.`
  );
  logs.push(
    `[${ts()}] ℹ️ Event: scraper menunggu sumber stabil (jobfair.kemnaker SPA); kolom DB sudah siap.`
  );
  logs.push(`[${ts()}] ✅ Sinkronisasi konten selesai.`);

  return {
    articles,
    certifications,
    events: { created: 0, updated: 0 },
    logs,
  };
}
