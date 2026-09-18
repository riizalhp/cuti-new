// ============================================================================
// Data layer portal — baca DB via @employr/db, petakan ke bentuk template .astro
// ----------------------------------------------------------------------------
// Semua halaman portal membaca tabel jobs / certifications / events / articles
// / courses (termasuk hasil scraping harian). Fungsi get* mengembalikan bentuk
// LENGKAP (augmented) yang dipakai template list maupun detail.
// ============================================================================

import { prisma } from './prisma';

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const FALLBACK_CERT = '/images/placeholder-cert.svg';
const FALLBACK_COURSE = '/images/placeholder-course.svg';
const FALLBACK_EVENT = '/images/placeholder-event.svg';
const FALLBACK_ARTICLE = '/images/placeholder-article.svg';

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

/** Badge kasar berdasarkan umur posting */
function inferBadge(createdAt: Date): string | undefined {
  const days = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 1) return 'Baru';
  if (days <= 3) return 'Hot';
  return undefined;
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export interface PortalJob {
  id: string;
  slug: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyWebsite?: string;
  location: string;
  geo: string;
  type: string;
  experience: string;
  category: string;
  salary: string;
  postedAt: string;
  deadline?: string;
  badge?: string;
  source: string;
  sourceUrl: string;
  description: string;
  qualifications: string[];
  skills: string[];
  benefits: string[];
  companyAbout: string;
  image: string;
}

export async function getPortalJobs(limit = 500): Promise<PortalJob[]> {
  const jobs = (await prisma.jobs.findMany({
    where: { is_active: true },
    include: { companies: true },
    orderBy: { created_at: 'desc' },
    take: limit,
  })) as any[];

  return jobs.map((job) => {
    const requirements = Array.isArray(job.requirements) ? (job.requirements as string[]) : [];
    const company = job.companies?.name || 'Perusahaan';
    return {
      id: job.id,
      slug: job.slug,
      title: job.title,
      company,
      companyLogo: job.companies?.logo_url || undefined,
      companyWebsite: job.companies?.website || undefined,
      location: job.location || 'Indonesia',
      geo: (job.location || 'Indonesia').split(',')[0].trim(),
      type: workTypeLabel(job.work_type),
      experience: 'Entry Level',
      category: inferCategory(job.title, job.description || ''),
      salary: formatSalary(job.salary_min, job.salary_max, job.salary_period),
      postedAt: timeAgo(job.created_at),
      deadline: job.deadline
        ? job.deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : undefined,
      badge: inferBadge(job.created_at),
      source: job.source && job.source !== 'manual' ? job.source : 'Portal Resmi Perusahaan',
      sourceUrl: job.external_url || '#',
      description: job.description || 'Lowongan kerja aktif.',
      qualifications: requirements.length
        ? requirements
        : ['Pendidikan sesuai posisi yang dilamar', 'Bersedia ditempatkan sesuai unit kerja perusahaan'],
      skills: requirements.length ? requirements.slice(0, 6) : [],
      benefits: [],
      companyAbout: `${company} membuka lowongan ${job.title}. Profil lengkap perusahaan tersedia di sumber resmi lowongan.`,
      image: FALLBACK_COURSE,
    };
  });
}

export async function getPortalJobBySlug(slug: string): Promise<PortalJob | null> {
  const jobs = await getPortalJobs(500);
  return jobs.find((j) => j.slug === slug) || null;
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

export async function getPortalCertifications(limit = 50): Promise<PortalCertification[]> {
  const certs = (await prisma.certifications.findMany({
    where: { is_active: true },
    orderBy: { created_at: 'desc' },
    take: limit,
  })) as any[];

  return certs.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    provider: c.provider,
    issuer: c.provider,
    duration: c.duration_hours > 0 ? `${c.duration_hours} jam` : 'Cek detail skema',
    price: c.price > 0 ? `Rp ${c.price.toLocaleString('id-ID')}` : 'Cek biaya di link resmi',
    officialUrl: c.external_url || '#',
    description: c.description,
    level: 'Umum',
    category: 'Sertifikasi',
    format: 'Online',
    type: 'Sertifikasi Profesi',
    rating: '-',
    students: '',
    validity: 'Cek skema resmi',
    geo: 'Nasional',
    image: c.cover_image_url || FALLBACK_CERT,
    skills: [],
    benefits: [],
    requirements: [],
    schedule: 'Cek jadwal di link resmi',
  }));
}

