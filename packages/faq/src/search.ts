import type { FaqArticle, FaqSearchResult, SearchHit } from "./types";
import { loadArticles } from "./loader";
import { markdownToPlainText } from "./markdown";
import { getCategoryLabel } from "./categories";

/**
 * Mesin pencari berbasis IR klasik (TF-IDF + cosine similarity).
 * BUKAN LLM / AI generatif — murni pencocokan statistik kata kunci,
 * sehingga cepat, gratis, deterministik, dan offline.
 */

// Stopword Bahasa Indonesia umum (kata tugas yang tidak informatif)
const STOPWORDS = new Set(
  `yang dan di ke dari ini itu untuk dengan pada dalam sebagai atau juga tidak akan ke saya kamu kita mereka dia aku kau anda ada adalah telah sudah bisa dapat harus mau ingin apa bagaimana mengapa dimana dimana kapan siapa karena tetapi namun sedangkan sementara lalu kemudian sehingga agar supaya antara terhadap tentang oleh bagi bagi para pun saja lagi masih sangat paling lebih kurang ya oh hai halo kalau jika bila saat ketika setelah sebelum selama sampai pada punya pakai bisa tidaknya ga gak`.split(
    /\s+/
  )
);

const TERM_RE = /[a-z0-9]+(?:[-'][a-z0-9]+)*/g;

function tokenize(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .match(TERM_RE)
    ?.filter((t) => t.length > 1 && !STOPWORDS.has(t));
  return tokens ?? [];
}

function countTokens(tokens: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of tokens) {
    map.set(t, (map.get(t) || 0) + 1);
  }
  return map;
}

interface DocVector {
  article: FaqArticle;
  terms: Map<string, number>;
  norm: number;
}

interface Index {
  docs: DocVector[];
  idf: Map<string, number>;
}

let indexCache: Index | null = null;

function buildIndex(): Index {
  if (indexCache) return indexCache;

  const articles = loadArticles();
  const df = new Map<string, number>();

  // Banyak artikel yang memuat tiap term
  for (const a of articles) {
    const tokens = tokenize(documentText(a));
    const seen = new Set(tokens);
    for (const t of seen) df.set(t, (df.get(t) || 0) + 1);
  }

  const N = Math.max(articles.length, 1);
  const idf = new Map<string, number>();
  for (const [term, d] of df) {
    // smoothing agar term di semua dokumen tetap berbobot kecil
    idf.set(term, Math.log((N + 1) / (d + 1)) + 1);
  }

  const docs: DocVector[] = articles.map((article) => {
    const tokens = tokenize(documentText(article));
    const counts = countTokens(tokens);
    const terms = new Map<string, number>();
    let normSq = 0;
    for (const [term, count] of counts) {
      const tf = 1 + Math.log(count); // sublinear TF
      const w = tf * (idf.get(term) || 1);
      terms.set(term, w);
      normSq += w * w;
    }
    return { article, terms, norm: Math.sqrt(normSq) || 1 };
  });

  indexCache = { docs, idf };
  return indexCache;
}

/**
 * Teks dokumen: judul & kata kunci diberi bobot lebih tinggi (diulang)
 * agar kemiripan judul/topik lebih diutamakan daripada isi panjang.
 */
function documentText(article: FaqArticle): string {
  const head = [
    article.title,
    article.title,
    article.description,
    article.keywords.join(" "),
  ]
    .filter(Boolean)
    .join(" ");
  return `${head} ${markdownToPlainText(article.body)}`;
}

function queryVector(query: string, index: Index): Map<string, number> {
  const tokens = tokenize(query);
  const counts = countTokens(tokens);
  const vec = new Map<string, number>();
  for (const [term, count] of counts) {
    const tf = 1 + Math.log(count);
    vec.set(term, tf * (index.idf.get(term) || 1));
  }
  return vec;
}

function cosine(a: Map<string, number>, b: Map<string, number>, bNorm: number): number {
  if (a.size === 0) return 0;
  let dot = 0;
  for (const [term, wa] of a) {
    const wb = b.get(term);
    if (wb) dot += wa * wb;
  }
  let aNormSq = 0;
  for (const w of a.values()) aNormSq += w * w;
  const aNorm = Math.sqrt(aNormSq) || 1;
  return dot / (aNorm * bNorm);
}

/** Skor relevansi minimum agar dianggap "terjawab". */
export const MIN_SCORE = 0.15;

function makeSnippet(article: FaqArticle, queryTerms: string[]): string {
  const plain = markdownToPlainText(article.body);
  const lower = plain.toLowerCase();
  let idx = -1;
  for (const t of queryTerms) {
    const at = lower.indexOf(t);
    if (at >= 0 && (idx === -1 || at < idx)) idx = at;
  }
  const start = idx > 0 ? Math.max(0, idx - 80) : 0;
  const raw = plain.slice(start, start + 260).trim();
  const snippet = raw.length >= 260 ? `${raw}...` : raw;
  return snippet || article.description;
}

/**
 * Cari artikel paling relevan terhadap query pengguna.
 */
export function searchFaq(query: string, limit = 3): FaqSearchResult {
  const q = query.trim();
  const index = buildIndex();
  const qv = queryVector(q, index);

  const scored: SearchHit[] = index.docs
    .map((doc) => {
      const score = cosine(qv, doc.terms, doc.norm);
      return { article: doc.article, score, snippet: "" };
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score);

  const queryTerms = tokenize(q);

  const hits = scored
    .slice(0, limit)
    .map((h) => ({ ...h, snippet: makeSnippet(h.article, queryTerms) }));

  // Syarat "terjawab": skor di atas ambang DAN minimal 1 token bermakna
  // dari query benar-benar cocok dengan artikel teratas (cegah jawab nonsense).
  const bestHit = hits[0];
  const sharesToken =
    bestHit &&
    queryTerms.some((t) =>
      tokenize(documentText(bestHit.article)).includes(t)
    );
  const answered = Boolean(bestHit && bestHit.score >= MIN_SCORE && sharesToken);
  const top = answered ? bestHit : undefined;

  const answerText = top ? buildChatAnswer(top.article, top.snippet) : buildFallbackAnswer(q);

  const suggestions = index.docs
    .filter((d) => d.article.slug !== top?.article.slug)
    .slice(0, 4)
    .map((d) => d.article.title);

  return { query: q, hits, answered, answerText, suggestions };
}

function buildChatAnswer(article: FaqArticle, snippet: string): string {
  const categoryLabel = getCategoryLabel(article.category);
  const steps = extractSteps(article.body).slice(0, 4);

  const lines: string[] = [
    `Berikut panduan singkatnya (${categoryLabel}):`,
    ``,
    `**${article.title}**`,
    ``,
    article.description,
    ``,
  ];

  if (steps.length > 0) {
    lines.push("Langkah penting:", "");
    for (const s of steps) lines.push(`- ${s}`);
    lines.push("");
  }

  if (snippet && snippet !== article.description) {
    lines.push(snippet, "");
  }

  lines.push(
    `Baca panduan lengkap & detail di Pusat Bantuan: faq.employr.id/artikel/${article.slug}`
  );

  return lines.join("\n");
}

/** Ambil beberapa poin penting (list items) dari isi artikel. */
function extractSteps(body: string): string[] {
  const steps: string[] = [];
  for (const line of body.split(/\r?\n/)) {
    const m = line.match(/^\s*[-*+]\s+(.*)$/);
    if (m && steps.length < 8) {
      const text = m[1]
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
        .trim();
      if (text) steps.push(text);
    }
  }
  return steps;
}

function buildFallbackAnswer(query: string): string {
  return [
    "Maaf, saya belum menemukan jawaban yang cocok dengan pertanyaanmu di Pusat Bantuan kami.",
    "",
    `Kamu bertanya: "${query.trim()}"`,
    "",
    "Coba gunakan kata kunci yang lebih spesifik, misalnya: \"cara cetak CV PDF\", \"tambah lamaran di tracker\", \"kode voucher\", atau \"check-in harian\".",
    "",
    "Kamu juga bisa melihat semua artikel panduan di faq.employr.id, atau hubungi tim Customer Service Employr melalui email support@employr.id.",
  ].join("\n");
}

/** Pertanyaan populer untuk chip saran cepat di chat widget. */
export function getQuickPrompts(limit = 4): string[] {
  const topSlugs = [
    "cara-cetak-cv-pdf",
    "tracker-lamaran",
    "cara-pembayaran",
    "misi-cuan",
    "referral",
    "skor-ats-cv",
    "paket-dan-harga",
    "jasa-cv-hrd",
  ];
  const articles = loadArticles();
  return topSlugs
    .map((s) => articles.find((a) => a.slug === s))
    .filter(Boolean)
    .slice(0, limit)
    .map((a) => a!.title.replace(/^Cara\s+/i, ""));
}
