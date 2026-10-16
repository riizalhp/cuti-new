import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.resolve(__dirname, '../screenshots/audit-mobile-saran-fitur-v2');
fs.mkdirSync(OUT_DIR, { recursive: true });

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

async function auditMobile(browser, viewport, name) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 EdgA/120.0.0.0',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const rawSession = JSON.stringify(sessionUser);
  await context.addCookies([
    { name: 'employr_user_session', value: rawSession, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: rawSession, domain: 'localhost', path: '/' },
  ]);

  const page = await context.newPage();
  console.log(`\n=== Menguji ${name} (${viewport.width}x${viewport.height}) ===`);

  await page.goto('http://localhost:3000/saran-fitur', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  // 1. Audit Tab Toggle Form vs Riwayat
  const tabAudit = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    return tabs.map(t => {
      const rect = t.getBoundingClientRect();
      return {
        text: t.innerText.trim(),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        touchTargetPass: rect.height >= 40 && rect.width >= 40
      };
    });
  });
  console.log('Audit Tabs Toggle:', tabAudit);

  // Screenshot Form Tab
  const formScreenPath = path.join(OUT_DIR, `${name}-01-form.png`);
  await page.screenshot({ path: formScreenPath, fullPage: false });
  console.log(`Screenshot form: ${formScreenPath}`);

  // Cek overflow horizontal pada halaman form
  const formOverflow = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const overflowing = [];
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > docWidth + 1) {
        overflowing.push({
          tag: el.tagName.toLowerCase(),
          className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 60) : '',
          width: Math.round(rect.width),
          right: Math.round(rect.right),
          docWidth
        });
      }
    });
    return overflowing;
  });
  console.log(`Overflow elements on Form tab: ${formOverflow.length}`);

  // 2. Klik Tab Riwayat
  const historyTab = page.locator('[role="tab"]:has-text("Riwayat")');
  if (await historyTab.count() > 0) {
    await historyTab.click();
    await page.waitForTimeout(800);

    const historyScreenPath = path.join(OUT_DIR, `${name}-02-riwayat.png`);
    await page.screenshot({ path: historyScreenPath, fullPage: false });
    console.log(`Screenshot riwayat: ${historyScreenPath}`);

    // Cek Refresh button touch target
    const refreshBtn = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Segarkan'));
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return {
        text: btn.innerText.trim(),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        pass: rect.height >= 40 && rect.width >= 40
      };
    });
    console.log('Refresh Button Audit:', refreshBtn);

    // Cek overflow horizontal pada halaman Riwayat
    const historyOverflow = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const overflowing = [];
      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > docWidth + 1) {
          overflowing.push({
            tag: el.tagName.toLowerCase(),
            className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 60) : '',
            width: Math.round(rect.width),
            right: Math.round(rect.right),
            docWidth
          });
        }
      });
      return overflowing;
    });
    console.log(`Overflow elements on History tab: ${historyOverflow.length}`);

    // 3. Klik kartu riwayat pertama untuk membuka Drawer Detail
    const firstCard = page.locator('[role="button"]:has-text("Rincian")').first();
    if (await firstCard.count() > 0) {
      await firstCard.click();
      await page.waitForTimeout(800);

      const drawerScreenPath = path.join(OUT_DIR, `${name}-03-drawer.png`);
      await page.screenshot({ path: drawerScreenPath, fullPage: false });
      console.log(`Screenshot drawer: ${drawerScreenPath}`);

      const drawerOverflow = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const overflowing = [];
        document.querySelectorAll('[role="dialog"] *').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > docWidth + 1) {
            overflowing.push({
              tag: el.tagName.toLowerCase(),
              className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 60) : '',
              width: Math.round(rect.width),
              right: Math.round(rect.right),
              docWidth
            });
          }
        });
        return overflowing;
      });
      console.log(`Overflow elements in Drawer: ${drawerOverflow.length}`);
    }
  }

  await context.close();
}

async function run() {
  console.log(`Menjalankan Browser dari: ${EDGE_PATH}`);
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  try {
    await auditMobile(browser, { width: 360, height: 740 }, 'Android-360');
    await auditMobile(browser, { width: 375, height: 667 }, 'iPhone-SE-375');
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
