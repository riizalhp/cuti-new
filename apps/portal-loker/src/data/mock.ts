// ============================================================================
// Data Portal — Akses Data Riil dari PostgreSQL (Tanpa Dummy Data)
// ----------------------------------------------------------------------------
// Portal berjalan di SSR (Astro Node) dan data bersumber dari database
// PostgreSQL (jobs, certifications, events, articles, courses).
// ============================================================================

import {
  getPortalJobs,
  getPortalCertifications,
  getPortalEvents,
  getPortalArticles,
  getPortalCourses,
} from '../lib/data';

export type LowonganItem = Awaited<ReturnType<typeof getPortalJobs>>[number];
export type Lowongan = LowonganItem;
export type ArtikelItem = Awaited<ReturnType<typeof getPortalArticles>>[number];
export type Artikel = ArtikelItem;
export type SertifikasiItem = Awaited<ReturnType<typeof getPortalCertifications>>[number];
export type Sertifikat = SertifikasiItem;
export type CourseItem = Awaited<ReturnType<typeof getPortalCourses>>[number];
export type Kursus = CourseItem;
export type EventItem = Awaited<ReturnType<typeof getPortalEvents>>[number];
export type JobFair = EventItem;

export interface TrendingTopic {
  rank: number;
  name: string;
  reads: string;
  slug: string;
}

// ---------------------------------------------------------------------------
// Array publik yang diisi secara dinamis dari database oleh ensureData()
// ---------------------------------------------------------------------------

export const lowonganList: LowonganItem[] = [];
export const sertifikasiList: SertifikasiItem[] = [];
export const courseList: CourseItem[] = [];
export const kursusList: CourseItem[] = courseList;
export const eventList: EventItem[] = [];
export const jobFairList: EventItem[] = eventList;
export const artikelList: ArtikelItem[] = [];

export const trendingTopics: TrendingTopic[] = [
  { rank: 1, name: 'Fresh Graduate', reads: '18K+ lowongan', slug: 'fresh-graduate' },
  { rank: 2, name: 'Admin & Operasional', reads: '12K+ pencari', slug: 'admin' },
  { rank: 3, name: 'Remote & Hybrid', reads: '8K+ posisi', slug: 'remote' },
  { rank: 4, name: 'IT & Programmer', reads: '7K+ posisi', slug: 'it' },
  { rank: 5, name: 'Marketing & Sales', reads: '6K+ lowongan', slug: 'marketing' },
];

/** Top picks dinamis dari data database terbaru */
export const topPicks: Array<{
  type: string;
  badgeColor: string;
  date: string;
  title: string;
  meta1: string;
  meta2: string;
  image: string;
  link: string;
}> = [];

function replaceInPlace<T>(arr: T[], items: T[]): void {
  arr.splice(0, arr.length, ...items);
}

let loadPromise: Promise<void> | null = null;
let lastLoadedAt = 0;
const CACHE_TTL_MS = 60_000; // 60 detik cache runtime SSR

/**
 * Muat data dari database PostgreSQL secara terpadu.
 * Panggil di frontmatter template:
 *   await ensureData();
 */
export async function ensureData(force = false): Promise<void> {
  const now = Date.now();
  if (!force && lowonganList.length > 0 && now - lastLoadedAt < CACHE_TTL_MS) {
    return;
  }

  if (loadPromise) {
    await loadPromise;
    return;
  }

  loadPromise = (async () => {
    try {
      const [jobs, certs, courses, events, articles] = await Promise.all([
        getPortalJobs(500),
        getPortalCertifications(60),
        getPortalCourses(60),
        getPortalEvents(60),
        getPortalArticles(60),
      ]);

      replaceInPlace(lowonganList, jobs);
      replaceInPlace(sertifikasiList, certs);
      replaceInPlace(courseList, courses);
      replaceInPlace(eventList, events);
      replaceInPlace(artikelList, articles);

      const picks: typeof topPicks = [];
      if (lowonganList[0]) {
        picks.push({
          type: 'LOWONGAN',
          badgeColor: 'bg-blue-600 text-white',
          date: lowonganList[0].postedAt,
          title: lowonganList[0].title,
          meta1: lowonganList[0].geo,
          meta2: lowonganList[0].type,
          image: lowonganList[0].image,
          link: `/lowongan/${lowonganList[0].slug}`,
        });
      }
      if (artikelList[0]) {
        picks.push({
          type: 'ARTIKEL',
          badgeColor: 'bg-emerald-600 text-white',
          date: artikelList[0].date,
          title: artikelList[0].title,
          meta1: artikelList[0].readTime,
          meta2: artikelList[0].category,
          image: artikelList[0].image,
          link: `/career/${artikelList[0].slug}`,
        });
      }
      if (eventList[0]) {
        picks.push({
          type: 'EVENT',
          badgeColor: 'bg-purple-600 text-white',
          date: eventList[0].date,
          title: eventList[0].title,
          meta1: eventList[0].location,
          meta2: eventList[0].format,
          image: eventList[0].image,
          link: `/event/${eventList[0].slug}`,
        });
      }
      if (sertifikasiList[0]) {
        picks.push({
          type: 'SERTIFIKASI',
          badgeColor: 'bg-amber-500 text-white',
          date: '',
          title: sertifikasiList[0].title,
          meta1: sertifikasiList[0].format,
          meta2: sertifikasiList[0].provider,
          image: sertifikasiList[0].image,
          link: `/sertifikasi/${sertifikasiList[0].slug}`,
        });
      }
      replaceInPlace(topPicks, picks);
      lastLoadedAt = Date.now();
    } catch (e) {
      console.error('[portal-loker] Gagal memuat data dari database PostgreSQL:', e);
    } finally {
      loadPromise = null;
    }
  })();

  await loadPromise;
}
