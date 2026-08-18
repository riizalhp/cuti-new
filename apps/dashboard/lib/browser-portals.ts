// ============================================================================
// Browser Portal Scraper — semi-otomatis dengan sesi login USER SENDIRI
// ----------------------------------------------------------------------------
// Pola sama dengan LinkedIn (lihat lib/linkedin-scraper.ts), TANPA bypass
// login/CAPTCHA/anti-bot:
//   1. User klik "Login {Portal}" → Chrome headful terbuka ke halaman login portal
//   2. User login MANUAL di browser itu (kredensial TIDAK pernah disimpan)
//   3. Bot menyimpan storage_state (cookie sesi) ke .data/{portal}-auth.json
//   4. Scraping membuka browser dengan sesi tsb → ambil kartu lowongan publik
//   5. Jika muncul CAPTCHA/OTP → user selesaikan manual di browser tsb
//
// Portal: Indeed, Loker.id, Jooble, Cake.me (CakeResume), Karir.com, KitaLulus.
// Catatan: selektor kartu lowongan dibuat generik + best-effort karena tiap
// portal beda struktur; jika hasilnya kosong/aneh, user bisa login dulu agar
// sesi browser stabil, lalu coba lagi.
// ============================================================================

import { chromium, type Browser, type Page } from 'playwright-core';
import fs from 'fs';
import path from 'path';

export interface BrowserJobItem {
  title: string;
  company: string;
  location: string;
  salary: string;
  url: string;
  postedTime: string;
}

export interface BrowserPortalConfig {
  id: string; // 'Indeed' | 'Loker.id' | 'Jooble' | 'CakeResume' | 'Karir.com' | 'KitaLulus'
  name: string;
  loginUrl: string;
  searchUrl: (keyword: string) => string;
  /** Pola href yang menandakan tautan detail lowongan (best-effort). */
  jobLinkPattern: RegExp;
  /** Segmen path halaman login (untuk deteksi masih di halaman login). */
  loginPath: string;
}

export const BROWSER_PORTALS: BrowserPortalConfig[] = [
  {
    id: 'Indeed',
    name: 'Indeed',
    loginUrl: 'https://id.indeed.com/account/login',
    searchUrl: (kw) => `https://id.indeed.com/jobs?q=${encodeURIComponent(kw)}&l=Indonesia`,
    jobLinkPattern: /(viewjob|\/rc\/clk|indeed\.com\/job)/i,
    loginPath: 'account/login',
  },
  {
    id: 'Loker.id',
    name: 'Loker.id',
    loginUrl: 'https://loker.id/login',
    searchUrl: (kw) => `https://loker.id/lowongan?q=${encodeURIComponent(kw)}`,
    jobLinkPattern: /\/lowongan\/[^?]+/i,
    loginPath: 'login',
  },
  {
    id: 'Jooble',
    name: 'Jooble',
    loginUrl: 'https://id.jooble.org/login',
    searchUrl: (kw) => `https://id.jooble.org/${encodeURIComponent(kw.split(' ').join('-').toLowerCase())}`,
    jobLinkPattern: /\/job\//i,
    loginPath: 'login',
  },
  {
    id: 'CakeResume',
    name: 'Cake (CakeResume)',
    loginUrl: 'https://www.cake.me/login',
    searchUrl: (kw) => `https://www.cake.me/jobs?query=${encodeURIComponent(kw)}`,
    jobLinkPattern: /\/jobs\/[^?]/i,
    loginPath: 'login',
  },
  {
    id: 'Karir.com',
    name: 'Karir.com',
    loginUrl: 'https://www.karir.com/login',
    searchUrl: (kw) => `https://www.karir.com/search-lowongan?keywords=${encodeURIComponent(kw)}`,
    jobLinkPattern: /\/job(s)?\//i,
    loginPath: 'login',
  },
  {
    id: 'KitaLulus',
    name: 'KitaLulus',
    loginUrl: 'https://www.kitalulus.com/auth',
    searchUrl: (kw) => `https://www.kitalulus.com/lowongan?position=${encodeURIComponent(kw)}`,
    jobLinkPattern: /\/lowongan\/[^?]+/i,
    loginPath: 'auth',
  },
];

export function getPortalConfig(id: string): BrowserPortalConfig {
  const cfg = BROWSER_PORTALS.find((p) => p.id === id);
  if (!cfg) throw new Error(`Portal ${id} tidak dikenali`);
  return cfg;
}

