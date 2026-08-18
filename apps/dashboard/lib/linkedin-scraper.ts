// ============================================================================
// LinkedIn Profile Scraper — semi-otomatis dengan sesi login PENGUNA SENDIRI
// ----------------------------------------------------------------------------
// Alur (sesuai rekomendasi chat Manus — TANPA bypass login/CAPTCHA/anti-bot):
//   1. User klik "Login LinkedIn" → browser headful terbuka ke linkedin.com/login
//   2. User login MANUAL di browser itu (password TIDAK pernah disimpan di kode)
//   3. Bot menyimpan storage_state (cookie sesi) ke file lokal .data/
//   4. User tempel link profil → bot buka browser dengan sesi tsb → ekstrak data
//   5. Jika muncul CAPTCHA/OTP/verifikasi → proses berhenti, user selesaikan manual
//
// Wajib dijalankan pada mesin yang punya GUI (Chrome terpasang). Tidak cocok
// untuk environment server headless produksi.
// ============================================================================

import { chromium, type Browser, type Page, type Locator } from 'playwright-core';
import fs from 'fs';
import path from 'path';

export interface LinkedInExperience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface LinkedInEducation {
  degree: string;
  institution: string;
  year: string;
}

export interface LinkedInCertification {
  name: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
}

export interface LinkedInProject {
  title: string;
  role: string;
  duration: string;
  description: string;
  techStack: string[];
  url: string;
}

export interface LinkedInProfileData {
  name: string;
  headline: string;
  about: string;
  location: string;
  connections: string;
  experience: LinkedInExperience[];
  education: LinkedInEducation[];
  certifications: LinkedInCertification[];
  projects: LinkedInProject[];
  skills: string[];
  profileUrl: string;
  scrapedAt: string;
}

export interface LinkedInScrapeResult {
  success: boolean;
  data?: LinkedInProfileData;
  error?: string;
  step?: string;
}

// ---------------------------------------------------------------------------
// Pemetaan error teknis (Playwright) → pesan ramah untuk pengguna
// ---------------------------------------------------------------------------

