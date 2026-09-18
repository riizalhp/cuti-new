// ============================================================================
// Data Portal — kompatibel dengan template lama, isi dari DATABASE
// ----------------------------------------------------------------------------
// Dulu file ini berisi mock hardcode. Sekarang portal jalan SSR (Astro Node)
// dan data diambil dari DB (jobs, certifications, events, articles, courses)
// — termasuk hasil scraping harian cron 01.00 WIB.
//
// Kontrak untuk semua komponen/halaman .astro:
//   - Import list dari file ini (nama export tetap sama, tetap array).
//   - Panggil `await ensureData()` SEBELUM membaca list di frontmatter.
//     ensureData mengisi array yang sama (in-place), jadi .map() tetap bekerja.
//
// Untuk halaman detail, pakai getPortal*BySlug dari lib/data (SSR per-request).
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
// Array kompatibel — referensi tetap, isi diisi ensureData() secara in-place
// ---------------------------------------------------------------------------

export const lowonganList: LowonganItem[] = [];
export const sertifikasiList: SertifikasiItem[] = [];
export const courseList: CourseItem[] = [];
export const kursusList: CourseItem[] = courseList;
export const eventList: EventItem[] = [];
export const jobFairList: EventItem[] = eventList;
export const artikelList: ArtikelItem[] = [];

export const trendingTopics: TrendingTopic[] = [
  { rank: 1, name: 'Fresh Graduate', reads: '12.4K pembaca', slug: 'fresh-graduate' },
  { rank: 2, name: 'Interview Kerja', reads: '10.1K pembaca', slug: 'interview-kerja' },
  { rank: 3, name: 'Remote Work', reads: '8.9K pembaca', slug: 'remote-work' },
  { rank: 4, name: 'Career Switch', reads: '7.6K pembaca', slug: 'career-switch' },
  { rank: 5, name: 'Pengembangan Diri', reads: '6.8K pembaca', slug: 'pengembangan-diri' },
];

/** Top picks dinamis dari data DB terbaru (1 per kategori) */
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

let _loading: Promise<void> | null = null;

/**
 * Muat data dari DB sekali per proses (cached). Panggil di frontmatter:
 *   await ensureData();
 */
export async function ensureData(): Promise<void> {
  if (_loading) return _loading;
  _loading = (async () => {
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
    } catch (e) {
      // DB gagal → portal tetap render dengan data kosong (jangan crash)
      console.error('[portal-loker] Gagal memuat data dari DB:', e);
    }
  })();
  return _loading;
}
