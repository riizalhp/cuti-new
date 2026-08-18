import fs from "node:fs";
import path from "node:path";
import type { FaqArticle } from "./types";

/**
 * Mencari direktori konten paket @cuti/faq.
 * Berjalan dari app manapun di monorepo (apps/*), dan bisa di-override
 * lewat env FAQ_CONTENT_DIR (berguna untuk deployment mandiri).
 */
export function resolveContentDir(): string {
  const candidates = [
    process.env.FAQ_CONTENT_DIR,
    path.join(process.cwd(), "..", "..", "packages", "faq", "content"),
    path.join(process.cwd(), "..", "packages", "faq", "content"),
    path.join(process.cwd(), "packages", "faq", "content"),
  ].filter((v): v is string => Boolean(v));

  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir)) return dir;
    } catch {
      // ignore
    }
  }
  return candidates[0];
}

/**
 * Parser frontmatter sederhana (format `key: value` di antara blok `---`).
 */
export function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw.trim() };

  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body: m[2].trim() };
}

/**
 * Membaca seluruh artikel FAQ dari direktori konten.
 * Hasil di-cache per proses (runtime Node) agar tidak baca disk berulang-ulang.
 */
let cache: FaqArticle[] | null = null;

export function loadArticles(): FaqArticle[] {
  if (cache) return cache;

  const dir = resolveContentDir();
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const articles: FaqArticle[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { meta, body } = parseFrontmatter(raw);

    const slug = meta.slug || file.replace(/\.md$/, "").replace(/^\d+-/, "");
    const title = meta.title || slug;
    const description = meta.description || "";
    const category = meta.category || "akun-bantuan";
    const order = Number(meta.order || 99);
    const updatedAt = meta.updatedAt || "2026-08-18";
    const keywords = (meta.keywords || "")
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    if (!body) continue;

    articles.push({
      slug,
      title,
      description,
      category,
      order,
      updatedAt,
      keywords,
      body,
    });
  }

  articles.sort((a, b) => {
    const ia = FAQ_CATEGORY_INDEX(a.category);
    const ib = FAQ_CATEGORY_INDEX(b.category);
    if (ia !== ib) return ia - ib;
    return a.order - b.order;
  });

  cache = articles;
  return articles;
}

function FAQ_CATEGORY_INDEX(slug: string): number {
  // lightweight local lookup to avoid circular import at module scope
  const order: Record<string, number> = {
    memulai: 0,
    "cv-dokumen": 1,
    "evaluasi-optimasi": 2,
    "lamaran-kerja": 3,
    "misi-reward": 4,
    "pengembangan-karier": 5,
    "membership-pembayaran": 6,
    "akun-bantuan": 7,
  };
  return order[slug] ?? 99;
}

export function getArticleBySlug(slug: string): FaqArticle | undefined {
  return loadArticles().find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: string): FaqArticle[] {
  return loadArticles().filter((a) => a.category === category);
}

export function getLatestArticles(limit = 6): FaqArticle[] {
  return [...loadArticles()]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, limit);
}
