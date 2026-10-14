// ============================================================================
// Data layer portal — baca DB via Prisma, petakan ke bentuk template .astro
// ----------------------------------------------------------------------------
// Semua halaman portal membaca tabel riil jobs / certifications / events / articles
// / courses dari database PostgreSQL (termasuk hasil sinkronisasi loker).
// Tidak menggunakan dummy data fallback.
// ============================================================================

import { prisma } from './prisma';

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const FALLBACK_CERT = '/images/placeholder-cert.svg';
const FALLBACK_COURSE = '/images/placeholder-course.svg';
const FALLBACK_EVENT = '/images/placeholder-event.svg';
const FALLBACK_ARTICLE = '/images/placeholder-article.svg';
const FALLBACK_JOB = '/images/hero-job.webp';

export function resolveCourseImage(title: string, cover?: string | null): string {
  if (cover && cover.trim() !== '') return cover;
  const t = (title || '').toLowerCase();
  if (t.includes('excel') || t.includes('data') || t.includes('analis') || t.includes('hr')) {
    return '/images/placeholder-course-data.svg';
  }
  if (t.includes('marketing') || t.includes('design') || t.includes('sosial') || t.includes('media') || t.includes('copywriting')) {
    return '/images/placeholder-course-design.svg';
  }
  return FALLBACK_COURSE;
}

export function resolveEventImage(title: string, type?: string | null, cover?: string | null): string {
  if (cover && cover.trim() !== '') return cover;
  const t = (title || '').toLowerCase();
  const tp = (type || '').toLowerCase();
  if (t.includes('webinar') || tp.includes('webinar') || t.includes('online')) {
    return '/images/placeholder-event-webinar.svg';
  }
  if (t.includes('workshop') || t.includes('clinic') || t.includes('interview') || t.includes('bedah cv')) {
    return '/images/placeholder-event-workshop.svg';
  }
  return FALLBACK_EVENT;
}

function timeAgo(date: Date): string {
  const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return 'Dibuka baru saja';
  if (diffHours < 24) return `Dibuka ${diffHours} jam lalu`;
  const days = Math.floor(diffHours / 24);
  if (days === 1) return 'Dibuka kemarin';
  if (days < 30) return `Dibuka ${days} hari lalu`;
  return `Dibuka ${date.getDate()} ${MONTHS_ID[date.getMonth()]} ${date.getFullYear()}`;
}

