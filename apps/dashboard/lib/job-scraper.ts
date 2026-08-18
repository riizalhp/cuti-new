// ============================================================================
// Bot Scraper Lowongan Kerja — server-side
// ----------------------------------------------------------------------------
// Mengambil lowongan dari HALAMAN PUBLIK portal (SSR HTML), TANPA bypass
// login/CAPTCHA/anti-bot, sesuai panduan platform (lihat history chat Manus).
//
// Portal yang scrapable dari halaman publik:
//   - Jobstreet  (id.jobstreet.com  — JSON JobSearchV7SearchResponse di <script>)
//   - Glints     (glints.com        — __NEXT_DATA__ > initialJobs.jobsInPage)
//   - Dealls     (dealls.com        — __NEXT_DATA__ > dehydratedState)
//   - Talent.com (id.talent.com     — kartu SSR data-testid="job-card-unified")
//   - LinkedIn   (linkedin.com      — LinkedIn Jobs Search, pakai sesi login
//                 pengguna sendiri, tanpa bypass login/CAPTCHA)
//   - Kalibrr    (kalibrr.com       — __NEXT_DATA__ > props.pageProps.jobs)
//   - Jobindo    (jobindo.com       — Inertia data-page di <div id="app">)
//   - 12 portal blog loker WordPress (listing publik via pencarian ?s= atau
//     halaman daftar): lokerho.com, sejakkemarin.com, lamarlangsung.com,
//     informasilowongankerja.com, solusikerja.net, bursakerjadepnaker.com,
//     lokeranakmedan.com, infolokerjabar.com, infolokerbanten.com,
//     infolokerkarawang.com, lokermuslim.id, lowkerjogja.co.id
//   - Jora       (id.jora.com       — SSR publik, kartu data-braze-job-panel-view)
//   - 4 portal Blogger (feed JSON publik ?alt=json&q=): jobinaja.com,
//     lokernas.com, officialkarir.com, logkerja.id
// Portal yang butuh browser + sesi login USER SENDIRI (pola sama dgn LinkedIn,
// tanpa bypass CAPTCHA — lihat lib/browser-portals.ts): Indeed, Loker.id,
// Jooble, Cake.me (CakeResume), Karir.com, KitaLulus.
// ============================================================================

export type PortalId =
  | 'Jobstreet'
  | 'Glints'
  | 'Dealls'
  | 'Talent'
  | 'LinkedIn'
  | 'Kalibrr'
  | 'Jobindo'
  | 'Jora'
  | 'Jobinaja'
  | 'Lokernas'
  | 'OfficialKarir'
  | 'LogKerja'
  | 'Indeed'
  | 'Loker.id'
  | 'Jooble'
  | 'CakeResume'
  | 'Karir.com'
  | 'KitaLulus'
  | 'LokerHeadOffice'
  | 'SejakKemarin'
  | 'LamarLangsung'
  | 'InfoLokerKerja'
  | 'SolusiKerja'
  | 'BursaKerjaDepnaker'
  | 'LokerAnakMedan'
  | 'InfoLokerJabar'
  | 'InfoLokerBanten'
  | 'InfoLokerKarawang'
  | 'LokerMuslim'
  | 'LowkerJogja';

export interface ExtractedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  portal: PortalId;
  portalUrl: string;
  jobType: 'Full-time' | 'Contract' | 'Internship' | 'Remote';
  experience: 'Entry-level' | 'Junior' | 'Mid-Senior' | 'Senior';
  postedTime: string;
  extractedTime: string;
  matchScore: number;
  description: string;
  requirements: string[];
  skills: string[];
  isSaved?: boolean;
}

export interface ScrapeOptions {
  keyword: string;
  location?: string;
  portals?: PortalId[];
}

export interface PortalResult {
  status: 'ok' | 'error' | 'skipped';
  count: number;
  message: string;
}

export interface ScrapeOutput {
  jobs: ExtractedJob[];
  logs: string[];
  stats: Record<PortalId, PortalResult>;
}

// Portal yang butuh browser + sesi login USER SENDIRI (pola LinkedIn),
// implementasinya di lib/browser-portals.ts (di-import dinamis agar tidak
// memberatkan jalur scrape biasa).
const BROWSER_PORTAL_IDS: PortalId[] = ['Indeed', 'Loker.id', 'Jooble', 'CakeResume', 'Karir.com', 'KitaLulus'];

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

const FETCH_TIMEOUT_MS = 20000;

