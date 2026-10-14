import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'http://localhost:3000';
const OUT_DIR = path.resolve(__dirname, '../screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const sessionUser = {
  id: 'a3e09016-eaa6-4394-a939-ee8679c2dc37',
  name: 'Budi Santoso',
  email: 'budi.santoso@gmail.com',
  role: 'MEMBER',
  onboarded: true,
};

async function capture() {
  console.log('Launching Chrome to screenshot /beranda...');
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  // 1. Desktop Viewport
  console.log('Capturing Desktop /beranda (1440x900)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const serializedUser = encodeURIComponent(JSON.stringify(sessionUser));
  await desktopContext.addCookies([
    { name: 'employr_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
  ]);
  await desktopContext.addInitScript((user) => {
    try {
      localStorage.setItem('employr_user_session', JSON.stringify(user));
      localStorage.setItem('employr_onboarding_completed', 'true');
    } catch (_) {}
  }, sessionUser);

  await desktopContext.route('**/api/auth/session', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, session: { user: sessionUser } }),
    });
  });

  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(`${BASE}/beranda`, { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(2000);

  const desktopShotPath = path.join(OUT_DIR, 'beranda-desktop.png');
  await desktopPage.screenshot({ path: desktopShotPath, fullPage: true });
  console.log(`Saved desktop screenshot to: ${desktopShotPath}`);
  await desktopContext.close();

  // 2. Mobile Viewport (iPhone 14/15 size: 390x844)
  console.log('Capturing Mobile /beranda (390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  await mobileContext.addCookies([
    { name: 'employr_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
  ]);
  await mobileContext.addInitScript((user) => {
    try {
      localStorage.setItem('employr_user_session', JSON.stringify(user));
      localStorage.setItem('employr_onboarding_completed', 'true');
    } catch (_) {}
  }, sessionUser);

  await mobileContext.route('**/api/auth/session', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, session: { user: sessionUser } }),
    });
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${BASE}/beranda`, { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(2000);

  const mobileShotPath = path.join(OUT_DIR, 'beranda-mobile.png');
  await mobilePage.screenshot({ path: mobileShotPath, fullPage: true });
  console.log(`Saved mobile screenshot to: ${mobileShotPath}`);
  await mobileContext.close();

  await browser.close();
  console.log('Done capturing /beranda!');
}

capture().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