export async function getPortalCertificationBySlug(slug: string): Promise<PortalCertification | null> {
  const certs = await getPortalCertifications(100);
  return certs.find((c) => c.slug === slug) || null;
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

export async function getPortalEvents(limit = 50): Promise<PortalEvent[]> {
  const events = (await prisma.events.findMany({
    where: { is_active: true },
    orderBy: { event_date: 'asc' },
    take: limit,
  })) as any[];

  return events.map((e) => {
    const d = e.event_date;
    const month = MONTHS_ID[d.getMonth()];
    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      organizer: e.source && e.source !== 'manual' ? e.source : 'Employer Job',
      type: 'Job Fair',
      date: `${d.getDate()} ${month} ${d.getFullYear()}`,
      day: String(d.getDate()),
      month,
      dateDay: String(d.getDate()),
      dateMonth: month,
      dateYear: String(d.getFullYear()),
      fullDate: `${d.getDate()} ${month} ${d.getFullYear()}`,
      time: 'Cek jadwal resmi',
      location: e.location || 'Indonesia',
      geo: (e.location || 'Indonesia').split(',')[0].trim(),
      format: e.type === 'ONLINE' ? 'Online' : 'Offline',
      price: 'Gratis',
      officialUrl: e.external_url || '#',
      description: e.description,
      image: e.cover_image_url || FALLBACK_EVENT,
      highlights: [],
    };
  });
}

export async function getPortalEventBySlug(slug: string): Promise<PortalEvent | null> {
  const events = await getPortalEvents(100);
  return events.find((e) => e.slug === slug) || null;
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
  readTime: string;
  excerpt: string;
  content: string[];
  image: string;
  tags: string[];
  featured?: boolean;
  rank?: number;
  views?: string;
}

export async function getPortalArticles(limit = 50): Promise<PortalArticle[]> {
  const articles = (await prisma.articles.findMany({
    where: { is_published: true },
    include: { article_categories: true },
    orderBy: { published_at: 'desc' },
    take: limit,
  })) as any[];

  return articles.map((a) => {
    const paragraphs = String(a.content || '')
      .split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/)
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 40)
      .slice(0, 12);
    const excerptSrc = paragraphs[0] || (a.content || '').slice(0, 160);

    return {
      id: a.id,
      slug: a.slug,
      title: a.title,
      category: a.article_categories?.name || 'Karier',
      author: a.author,
      authorRole: 'Kontributor',
      date: a.published_at
        ? a.published_at.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : '',
      readTime: `${Math.max(1, Math.round((a.content || '').split(/\s+/).length / 200))} menit baca`,
      excerpt: excerptSrc.length > 160 ? excerptSrc.slice(0, 160) + '...' : excerptSrc,
      content: paragraphs.length ? paragraphs : [a.content || a.title],
      image: a.cover_image_url || FALLBACK_ARTICLE,
      tags: [],
    };
  });
}

export async function getPortalArticleBySlug(slug: string): Promise<PortalArticle | null> {
  const articles = await getPortalArticles(100);
  return articles.find((a) => a.slug === slug) || null;
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

export async function getPortalCourses(limit = 50): Promise<PortalCourse[]> {
  const courses = (await prisma.courses.findMany({
    where: { is_active: true },
    orderBy: { created_at: 'desc' },
    take: limit,
  })) as any[];

  return courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    provider: c.instructor,
    level: c.level || 'Pemula',
    category: 'Pelatihan',
    duration: c.duration_hours > 0 ? `${c.duration_hours} jam` : 'Cek detail',
    price: c.price > 0 ? `Rp ${c.price.toLocaleString('id-ID')}` : 'Gratis',
    rating: '4.8',
    students: '',
    language: 'Indonesia',
    geoTag: 'Online',
    image: c.cover_image_url || FALLBACK_COURSE,
    officialUrl: c.external_url || '#',
    description: c.description,
    certificate: true,
    benefits: [],
    modules: [],
  }));
}

export async function getPortalCourseBySlug(slug: string): Promise<PortalCourse | null> {
  const courses = await getPortalCourses(100);
  return courses.find((c) => c.slug === slug) || null;
}