// ---------------------------------------------------------------------------
// Helpers HTML/JSON
// ---------------------------------------------------------------------------

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': BROWSER_UA,
      'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
      Accept: 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} dari ${url}`);
  return res.text();
}

function findObjectStart(text: string, fromIdx: number): number {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = fromIdx; i >= 0; i--) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
    } else {
      if (ch === '"') inString = true;
      else if (ch === '}') depth++;
      else if (ch === '{') {
        depth--;
        if (depth < 0) return i;
      }
    }
  }
  return -1;
}

function findObjectEnd(text: string, startIdx: number): number {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
    } else {
      if (ch === '"') inString = true;
      else if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) return i;
      }
    }
  }
  return -1;
}

function extractObjectAt(text: string, openBraceIdx: number): any | null {
  const end = findObjectEnd(text, openBraceIdx);
  if (end < 0) return null;
  try {
    return JSON.parse(text.slice(openBraceIdx, end + 1));
  } catch {
    return null;
  }
}

/**
 * Cari objek JSON: marker WAJIB diawali karakter `{` sehingga index marker
 * langsung menunjuk ke pembuka objek (menghindari ambiguitas string saat
 * scan mundur). Contoh marker: '{"__typename":"JobSearchV7SearchResponse"'.
 */
function extractJsonFromMarker(text: string, marker: string): any | null {
  const idx = text.indexOf(marker);
  if (idx < 0) return null;
  if (text[idx] !== '{') return null;
  return extractObjectAt(text, idx);
}

/** Ekstrak seluruh JSON dari tag <script id="__NEXT_DATA__" ...>...</script>. */
function extractNextData(text: string): any | null {
  const m = text.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/** Decode HTML entities (untuk Inertia data-page yang di-encode sebagai atribut HTML). */
function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)));
}

/** Hapus tag HTML, sisakan teks polos. */
function stripHtml(s: string): string {
  if (!s) return '';
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ekstrak kualifikasi/persyaratan dari HTML (list <li>) atau teks ber-bullet •. */
function extractRequirements(raw: string): string[] {
  if (!raw) return [];
  const li = [...raw.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)]
    .map((m) => stripHtml(m[1]))
    .filter(Boolean);
  if (li.length) return li.slice(0, 5);
  return stripHtml(raw)
    .split('•')
    .map((s) => s.trim().replace(/^[:\-–]+\s*/, ''))
    .filter((s) => s.length >= 8)
    .slice(0, 5);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Ambil nilai objek JSON dari key "ref" seperti "JobSearchV7JobLocation:2030701". */
function extractRefValue(text: string, key: string): any | null {
  const re = new RegExp(`"${escapeRegExp(key)}"\\s*:\\s*(\\{)`);
  const m = re.exec(text);
  if (!m) return null;
  const braceIdx = m.index + m[0].length - 1;
  return extractObjectAt(text, braceIdx);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return 'Baru saja';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit yang lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari yang lalu`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} minggu yang lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRupiah(n: number | null | undefined): string {
  if (n == null) return '';
  return 'Rp ' + n.toLocaleString('id-ID');
}

function inferExperience(title: string, minYears?: number | null): ExtractedJob['experience'] {
  if (minYears != null) {
    if (minYears <= 0) return 'Entry-level';
    if (minYears <= 2) return 'Junior';
    if (minYears <= 5) return 'Mid-Senior';
    return 'Senior';
  }
  const t = title.toLowerCase();
  if (/(senior|sr\.?\b|lead|principal|head)/.test(t)) return 'Senior';
  if (/(junior|jr\.?\b|entry|fresh|graduate)/.test(t)) return 'Entry-level';
  if (/(intern|magang|trainee)/.test(t)) return 'Entry-level';
  return 'Mid-Senior';
}

const TECH_KEYWORDS = [
  'react', 'next', 'node', 'typescript', 'javascript', 'python', 'java', 'golang', 'go ', 'php',
  'laravel', 'vue', 'angular', 'tailwind', 'css', 'html5', 'sql', 'mysql', 'postgresql', 'mongodb',
  'aws', 'gcp', 'docker', 'kubernetes', 'git', 'figma', 'ui/ux', 'flutter', 'kotlin', 'swift',
  'data', 'analyst', 'marketing', 'sales', 'admin', 'excel', 'copywriting', 'social media', 'seo',
  'customer service', 'operation', 'accounting', 'finance', 'hrd', 'design', 'mobile', 'fullstack',
];

function inferSkills(title: string, description: string, existing: string[] = []): string[] {
  const skills = new Set<string>(existing.filter(Boolean));
  const hay = `${title} ${description}`.toLowerCase();
  for (const kw of TECH_KEYWORDS) {
    if (hay.includes(kw)) skills.add(kw.trim());
  }
  return Array.from(skills).slice(0, 6);
}

function inferRequirements(description: string): string[] {
  if (!description) return [];
  const parts = description
    .split(/[.;\n•]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 25);
  return parts.slice(0, 4);
}

function computeMatchScore(keyword: string, title: string, skills: string[], description: string): number {
  const tokens = keyword.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
  if (tokens.length === 0) return 75;
  const hay = `${title} ${skills.join(' ')} ${description}`.toLowerCase();
  const hits = tokens.filter((t) => hay.includes(t)).length;
  const ratio = hits / tokens.length;
  return Math.min(97, Math.round(62 + ratio * 35));
}

// ---------------------------------------------------------------------------
// Parser per portal
// ---------------------------------------------------------------------------

/** Jobstreet — https://id.jobstreet.com/id/job-search/{slug}-jobs/ */
async function scrapeJobstreet(keyword: string): Promise<{ jobs: ExtractedJob[]; log: string }> {
  const slug = slugify(keyword);
  const url = `https://id.jobstreet.com/id/job-search/${slug}-jobs/`;
  const html = await fetchHtml(url);
  const resp = extractJsonFromMarker(html, '{"__typename":"JobSearchV7SearchResponse"');
  if (!resp?.results?.jobs?.length) throw new Error('Tidak ada data lowongan di respons Jobstreet');

  const rawJobs = resp.results.jobs as any[];
  const jobs: ExtractedJob[] = [];

  for (const j of rawJobs) {
    try {
      const orgRef = j.organisation?.__ref as string | undefined;
      const org = orgRef ? extractRefValue(html, orgRef) : null;
      const locRef = j.location?.__ref as string | undefined;
      const loc = locRef ? extractRefValue(html, locRef) : null;
      const waRef = j.workArrangements?.[0]?.__ref as string | undefined;
      const wa = waRef ? extractRefValue(html, waRef) : null;
      const arrangementLabel = wa?.label?.text as string | undefined;

      const salary = j.salary as { min?: number; max?: number } | undefined;
      const salaryText =
        salary?.min || salary?.max
          ? `${formatRupiah(salary.min)} - ${formatRupiah(salary.max)}`
          : 'Gaji tidak ditampilkan';

      const workType = (j.cjs?.workTypes?.[0]?.name?.['name({"locale":"id-ID"})'] || j.cjs?.workTypes?.[0]?.name || 'Full time') as string;

      let jobType: ExtractedJob['jobType'] = 'Full-time';
      if (/jarak jauh|remote/i.test(arrangementLabel || '')) jobType = 'Remote';
      else if (/kontrak|contract/i.test(workType)) jobType = 'Contract';
      else if (/intern|magang/i.test(workType)) jobType = 'Internship';

      const listedAt = j.listedAt as Record<string, any> | undefined;
      const postedLabel = Object.entries(listedAt || {}).find(([k]) => k.startsWith('label'))?.[1] as string | undefined;

      const title = String(j.title || '').trim();
      const description = String(j.abstract || '').trim();
      const company = (org?.name || j.advertiser?.name || 'Perusahaan').trim();
      const location = (loc?.displayName?.text || 'Indonesia').trim();
      const skills = inferSkills(title, description);

      jobs.push({
        id: `jobstreet-${j.id}`,
        title,
        company,
        location,
        salary: salaryText,
        portal: 'Jobstreet',
        portalUrl: `https://id.jobstreet.com/id/job/${j.id}`,
        jobType,
        experience: inferExperience(title),
        postedTime: postedLabel || timeAgo(listedAt?.dateTimeUtc),
        extractedTime: 'Baru saja',
        matchScore: computeMatchScore(keyword, title, skills, description),
        description,
        requirements: inferRequirements(description),
        skills,
      });
    } catch {
      // lewati job yang gagal diparse
    }
  }

  return { jobs, log: `Jobstreet: ${jobs.length} lowongan diekstrak dari halaman publik` };
}

/** Glints — https://glints.com/id/opportunities/jobs/explore?keyword=... */
async function scrapeGlints(keyword: string): Promise<{ jobs: ExtractedJob[]; log: string }> {
  const url = `https://glints.com/id/opportunities/jobs/explore?keyword=${encodeURIComponent(keyword)}`;
  const html = await fetchHtml(url);
  const data = extractNextData(html);
  const rawJobs: any[] = data?.props?.pageProps?.initialJobs?.jobsInPage || [];
  if (!rawJobs.length) throw new Error('Tidak ada data lowongan di respons Glints');

  const jobs: ExtractedJob[] = [];
  for (const j of rawJobs) {
    try {
      const arrangement = String(j.workArrangementOption || '').toUpperCase();
      const jobTypeRaw = String(j.type || '').toUpperCase();
      let jobType: ExtractedJob['jobType'] = 'Full-time';
      if (arrangement === 'REMOTE') jobType = 'Remote';
      else if (jobTypeRaw.includes('INTERN')) jobType = 'Internship';
      else if (jobTypeRaw.includes('CONTRACT') || jobTypeRaw.includes('PART')) jobType = 'Contract';

      const sal = j.salaries?.[0] as { minAmount?: number; maxAmount?: number } | undefined;
      const salaryText =
        sal?.minAmount || sal?.maxAmount
          ? `${formatRupiah(sal.minAmount)} - ${formatRupiah(sal.maxAmount)}`
          : 'Gaji tidak ditampilkan';

      const loc = j.location as { formattedName?: string; parents?: Array<{ formattedName?: string }> } | null;
      const locParts: string[] = [];
      for (const p of loc?.parents || []) if (p.formattedName) locParts.push(p.formattedName);
      if (loc?.formattedName) locParts.push(loc.formattedName);
      const country = (j.country as { name?: string } | null)?.name;
      const location = [...new Set(locParts)].join(', ') || country || 'Indonesia';

      const title = String(j.title || '').trim();
      const skills = inferSkills(title, '', (j.skills || []).map((s: any) => s?.name).filter(Boolean));

      jobs.push({
        id: `glints-${j.id}`,
        title,
        company: String(j.company?.name || 'Perusahaan').trim(),
        location,
        salary: salaryText,
        portal: 'Glints',
        portalUrl: `https://glints.com/id/opportunities/jobs/${slugify(title)}/${j.id}`,
        jobType,
        experience: inferExperience(title, j.minYearsOfExperience ?? null),
        postedTime: timeAgo(j.createdAt),
        extractedTime: 'Baru saja',
        matchScore: computeMatchScore(keyword, title, skills, ''),
        description: '',
        requirements: [],
        skills,
      });
    } catch {
      // lewati job yang gagal diparse
    }
  }

  return { jobs, log: `Glints: ${jobs.length} lowongan diekstrak dari halaman publik` };
}

/** LinkedIn — LinkedIn Jobs Search (butuh sesi login pengguna sendiri) */
async function scrapeLinkedInPortal(keyword: string, location?: string): Promise<{ jobs: ExtractedJob[]; log: string }> {
  const { scrapeLinkedInJobs } = await import('./linkedin-scraper');
  const { jobs } = await scrapeLinkedInJobs(keyword, location);

  const mapped: ExtractedJob[] = jobs.map((j, idx) => ({
    id: `linkedin-${idx}-${slugify(j.title).slice(0, 24)}-${Date.now()}`,
    title: j.title,
    company: j.company,
    location: j.location,
    salary: j.salary || 'Gaji tidak ditampilkan',
    portal: 'LinkedIn',
    portalUrl: j.url,
    jobType: 'Full-time',
    experience: inferExperience(j.title),
    postedTime: j.postedTime,
    extractedTime: 'Baru saja',
    matchScore: computeMatchScore(keyword, j.title, j.skills, j.description),
    description: j.description,
    requirements: inferRequirements(j.description),
    skills: inferSkills(j.title, j.description, j.skills),
  }));

  return { jobs: mapped, log: `LinkedIn: ${jobs.length} lowongan diekstrak (sesi login Anda)` };
}

/** Dealls — https://dealls.com/jobs?q=... */
async function scrapeDealls(keyword: string): Promise<{ jobs: ExtractedJob[]; log: string }> {
  const url = `https://dealls.com/jobs?q=${encodeURIComponent(keyword)}`;
  const html = await fetchHtml(url);
  const data = extractNextData(html);
  const pages: any[] =
    data?.props?.pageProps?.dehydratedState?.queries?.[0]?.state?.data?.pages || [];
  const docs = pages.flatMap((p) => p?.docs || []);
  if (!docs.length) throw new Error('Tidak ada data lowongan di respons Dealls');

  const jobs: ExtractedJob[] = [];
  for (const d of docs) {
    try {
      const empTypes: string[] = d.employmentTypes || [];
      const workplace = String(d.workplaceType || '').toLowerCase();
      let jobType: ExtractedJob['jobType'] = 'Full-time';
      if (workplace === 'remote') jobType = 'Remote';
      else if (empTypes.includes('internship')) jobType = 'Internship';
      else if (empTypes.includes('contract') || empTypes.includes('parttime')) jobType = 'Contract';

      const sal = d.salaryRange as { start?: number; end?: number } | null;
      const salaryText =
        sal?.start || sal?.end
          ? `${formatRupiah(sal.start)} - ${formatRupiah(sal.end)}`
          : 'Gaji tidak ditampilkan';

      const title = String(d.role || '').trim();
      const skills = inferSkills(title, '', (d.skills || []).map((s: any) => s?.name).filter(Boolean));
      const location = d.city || d.country || (workplace === 'remote' ? 'Remote' : 'Indonesia');

      jobs.push({
        id: `dealls-${d.id}`,
        title,
        company: String(d.company?.name || 'Perusahaan').trim(),
        location: String(location).trim(),
        salary: salaryText,
        portal: 'Dealls',
        portalUrl: `https://dealls.com/loker/${d.slug}~${d.company?.slug}`,
        jobType,
        experience: inferExperience(title),
        postedTime: timeAgo(d.publishedAt),
        extractedTime: 'Baru saja',
        matchScore: computeMatchScore(keyword, title, skills, ''),
        description: '',
        requirements: [],
        skills,
      });
    } catch {
      // lewati job yang gagal diparse
    }
  }

  return { jobs, log: `Dealls: ${jobs.length} lowongan diekstrak dari halaman publik` };
}

/** Talent.com — https://id.talent.com/jobs?k=...&l=... (SSR, kartu publik) */
async function scrapeTalent(keyword: string, location?: string): Promise<{ jobs: ExtractedJob[]; log: string }> {
  const url = `https://id.talent.com/jobs?k=${encodeURIComponent(keyword)}&l=${encodeURIComponent(location?.trim() || 'Indonesia')}`;
  const html = await fetchHtml(url);

  // Setiap kartu lowongan ditandai data-testid="job-card-unified" (SSR)
  const cards = html.split('data-testid="job-card-unified"').slice(1);
  if (!cards.length) throw new Error('Tidak ada data lowongan di respons Talent.com');

  const decodeEntities = (s: string) =>
    s.replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  const grab = (card: string, cls: string) => {
    const m = card.match(new RegExp(`class="[^"]*${cls}[^"]*"[^>]*>([\\s\\S]*?)<\\/`, 'i'));
    return m ? decodeEntities(m[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim() : '';
  };

  const jobs: ExtractedJob[] = [];
  for (let i = 0; i < cards.length; i++) {
    try {
      const card = cards[i];
      const title = grab(card, 'JobCard_title');
      if (!title) continue;

      const company = grab(card, 'JobCard_company') || 'Perusahaan';
      const location = grab(card, 'JobCard_location') || 'Indonesia';
      const description = grab(card, 'JobCard_snippet');
      const timeEl = card.match(/class="[^"]*JobCard_timeText[^"]*"[^>]*dateTime="([^"]+)"/);
      const hrefMatch = card.match(/href="([^"]*\/view\?id=[^"]+)"/);
      const href = hrefMatch?.[1] || '';
      const portalUrl = href.startsWith('http') ? href : `https://id.talent.com${href}`;
      const skills = inferSkills(title, description);

      jobs.push({
        id: `talent-${i}-${slugify(title).slice(0, 28)}`,
        title,
        company,
        location,
        salary: 'Gaji tidak ditampilkan',
        portal: 'Talent',
        portalUrl,
        jobType: 'Full-time',
        experience: inferExperience(title),
        postedTime: timeEl ? timeAgo(timeEl[1]) : 'Baru saja',
        extractedTime: 'Baru saja',
        matchScore: computeMatchScore(keyword, title, skills, description),
        description,
        requirements: inferRequirements(description),
        skills,
      });
    } catch {
      // lewati job yang gagal diparse
    }
  }

  return { jobs, log: `Talent.com: ${jobs.length} lowongan diekstrak dari halaman publik` };
}

/** Kalibrr — https://www.kalibrr.com/home/te/{slug} (__NEXT_DATA__ > props.pageProps.jobs) */
async function scrapeKalibrr(keyword: string): Promise<{ jobs: ExtractedJob[]; log: string }> {
  const slug = slugify(keyword);
  const url = `https://www.kalibrr.com/home/te/${slug}`;
  const html = await fetchHtml(url);
  const data = extractNextData(html);
  const rawJobs: any[] = data?.props?.pageProps?.jobs || [];
  if (!rawJobs.length) throw new Error('Tidak ada data lowongan di respons Kalibrr');

  const jobs: ExtractedJob[] = [];
  for (const j of rawJobs) {
    try {
      const tenure = String(j.tenure || '').toLowerCase();
      let jobType: ExtractedJob['jobType'] = 'Full-time';
      if (j.isWorkFromHome) jobType = 'Remote';
      else if (tenure.includes('contract')) jobType = 'Contract';
      else if (tenure.includes('intern')) jobType = 'Internship';

      let salaryText = 'Gaji tidak ditampilkan';
      if (j.salaryShown && (j.baseSalary || j.maximumSalary)) {
        const min = formatRupiah(j.baseSalary);
        const max = formatRupiah(j.maximumSalary);
        salaryText = min && max && min !== max ? `${min} - ${max}` : min || max;
        if (j.salaryInterval === 'month') salaryText += ' / bulan';
      }

      const addr = j.googleLocation?.addressComponents || {};
      const location = j.isWorkFromHome
        ? 'Remote'
        : [...new Set([addr.city, addr.region, addr.country].filter(Boolean))].join(', ') || 'Indonesia';

      const title = String(j.name || '').trim();
      const description = String(j.description || '').trim();
      const skills = inferSkills(title, description);

      jobs.push({
        id: `kalibrr-${j.id}`,
        title,
        company: String(j.companyName || 'Perusahaan').trim(),
        location,
        salary: salaryText,
        portal: 'Kalibrr',
        portalUrl: `https://www.kalibrr.com/c/${j.company?.code}/jobs/${j.id}/${j.slug}`,
        jobType,
        experience: inferExperience(title),
        postedTime: timeAgo(j.activationDate),
        extractedTime: 'Baru saja',
        matchScore: computeMatchScore(keyword, title, skills, description),
        description,
        requirements: extractRequirements(j.qualifications),
        skills,
      });
    } catch {
      // lewati job yang gagal diparse
    }
  }

  return { jobs, log: `Kalibrr: ${jobs.length} lowongan diekstrak dari halaman publik` };
}

/** Jobindo — https://jobindo.com/cari-lowongan-kerja?search=... (Inertia data-page di <div id="app">) */
async function scrapeJobindo(keyword: string): Promise<{ jobs: ExtractedJob[]; log: string }> {
  const url = `https://jobindo.com/cari-lowongan-kerja?search=${encodeURIComponent(keyword)}`;
  const html = await fetchHtml(url);
  const m = html.match(/<div id="app" data-page="([\s\S]*?)"\s*>/);
  if (!m) throw new Error('Tidak dapat menemukan data halaman Jobindo');

  let page: any = null;
  try {
    page = JSON.parse(decodeHtmlEntities(m[1]));
  } catch {
    throw new Error('Data halaman Jobindo tidak valid');
  }
  const rawJobs: any[] = page?.props?.jobs?.data || [];
  if (!rawJobs.length) throw new Error('Tidak ada data lowongan di respons Jobindo');

  const jobs: ExtractedJob[] = [];
  for (const j of rawJobs) {
    try {
      const jt = String(j.job_type_name || '').toLowerCase();
      let jobType: ExtractedJob['jobType'] = 'Full-time';
      if (jt.includes('magang') || jt.includes('intern')) jobType = 'Internship';
      else if (jt.includes('kontrak') || jt.includes('part')) jobType = 'Contract';

      const minS = String(j.salary_min_name || '').trim();
      const maxS = String(j.salary_max_name || '').trim();
      const salaryText = minS && maxS ? `${minS} - ${maxS}` : minS || maxS || 'Gaji tidak ditampilkan';

      const title = String(j.title || '').trim();
      const description = String(j.description || stripHtml(j.html) || '').trim();
      const skills = inferSkills(title, description);
      const postedIso = j.date ? new Date(Number(j.date) * 1000).toISOString() : String(j.created_at || '').replace(' ', 'T');

      jobs.push({
        id: `jobindo-${j.id}`,
        title,
        company: String(j.employer_detail?.company || 'Perusahaan').trim(),
        location: String(j.region_name || 'Indonesia').trim(),
        salary: salaryText,
        portal: 'Jobindo',
        portalUrl: String(j.url || `https://jobindo.com/`),
        jobType,
        experience: inferExperience(title),
        postedTime: timeAgo(postedIso),
        extractedTime: 'Baru saja',
        matchScore: computeMatchScore(keyword, title, skills, description),
        description,
        requirements: extractRequirements(j.message) || inferRequirements(description),
        skills,
      });
    } catch {
      // lewati job yang gagal diparse
    }
  }

  return { jobs, log: `Jobindo: ${jobs.length} lowongan diekstrak dari halaman publik` };
}

// ---------------------------------------------------------------------------
// Portal WordPress (blog loker) — listing halaman publik
// ---------------------------------------------------------------------------
// Teruji bisa di-scrape dari halaman publik tanpa login (Agustus 2026):
//   lokerho.com, sejakkemarin.com, lamarlangsung.com, informasilowongankerja.com,
//   solusikerja.net, bursakerjadepnaker.com, lokeranakmedan.com, infolokerjabar.com,
//   infolokerbanten.com, infolokerkarawang.com, lokermuslim.id, lowkerjogja.co.id
// Strategi: pakai pencarian WordPress (?s=) untuk relevansi kata kunci, lalu
// fallback ke halaman daftar bila pencarian kosong/tidak ada lowongan.

const WP_JOB_TITLE_RE =
  /(lowongan|loker|staff|admin|developer|operator|sales|marketing|karyawan|magang|intern|crew|produksi|spv|supervisor|frontline|engineer|analyst|guru|driver|cleaning|satpam|helper|accounting|finance|hrd|designer|store|part\s?time|full\s?time|cs\b|kasir|pramuniaga)/i;

const WP_NAV_BLOCKLIST = [
  'pasang', 'login', 'register', 'tentang', 'kontak', 'kebijakan', 'privacy',
  'sitemap', 'semua lowongan', 'loker baru', 'kategori lowongan', 'arsip', 'profil',
  'syarat', 'ketentuan', 'lowongan kerja agustus', 'lowongan kerja september',
  'lowongan kerja oktober', 'lowongan kerja november', 'lowongan kerja desember',
];

interface WordPressPortalConfig {
  id: PortalId;
  label: string;
  searchUrl: (keyword: string) => string;
  listUrl: string;
}

const WORDPRESS_PORTALS: WordPressPortalConfig[] = [
  {
    id: 'LokerHeadOffice',
    label: 'LokerHeadOffice',
    searchUrl: (kw) => `https://lokerho.com/?s=${encodeURIComponent(kw)}`,
    listUrl: 'https://lokerho.com/',
  },
  {
    id: 'SejakKemarin',
    label: 'SejakKemarin',
    searchUrl: (kw) => `https://sejakkemarin.com/?s=${encodeURIComponent(kw)}`,
    listUrl: 'https://sejakkemarin.com/',
  },
  {
    id: 'LamarLangsung',
    label: 'LamarLangsung',
    searchUrl: (kw) => `https://lamarlangsung.com/?s=${encodeURIComponent(kw)}`,
    listUrl: 'https://lamarlangsung.com/',
  },
  {
    id: 'InfoLokerKerja',
    label: 'InfoLokerKerja',
    searchUrl: (kw) => `https://informasilowongankerja.com/?s=${encodeURIComponent(kw)}`,
    listUrl: 'https://informasilowongankerja.com/',
  },
  {
    id: 'SolusiKerja',
    label: 'SolusiKerja',
    searchUrl: (kw) => `https://solusikerja.net/?s=${encodeURIComponent(kw)}`,
    listUrl: 'https://solusikerja.net/',
  },
  {
    id: 'BursaKerjaDepnaker',
    label: 'BursaKerjaDepnaker',
    searchUrl: (kw) => `https://bursakerjadepnaker.com/?s=${encodeURIComponent(kw)}`,
    listUrl: 'https://bursakerjadepnaker.com/',
  },
  {
    id: 'LokerAnakMedan',
    label: 'LokerAnakMedan',
    searchUrl: (kw) => `https://lokeranakmedan.com/?s=${encodeURIComponent(kw)}`,
    listUrl: 'https://lokeranakmedan.com/',
  },
  {
    id: 'InfoLokerJabar',
    label: 'InfoLokerJabar',
    searchUrl: (kw) => `https://infolokerjabar.com/?s=${encodeURIComponent(kw)}`,
    listUrl: 'https://infolokerjabar.com/',
  },
  {
    id: 'InfoLokerBanten',
    label: 'InfoLokerBanten',
    searchUrl: (kw) => `https://infolokerbanten.com/?s=${encodeURIComponent(kw)}`,
    listUrl: 'https://infolokerbanten.com/',
  },
  {
    id: 'InfoLokerKarawang',
    label: 'InfoLokerKarawang',
    searchUrl: (kw) => `https://infolokerkarawang.com/?s=${encodeURIComponent(kw)}`,
    listUrl: 'https://infolokerkarawang.com/category/loker-pabrik/',
  },
  {
    id: 'LokerMuslim',
    label: 'LokerMuslim',
    searchUrl: (kw) => `https://www.lokermuslim.id/?s=${encodeURIComponent(kw)}`,
    listUrl: 'https://www.lokermuslim.id/tag/lowongankerja/',
  },
  {
    id: 'LowkerJogja',
    label: 'LowkerJogja',
    searchUrl: (kw) => `https://lowkerjogja.co.id/?s=${encodeURIComponent(kw)}`,
    listUrl: 'https://lowkerjogja.co.id/lowongan/',
  },
];

/** Ekstrak gaji dari judul, mis. "Rp5.500.000" atau "Rp3jt - Rp5jt". */
function extractSalaryFromTitle(title: string): string {
  const matches = [...title.matchAll(/Rp\s?([\d.,]+)/gi)].map((m) => m[1]);
  if (!matches.length) return '';
  const fmt = (s: string) => {
    const n = Number(s.replace(/\./g, '').replace(/,/g, ''));
    return Number.isFinite(n) ? 'Rp ' + n.toLocaleString('id-ID') : 'Rp ' + s;
  };
  const vals = matches.map(fmt);
  return vals.length > 1 ? `${vals[0]} - ${vals[1]}` : vals[0];
}

const WP_KNOWN_CITIES = [
  'jakarta', 'bandung', 'surabaya', 'medan', 'batam', 'semarang', 'yogyakarta', 'jogja',
  'bekasi', 'depok', 'bogor', 'tangerang', 'karawang', 'cikarang', 'cikande', 'serang',
  'sidoarjo', 'malang', 'denpasar', 'makassar', 'palembang', 'pekanbaru', 'balikpapan',
  'samarinda', 'sleman', 'tegal', 'demak', 'solo', 'surakarta', 'cilacap', 'purwokerto',
  'banjarmasin', 'pontianak', 'manado', 'lampung', 'padang', 'aceh', 'cikupa', 'cibitung',
  'sumatera', 'kalimantan', 'sulawesi', 'bali', 'jawa barat', 'jawa tengah', 'jawa timur',
];

/** Tebak lokasi dari judul: segmen terakhir setelah dash atau kata kota yang dikenal. */
function extractLocationFromTitle(title: string): string {
  const parts = title.split(/\s+[–—-]\s+/).map((s) => s.trim()).filter(Boolean);
  const last = parts[parts.length - 1] || '';
  const locationish = (s: string) =>
    s.length >= 2 &&
    s.length <= 45 &&
    !/^(pt|cv|ud|yayasan|dibutuhkan|lowongan|loker)\b/i.test(s) &&
    !/Rp\s?[\d.]/i.test(s) &&
    !/\d{4}$/.test(s);
  if (last && locationish(last)) {
    if (/^(kota|kab|kabupaten|prov|provinsi|area)\b/i.test(last)) return last;
    if (/^(remote|wfh|onsite|hybrid|work from home)/i.test(last)) return last;
  }
  const lower = title.toLowerCase();
  const found = WP_KNOWN_CITIES.find((c) => new RegExp(`(^|[^a-z])${c}([^a-z]|$)`).test(lower));
  if (found) {
    const map: Record<string, string> = {
      jogja: 'Yogyakarta',
      'jawa barat': 'Jawa Barat',
      'jawa tengah': 'Jawa Tengah',
      'jawa timur': 'Jawa Timur',
      sumatera: 'Sumatera',
      kalimantan: 'Kalimantan',
      sulawesi: 'Sulawesi',
    };
    return map[found] || found.charAt(0).toUpperCase() + found.slice(1);
  }
  return '';
}

/** Tebak perusahaan dari judul via prefix PT/CV/UD/Yayasan. */
function extractCompanyFromTitle(title: string): string {
  const m = title.match(/\b(?:PT|CV|UD|Yayasan|BUMN)\s+[A-Za-z0-9][A-Za-z0-9&.'’\- ]*/);
  if (m) {
    const cleaned = m[0]
      .replace(/\s+[–—-].*$/, '')
      .replace(/\s+\(.*$/, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (cleaned) return cleaned;
  }
  const di = title.match(/\bdi\s+(PT|CV|UD|Yayasan|BUMN)\s+[A-Za-z0-9][A-Za-z0-9&.'’\- ]*/i);
  if (di) {
    const cleaned = di[0]
      .replace(/^di\s+/i, '')
      .replace(/\s+[–—-].*$/, '')
      .replace(/\s+\(.*$/, '')
      .trim();
    if (cleaned) return cleaned;
  }
  // Fallback "... di NamaPerusahaan" di akhir judul (hindari kata kota)
  const diEnd = title.match(/\bdi\s+([A-Z][A-Za-z0-9&.'’\- ]{2,45})$/i);
  if (diEnd) {
    const cand = diEnd[1].trim();
    const lower = cand.toLowerCase();
    const looksCity = WP_KNOWN_CITIES.some((c) => new RegExp(`(^|[^a-z])${c}([^a-z]|$)`).test(lower));
    if (!looksCity) return cand;
  }
  return 'Perusahaan';
}

/** Perkiraan waktu posting dari pola tanggal di URL (mis. /2026/07/28/). */
function postedFromUrl(url: string): string {
  const m = url.match(/\/(20\d{2})\/(\d{2})\/(\d{2})\//);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (!Number.isNaN(d.getTime())) return timeAgo(d.toISOString());
  }
  return 'Baru saja';
}

function isWpJobAnchor(href: string, text: string, domain: string): boolean {
  if (!href || !text) return false;
  if (text.length < 12) return false;
  if (!WP_JOB_TITLE_RE.test(text)) return false;
  const h = href.toLowerCase();
  if (/^(#|mailto:|javascript:)/.test(h)) return false;
  if (/\.(css|js|png|jpe?g|webp|svg|ico|woff2?|gif)$/.test(h)) return false;
  if (/(wp-content|wp-json|wp-admin|feed|sitemap|\.xml$|\.txt$)/.test(h)) return false;
  if (/(pasang|login|register|kebijakan|privacy|tentang|kontak|syarat|ketentuan)/.test(h)) return false;
  if (/\/(category|tag|author|kategori|kategori-loker)\//.test(h)) return false;
  if (/\?s=|\?p=|\?page|\?cat=/.test(h)) return false;
  // tautan beranda / root domain
  if (/^https?:\/\/(www\.)?[^/]+\/?$/.test(h)) return false;
  if (h.startsWith('http') && !h.includes(domain)) return false;
  const low = text.toLowerCase();
  for (const b of WP_NAV_BLOCKLIST) if (low.includes(b)) return false;
  return true;
}

function extractWordpressAnchors(html: string, cfg: WordPressPortalConfig): Array<{ text: string; href: string }> {
  const domain = new URL(cfg.listUrl).hostname;
  const anchors = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([^<]{8,140})<\/a>/g)];
  const out: Array<{ text: string; href: string }> = [];
  const seen = new Set<string>();
  for (const a of anchors) {
    const href = a[1].trim();
    const text = decodeHtmlEntities(a[2]).replace(/\s+/g, ' ').trim();
    if (!isWpJobAnchor(href, text, domain)) continue;
    if (seen.has(href)) continue;
    seen.add(href);
    out.push({ text, href });
  }
  return out;
}

async function scrapeWordpressPortal(keyword: string, cfg: WordPressPortalConfig): Promise<{ jobs: ExtractedJob[]; log: string }> {
  let html = '';
  try {
    html = await fetchHtml(cfg.searchUrl(keyword));
  } catch {
    html = '';
  }
  let anchors = html ? extractWordpressAnchors(html, cfg) : [];
  if (!anchors.length) {
    // Fallback ke halaman daftar (pencarian kosong / tidak tersedia)
    html = await fetchHtml(cfg.listUrl);
    anchors = extractWordpressAnchors(html, cfg);
  }
  if (!anchors.length) throw new Error(`Tidak ada lowongan ditemukan di ${cfg.label}`);

  const jobs: ExtractedJob[] = [];
  for (const a of anchors) {
    if (jobs.length >= 25) break;
    const title = decodeHtmlEntities(a.text).replace(/\s+/g, ' ').trim();
    const url = a.href.startsWith('http') ? a.href : new URL(a.href, cfg.listUrl).href;
    try {
      const salary = extractSalaryFromTitle(title);
      const company = extractCompanyFromTitle(title);
      const location = extractLocationFromTitle(title);
      const skills = inferSkills(title, '');
      jobs.push({
        id: `${cfg.id}-${slugify(title).slice(0, 36)}-${jobs.length}`,
        title,
        company,
        location: location || 'Indonesia',
        salary: salary || 'Gaji tidak ditampilkan',
        portal: cfg.id,
        portalUrl: url,
        jobType: 'Full-time',
        experience: inferExperience(title),
        postedTime: postedFromUrl(url),
        extractedTime: 'Baru saja',
        matchScore: computeMatchScore(keyword, title, skills, ''),
        description: '',
        requirements: [],
        skills,
      });
    } catch {
      // lewati job yang gagal diparse
    }
  }

  return { jobs, log: `${cfg.label}: ${jobs.length} lowongan diekstrak dari halaman publik` };
}

// ---------------------------------------------------------------------------
// Jora — SSR publik (kartu dengan atribut data-* terstruktur)
// ---------------------------------------------------------------------------

/** Jora — https://id.jora.com/jobs?sp=search&q=... */
async function scrapeJora(keyword: string): Promise<{ jobs: ExtractedJob[]; log: string }> {
  const url = `https://id.jora.com/jobs?sp=search&q=${encodeURIComponent(keyword)}`;
  const html = await fetchHtml(url);
  const cards = html.split('class="job-card').slice(1);
  if (!cards.length) throw new Error('Tidak ada data lowongan di respons Jora');

  const jobs: ExtractedJob[] = [];
  for (const card of cards) {
    try {
      let jobId = '';
      let title = '';
      let location = '';
      let company = '';
      const metaMatch = card.match(/data-braze-job-panel-view="([^"]*)"/);
      if (metaMatch) {
        try {
          const meta = JSON.parse(decodeHtmlEntities(metaMatch[1]));
          jobId = String(meta.job_id || '');
          title = String(meta.job_title || '');
          location = String(meta.location || '');
          company = String(meta.company_name || '');
        } catch {
          // fallback di bawah
        }
      }
      if (!title) {
        const h2 = card.match(/<h2[^>]*class="[^"]*job-title[^"]*"[^>]*>([\s\S]*?)<\/h2>/);
        title = h2 ? stripHtml(h2[1]) : '';
      }
      if (!title) continue;

      let href = card.match(/href="([^"]*\/job\/[^"]+)"/)?.[1] || '';
      if (!href && jobId) href = `/job/${slugify(title)}-${jobId}`;
      const portalUrl = href.startsWith('http') ? href : `https://id.jora.com${href}`;

      const salMatch = card.match(/Rp\s?[\d.,]+(?:\s*-\s*Rp\s?[\d.,]+)?/i);
      const salaryText = salMatch ? salMatch[0].replace(/\s+/g, ' ') : 'Gaji tidak ditampilkan';
      const skills = inferSkills(title, '');

      jobs.push({
        id: `jora-${jobId || slugify(title)}`,
        title,
        company: company || 'Perusahaan',
        location: location || 'Indonesia',
        salary: salaryText,
        portal: 'Jora',
        portalUrl,
        jobType: 'Full-time',
        experience: inferExperience(title),
        postedTime: 'Baru saja',
        extractedTime: 'Baru saja',
        matchScore: computeMatchScore(keyword, title, skills, ''),
        description: '',
        requirements: [],
        skills,
      });
    } catch {
      // lewati job yang gagal diparse
    }
  }

  return { jobs, log: `Jora: ${jobs.length} lowongan diekstrak dari halaman publik` };
}

// ---------------------------------------------------------------------------
// Portal Blogger (blog loker) — feed JSON publik
// ---------------------------------------------------------------------------
// Feed: {blog}/feeds/posts/default?alt=json&q={keyword} → entry[]
//   title.$t, link[rel=alternate].href, published.$t, content.$t

interface BloggerPortalConfig {
  id: PortalId;
  label: string;
  blogBase: string;
}

const BLOGGER_PORTALS: BloggerPortalConfig[] = [
  { id: 'Jobinaja', label: 'Jobinaja', blogBase: 'https://www.jobinaja.com' },
  { id: 'Lokernas', label: 'Lokernas', blogBase: 'https://www.lokernas.com' },
  { id: 'OfficialKarir', label: 'OfficialKarir', blogBase: 'https://www.officialkarir.com' },
  { id: 'LogKerja', label: 'LogKerja', blogBase: 'https://www.logkerja.id' },
];

async function scrapeBloggerPortal(keyword: string, cfg: BloggerPortalConfig): Promise<{ jobs: ExtractedJob[]; log: string }> {
  const url = `${cfg.blogBase}/feeds/posts/default?alt=json&q=${encodeURIComponent(keyword)}&max-results=25`;
  const html = await fetchHtml(url);
  let entries: any[] = [];
  try {
    entries = JSON.parse(html)?.feed?.entry || [];
  } catch {
    throw new Error(`Feed ${cfg.label} tidak valid`);
  }
  if (!entries.length) throw new Error(`Tidak ada lowongan ditemukan di ${cfg.label}`);

  const jobs: ExtractedJob[] = [];
  for (const e of entries) {
    try {
      const title = String(e.title?.$t || '').replace(/\s+/g, ' ').trim();
      if (!title) continue;
      const link = e.link?.find((l: any) => l.rel === 'alternate')?.href || '';
      const description = stripHtml(String(e.content?.$t || '')).slice(0, 600);
      const salary = extractSalaryFromTitle(title);
      const company = extractCompanyFromTitle(title);
      const location = extractLocationFromTitle(title);
      const skills = inferSkills(title, description);

      jobs.push({
        id: `${cfg.id}-${slugify(title).slice(0, 36)}-${jobs.length}`,
        title,
        company,
        location: location || 'Indonesia',
        salary: salary || 'Gaji tidak ditampilkan',
        portal: cfg.id,
        portalUrl: link,
        jobType: 'Full-time',
        experience: inferExperience(title),
        postedTime: timeAgo(e.published?.$t),
        extractedTime: 'Baru saja',
        matchScore: computeMatchScore(keyword, title, skills, description),
        description,
        requirements: inferRequirements(description),
        skills,
      });
    } catch {
      // lewati job yang gagal diparse
    }
  }

  return { jobs, log: `${cfg.label}: ${jobs.length} lowongan diekstrak dari feed publik` };
}

// ---------------------------------------------------------------------------
// Orkestrasi + deduplikasi
// ---------------------------------------------------------------------------

function dedupeJobs(jobs: ExtractedJob[]): ExtractedJob[] {
  const seen = new Set<string>();
  const out: ExtractedJob[] = [];
  for (const j of jobs) {
    const key = `${j.portal}|${j.title}|${j.company}|${j.location}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(j);
  }
  return out;
}

export async function runScrape(options: ScrapeOptions): Promise<ScrapeOutput> {
  const keyword = options.keyword?.trim();
  if (!keyword) throw new Error('Kata kunci / posisi pekerjaan wajib diisi.');

  const ALLOWED_PORTALS: PortalId[] = [
    'Jobstreet', 'Glints', 'Dealls', 'Talent', 'LinkedIn', 'Kalibrr', 'Jobindo',
    'Jora', 'Jobinaja', 'Lokernas', 'OfficialKarir', 'LogKerja',
    'Indeed', 'Loker.id', 'Jooble', 'CakeResume', 'Karir.com', 'KitaLulus',
    'LokerHeadOffice', 'SejakKemarin', 'LamarLangsung', 'InfoLokerKerja', 'SolusiKerja',
    'BursaKerjaDepnaker', 'LokerAnakMedan', 'InfoLokerJabar', 'InfoLokerBanten',
    'InfoLokerKarawang', 'LokerMuslim', 'LowkerJogja',
  ];

  const requested = options.portals?.length
    ? (options.portals.filter((p) => ALLOWED_PORTALS.includes(p)) as PortalId[])
    : (ALLOWED_PORTALS.filter((p) => p !== 'LinkedIn') as PortalId[]);

  const logs: string[] = [];
  const stats: Record<PortalId, PortalResult> = {
    Jobstreet: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    Glints: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    Dealls: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    Talent: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    LinkedIn: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    Kalibrr: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    Jobindo: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    LokerHeadOffice: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    SejakKemarin: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    LamarLangsung: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    InfoLokerKerja: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    SolusiKerja: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    BursaKerjaDepnaker: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    LokerAnakMedan: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    InfoLokerJabar: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    InfoLokerBanten: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    InfoLokerKarawang: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    LokerMuslim: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    LowkerJogja: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    Jora: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    Jobinaja: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    Lokernas: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    OfficialKarir: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    LogKerja: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    Indeed: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    'Loker.id': { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    Jooble: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    CakeResume: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    'Karir.com': { status: 'skipped', count: 0, message: 'Tidak dipilih' },
    KitaLulus: { status: 'skipped', count: 0, message: 'Tidak dipilih' },
  };

  const ts = () => new Date().toLocaleTimeString('id-ID', { hour12: false });
  logs.push(`[${ts()}] 🌐 Bot scraper dimulai — kata kunci "${keyword}"`);
  logs.push(`[${ts()}] 🔍 Menghubungkan ke halaman publik ${requested.join(', ')}...`);

  const scrapers: Array<{ id: PortalId; fn: (kw: string) => Promise<{ jobs: ExtractedJob[]; log: string }> }> = [
    { id: 'Jobstreet', fn: (kw) => scrapeJobstreet(kw) },
    { id: 'Glints', fn: (kw) => scrapeGlints(kw) },
    { id: 'Dealls', fn: (kw) => scrapeDealls(kw) },
    { id: 'Talent', fn: (kw) => scrapeTalent(kw, options.location) },
    { id: 'Kalibrr', fn: (kw) => scrapeKalibrr(kw) },
    { id: 'Jobindo', fn: (kw) => scrapeJobindo(kw) },
    { id: 'Jora', fn: (kw) => scrapeJora(kw) },
    ...BLOGGER_PORTALS.map((cfg) => ({ id: cfg.id, fn: (kw: string) => scrapeBloggerPortal(kw, cfg) })),
    ...WORDPRESS_PORTALS.map((cfg) => ({ id: cfg.id, fn: (kw: string) => scrapeWordpressPortal(kw, cfg) })),
    ...BROWSER_PORTAL_IDS.map((id) => ({
      id,
      fn: async (kw: string) => {
        const { scrapeBrowserPortal } = await import('./browser-portals');
        const { jobs, log } = await scrapeBrowserPortal(id, kw);
        const mapped: ExtractedJob[] = jobs.map((j, idx) => ({
          id: `${id}-${idx}-${slugify(j.title).slice(0, 24)}`,
          title: j.title,
          company: j.company,
          location: j.location,
          salary: j.salary,
          portal: id as PortalId,
          portalUrl: j.url,
          jobType: 'Full-time',
          experience: inferExperience(j.title),
          postedTime: j.postedTime,
          extractedTime: 'Baru saja',
          matchScore: computeMatchScore(kw, j.title, inferSkills(j.title, ''), ''),
          description: '',
          requirements: [],
          skills: inferSkills(j.title, ''),
        }));
        return { jobs: mapped, log };
      },
    })),
    { id: 'LinkedIn', fn: (kw) => scrapeLinkedInPortal(kw, options.location) },
  ];

  // Urutkan: portal browser (buka Chrome) + LinkedIn ditaruh terakhir supaya
  // tidak memblokir portal lain (error akan di-catch per-portal).
  scrapers.sort((a, b) => {
    const aLast = a.id === 'LinkedIn' || BROWSER_PORTAL_IDS.includes(a.id) ? 1 : 0;
    const bLast = b.id === 'LinkedIn' || BROWSER_PORTAL_IDS.includes(b.id) ? 1 : 0;
    return aLast - bLast;
  });

  const allJobs: ExtractedJob[] = [];

  for (const s of scrapers) {
    if (!requested.includes(s.id)) continue;
    try {
      const { jobs, log } = await s.fn(keyword);
      allJobs.push(...jobs);
      stats[s.id] = { status: 'ok', count: jobs.length, message: log };
      logs.push(`[${ts()}] ⚡ ${log}`);
    } catch (e: any) {
      stats[s.id] = { status: 'error', count: 0, message: e.message || 'Gagal mengambil data' };
      logs.push(`[${ts()}] 🚨 ${s.id} gagal: ${e.message || 'terjadi kesalahan'}`);
    }
  }

  const jobs = dedupeJobs(allJobs);
  logs.push(`[${ts()}] ✅ EKSTRAKSI SUKSES: ${jobs.length} lowongan unik ditemukan (setelah deduplikasi).`);

  return { jobs, logs, stats };
}
