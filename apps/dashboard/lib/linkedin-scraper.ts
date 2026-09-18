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
import { normalizeLinkedInUrl } from './linkedin-url';

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
  const page = await context.newPage();
  await page.addInitScript('window.__name = (fn, name) => fn;');
  return page;
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

export async function scrapeLinkedInProfile(urlInput: string): Promise<LinkedInScrapeResult> {
  if (!hasStoredSession()) {
    return { success: false, error: 'Belum ada sesi login. Klik "Login LinkedIn" terlebih dahulu.' };
  }

  const profileUrl = normalizeLinkedInUrl(urlInput);
  if (!/linkedin\.com\/in\//i.test(profileUrl)) {
    return { success: false, error: 'URL tidak valid. Masukkan format linkedin.com/in/username atau https://www.linkedin.com/in/username' };
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
    await page.waitForTimeout(4000);
    await page.evaluate('window.__name = (fn, name) => fn;').catch(() => null);

    // Deteksi authwall / checkpoint
    const currentUrl = page.url();
    if (currentUrl.includes('/authwall') || currentUrl.includes('/checkpoint') || currentUrl.includes('/login')) {
      return {
        success: false,
        error: 'LinkedIn meminta verifikasi (authwall/CAPTCHA). Selesaikan secara manual di browser lalu coba lagi, atau login ulang.',
      };
    }

    // Scroll bertahap di kontainer utama (main / #workspace / window) supaya semua lazy-loaded card termuat
    await page.evaluate(async () => {
      const scrollable = document.querySelector('main, #workspace, .scaffold-layout__main') || window;
      for (let step = 0; step < 12; step++) {
        if (scrollable.scrollBy) {
          scrollable.scrollBy(0, 600);
        } else {
          window.scrollBy(0, 600);
        }
        await new Promise((r) => setTimeout(r, 400));
      }
    });
    await page.waitForTimeout(1500);

    // Ekstraksi data menggunakan pendekatan hirarki semantik & leaf section
    const profileData = await page.evaluate(() => {
      const clean = (t: string | null | undefined) => (t || '').replace(/\s+/g, ' ').trim();
      const text = (el: Element | null | undefined) => clean((el as HTMLElement)?.innerText || el?.textContent);

      const allSections = Array.from(document.querySelectorAll('section'));
      // Leaf sections: section yang tidak memiliki child section (spesifik untuk card isi)
      const leafSections = allSections.filter((s) => s.querySelectorAll('section').length === 0);

      const findLeafSection = (keywords: string[]) => {
        return leafSections.find((s) => {
          const h = s.querySelector('h1, h2, h3, [role="heading"]');
          if (!h) return false;
          const ht = text(h).toLowerCase();
          return keywords.some((k) => ht.includes(k.toLowerCase()));
        });
      };

      const sectionText = (sec: Element | null | undefined): string => {
        if (!sec) return '';
        return (sec as HTMLElement).innerText || sec.textContent || '';
      };

      // 1. Profil Utama (Top Card)
      let name = '';
      let headline = '';
      let location = '';
      let connections = '';

      // Cari section header profil utama
      const topSection = allSections.find((s) => {
        const h = s.querySelector('h1, h2');
        const ht = text(h);
        const sTxt = sectionText(s);
        return (
          ht &&
          !/notifikasi|iklan|feed|activity|about|experience|education/i.test(ht) &&
          (sTxt.includes('koneksi') || sTxt.includes('connections') || sTxt.includes('followers'))
        );
      }) || allSections[1] || allSections[0];

      if (topSection) {
        const h = topSection.querySelector('h1, h2');
        if (h && !/notifikasi|iklan/i.test(text(h))) {
          name = text(h);
        }

        const lines = sectionText(topSection).split('\n').map(clean).filter(Boolean);
        const nameIdx = lines.findIndex((l: string) => l.includes(name) || (name && name.includes(l)));
        const start = nameIdx !== -1 ? nameIdx + 1 : 0;

        for (let i = start; i < Math.min(lines.length, start + 10); i++) {
          const l = lines[i];
          if (/^(he\/him|she\/her|they\/them)$/i.test(l)) continue;
          if (!headline && l.length > 2 && !/koneksi|connections|pengikut|followers|hubungkan|connect|info kontak|contact info|terbuka untuk bekerja|open to work/i.test(l)) {
            headline = l;
            continue;
          }
          if (headline && !location && /(indonesia|jakarta|semarang|bandung|surabaya|yogyakarta|banten|jawa|remote|hybrid|singapore|malaysia)/i.test(l) && !/koneksi|connections|pengikut/i.test(l)) {
            location = l.split('·')[0].trim();
            continue;
          }
          if (!connections) {
            if (/\d+\s*(koneksi|connections|pengikut|followers)/i.test(l)) {
              connections = l;
            } else if (/^\d+[\d.,]*$/.test(l) && lines[i + 1] && /(koneksi|connections|pengikut|followers)/i.test(lines[i + 1])) {
              connections = `${l} ${lines[i + 1]}`;
            }
          }
        }
      }

      // 2. About / Bio
      const aboutSec = findLeafSection(['about', 'tentang']);
      let about = '';
      if (aboutSec) {
        const raw = sectionText(aboutSec).split('\n').map(clean).filter(Boolean);
        const filtered = raw.filter((l: string) => !/^(about|tentang)$/i.test(l) && !/^top skills/i.test(l));
        about = filtered.join('\n\n');
      } else if (topSection) {
        const topLines = sectionText(topSection).split('\n').map(clean).filter(Boolean);
        const aboutIdx = topLines.findIndex((l: string) => /^about$/i.test(l));
        if (aboutIdx !== -1 && topLines[aboutIdx + 1]) {
          about = topLines[aboutIdx + 1];
        }
      }

      // 3. Pengalaman Kerja (Experience) — Robust State-Machine Parser
      const expSec = findLeafSection(['experience', 'pengalaman']);
      const experience: any[] = [];
      if (expSec) {
        const raw = sectionText(expSec).split('\n').map(clean).filter(Boolean);
        const filtered = raw.filter((l: string) => !/^(experience|pengalaman|show all|tampilkan semua)$/i.test(l));

        const isCompanyGroup = (line: string) => {
          return (
            !/\d{4}/.test(line) &&
            /\b(full-time|part-time|freelance|internship|magang|kontrak|contract|self-employed|apprenticeship|pekerja lepas)\b/i.test(line) &&
            /\d+\s*(?:mos?|yrs?|bln|thn|bulan|tahun)/i.test(line)
          );
        };

        const isRoleDateDuration = (line: string) => {
          return (
            /\d{4}/.test(line) &&
            (/(?:present|saat ini)/i.test(line) || /[-–—]/.test(line)) &&
            (/\d+\s*(?:mos?|yrs?|bln|thn|bulan|tahun)/i.test(line) || /(?:present|saat ini)/i.test(line))
          );
        };

        const isEmploymentTypeStandalone = (line: string) => {
          return (
            line.includes('·') &&
            /\b(full-time|part-time|freelance|internship|magang|kontrak|contract|self-employed|apprenticeship|pekerja lepas)\b/i.test(line)
          );
        };

        const roleIndices: number[] = [];
        filtered.forEach((line, idx) => {
          if (isRoleDateDuration(line)) {
            roleIndices.push(idx);
          }
        });

        let currentGroupCompany = '';

        for (let r = 0; r < roleIndices.length; r++) {
          const dateIdx = roleIndices[r];
          const duration = filtered[dateIdx];
          const nextDateIdx = r + 1 < roleIndices.length ? roleIndices[r + 1] : filtered.length;

          let role = '';
          let company = '';
          const descParts: string[] = [];

          const l1 = filtered[dateIdx - 1] || '';
          const l2 = filtered[dateIdx - 2] || '';

          if (isEmploymentTypeStandalone(l1)) {
            company = l1.split('·')[0].trim();
            role = l2;
            currentGroupCompany = '';
          } else {
            const prevDateIdx = r > 0 ? roleIndices[r - 1] : -1;
            for (let k = Math.max(0, prevDateIdx); k < dateIdx; k++) {
              if (isCompanyGroup(filtered[k])) {
                currentGroupCompany = filtered[k - 1] || '';
              }
            }
            role = l1;
            company = currentGroupCompany;
          }

          let endIdx = nextDateIdx;
          if (r + 1 < roleIndices.length) {
            const nextL1 = filtered[nextDateIdx - 1] || '';
            if (isEmploymentTypeStandalone(nextL1)) {
              endIdx = nextDateIdx - 2;
            } else if (isCompanyGroup(filtered[nextDateIdx - 2])) {
              endIdx = nextDateIdx - 3;
            } else {
              endIdx = nextDateIdx - 1;
            }
          }

          for (let j = dateIdx + 1; j < endIdx; j++) {
            const descLine = filtered[j];
            if (!isCompanyGroup(descLine) && !/^(show all|tampilkan semua)$/i.test(descLine)) {
              descParts.push(descLine);
            }
          }

          experience.push({
            role: role || 'Posisi',
            company: company || currentGroupCompany || 'Perusahaan',
            duration,
            description: descParts.join(' • '),
          });
        }
      }

      // 4. Pendidikan (Education)
      const eduSec = findLeafSection(['education', 'pendidikan']);
      const education: any[] = [];
      if (eduSec) {
        const raw = sectionText(eduSec).split('\n').map(clean).filter(Boolean);
        const filtered = raw.filter((l: string) => !/^(education|pendidikan|show all|tampilkan semua)/i.test(l));

        const eduDateIndices: number[] = [];
        filtered.forEach((l, idx) => {
          if (/\d{4}\s*[-–—]\s*(?:[a-zA-Z]+\s*)?(\d{4}|present|saat ini)/i.test(l) || /^\d{4}$/.test(l)) {
            eduDateIndices.push(idx);
          }
        });

        if (eduDateIndices.length > 0) {
          eduDateIndices.forEach((dateIdx) => {
            const year = filtered[dateIdx];
            const institution = filtered[dateIdx - 2] || filtered[dateIdx - 1] || '';
            const degree = filtered[dateIdx - 2] ? filtered[dateIdx - 1] : '';
            education.push({ institution, degree, year });
          });
        }
      }

      // 5. Sertifikasi (Certifications)
      const certSec = findLeafSection(['license', 'certification', 'lisensi', 'sertifikasi']);
      const certifications: any[] = [];
      if (certSec) {
        const raw = sectionText(certSec).split('\n').map(clean).filter(Boolean);
        const filtered = raw.filter((l: string) => !/^(licenses & certifications|certifications|licenses|lisensi & sertifikasi|show all|tampilkan semua)/i.test(l));

        const issueIndices: number[] = [];
        filtered.forEach((l, idx) => {
          if (/^(issued|diterbitkan)/i.test(l)) {
            issueIndices.push(idx);
          }
        });

        if (issueIndices.length > 0) {
          issueIndices.forEach((issueIdx) => {
            const issueDate = filtered[issueIdx];
            const name = filtered[issueIdx - 2] || '';
            const issuer = filtered[issueIdx - 1] || '';
            let credentialId = '';
            if (filtered[issueIdx + 1] && /credential id/i.test(filtered[issueIdx + 1])) {
              credentialId = filtered[issueIdx + 1].replace(/credential id/i, '').trim();
            }
            certifications.push({ name, issuer, issueDate, credentialId });
          });
        }
      }

      // 6. Proyek (Projects)
      const projSec = findLeafSection(['projects', 'proyek']);
      const projects: any[] = [];
      if (projSec) {
        const raw = sectionText(projSec).split('\n').map(clean).filter(Boolean);
        const filtered = raw.filter((l: string) => !/^(projects|proyek|show all|tampilkan semua)/i.test(l));

        const projDateIndices: number[] = [];
        filtered.forEach((l, idx) => {
          if (/\d{4}\s*[-–—]\s*(?:[a-zA-Z]+\s*)?(\d{4}|present|saat ini)/i.test(l)) {
            projDateIndices.push(idx);
          }
        });

        if (projDateIndices.length > 0) {
          projDateIndices.forEach((dateIdx, pIdx) => {
            const duration = filtered[dateIdx];
            const title = filtered[dateIdx - 1] || '';
            const nextDateIdx = pIdx + 1 < projDateIndices.length ? projDateIndices[pIdx + 1] : filtered.length;
            const desc = filtered.slice(dateIdx + 1, nextDateIdx - 1).join(' ');
            projects.push({
              title,
              role: '',
              duration,
              description: desc,
              techStack: [],
              url: '',
            });
          });
        }
      }

      // 7. Skills & Keahlian
      const skillSec = findLeafSection(['skills', 'keahlian']);
      const skills: string[] = [];
      if (skillSec) {
        const raw = sectionText(skillSec).split('\n').map(clean).filter(Boolean);
        const filtered = raw.filter((l: string) => !/^(skills|keahlian|show all|tampilkan semua|\d+ skill)/i.test(l));
        filtered.forEach((s: string) => {
          if (s.length > 1 && s.length <= 50 && !skills.includes(s) && !/show all|tampilkan semua/i.test(s)) {
            skills.push(s);
          }
        });
      }

      // Ambil juga Top Skills dari teks bagian About
      const topSkillsText = sectionText(aboutSec);
      const topSkillsMatch = topSkillsText.match(/top skills\s*([^\n]+)/i);
      if (topSkillsMatch && topSkillsMatch[1]) {
        topSkillsMatch[1].split(/[•·,]/).map(clean).filter(Boolean).forEach((sk: string) => {
          if (!skills.includes(sk) && sk.length <= 50) skills.push(sk);
        });
      }

      // Fallback nama dari document.title jika elemen heading di DOM disamarkan
      if (!name) {
        const titleParts = document.title.split('|');
        if (titleParts.length > 1) {
          name = clean(titleParts[0]);
        }
      }

      return {
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
        profileUrl: window.location.href,
        scrapedAt: new Date().toISOString(),
      };
    });

    // Deep Extraction untuk menarik seluruh Pengalaman, Sertifikasi & Skills lengkap dari sub-halaman /details/
    const baseUrl = profileUrl.replace(/\/+$/, '').split('?')[0];

    // 1. Ekstraksi Mendalam: Seluruh Riwayat Pengalaman Kerja (/details/experience/)
    try {
      await page.goto(`${baseUrl}/details/experience/`, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(1500);
      await page.evaluate('window.__name = (fn, name) => fn;').catch(() => null);
      await page.evaluate(async () => {
        const s = document.querySelector('main, #workspace, .scaffold-layout__main') || window;
        for (let i = 0; i < 8; i++) {
          if (s.scrollBy) s.scrollBy(0, 800);
          else window.scrollBy(0, 800);
          await new Promise((r) => setTimeout(r, 250));
        }
      });
      await page.waitForTimeout(800);

      const allExp = await page.evaluate(() => {
        const clean = (t: string | null | undefined) => (t || '').replace(/\s+/g, ' ').trim();
        const main = document.querySelector('main .scaffold-layout__main, main') || document.body;
        const raw = ((main as HTMLElement)?.innerText || main?.textContent || '').split('\n').map(clean).filter(Boolean);
        const cutIdx = raw.findIndex((l: string) => /^(lebih banyak profil|people also viewed|rekomendasi|tentang|aksesibilitas|linkedin corporation)/i.test(l));
        const trimmed = cutIdx !== -1 ? raw.slice(0, cutIdx) : raw;
        const filtered = trimmed.filter((l: string) => !/^(experience|pengalaman|show all|tampilkan semua)$/i.test(l));

        const isCompanyGroup = (line: string) => {
          return (
            !/\d{4}/.test(line) &&
            /\b(full-time|part-time|freelance|internship|magang|kontrak|contract|self-employed|apprenticeship|pekerja lepas)\b/i.test(line) &&
            /\d+\s*(?:mos?|yrs?|bln|thn|bulan|tahun)/i.test(line)
          );
        };

        const isRoleDateDuration = (line: string) => {
          return (
            /\d{4}/.test(line) &&
            (/(?:present|saat ini)/i.test(line) || /[-–—]/.test(line)) &&
            (/\d+\s*(?:mos?|yrs?|bln|thn|bulan|tahun)/i.test(line) || /(?:present|saat ini)/i.test(line))
          );
        };

        const isEmploymentTypeStandalone = (line: string) => {
          return (
            line.includes('·') &&
            /\b(full-time|part-time|freelance|internship|magang|kontrak|contract|self-employed|apprenticeship|pekerja lepas)\b/i.test(line)
          );
        };

        const roleIndices: number[] = [];
        filtered.forEach((line: string, idx: number) => {
          if (isRoleDateDuration(line)) {
            roleIndices.push(idx);
          }
        });

        const exp: any[] = [];
        let currentGroupCompany = '';

        for (let r = 0; r < roleIndices.length; r++) {
          const dateIdx = roleIndices[r];
          const duration = filtered[dateIdx];
          const nextDateIdx = r + 1 < roleIndices.length ? roleIndices[r + 1] : filtered.length;

          let role = '';
          let company = '';
          const descParts: string[] = [];

          const l1 = filtered[dateIdx - 1] || '';
          const l2 = filtered[dateIdx - 2] || '';

          if (isEmploymentTypeStandalone(l1)) {
            company = l1.split('·')[0].trim();
            role = l2;
            currentGroupCompany = '';
          } else {
            const prevDateIdx = r > 0 ? roleIndices[r - 1] : -1;
            for (let k = Math.max(0, prevDateIdx); k < dateIdx; k++) {
              if (isCompanyGroup(filtered[k])) {
                currentGroupCompany = filtered[k - 1] || '';
              }
            }
            role = l1;
            company = currentGroupCompany;
          }

          let endIdx = nextDateIdx;
          if (r + 1 < roleIndices.length) {
            const nextL1 = filtered[nextDateIdx - 1] || '';
            if (isEmploymentTypeStandalone(nextL1)) {
              endIdx = nextDateIdx - 2;
            } else if (isCompanyGroup(filtered[nextDateIdx - 2])) {
              endIdx = nextDateIdx - 3;
            } else {
              endIdx = nextDateIdx - 1;
            }
          }

          for (let j = dateIdx + 1; j < endIdx; j++) {
            const descLine = filtered[j];
            if (!isCompanyGroup(descLine) && !/^(show all|tampilkan semua)$/i.test(descLine)) {
              descParts.push(descLine);
            }
          }

          exp.push({
            role: role || 'Posisi',
            company: company || currentGroupCompany || 'Perusahaan',
            duration,
            description: descParts.join(' • '),
          });
        }

        return exp;
      });

      if (allExp && allExp.length > profileData.experience.length) {
        profileData.experience = allExp;
      }
    } catch {
      // jika gagal, tetap gunakan data pengalaman dari halaman utama
    }

    // 2. Ekstraksi Mendalam: Seluruh Sertifikasi (/details/certifications/)
    try {
      await page.goto(`${baseUrl}/details/certifications/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1500);
      await page.evaluate('window.__name = (fn, name) => fn;').catch(() => null);
      await page.evaluate(async () => {
        const s = document.querySelector('main, #workspace, .scaffold-layout__main') || window;
        for (let i = 0; i < 6; i++) {
          if (s.scrollBy) s.scrollBy(0, 800);
          else window.scrollBy(0, 800);
          await new Promise((r) => setTimeout(r, 200));
        }
      });
      await page.waitForTimeout(800);

      const allCerts = await page.evaluate(() => {
        const clean = (t: string | null | undefined) => (t || '').replace(/\s+/g, ' ').trim();
        const main = document.querySelector('main .scaffold-layout__main, main') || document.body;
        const raw = ((main as HTMLElement)?.innerText || main?.textContent || '').split('\n').map(clean).filter(Boolean);
        const cutIdx = raw.findIndex((l: string) => /^(lebih banyak profil|people also viewed|rekomendasi|tentang|aksesibilitas|linkedin corporation)/i.test(l));
        const trimmed = cutIdx !== -1 ? raw.slice(0, cutIdx) : raw;
        const filtered = trimmed.filter((l: string) => !/^(licenses & certifications|certifications|licenses|lisensi & sertifikasi|show all|tampilkan semua)/i.test(l));

        const issueIndices: number[] = [];
        filtered.forEach((l: string, idx: number) => {
          if (/^(issued|diterbitkan)/i.test(l)) issueIndices.push(idx);
        });

        const certs: any[] = [];
        issueIndices.forEach((issueIdx) => {
          const issueDate = filtered[issueIdx];
          const name = filtered[issueIdx - 2] || '';
          const issuer = filtered[issueIdx - 1] || '';
          let credentialId = '';
          if (filtered[issueIdx + 1] && /credential id/i.test(filtered[issueIdx + 1])) {
            credentialId = filtered[issueIdx + 1].replace(/credential id/i, '').trim();
          }
          if (name && !certs.some((c) => c.name === name)) {
            certs.push({ name, issuer, issueDate, credentialId });
          }
        });
        return certs;
      });

      if (allCerts && allCerts.length > profileData.certifications.length) {
        profileData.certifications = allCerts;
      }
    } catch {
      // jika gagal, tetap gunakan sertifikasi dari halaman utama
    }

    // 3. Ekstraksi Mendalam: Seluruh Skills (/details/skills/)
    try {
      await page.goto(`${baseUrl}/details/skills/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1500);
      await page.evaluate('window.__name = (fn, name) => fn;').catch(() => null);
      await page.evaluate(async () => {
        const s = document.querySelector('main, #workspace, .scaffold-layout__main') || window;
        for (let i = 0; i < 8; i++) {
          if (s.scrollBy) s.scrollBy(0, 800);
          else window.scrollBy(0, 800);
          await new Promise((r) => setTimeout(r, 250));
        }
      });
      await page.waitForTimeout(800);

      const certNames = (profileData.certifications || []).map((c: any) => (c.name || '').toLowerCase());

      const allSkills = await page.evaluate((certs: string[]) => {
        const clean = (t: string | null | undefined) => (t || '').replace(/\s+/g, ' ').trim();
        const main = document.querySelector('main .scaffold-layout__main, main') || document.body;
        const rawText = (main as HTMLElement)?.innerText || main?.textContent || '';
        const cutIdx = rawText.indexOf('Lebih banyak profil');
        const trimmedText = cutIdx !== -1 ? rawText.slice(0, cutIdx) : rawText;
        const lines = trimmedText.split('\n').map(clean).filter(Boolean);

        const isContext = (line: string) => {
          if (/^(keahlian|skills|semua|all|pengetahuan|peralatan|interpersonal)/i.test(line)) return true;
          if (/^(show all|tampilkan semua|\d+\s*endorsement)/i.test(line)) return true;
          if (/(\bat\b|\bdi\b|experiences?\s+at)/i.test(line)) return true;
          if (/(\.id|\.fun|\.com|\.org|\.io|dashboard)/i.test(line)) return true;
          if (/^(head of|staff|intern|manager|lead|co-founder|founder|hustler)/i.test(line)) return true;
          if (/^(studi independen|magang|freelance)/i.test(line)) return true;
          if (certs.some((c) => c === line.toLowerCase())) return true;
          return false;
        };

        const results: string[] = [];
        lines.forEach((l: string) => {
          if (!isContext(l) && l.length > 1 && l.length < 50 && !results.includes(l)) {
            results.push(l);
          }
        });

        return results;
      }, certNames);

      if (allSkills && allSkills.length > 0) {
        profileData.skills = Array.from(new Set([...profileData.skills, ...allSkills])).slice(0, 60);
      }
    } catch {
      // jika gagal, tetap gunakan skills dari halaman utama
    }

    return { success: true, data: profileData };
  } catch (e: any) {
    console.error('LinkedIn Scraper Error:', e);
    return { success: false, error: toFriendlyError(e, 'Gagal mengekstrak profil LinkedIn. Pastikan link profil valid dan bisa diakses, lalu coba lagi.') };
  } finally {
    await browser.close().catch(() => null);
  }
}