// ---------------------------------------------------------------------------
// Penyimpanan sesi (lokal, di-ignore git)
// ---------------------------------------------------------------------------

function getDataDir(): string {
  const dir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getAuthStatePath(id: string): string {
  return path.join(getDataDir(), `${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-auth.json`);
}

export function hasStoredSession(id: string): boolean {
  return fs.existsSync(getAuthStatePath(id));
}

export function clearStoredSession(id: string): void {
  const p = getAuthStatePath(id);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

export interface PortalSessionStatus {
  portal: string;
  name: string;
  hasSession: boolean;
}

export function getPortalStatus(id: string): PortalSessionStatus {
  const cfg = getPortalConfig(id);
  return { portal: id, name: cfg.name, hasSession: hasStoredSession(id) };
}

// ---------------------------------------------------------------------------
// Browser helper — Chrome sistem (channel: 'chrome')
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

async function newPageWithSession(browser: Browser, id: string): Promise<Page> {
  const authPath = getAuthStatePath(id);
  const context = await browser.newContext({
    locale: 'id-ID',
    viewport: { width: 1440, height: 900 },
    storageState: fs.existsSync(authPath) ? authPath : undefined,
  });
  return context.newPage();
}

// ---------------------------------------------------------------------------
// Login manual — buka browser headful, tunggu user login, simpan sesi
// ---------------------------------------------------------------------------

export interface PortalLoginResult {
  success: boolean;
  portal?: string;
  error?: string;
  step?: string;
}

export async function loginPortal(id: string, timeoutMs = 300000): Promise<PortalLoginResult> {
  const cfg = getPortalConfig(id);
  let browser: Browser;
  try {
    browser = await launchBrowser(false);
  } catch {
    return {
      success: false,
      error:
        'Gagal membuka browser Chrome. Pastikan Google Chrome terpasang dan tidak sedang dipakai proses lain.',
    };
  }

  try {
    const page = await newPageWithSession(browser, id);
    await page.goto(cfg.loginUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2500);

    // Tunggu user login manual — sukses jika URL sudah meninggalkan halaman login
    const deadline = Date.now() + timeoutMs;
    let loggedIn = false;
    while (Date.now() < deadline) {
      const url = page.url();
      if (!url.includes(cfg.loginPath) && !/(authwall|checkpoint|security-check)/i.test(url)) {
        loggedIn = true;
        break;
      }
      // Jeda lebih lama untuk SPA (login tanpa pindah URL)
      await page.waitForTimeout(2500);
    }

    if (!loggedIn) {
      return {
        success: false,
        error: `Waktu login ${cfg.name} habis. Silakan coba lagi dan selesaikan login dalam ${
          Math.round(timeoutMs / 60000)
        } menit.`,
      };
    }

    // Tunggu halaman termuat lalu simpan storage state (cookie + localStorage)
    await page.waitForTimeout(3000);
    await page.context().storageState({ path: getAuthStatePath(id) });

    return { success: true, portal: id, step: 'login' };
  } catch (e: any) {
    return { success: false, error: `Login ${cfg.name} gagal: ${e.message || 'terjadi kesalahan'}` };
  } finally {
    await browser.close().catch(() => null);
  }
}

// ---------------------------------------------------------------------------
// Cek sesi masih valid (buka halaman cari tanpa login-wall)
// ---------------------------------------------------------------------------

export interface PortalCheckResult {
  success: boolean;
  portal: string;
  valid: boolean;
  error?: string;
}

export async function checkPortalSession(id: string): Promise<PortalCheckResult> {
  const cfg = getPortalConfig(id);
  if (!hasStoredSession(id)) {
    return { success: true, portal: id, valid: false, error: 'Belum ada sesi login.' };
  }

  let browser: Browser;
  try {
    browser = await launchBrowser(true);
  } catch {
    return { success: false, portal: id, valid: hasStoredSession(id), error: 'Gagal membuka Chrome untuk cek sesi.' };
  }

  try {
    const page = await newPageWithSession(browser, id);
    await page.goto(cfg.searchUrl('admin'), { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);

    const url = page.url();
    const blocked = url.includes(cfg.loginPath) || /(authwall|checkpoint|security-check)/i.test(url);
    return { success: true, portal: id, valid: !blocked };
  } catch {
    return { success: false, portal: id, valid: hasStoredSession(id), error: 'Gagal memeriksa sesi.' };
  } finally {
    await browser.close().catch(() => null);
  }
}

// ---------------------------------------------------------------------------
// Scraping lowongan dengan browser (sesi user jika ada)
// ---------------------------------------------------------------------------

function parseCardText(title: string, cardText: string): { company: string; location: string; salary: string } {
  const lines = cardText
    .split('\n')
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const titleIdx = lines.findIndex((l) => l === title || (title.length > 12 && l.includes(title.slice(0, 24))));
  const after = titleIdx >= 0 ? lines.slice(titleIdx + 1) : lines;

  const salary =
    after.find((l) => /Rp\s?[\d.,]/.test(l)) ||
    lines.find((l) => /Rp\s?[\d.,]/.test(l)) ||
    '';

  const skip = (l: string) =>
    !l ||
    /^(Baru|Hari ini|Kemarin|\d+ (hari|jam|menit)|Full.?time|Kontrak|Penuh waktu|Purna waktu|Part.?time|Paruh waktu|Remote|On.?site|Hybrid|Lihat|Simpan|Lamar|Tersimpan|Dibuka)/i.test(l) ||
    l === title ||
    l === salary;

  const candidates = after.filter((l) => !skip(l) && l.length >= 2);
  const company = candidates[0] || 'Perusahaan';
  const location =
    candidates.find((l) => /(kota|kab|jakarta|bandung|surabaya|medan|semarang|yogyakarta|bali|remote|indonesia|, )/i.test(l)) ||
    candidates[1] ||
    'Indonesia';

  return { company, location, salary: salary || 'Gaji tidak ditampilkan' };
}

export async function scrapeBrowserPortal(
  id: string,
  keyword: string
): Promise<{ jobs: BrowserJobItem[]; log: string }> {
  const cfg = getPortalConfig(id);
  let browser: Browser;
  try {
    browser = await launchBrowser(false);
  } catch {
    throw new Error(`Gagal membuka browser Chrome untuk mencari lowongan di ${cfg.name}.`);
  }

  try {
    const page = await newPageWithSession(browser, id);
    const url = cfg.searchUrl(keyword);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);

    // Deteksi login-wall / CAPTCHA
    const finalUrl = page.url();
    if (/(authwall|checkpoint|security-check|recaptcha)/i.test(finalUrl)) {
      throw new Error(
        `${cfg.name} meminta verifikasi (CAPTCHA/login-wall). Selesaikan secara manual di browser, lalu coba lagi — atau login dulu lewat tombol "Login ${cfg.name}".`
      );
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

    const items: BrowserJobItem[] = [];
    const seen = new Set<string>();
    const links = page.locator('a[href]');
    const total = await links.count().catch(() => 0);

    for (let i = 0; i < total && items.length < 25; i++) {
      const a = links.nth(i);
      const href = await a.getAttribute('href').catch(() => '');
      if (!href || !cfg.jobLinkPattern.test(href)) continue;
      const abs = href.startsWith('http') ? href : new URL(href, page.url()).href;
      if (seen.has(abs)) continue;

      const title = (await a.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
      if (title.length < 4 || /^(lihat|semua|lowongan|karir|masuk|daftar|login|beranda|kategori)/i.test(title)) continue;
      seen.add(abs);

      const cardText = await a
        .evaluate((el) => {
          let n: HTMLElement | null = el as HTMLElement;
          for (let i = 0; i < 5 && n; i++) {
            const t = n.innerText || '';
            if (t.split('\n').filter(Boolean).length >= 3) return t;
            n = n.parentElement;
          }
          return '';
        })
        .catch(() => '');

      const { company, location, salary } = parseCardText(title, cardText);
      items.push({
        title,
        company,
        location,
        salary,
        url: abs,
        postedTime: 'Baru saja',
      });
    }

    if (!items.length) {
      throw new Error(
        `Tidak ada lowongan ditemukan di ${cfg.name} untuk kata kunci tersebut. ` +
          (hasStoredSession(id)
            ? 'Coba login ulang (sesi mungkin kedaluwarsa) atau sesuaikan kata kunci.'
            : `Jika halaman butuh login, klik tombol "Login ${cfg.name}" dulu, lalu coba lagi.`)
      );
    }

    return {
      jobs: items,
      log: `${cfg.name}: ${items.length} lowongan diekstrak (browser${hasStoredSession(id) ? ' + sesi login Anda' : ''})`,
    };
  } catch (e: any) {
    throw new Error(e.message || `Gagal mengambil lowongan dari ${cfg.name}.`);
  } finally {
    await browser.close().catch(() => null);
  }
}
