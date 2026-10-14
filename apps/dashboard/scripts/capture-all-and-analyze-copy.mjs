import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'http://127.0.0.1:3000';
const OUT_DIR = path.resolve(__dirname, '../e2e/review/council-audit');
fs.mkdirSync(OUT_DIR, { recursive: true });

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const sessionUser = {
  id: 'a3e09016-eaa6-4394-a939-ee8679c2dc37',
  name: 'Budi Santoso',
  email: 'budi.santoso@gmail.com',
  role: 'MEMBER',
  onboarded: true,
};

const sessionUserNew = {
  id: '883b5267-b864-4348-855b-72f15651bac2',
  name: 'Dimas Pratama',
  email: 'dimas@example.com',
  role: 'USER',
  onboarded: false,
};

const PAGES_PUBLIC = [
  { id: 'login', name: 'Masuk Akun', path: '/login' },
  { id: 'register', name: 'Daftar Akun', path: '/register' },
  { id: 'forgot-password', name: 'Lupa Password', path: '/forgot-password' },
  { id: 'reset-password', name: 'Reset Password', path: '/reset-password?token=test_token_audit' },
  { id: 'kebijakan-privasi', name: 'Kebijakan Privasi', path: '/kebijakan-privasi' },
  { id: 'syarat-ketentuan', name: 'Syarat & Ketentuan', path: '/syarat-ketentuan' },
];

const PAGES_AUTHENTICATED = [
  { id: 'beranda', name: 'Beranda', path: '/beranda' },
  { id: 'cv', name: 'CV Saya', path: '/cv' },
  { id: 'cv-screener', name: 'Screening ATS', path: '/cv-screener' },
  { id: 'tracker', name: 'Tracker Lamaran', path: '/tracker' },
  { id: 'career-intelligence', name: 'Career Intelligence', path: '/career-intelligence' },
  { id: 'misi-cuan', name: 'Misi Cuan', path: '/misi-cuan' },
  { id: 'referral', name: 'Referral', path: '/referral' },
  { id: 'pengaturan', name: 'Pengaturan', path: '/pengaturan' },
  { id: 'readiness', name: 'Kesiapan Kerja (Readiness)', path: '/readiness' },
  { id: 'mailer', name: 'Email & Surat Lamaran', path: '/mailer' },
  { id: 'scrape-jobs', name: 'Pencarian Loker', path: '/scrape-jobs' },
  { id: 'interview', name: 'Simulasi Interview', path: '/interview' },
  { id: 'latihan-soal', name: 'Latihan Soal', path: '/latihan-soal' },
  { id: 'saran-fitur', name: 'Saran Fitur', path: '/saran-fitur' },
  { id: 'lapor-bug', name: 'Lapor Kendala', path: '/lapor-bug' },
  { id: 'pembayaran', name: 'Pembayaran / Membership', path: '/pembayaran' },
];

function countSentences(text) {
  if (!text) return 0;
  // Clean clean text
  const clean = text.replace(/(\r\n|\n|\r)/gm, ' ').trim();
  // Match sentence ending punctuation followed by space or end
  const matches = clean.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!matches) {
    return clean.length > 80 ? 2 : 1;
  }
  return matches.length;
}