function formatSalary(min: number | null, max: number | null, period: string): string {
  if (!min && !max) return 'Gaji kompetitif';
  const fmt = (n: number) =>
    n >= 1000000 ? `Rp ${(n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}jt` : `Rp ${n.toLocaleString('id-ID')}`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}${period === 'YEAR' ? '/thn' : ''}`;
  return fmt(min || max || 0);
}

function workTypeLabel(workType: string): string {
  const map: Record<string, string> = {
    ONSITE: 'Full Time',
    REMOTE: 'Remote',
    HYBRID: 'Hybrid',
    ONLINE: 'Online',
  };
  return map[workType] || 'Full Time';
}

/** Estimasi kategori kasar dari judul/deskripsi (untuk filter & badge) */
function inferCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (/(teknisi|mechanic|produksi|operator|gudang|driver|warehouse|qc)/.test(text)) return 'Teknik & Produksi';
  if (/(admin|staff|data entry|customer service|cs)/.test(text)) return 'Admin & Operasional';
  if (/(marketing|sales|promo|social media)/.test(text)) return 'Marketing';
  if (/(guru|teacher|pengajar)/.test(text)) return 'Pendidikan';
  if (/(perawat|nurse|apoteker|kesehatan)/.test(text)) return 'Kesehatan';
  if (/(react|frontend|backend|programmer|developer|it\b|software)/.test(text)) return 'IT';
  if (/(finance|keuangan|akuntan|accounting|tax)/.test(text)) return 'Finance';
  return 'Umum';
}

/** Pembersih teks korup/mojibake dan entitas HTML mentah */
export function cleanText(str: string): string {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&copy;/gi, '©')
    .replace(/&reg;/gi, '®')
    .replace(/\[&>[^\]]+\]:[^\s"'>]+/gi, '')
    .replace(/(?:\[[^\]]*\]|svg\]|class=)[^\s"'>]*/gi, '')
    .replace(/[">]+\s*/g, ' ')
    .replace(/=oj\?w-[^\s]+/gi, '')
    .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, (ch) => {
      if (ch === '—' || ch === '–' || ch === '•' || ch === '“' || ch === '”' || ch === '‘' || ch === '’' || ch === '®' || ch === '©') return ch;
      return ' ';
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/** Pembersih deskripsi panjang: hapus tag HTML mentah tetapi pertahankan baris baru paragraf */
export function cleanDescription(str: string): string {
  if (!str) return '';
  return str
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Badge kasar berdasarkan umur posting */
function inferBadge(createdAt: Date): string | undefined {
  const days = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 1) return 'Baru';
  if (days <= 3) return 'Hot';
  return undefined;
}

/** Normalisasi slug lama yang memiliki akhiran hash heksadesimal (-8ddf5a) atau kata terpotong */
function normalizeLegacySlug(rawSlug: string): { clean: string; prefix: string } {
  const clean = rawSlug
    .toLowerCase()
    .trim()
    .replace(/-[a-f0-9]{6,8}$/i, '')
    .replace(/^-+|-+$/g, '');
  const lastDash = clean.lastIndexOf('-');
  const prefix = lastDash > 12 ? clean.slice(0, lastDash) : clean;
  return { clean, prefix };
}

const INTERNAL_SOURCE_TAGS = new Set([
  'manual',
  'bulk_import',
  'scraper',
  'sync',
  'admin',
  'seed',
  'system',
  'crawler',
  'internal',
  'import',
  'user_submission',
]);

/** Format label sumber lowongan agar ramah pembaca dan tidak membocorkan metadata teknis DB */
export function formatJobSource(rawSource?: string | null, companyName?: string): string {
  const clean = cleanText(rawSource || '').toLowerCase().trim();
  const isInternal = !clean || INTERNAL_SOURCE_TAGS.has(clean);

  if (isInternal) {
    if (companyName && companyName.trim() && companyName.toLowerCase() !== 'perusahaan') {
      return `Kanal Resmi ${companyName.trim()}`;
    }
    return 'Portal Resmi Perusahaan';
  }

  // Jika nama sumber adalah portal publik populer, rapikan kapitalisasinya
  if (clean.includes('jobstreet')) return 'Jobstreet';
  if (clean.includes('glints')) return 'Glints';
  if (clean.includes('kalibrr')) return 'Kalibrr';
  if (clean.includes('linkedin')) return 'LinkedIn';
  if (clean.includes('kitalulus')) return 'KitaLulus';
  if (clean.includes('karir.com') || clean === 'karir') return 'Karir.com';
  if (clean.includes('kemnaker') || clean.includes('disnaker')) return 'Kemnaker RI';
  if (clean.includes('dealls')) return 'Dealls';

  // Jika berupa URL, ambil nama domain host yang bersih
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const url = new URL(rawSource!);
      return url.hostname.replace(/^www\./i, '');
    } catch {
      return 'Situs Resmi Perusahaan';
    }
  }

  // Jika teks biasa, tampilkan teks aslinya
  return cleanText(rawSource || '') || 'Portal Resmi Perusahaan';
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export interface PortalJob {
  id: string;
  slug: string;
  title: string;
  company: string;
  companyWebsite?: string;
  location: string;
  geo: string;
  type: string;
  experience: string;
  category: string;
  salary: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  postedAt: string;
  postedAtIso: string;
  deadline?: string;
  deadlineIso?: string;
  badge?: string;
  isPromoted?: boolean;
  source: string;
  sourceUrl: string;
  description: string;
  qualifications: string[];
  skills: string[];
  benefits: string[];
  companyAbout: string;
  image: string;
}

function mapPrismaJob(job: any): PortalJob {
  const requirements = Array.isArray(job.requirements) ? (job.requirements as string[]) : [];
  const company = job.companies?.name || 'Perusahaan';
  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    company,
    companyWebsite: job.companies?.website || undefined,
    location: job.location || 'Indonesia',
    geo: (job.location || 'Indonesia').split(',')[0].trim(),
    type: workTypeLabel(job.work_type),
    experience: 'Entry Level',
    category: inferCategory(job.title, job.description || ''),
    salary: formatSalary(job.salary_min, job.salary_max, job.salary_period),
    salaryMin: job.salary_min ?? null,
    salaryMax: job.salary_max ?? null,
    postedAt: timeAgo(job.created_at),
    postedAtIso: job.created_at ? job.created_at.toISOString() : new Date().toISOString(),
    deadline: job.deadline
      ? job.deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : undefined,
    deadlineIso: job.deadline ? job.deadline.toISOString() : undefined,
    badge: inferBadge(job.created_at),
    source: formatJobSource(job.source, company),
    sourceUrl: job.external_url || '#',
    description: cleanDescription(job.description) || 'Lowongan kerja aktif.',
    qualifications: requirements.length
      ? requirements
      : ['Pendidikan sesuai posisi yang dilamar', 'Bersedia ditempatkan sesuai unit kerja perusahaan'],
    skills: requirements.length ? requirements.slice(0, 6) : (Array.isArray(job.tags) && job.tags.length ? job.tags : []),
    benefits: [],
    companyAbout: `${company} membuka lowongan ${job.title}. Profil lengkap perusahaan tersedia di sumber resmi lowongan.`,
    image: FALLBACK_JOB,
  };
}

export async function getPortalJobs(limit = 500): Promise<PortalJob[]> {
  try {
    const jobs = await prisma.jobs.findMany({
      where: { is_active: true },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
            slug: true,
            website: true,
            industry: true,
            location: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    if (!jobs || jobs.length === 0) {
      return [];
    }

    return jobs.map(mapPrismaJob);
  } catch (err) {
    console.error('[portal-loker] Error getPortalJobs:', err);
    return [];
  }
}

export async function getPortalTotalJobsCount(): Promise<number> {
  try {
    return await prisma.jobs.count({ where: { is_active: true } });
  } catch (err) {
    console.error('[portal-loker] Error getPortalTotalJobsCount:', err);
    return 0;
  }
}

export async function getPortalJobBySlug(slug: string): Promise<PortalJob | null> {
  const includeCompany = {
    companies: {
      select: {
        id: true,
        name: true,
        slug: true,
        website: true,
        industry: true,
        location: true,
      },
    },
  };
  try {
    let job = await prisma.jobs.findUnique({
      where: { slug },
      include: includeCompany,
    });
    if (!job) {
      const { clean, prefix } = normalizeLegacySlug(slug);
      if (clean.length >= 6) {
        job = await prisma.jobs.findFirst({
          where: { is_active: true, slug: { startsWith: clean } },
          include: includeCompany,
        });
      }
      if (!job && prefix !== clean && prefix.length >= 10) {
        job = await prisma.jobs.findFirst({
          where: { is_active: true, slug: { startsWith: prefix } },
          include: includeCompany,
        });
      }
    }
    if (!job) return null;
    return mapPrismaJob(job);
  } catch (err) {
    console.error('[portal-loker] Error getPortalJobBySlug:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Certifications
// ---------------------------------------------------------------------------

export interface PortalCertification {
  id: string;
  slug: string;
  title: string;
  provider: string;
  issuer: string;
  duration: string;
  price: string;
  officialUrl: string;
  description: string;
  level: string;
  category: string;
  format: string;
  type: string;
  rating: string;
  students: string;
  validity: string;
  geo: string;
  image: string;
  skills: string[];
  benefits: string[];
  requirements: string[];
  schedule: string;
}

function mapPrismaCert(c: any): PortalCertification {
  return {
    id: c.id,
    slug: c.slug,
    title: cleanText(c.title),
    provider: cleanText(c.provider),
    issuer: cleanText(c.provider),
    duration: c.duration_hours > 0 ? `${c.duration_hours} jam` : 'Cek detail skema',
    price: c.price > 0 ? `Rp ${c.price.toLocaleString('id-ID')}` : 'Gratis',
    officialUrl: c.external_url || '#',
    description: cleanDescription(c.description) || 'Detail sertifikasi resmi.',
    level: Array.isArray(c.tags) && c.tags[0] ? c.tags[0] : 'Umum',
    category: 'Sertifikasi Resmi',
    format: 'Online & TUK',
    type: 'Sertifikasi Profesi',
    rating: '4.8',
    students: 'Terverifikasi',
    validity: 'Standar Industri',
    geo: 'Nasional & Global',
    image: c.cover_image_url || FALLBACK_CERT,
    skills: Array.isArray(c.tags) ? c.tags : [],
    benefits: [
      'Sertifikat digital terverifikasi untuk portofolio dan profil karier',
      'Standar kompetensi resmi yang diakui industri dan instansi'
    ],
    requirements: ['Pendaftaran melalui tautan resmi lembaga penerbit sertifikasi'],
    schedule: 'Jadwal pendaftaran dibuka secara berkala',
  };
}

export async function getPortalCertifications(limit = 50): Promise<PortalCertification[]> {
  try {
    const certs = await prisma.certifications.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    if (!certs || certs.length === 0) {
      return [];
    }

    return certs.map(mapPrismaCert);
  } catch (err) {
    console.error('[portal-loker] Error getPortalCertifications:', err);
    return [];
  }
}

export async function getPortalCertificationBySlug(slug: string): Promise<PortalCertification | null> {
  try {
    let c = await prisma.certifications.findUnique({ where: { slug } });
    if (!c) {
      const { clean, prefix } = normalizeLegacySlug(slug);
      if (clean.length >= 4) {
        c = await prisma.certifications.findFirst({
          where: { is_active: true, slug: { startsWith: clean } },
        });
      }
      if (!c && prefix !== clean && prefix.length >= 10) {
        c = await prisma.certifications.findFirst({
          where: { is_active: true, slug: { startsWith: prefix } },
        });
      }
    }
    if (!c) return null;
    return mapPrismaCert(c);
  } catch (err) {
    console.error('[portal-loker] Error getPortalCertificationBySlug:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export interface PortalEvent {
  id: string;
  slug: string;
  title: string;
  organizer: string;
  type: string;
  date: string;
  eventDateIso: string;
  day: string;
  month: string;
  dateDay: string;
  dateMonth: string;
  dateYear: string;
  fullDate: string;
  time: string;
  location: string;
  geo: string;
  format: string;
  price: string;
  officialUrl: string;
  description: string;
  image: string;
  highlights: string[];
  badge?: string;
  companies?: string;
  attendeesCount?: string;
  companiesCount?: string;
  agenda?: { time: string; title?: string; desc?: string; activity?: string }[];
  exhibitors?: string[];
}

function mapPrismaEvent(e: any): PortalEvent {
  const d = e.event_date;
  const month = MONTHS_ID[d.getMonth()] || 'Bulan ini';
  const year = d.getFullYear();
  const format = e.type === 'ONLINE' ? 'Online' : e.type === 'HYBRID' ? 'Hybrid' : 'Offline';
  const rawSource = cleanText(e.source || '');
  const isInternalSource = !rawSource || ['manual', 'bulk_import', 'scraper', 'sync', 'admin', 'seed'].includes(rawSource.toLowerCase());
  return {
    id: e.id,
    slug: e.slug,
    title: cleanText(e.title),
    organizer: isInternalSource ? 'Penyelenggara Resmi' : rawSource,
    type: e.type === 'ONLINE' ? 'Webinar' : 'Job Fair',
    date: `${d.getDate()} ${month} ${year}`,
    eventDateIso: d instanceof Date && !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString(),
    day: String(d.getDate()),
    month,
    dateDay: String(d.getDate()),
    dateMonth: month,
    dateYear: String(year),
    fullDate: `${d.getDate()} ${month} ${year}`,
    time: 'Cek jadwal resmi',
    location: cleanText(e.location) || 'Indonesia',
    geo: (cleanText(e.location) || 'Indonesia').split(',')[0].trim(),
    format,
    price: 'Gratis',
    officialUrl: e.external_url || '#',
    description: cleanDescription(e.description) || 'Detail acara.',
    image: resolveEventImage(e.title, e.type, e.cover_image_url),
    highlights: Array.isArray(e.tags) ? e.tags : [],
  };
}

export async function getPortalEvents(limit = 50): Promise<PortalEvent[]> {
  try {
    const events = await prisma.events.findMany({
      where: { is_active: true },
      orderBy: { event_date: 'asc' },
      take: limit,
    });

    if (!events || events.length === 0) {
      return [];
    }

    return events.map(mapPrismaEvent);
  } catch (err) {
    console.error('[portal-loker] Error getPortalEvents:', err);
    return [];
  }
}

export async function getPortalEventBySlug(slug: string): Promise<PortalEvent | null> {
  try {
    let e = await prisma.events.findUnique({ where: { slug } });
    if (!e) {
      const { clean, prefix } = normalizeLegacySlug(slug);
      if (clean.length >= 4) {
        e = await prisma.events.findFirst({
          where: { is_active: true, slug: { startsWith: clean } },
        });
      }
      if (!e && prefix !== clean && prefix.length >= 10) {
        e = await prisma.events.findFirst({
          where: { is_active: true, slug: { startsWith: prefix } },
        });
      }
    }
    if (!e) return null;
    return mapPrismaEvent(e);
  } catch (err) {
    console.error('[portal-loker] Error getPortalEventBySlug:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export interface PortalArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  publishedAtIso: string;
  readTime: string;
  excerpt: string;
  content: string[];
  contentHtml: string;
  image: string;
  tags: string[];
  featured?: boolean;
  rank?: number;
  views?: string;
}

function mapPrismaArticle(a: any): PortalArticle {
  const rawContent = String(a.content || '');
  const hasHtml = /<\/?(p|h[1-6]|ul|ol|li|div|blockquote)[^>]*>/i.test(rawContent);

  // Bersihkan teks untuk kutipan cuplikan (excerpt)
  const plainText = rawContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
  const excerptSrc = plainText.slice(0, 160);

  // Format HTML rapi
  const contentHtml = hasHtml
    ? rawContent
    : rawContent
        .split(/\n{2,}/)
        .map((p) => `<p>${p.trim()}</p>`)
        .join('');

  const paragraphs = hasHtml
    ? rawContent
        .split(/<\/p>|<\/h[1-6]>|<\/li>/i)
        .map((p) => p.replace(/<[^>]*>/g, '').trim())
        .filter((p) => p.length > 10)
    : rawContent
        .split(/\n{2,}/)
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 20);

  return {
    id: a.id,
    slug: a.slug,
    title: cleanText(a.title),
    category: cleanText(a.article_categories?.name || 'Karier'),
    author: cleanText(a.author) || 'Tim Employr',
    authorRole: 'Kontributor',
    date: a.published_at
      ? a.published_at.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Terbaru',
    publishedAtIso:
      a.published_at instanceof Date
        ? a.published_at.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    readTime: `${Math.max(1, Math.round(plainText.split(/\s+/).length / 200))} menit baca`,
    excerpt: cleanText(excerptSrc.length >= 160 ? excerptSrc + '...' : excerptSrc),
    content: paragraphs.length ? paragraphs : [plainText || a.title],
    contentHtml,
    image: a.cover_image_url || FALLBACK_ARTICLE,
    tags: Array.isArray(a.tags) ? a.tags : [],
  };
}

export async function getPortalArticles(limit = 50): Promise<PortalArticle[]> {
  try {
    const articles = await prisma.articles.findMany({
      where: {
        is_published: true,
      },
      include: { article_categories: true },
      orderBy: { published_at: 'desc' },
      take: limit,
    });

    if (!articles || articles.length === 0) {
      return [];
    }

    return articles.map(mapPrismaArticle);
  } catch (err) {
    console.error('[portal-loker] Error getPortalArticles:', err);
    return [];
  }
}

export async function getPortalArticleBySlug(slug: string): Promise<PortalArticle | null> {
  try {
    let a = await prisma.articles.findUnique({
      where: { slug },
      include: { article_categories: true },
    });
    if (!a) {
      const { clean, prefix } = normalizeLegacySlug(slug);
      if (clean.length >= 4) {
        a = await prisma.articles.findFirst({
          where: { is_published: true, slug: { startsWith: clean } },
          include: { article_categories: true },
        });
      }
      if (!a && prefix !== clean && prefix.length >= 10) {
        a = await prisma.articles.findFirst({
          where: { is_published: true, slug: { startsWith: prefix } },
          include: { article_categories: true },
        });
      }
    }
    if (!a) return null;
    return mapPrismaArticle(a);
  } catch (err) {
    console.error('[portal-loker] Error getPortalArticleBySlug:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export interface PortalCourse {
  id: string;
  slug: string;
  title: string;
  provider: string;
  level: string;
  category: string;
  duration: string;
  price: string;
  originalPrice?: string;
  rating: string;
  students: string;
  language: string;
  geoTag: string;
  image: string;
  officialUrl: string;
  description: string;
  certificate: boolean;
  benefits: string[];
  modules: { title: string; lessons: string; duration: string }[];
}

function mapPrismaCourse(c: any): PortalCourse {
  return {
    id: c.id,
    slug: c.slug,
    title: cleanText(c.title),
    provider: cleanText(c.instructor) || 'Instruktur Resmi',
    level: c.level || 'Pemula',
    category: 'Pelatihan Skill',
    duration: c.duration_hours > 0 ? `${c.duration_hours} jam` : 'Self-paced',
    price: c.price > 0 ? `Rp ${c.price.toLocaleString('id-ID')}` : 'Gratis',
    rating: '4.8',
    students: 'Komunitas Belajar',
    language: 'Indonesia',
    geoTag: 'Online',
    image: resolveCourseImage(c.title, c.cover_image_url),
    officialUrl: c.external_url || '#',
    description: cleanDescription(c.description) || 'Detail pelatihan.',
    certificate: true,
    benefits: Array.isArray(c.tags) && c.tags.length ? c.tags : ['Materi terstruktur', 'Sertifikat kelulusan'],
    modules: [],
  };
}

export async function getPortalCourses(limit = 50): Promise<PortalCourse[]> {
  try {
    const courses = await prisma.courses.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    if (!courses || courses.length === 0) {
      return [];
    }

    return courses.map(mapPrismaCourse);
  } catch (err) {
    console.error('[portal-loker] Error getPortalCourses:', err);
    return [];
  }
}

export async function getPortalCourseBySlug(slug: string): Promise<PortalCourse | null> {
  try {
    let c = await prisma.courses.findUnique({ where: { slug } });
    if (!c) {
      const { clean, prefix } = normalizeLegacySlug(slug);
      if (clean.length >= 4) {
        c = await prisma.courses.findFirst({
          where: { is_active: true, slug: { startsWith: clean } },
        });
      }
      if (!c && prefix !== clean && prefix.length >= 10) {
        c = await prisma.courses.findFirst({
          where: { is_active: true, slug: { startsWith: prefix } },
        });
      }
    }
    if (!c) return null;
    return mapPrismaCourse(c);
  } catch (err) {
    console.error('[portal-loker] Error getPortalCourseBySlug:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Global Stats & Counts
// ---------------------------------------------------------------------------

let cachedCounts: { jobs: number; certs: number; courses: number; events: number; articles: number; companies: number } | null = null;
let cachedCountsAt = 0;
const COUNTS_TTL = 60 * 1000; // 60 detik

export async function getPortalCounts() {
  const now = Date.now();
  if (cachedCounts && (now - cachedCountsAt < COUNTS_TTL)) {
    return cachedCounts;
  }
  try {
    const [jobs, certs, courses, events, articles, companies] = await Promise.all([
      prisma.jobs.count({ where: { is_active: true } }),
      prisma.certifications.count({ where: { is_active: true } }),
      prisma.courses.count({ where: { is_active: true } }),
      prisma.events.count({ where: { is_active: true } }),
      prisma.articles.count({ where: { is_published: true } }),
      prisma.companies.count(),
    ]);
    cachedCounts = { jobs, certs, courses, events, articles, companies };
    cachedCountsAt = now;
    return cachedCounts;
  } catch (err) {
    console.error('[portal-loker] Error getPortalCounts:', err);
    return cachedCounts || { jobs: 0, certs: 0, courses: 0, events: 0, articles: 0, companies: 0 };
  }
}
