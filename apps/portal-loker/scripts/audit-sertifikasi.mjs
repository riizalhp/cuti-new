import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_URL = 'http://localhost:3003/sertifikasi';
const EDGE_PATH_1 = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const EDGE_PATH_2 = 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe';
const EDGE_PATH = fs.existsSync(EDGE_PATH_1) ? EDGE_PATH_1 : EDGE_PATH_2;

const SCREENSHOT_DIR = path.resolve(__dirname, '../screenshots/audit-sertifikasi');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runAudit() {
  console.log(`Starting Microsoft Auditor & Antislop verification on: ${TARGET_URL}`);
  console.log(`Browser executable: ${EDGE_PATH}`);

  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const res = await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`HTTP Status: ${res.status()}`);

  // Take initial desktop screenshot
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-full.png'), fullPage: true });

  // 1. Heading Hierarchy Check
  const headingAudit = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const list = headings.map((h) => ({
      level: parseInt(h.tagName.substring(1), 10),
      tag: h.tagName,
      text: h.innerText.trim().replace(/\s+/g, ' ').slice(0, 60),
    }));

    const skips = [];
    let prevLevel = 0;
    for (const h of list) {
      if (prevLevel > 0 && h.level > prevLevel + 1) {
        skips.push({ from: prevLevel, to: h.level, heading: h.text, tag: h.tag });
      }
      prevLevel = h.level;
    }

    return { total: list.length, list, skips };
  });

  console.log('\n--- Heading Hierarchy Audit ---');
  console.log(`Total Headings: ${headingAudit.total}`);
  console.log(`Heading Skips (violations): ${headingAudit.skips.length}`);
  if (headingAudit.skips.length > 0) {
    console.error('Violations:', JSON.stringify(headingAudit.skips, null, 2));
  }

  // 2. Em-Dash & En-Dash Audit
  const dashAudit = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const violations = [];
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') continue;
      const text = node.textContent;
      if (text && /[—–]/.test(text)) {
        violations.push({
          parentTag: parent.tagName,
          sample: text.trim().slice(0, 80),
        });
      }
    }
    return violations;
  });

  console.log('\n--- Em-dash & En-dash Check ---');
  console.log(`Dash Violations: ${dashAudit.length}`);
  if (dashAudit.length > 0) {
    console.error('Found dash violations:', dashAudit.slice(0, 5));
  }

  // 3. ALL CAPS Check
  const allCapsAudit = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const violations = [];

    for (const el of elements) {
      if (['SCRIPT', 'STYLE', 'SVG', 'PATH', 'HEAD', 'META'].includes(el.tagName)) continue;
      const style = window.getComputedStyle(el);
      const text = (el.innerText || '').trim();

      // CSS text-transform: uppercase on string > 3 chars
      if (style.textTransform === 'uppercase' && text.length > 3) {
        violations.push({
          tag: el.tagName,
          className: el.className,
          text: text.slice(0, 40),
          reason: 'text-transform: uppercase',
        });
      }

      // Hardcoded raw ALL CAPS words longer than 4 chars (excluding acronyms like BNSP, HTTP, HTML, CSS, CV)
      if (
        text.length > 4 &&
        text === text.toUpperCase() &&
        /^[A-Z\s,.-]+$/.test(text) &&
        !['BNSP', 'HTML', 'HTTP', 'JSON', 'REST', 'CRUD', 'IELTS', 'TOEFL'].includes(text) &&
        el.children.length === 0
      ) {
        violations.push({
          tag: el.tagName,
          className: el.className,
          text: text.slice(0, 40),
          reason: 'Raw uppercase string',
        });
      }
    }
    return violations;
  });

  console.log('\n--- ALL CAPS Audit ---');
  console.log(`ALL CAPS Violations: ${allCapsAudit.length}`);
  if (allCapsAudit.length > 0) {
    console.error('Sample ALL CAPS violations:', allCapsAudit.slice(0, 5));
  }

  // 4. Interactive Tap Target Size Check (>= 44px min-h and min-w)
  const tapTargetAudit = await page.evaluate(() => {
    const interactives = Array.from(document.querySelectorAll('a, button, input:not([type="hidden"]), select, textarea'));
    const smallTargets = [];

    for (const el of interactives) {
      const rect = el.getBoundingClientRect();
      // Skip hidden or detached elements
      if (rect.width === 0 && rect.height === 0) continue;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      // Check min size: standard is 44x44 for touch accessibility
      const isSub44 = rect.height < 43.5 || rect.width < 43.5;
      if (isSub44) {
        smallTargets.push({
          tag: el.tagName,
          text: (el.innerText || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').trim().slice(0, 40),
          href: el.getAttribute('href'),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
          className: el.className,
        });
      }
    }
    return { total: interactives.length, small: smallTargets };
  });

  console.log('\n--- Interactive Tap Target Check ---');
  console.log(`Total Interactives: ${tapTargetAudit.total}`);
  console.log(`Sub-44px targets: ${tapTargetAudit.small.length}`);
  if (tapTargetAudit.small.length > 0) {
    console.warn('Sample sub-44px targets:', tapTargetAudit.small.slice(0, 10));
  }

  // 5. Section and Module Presence Check
  const modulesAudit = await page.evaluate(() => {
    return {
      hasHeroH1: Boolean(document.querySelector('h1')),
      heroH1Text: document.querySelector('h1')?.innerText?.trim(),
      hasInFeedAd: Boolean(document.querySelector('.col-span-1.sm\\:col-span-2')),
      hasSpotlight: Boolean(document.body.innerText.includes('Spotlight Pilihan')),
      hasCVAd: Boolean(document.body.innerText.includes('Review & Bedah CV Standar ATS')),
      hasViralList: Boolean(document.body.innerText.includes('Artikel Karier Terpopuler')),
      hasSkyscraper: Boolean(document.body.innerText.includes('Mitra Karier Masa Depan') || document.body.innerText.includes('Program 2026')),
      hasPagination: Boolean(document.querySelector('nav[aria-label="Navigasi halaman sertifikasi"]')),
      hasBacaJugaArtikel: Boolean(document.body.innerText.includes('Baca Juga Artikel & Tips Karier')),
      hasRekomendasiSertifikasi: Boolean(document.body.innerText.includes('Rekomendasi Sertifikasi Terkait Lainnya')),
      hasLokerTerkait: Boolean(document.body.innerText.includes('Lowongan Kerja Aktif Terkait')),
      hasKursusTerkait: Boolean(document.body.innerText.includes('Pelatihan & Kursus Rekomendasi')),
      hasEventTerkait: Boolean(document.body.innerText.includes('Agenda Event & Job Fair Mendatang')),
      certCardsCount: document.querySelectorAll('a[href^="/sertifikasi/"]').length,
    };
  });

  console.log('\n--- Modules & Elements Presence ---');
  console.log(JSON.stringify(modulesAudit, null, 2));

  // 6. Test Mobile Viewport
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-full.png'), fullPage: true });

  await browser.close();
  console.log('\nAudit script complete. Screenshots saved to:', SCREENSHOT_DIR);
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
