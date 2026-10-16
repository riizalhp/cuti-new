import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.resolve(__dirname, '../screenshots/audit-mobile-saran-fitur');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Microsoft Edge or Google Chrome
const EDGE_PATH = fs.existsSync('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe')
  ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  : (fs.existsSync('C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe')
      ? 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
      : (fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
          : null));

const sessionUser = {
  id: '32abe112-5239-40b3-b21c-51d5bcde0c31',
  name: 'Rizal Hanifa Pratama',
  email: 'pengguna@gmail.com',
  role: 'MEMBER',
  onboarded: true,
};

async function checkMobileOverflow(page, label) {
  return await page.evaluate((label) => {
    const docWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const bodyScrollWidth = document.body.scrollWidth;

    const overflowingElements = [];
    const allElements = document.querySelectorAll('*');

    allElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Allow minor subpixel rounding (0.5px)
      if (rect.right > docWidth + 1) {
        overflowingElements.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 100) : '',
          rect: {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            docWidth: docWidth
          },
          textSnippet: (el.innerText || el.textContent || '').trim().slice(0, 40)
        });
      }
    });

    // Check tap targets < 44x44
    const smallTargets = [];
    const interactive = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="tab"]');
    interactive.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
        smallTargets.push({
          tag: el.tagName.toLowerCase(),
          text: (el.innerText || el.getAttribute('aria-label') || el.title || '').trim().slice(0, 30),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : ''
        });
      }
    });

    return {
      label,
      docWidth,
      scrollWidth,
      bodyScrollWidth,
      hasHorizontalOverflow: scrollWidth > docWidth || bodyScrollWidth > docWidth,
      overflowingCount: overflowingElements.length,
      overflowingSample: overflowingElements.slice(0, 15),
      smallTargetsCount: smallTargets.length,
      smallTargetsSample: smallTargets.slice(0, 15)
    };
  }, label);
}

async function run() {
  console.log(`Starting Mobile Audit with browser: ${EDGE_PATH}`);
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const serializedUser = encodeURIComponent(JSON.stringify(sessionUser));

  // Test mobile viewports: 375x667 (iPhone SE), 390x844 (iPhone 13/14)
  const viewports = [
    { name: 'iPhone-SE-375', width: 375, height: 667 },
    { name: 'iPhone-14-390', width: 390, height: 844 },
  ];

  const auditReport = {
    viewportsTested: [],
    tabs: {},
    drawer: {},
  };

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: true,
      hasTouch: true,
    });

    await context.addCookies([
      { name: 'employr_user_session', value: serializedUser, domain: 'localhost', path: '/' },
      { name: 'cuti_user_session', value: serializedUser, domain: 'localhost', path: '/' },
      { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
    ]);

    const page = await context.newPage();

    console.log(`\nNavigating to http://localhost:3000/saran-fitur on ${vp.name}...`);
    await page.goto('http://localhost:3000/saran-fitur', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Check Tab 1: Formulir
    const formReport = await checkMobileOverflow(page, `${vp.name} - Tab Formulir`);
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-01-form.png`), fullPage: true });

    // Switch to Tab 2: Riwayat
    const riwayatTab = await page.locator('button[role="tab"]:has-text("Riwayat")').first();
    let historyReport = null;
    if (await riwayatTab.isVisible()) {
      await riwayatTab.click();
      await page.waitForTimeout(1000);
      historyReport = await checkMobileOverflow(page, `${vp.name} - Tab Riwayat`);
      await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-02-riwayat.png`), fullPage: true });

      // Click first card in Riwayat to open Drawer
      const firstCard = await page.locator('div[role="button"]:has-text("SFT-")').first();
      if (await firstCard.isVisible()) {
        await firstCard.click();
        await page.waitForTimeout(1000);
        const drawerReport = await checkMobileOverflow(page, `${vp.name} - Drawer Detail`);
        await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-03-drawer.png`) });
        auditReport.drawer[vp.name] = drawerReport;
      }
    }

    auditReport.viewportsTested.push({
      viewport: vp.name,
      formReport,
      historyReport,
    });

    await context.close();
  }

  await browser.close();

  console.log('\n================ AUDIT SUMMARY RESULT ================');
  console.log(JSON.stringify(auditReport, null, 2));

  fs.writeFileSync(path.join(OUT_DIR, 'audit-report.json'), JSON.stringify(auditReport, null, 2));
}

run().catch(console.error);
