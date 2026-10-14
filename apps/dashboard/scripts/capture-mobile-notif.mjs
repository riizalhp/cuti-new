import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'http://127.0.0.1:3000';
const OUT_DIR = path.resolve(__dirname, '../e2e/review/screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const sessionUser = {
  id: 'a3e09016-eaa6-4394-a939-ee8679c2dc37',
  name: 'Budi Santoso',
  email: 'budi.santoso@gmail.com',
  role: 'MEMBER',
  onboarded: true,
};

async function run() {
  console.log('Launching browser for mobile test...');
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const serialized = encodeURIComponent(JSON.stringify(sessionUser));
  await context.addCookies([
    { name: 'employr_user_session', value: serialized, domain: '127.0.0.1', path: '/' },
    { name: 'cuti_user_session', value: serialized, domain: '127.0.0.1', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: '127.0.0.1', path: '/' },
    { name: 'employr_user_session', value: serialized, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: serialized, domain: 'localhost', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
  ]);

  await context.addInitScript((user) => {
    try {
      localStorage.setItem('employr_user_session', JSON.stringify(user));
      localStorage.setItem('employr_onboarding_completed', 'true');
    } catch (_) {}
  }, sessionUser);

  // Mock essential auth endpoints
  await context.route('**/api/auth/session', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, session: { user: sessionUser } }),
    });
  });

  await context.route('**/api/auth/me', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, user: sessionUser }),
    });
  });

  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to /beranda on mobile...');
  await page.goto(`${BASE}/beranda`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  // Find notification bell
  const bell = page.locator('[data-slot="notification-bell"]').first();
  console.log('Clicking notification bell...');
  await page.evaluate(() => {
    const b = document.querySelector('[data-slot="notification-bell"]');
    if (b) b.click();
  });
  await page.waitForTimeout(1000);

  console.log('Bell aria-expanded after click:', await bell.getAttribute('aria-expanded'));

  const dialog = page.locator('[role="dialog"]').first();
  const dialogCount = await dialog.count();
  console.log('Dialog element count in DOM:', dialogCount);
  const dialogVisible = dialogCount > 0 ? await dialog.isVisible() : false;
  console.log('Dialog visible:', dialogVisible);

  if (dialogVisible) {
    const box = await dialog.boundingBox();
    console.log('Dialog bounding box:', JSON.stringify(box));
  }

  const ssPath = path.join(OUT_DIR, 'mobile-notif-open.png');
  await page.screenshot({ path: ssPath, fullPage: false });
  console.log('Screenshot saved to:', ssPath);

  const ssFullPath = path.join(OUT_DIR, 'mobile-notif-full.png');
  await page.screenshot({ path: ssFullPath, fullPage: true });
  console.log('Full screenshot saved to:', ssFullPath);

  await browser.close();
}

run().catch((err) => {
  console.error('Error running mobile capture:', err);
  process.exit(1);
});