async function run() {
  console.log('Launching Edge for Council Audit Screenshots & Text Analysis...');
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const allFindings = {};

  // 1. Audit Public Pages (No Auth)
  console.log('\n--- 1. AUDITING PUBLIC & AUTH PAGES ---');
  const pubContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const pubPage = await pubContext.newPage();

  for (const pageItem of PAGES_PUBLIC) {
    console.log(`Navigating to ${pageItem.name} (${pageItem.path})...`);
    try {
      await pubPage.goto(`${BASE}${pageItem.path}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await pubPage.waitForTimeout(2000);

      const shotPath = path.join(OUT_DIR, `${pageItem.id}.png`);
      await pubPage.screenshot({ path: shotPath, fullPage: true });

      const longTexts = await pubPage.evaluate(() => {
        const results = [];
        const seen = new Set();
        // Grab all text containers
        const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, div, li, blockquote, label'));
        
        for (const el of elements) {
          // Skip if element has child elements with substantial text (only pick leaf or semi-leaf nodes)
          if (el.children.length > 3 && el.tagName === 'DIV') continue;
          
          const raw = el.innerText?.trim();
          if (!raw || raw.length < 50 || seen.has(raw)) continue;
          
          // Count sentences
          const sentences = raw.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 5);
          if (sentences.length > 2 || (raw.length > 140 && sentences.length >= 2)) {
            seen.add(raw);
            // Identify context/parent role
            let role = 'body';
            if (el.closest('header') || el.closest('[class*="hero"]') || el.tagName.startsWith('H')) role = 'header/hero';
            else if (el.closest('form')) role = 'form-helper';
            else if (el.closest('[class*="card"]')) role = 'card';
            else if (el.closest('[class*="alert"]') || el.closest('[class*="banner"]')) role = 'alert/banner';
            
            results.push({
              tag: el.tagName.toLowerCase(),
              role,
              sentenceCount: sentences.length,
              charCount: raw.length,
              text: raw,
              sentences,
            });
          }
        }
        return results;
      });

      allFindings[pageItem.id] = {
        name: pageItem.name,
        path: pageItem.path,
        screenshot: shotPath,
        longTexts,
      };
      console.log(`  Captured ${pageItem.id} -> Found ${longTexts.length} long texts (>2 sentences).`);
    } catch (err) {
      console.error(`  Error on ${pageItem.id}:`, err.message);
    }
  }
  await pubContext.close();

  // 2. Audit Onboarding Page (User logged in but not onboarded)
  console.log('\n--- 2. AUDITING ONBOARDING ---');
  const onbContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const serializedNew = encodeURIComponent(JSON.stringify(sessionUserNew));
  await onbContext.addCookies([
    { name: 'employr_user_session', value: serializedNew, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: serializedNew, domain: 'localhost', path: '/' },
    { name: 'employr_user_session', value: serializedNew, domain: '127.0.0.1', path: '/' },
    { name: 'cuti_user_session', value: serializedNew, domain: '127.0.0.1', path: '/' },
  ]);
  await onbContext.addInitScript((user) => {
    try {
      localStorage.setItem('employr_user_session', JSON.stringify(user));
      localStorage.removeItem('employr_onboarding_completed');
    } catch (_) {}
  }, sessionUserNew);

  await onbContext.route('**/api/auth/session', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, session: { user: sessionUserNew } }),
    });
  });

  const onbPage = await onbContext.newPage();
  try {
    console.log('Navigating to Onboarding (/onboarding)...');
    await onbPage.goto(`${BASE}/onboarding`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await onbPage.waitForTimeout(2500);

    const shotPath = path.join(OUT_DIR, `onboarding.png`);
    await onbPage.screenshot({ path: shotPath, fullPage: true });

    const longTexts = await onbPage.evaluate(() => {
      const results = [];
      const seen = new Set();
      const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, div, li, blockquote, label'));
      for (const el of elements) {
        if (el.children.length > 3 && el.tagName === 'DIV') continue;
        const raw = el.innerText?.trim();
        if (!raw || raw.length < 50 || seen.has(raw)) continue;
        const sentences = raw.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 5);
        if (sentences.length > 2 || (raw.length > 140 && sentences.length >= 2)) {
          seen.add(raw);
          results.push({
            tag: el.tagName.toLowerCase(),
            role: 'onboarding-step',
            sentenceCount: sentences.length,
            charCount: raw.length,
            text: raw,
            sentences,
          });
        }
      }
      return results;
    });

    allFindings['onboarding'] = {
      name: 'Onboarding',
      path: '/onboarding',
      screenshot: shotPath,
      longTexts,
    };
    console.log(`  Captured onboarding -> Found ${longTexts.length} long texts (>2 sentences).`);
  } catch (err) {
    console.error('  Error on onboarding:', err.message);
  }
  await onbContext.close();

  // 3. Audit Authenticated User Dashboard Pages
  console.log('\n--- 3. AUDITING AUTHENTICATED USER DASHBOARD PAGES ---');
  const userContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const serializedUser = encodeURIComponent(JSON.stringify(sessionUser));
  await userContext.addCookies([
    { name: 'employr_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
    { name: 'employr_user_session', value: serializedUser, domain: '127.0.0.1', path: '/' },
    { name: 'cuti_user_session', value: serializedUser, domain: '127.0.0.1', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: '127.0.0.1', path: '/' },
  ]);
  await userContext.addInitScript((user) => {
    try {
      localStorage.setItem('employr_user_session', JSON.stringify(user));
      localStorage.setItem('employr_onboarding_completed', 'true');
    } catch (_) {}
  }, sessionUser);

  await userContext.route('**/api/auth/session', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, session: { user: sessionUser } }),
    });
  });

  const userPage = await userContext.newPage();

  for (const pageItem of PAGES_AUTHENTICATED) {
    console.log(`Navigating to ${pageItem.name} (${pageItem.path})...`);
    try {
      await userPage.goto(`${BASE}${pageItem.path}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await userPage.waitForTimeout(2500);

      const shotPath = path.join(OUT_DIR, `${pageItem.id}.png`);
      await userPage.screenshot({ path: shotPath, fullPage: true });

      const longTexts = await userPage.evaluate(() => {
        const results = [];
        const seen = new Set();
        const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, p, span, div, li, blockquote, label, small'));

        for (const el of elements) {
          if (el.children.length > 3 && el.tagName === 'DIV') continue;
          const raw = el.innerText?.trim();
          if (!raw || raw.length < 45 || seen.has(raw)) continue;

          // Check if this text itself contains line breaks or multiple sentences
          const sentences = raw.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 4);
          
          if (sentences.length > 2 || (raw.length > 130 && sentences.length >= 2)) {
            // Check context
            seen.add(raw);
            let role = 'general';
            if (el.closest('header') || el.closest('[class*="hero"]') || el.tagName.startsWith('H')) role = 'header/hero-subtext';
            else if (el.closest('button')) role = 'button';
            else if (el.closest('[class*="banner"]') || el.closest('[class*="alert"]')) role = 'banner/announcement';
            else if (el.closest('[class*="drawer"]')) role = 'drawer';
            else if (el.closest('table') || el.closest('[class*="table"]')) role = 'table-cell';
            else if (el.closest('[class*="card"]') || el.closest('[class*="bento"]')) role = 'card-subtext';

            results.push({
              tag: el.tagName.toLowerCase(),
              role,
              sentenceCount: sentences.length,
              charCount: raw.length,
              text: raw,
              sentences,
            });
          }
        }
        return results;
      });

      allFindings[pageItem.id] = {
        name: pageItem.name,
        path: pageItem.path,
        screenshot: shotPath,
        longTexts,
      };
      console.log(`  Captured ${pageItem.id} -> Found ${longTexts.length} long texts (>2 sentences).`);
    } catch (err) {
      console.error(`  Error on ${pageItem.id}:`, err.message);
    }
  }

  await userContext.close();
  await browser.close();

  const jsonReportPath = path.join(OUT_DIR, 'all-pages-text-audit.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(allFindings, null, 2), 'utf-8');
  console.log(`\n==========================================`);
  console.log(`Audit Complete! Saved report to: ${jsonReportPath}`);
  console.log(`All screenshots saved to: ${OUT_DIR}`);
}

run().catch((e) => {
  console.error('Audit Script Failed:', e);
  process.exit(1);
});