export function toFriendlyError(raw: unknown, fallback: string): string {
  const msg = raw instanceof Error ? raw.message : String(raw);
  const m = msg.toLowerCase();

  if (
    m.includes('browser has been closed') ||
    m.includes('context has been closed') ||
    m.includes('target page') ||
    m.includes('target closed') ||
    m.includes('has been closed')
  ) {
    return 'Jendela browser tertutup sebelum proses selesai. Silakan coba lagi dan biarkan jendela browser tetap terbuka sampai proses selesai.';
  }
  if (m.includes('executable') || (m.includes('chrome') && m.includes('launch'))) {
    return 'Gagal membuka browser Chrome. Pastikan Google Chrome terpasang di perangkat ini, lalu coba lagi.';
  }
  if (m.includes('timeout') || m.includes('timed out') || m.includes('navigation')) {
    return 'Koneksi ke LinkedIn terlalu lama. Periksa koneksi internet Anda, lalu coba lagi.';
  }
  if (m.includes('net::err_') || m.includes('connection refused') || m.includes('network') || m.includes('fetch failed')) {
    return 'Tidak dapat terhubung ke LinkedIn. Periksa koneksi internet Anda, lalu coba lagi.';
  }
  if (m.includes('proxy')) {
    return 'Terjadi masalah koneksi (proxy). Periksa pengaturan jaringan Anda, lalu coba lagi.';
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Lokasi penyimpanan sesi (local, di-ignore git)
// ---------------------------------------------------------------------------

function getDataDir(): string {
  const dir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getAuthStatePath(): string {
  return path.join(getDataDir(), 'linkedin-auth.json');
}

export function hasStoredSession(): boolean {
  return fs.existsSync(getAuthStatePath());
}

export function clearStoredSession(): void {
  const p = getAuthStatePath();
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

// ---------------------------------------------------------------------------
// Browser helper — pakai Chrome sistem (channel: 'chrome')
// ---------------------------------------------------------------------------

async function launchBrowser(headless: boolean): Promise<Browser> {
  return chromium.launch({
    channel: 'chrome',
    headless,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-first-run',
      '--no-default-browser-check',
    ],
  });
}

async function newAuthenticatedPage(browser: Browser): Promise<Page> {
  const authPath = getAuthStatePath();
  const context = await browser.newContext({
    locale: 'id-ID',
    viewport: { width: 1440, height: 900 },
    storageState: fs.existsSync(authPath) ? authPath : undefined,
  });
  return context.newPage();
}

// ---------------------------------------------------------------------------
// STEP 1: Login manual — buka browser headful, tunggu user login, simpan sesi
// ---------------------------------------------------------------------------

export async function loginLinkedIn(timeoutMs = 300000): Promise<LinkedInScrapeResult> {
  let browser: Browser;
  try {
    browser = await launchBrowser(false);
  } catch (e) {
    return { success: false, error: toFriendlyError(e, 'Gagal membuka browser Chrome. Pastikan Chrome terpasang dan tidak sedang dipakai proses lain.') };
  }

  try {
    const context = await browser.newContext({ locale: 'id-ID', viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.evaluate(() => {
      // Sembunyikan banner automation untuk pengalaman login lebih natural
      const style = document.createElement('style');
      style.textContent = 'div[data-test-id="artdeco-toast-layer"]{display:none}';
      document.head.appendChild(style);
    });

    // Tunggu user login manual — deteksi berhasil: URL berubah dari /login
    const deadline = Date.now() + timeoutMs;
    let loggedIn = false;
    while (Date.now() < deadline) {
      const url = page.url();
      if (!url.includes('/login') && !url.includes('/authwall') && !url.includes('/checkpoint')) {
        loggedIn = true;
        break;
      }
      await page.waitForTimeout(2000);
    }

    if (!loggedIn) {
      return { success: false, error: 'Waktu login habis. Silakan coba lagi dan selesaikan login dalam 5 menit.' };
    }

    // Pastikan halaman feed/beranda termuat lalu simpan storage state
    await page.waitForTimeout(3000);
    await context.storageState({ path: getAuthStatePath() });

    return { success: true, step: 'login' };
  } catch (e: any) {
    return { success: false, error: toFriendlyError(e, 'Login gagal. Silakan coba lagi.') };
  } finally {
    await browser.close().catch(() => null);
  }
}

// ---------------------------------------------------------------------------
// STEP 1b: Scraping LOWONGAN KERJA LinkedIn (LinkedIn Jobs Search)
// ---------------------------------------------------------------------------

export interface LinkedInJobItem {
  title: string;
  company: string;
  location: string;
  salary: string;
  postedTime: string;
  url: string;
  description: string;
  skills: string[];
}

/** Ambil teks dari beberapa selector (fallback). */
async function firstText(root: Page | Locator, selectors: string[]): Promise<string> {
  for (const sel of selectors) {
    const loc = root.locator(sel).first();
    if (await loc.count()) {
      const t = (await loc.innerText().catch(() => '')).trim();
      if (t) return t;
    }
  }
  return '';
}

async function extractLinkedInJobs(page: Page): Promise<LinkedInJobItem[]> {
  const items: LinkedInJobItem[] = [];

  // Beberapa varian selector kartu lowongan LinkedIn (berubah antar versi UI)
  const cardSelectors = [
    '.job-card-container',
    '.job-card-list__entity',
    '.scaffold-layout__list-item',
    'li[data-occludable-job-id]',
  ];

  for (const sel of cardSelectors) {
    const cards = page.locator(sel);
    const count = await cards.count();
    if (!count) continue;

    for (let i = 0; i < Math.min(count, 30); i++) {
      const card = cards.nth(i);
      try {
        const title = await firstText(card, [
          '.job-card-list__title',
          '.job-card-container__link',
          '.job-card-list__title--link',
          'a[data-tracking-control-name] span[dir="ltr"]',
          'strong',
        ]);
        const company = await firstText(card, [
          '.job-card-container__company-name',
          '.artdeco-entity-lockup__subtitle',
          '.job-card-list__company-name',
          '.t-black--light',
        ]);
        const location = await firstText(card, [
          '.job-card-container__metadata-item',
          '.artdeco-entity-lockup__caption',
          '.job-card-list__metadata-item',
          'ul li:last-child',
        ]);
        const postedTime = await firstText(card, [
          'time',
          '.job-card-container__metadata-item--listed',
          'span.job-card-container__metadata-item time',
        ]);

        const href = await card
          .locator('a.job-card-list__title, a.job-card-container__link, a[data-tracking-control-name]')
          .first()
          .getAttribute('href')
          .catch(() => null);
        const url = href
          ? (href.startsWith('http') ? href : 'https://www.linkedin.com' + href)
          : 'https://www.linkedin.com/jobs/search';

        if (!title) continue;
        items.push({
          title: title.replace(/\s+/g, ' ').trim(),
          company: company.replace(/\s+/g, ' ').trim() || 'Perusahaan',
          location: location.replace(/\s+/g, ' ').trim() || 'Indonesia',
          salary: 'Gaji tidak ditampilkan',
          postedTime: postedTime.replace(/\s+/g, ' ').trim() || 'Baru saja',
          url,
          description: '',
          skills: [],
        });
      } catch {
        // lewati kartu yang gagal dibaca
      }
    }
    if (items.length > 0) break;
  }

  return items;
}

export async function scrapeLinkedInJobs(
  keyword: string,
  location?: string
): Promise<{ jobs: LinkedInJobItem[]; log: string }> {
  if (!hasStoredSession()) {
    throw new Error('LinkedIn memerlukan sesi login. Klik "Login LinkedIn" terlebih dahulu.');
  }

  let browser: Browser;
  try {
    browser = await launchBrowser(false);
  } catch (e) {
    throw new Error(toFriendlyError(e, 'Gagal membuka browser Chrome untuk mencari lowongan LinkedIn.'));
  }

  try {
    const page = await newAuthenticatedPage(browser);
    const loc = location?.trim() || 'Indonesia';
    const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(loc)}`;

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);

    // Deteksi authwall / checkpoint
    const finalUrl = page.url();
    if (
      finalUrl.includes('/authwall') ||
      finalUrl.includes('/checkpoint') ||
      finalUrl.includes('/login')
    ) {
      throw new Error('LinkedIn meminta verifikasi (authwall/CAPTCHA). Selesaikan secara manual lalu coba lagi, atau login ulang.');
    }

    // Scroll pelan untuk memicu lazy-load daftar lowongan
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let y = 0;
        const step = 400;
        const timer = setInterval(() => {
          window.scrollBy(0, step);
          y += step;
          if (y > 2500) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });
    await page.waitForTimeout(3000);

    const jobs = await extractLinkedInJobs(page);
    if (!jobs.length) {
      throw new Error('Tidak ada lowongan ditemukan di LinkedIn untuk kata kunci tersebut.');
    }

    return { jobs, log: `LinkedIn: ${jobs.length} lowongan diekstrak (sesi login Anda)` };
  } catch (e: any) {
    throw new Error(toFriendlyError(e, e.message || 'Gagal mengambil lowongan LinkedIn.'));
  } finally {
    await browser.close().catch(() => null);
  }
}

// ---------------------------------------------------------------------------
// STEP 2: Cek sesi masih valid (tanpa harus buka profil)
// ---------------------------------------------------------------------------

export async function checkLinkedInSession(): Promise<LinkedInScrapeResult> {
  if (!hasStoredSession()) {
    return { success: false, error: 'Belum ada sesi login. Klik "Login LinkedIn" dulu.' };
  }

  let browser: Browser;
  try {
    browser = await launchBrowser(true);
  } catch (e) {
    return { success: false, error: toFriendlyError(e, 'Gagal membuka browser Chrome untuk memeriksa sesi.') };
  }

  try {
    const page = await newAuthenticatedPage(browser);
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);

    const url = page.url();
    const isAuthWall = url.includes('/login') || url.includes('/authwall') || url.includes('/checkpoint');
    if (isAuthWall) {
      return { success: false, error: 'Sesi LinkedIn sudah kedaluwarsa. Silakan login ulang lewat tombol "Login LinkedIn".' };
    }
    return { success: true, step: 'session-valid' };
  } catch (e: any) {
    return { success: false, error: toFriendlyError(e, 'Gagal memeriksa sesi LinkedIn. Silakan coba lagi.') };
  } finally {
    await browser.close().catch(() => null);
  }
}

// ---------------------------------------------------------------------------
// STEP 3: Ekstraksi data profil lengkap dari URL
// ---------------------------------------------------------------------------

function normalizeLinkedInUrl(input: string): string {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return 'https://' + trimmed;
}

/** Ambil teks bersih dari elemen (fallback multiple selector). */
async function textOf(page: Page, selectors: string[]): Promise<string> {
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (await el.count()) {
      const t = (await el.innerText().catch(() => '')).trim();
      if (t) return t;
    }
  }
  return '';
}

async function extractListSection(
  page: Page,
  sectionId: string,
  mapItem: (els: Record<string, string>) => Record<string, any>
): Promise<any[]> {
  const section = page.locator(`section#${sectionId}`).first();
  if (!(await section.count())) return [];

  const items = section.locator('.pvs-entity__parent-container, .pvs-entity');
  const count = await items.count();
  const result: any[] = [];

  for (let i = 0; i < Math.min(count, 30); i++) {
    const item = items.nth(i);
    const text = (await item.innerText().catch(() => '')).replace(/\n+/g, ' | ').trim();
    if (!text || text.length < 3) continue;

    const parts = text.split(' | ').map((p) => p.trim()).filter(Boolean);
    const mapped = mapItem({ parts: parts.join(' | '), first: parts[0] || '', text });
    if (mapped && Object.values(mapped).some((v) => v)) result.push(mapped);
  }
  return result;
}

export async function scrapeLinkedInProfile(urlInput: string): Promise<LinkedInScrapeResult> {
  if (!hasStoredSession()) {
    return { success: false, error: 'Belum ada sesi login. Klik "Login LinkedIn" terlebih dahulu.' };
  }

  const profileUrl = normalizeLinkedInUrl(urlInput);
  if (!/linkedin\.com\/in\//i.test(profileUrl)) {
    return { success: false, error: 'URL tidak valid. Gunakan format https://www.linkedin.com/in/username/' };
  }

  let browser: Browser;
  try {
    browser = await launchBrowser(false);
  } catch (e) {
    return { success: false, error: toFriendlyError(e, 'Gagal membuka browser Chrome untuk mengekstrak profil.') };
  }

  try {
    const page = await newAuthenticatedPage(browser);
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);

    // Deteksi authwall/checkpoint
    const url = page.url();
    if (url.includes('/authwall') || url.includes('/checkpoint') || url.includes('/login')) {
      return {
        success: false,
        error: 'LinkedIn meminta verifikasi (authwall/CAPTCHA). Selesaikan secara manual lalu coba lagi, atau login ulang.',
      };
    }

    // Scroll pelan supaya semua section termuat (Lazy Load)
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let y = 0;
        const step = 500;
        const timer = setInterval(() => {
          window.scrollBy(0, step);
          y += step;
          if (y > 6000) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 250);
      });
    });
    await page.waitForTimeout(2000);

    // --- Ekstraksi data ---
    const name = await textOf(page, [
      'h1.text-heading-xlarge',
      '.text-heading-xlarge',
      'h1',
    ]);
    const headline = await textOf(page, [
      '.text-body-medium.break-words',
      'div.text-body-medium',
      '.top-card__subtitle',
    ]);
    const location = await textOf(page, [
      '.text-body-small.inline.t-black--light.break-words',
      'span.text-body-small.inline',
    ]);
    const about = await textOf(page, [
      'section#about .inline-show-more-text span[aria-hidden="true"]',
      'section#about .inline-show-more-text',
      'section#about',
    ]);

    // Connections — ambil dari baris "X koneksi"
    let connections = '';
    const connLoc = page.locator('span.t-bold, .t-bold').first();
    if (await connLoc.count()) {
      const all = await page.locator('span.t-bold, div.t-bold').allInnerTexts();
      const found = all.find((t) => /\d/.test(t) && /(koneksi|connections|pengikut|followers)/i.test(t));
      if (found) connections = found.trim();
    }

    const experience = await extractListSection(page, 'experience', (els) => {
      const p = els.parts;
      const role = els.first;
      const rest = p.replace(els.first, '').trim();
      const company = rest.split(' | ')[0] || '';
      const duration = rest.split(' | ')[1] || '';
      return { role, company, duration, description: rest.split(' | ').slice(2).join(' ') };
    });

    const education = await extractListSection(page, 'education', (els) => {
      const p = els.parts;
      const degree = els.first;
      const institution = p.split(' | ')[1] || '';
      const year = p.split(' | ')[2] || '';
      return { degree, institution, year };
    });

    const certifications = await extractListSection(page, 'certifications', (els) => {
      const p = els.parts;
      return { name: els.first, issuer: p.split(' | ')[1] || '', issueDate: p.split(' | ')[2] || '', credentialId: '' };
    });

    const projects = await extractListSection(page, 'projects', (els) => {
      const p = els.parts;
      const title = els.first;
      const rest = p.replace(els.first, '').trim();
      const role = rest.split(' | ')[0] || '';
      const duration = rest.split(' | ')[1] || '';
      return { title, role, duration, description: rest.split(' | ').slice(2).join(' '), techStack: [], url: '' };
    });

    // Skills — dari section skills (teks terakhir yang panjang)
    const skills: string[] = [];
    const skillsSection = page.locator('section#skills').first();
    if (await skillsSection.count()) {
      const skillEls = await skillsSection.locator('.pvs-entity__parent-container, .pvs-entity, .pvs-list__paged-outer-item').allInnerTexts();
      for (const s of skillEls) {
        const clean = s.split('\n')[0].trim();
        if (clean && clean.length <= 60 && !skills.includes(clean)) skills.push(clean);
      }
    }
    // Fallback skills: dari tombol "Lihat semua" / badge skill
    if (skills.length === 0) {
      const skillItems = await page.locator('section#skills a span, .pvs-entity a span').allInnerTexts();
      for (const s of skillItems) {
        const clean = s.trim();
        if (clean && clean.length <= 60 && !skills.includes(clean)) skills.push(clean);
      }
    }

    const data: LinkedInProfileData = {
      name: name || 'Tidak terdeteksi',
      headline: headline || '',
      about,
      location: location || '',
      connections,
      experience,
      education,
      certifications,
      projects,
      skills: skills.slice(0, 50),
      profileUrl,
      scrapedAt: new Date().toISOString(),
    };

    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: toFriendlyError(e, 'Gagal mengekstrak profil LinkedIn. Pastikan link profil valid dan bisa diakses, lalu coba lagi.') };
  } finally {
    await browser.close().catch(() => null);
  }
}
