import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'http://localhost:3000';
const OUT_DIR = path.resolve(__dirname, '../screenshots/diagnosis');
fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const sessionUser = {
  id: 'a3e09016-eaa6-4394-a939-ee8679c2dc37',
  name: 'Budi Santoso',
  email: 'budi.santoso@gmail.com',
  role: 'FREE',
  onboarded: false,
};

async function capture() {
  console.log('Launching Chrome to screenshot Onboarding Diagnosis...');
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const serializedUser = encodeURIComponent(JSON.stringify(sessionUser));

  // 1. Desktop Context
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  await desktopContext.addCookies([
    { name: 'employr_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
  ]);

  await desktopContext.addInitScript((user) => {
    try {
      localStorage.setItem('employr_user_session', JSON.stringify(user));
      localStorage.removeItem('employr_onboarding_completed');
    } catch (_) {}
  }, sessionUser);

  await desktopContext.route('**/api/**', (route) => {
    const url = route.request().url();
    if (url.includes('/api/auth/session')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, session: { user: sessionUser } }),
      });
    }
    if (url.includes('/api/user/profile')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            ...sessionUser,
            fullName: 'Budi Santoso',
            major: 'Teknik Informatika',
            skills: ['React', 'JavaScript', 'TypeScript', 'UI/UX Design', 'Git'],
            targetJob: 'Frontend Developer',
            expectedSalary: 'Rp 6.000.000 - Rp 9.000.000',
          },
        }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  const page = await desktopContext.newPage();

  // 1. Desktop Aiming
  await page.goto(`${BASE}/onboarding?stage=career_direction&substep=aiming`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '01-desktop-aiming.png'), fullPage: true });
  console.log('Saved 01-desktop-aiming.png');

  // 2. Desktop Loading with Animated Avatar
  await page.goto(`${BASE}/onboarding?stage=career_direction&substep=loading`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, '02-desktop-loading-avatar.png'), fullPage: true });
  console.log('Saved 02-desktop-loading-avatar.png');

  // 3. Desktop Suggested Career Paths & Bento Cards
  await page.goto(`${BASE}/onboarding?stage=career_direction&substep=suggested_paths`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '03-desktop-suggested-paths.png'), fullPage: true });
  console.log('Saved 03-desktop-suggested-paths.png');

  await desktopContext.close();

  // 2. Mobile Context (390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  await mobileContext.addCookies([
    { name: 'employr_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: serializedUser, domain: 'localhost', path: '/' },
  ]);

  await mobileContext.route('**/api/**', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, session: { user: sessionUser }, data: [] }),
    });
  });

  const mobPage = await mobileContext.newPage();

  // 4. Mobile Aiming
  await mobPage.goto(`${BASE}/onboarding?stage=career_direction&substep=aiming`, { waitUntil: 'domcontentloaded' });
  await mobPage.waitForTimeout(800);
  await mobPage.screenshot({ path: path.join(OUT_DIR, '04-mobile-aiming.png'), fullPage: true });
  console.log('Saved 04-mobile-aiming.png');

  // 5. Mobile Loading with Animated Avatar
  await mobPage.goto(`${BASE}/onboarding?stage=career_direction&substep=loading`, { waitUntil: 'domcontentloaded' });
  await mobPage.waitForTimeout(600);
  await mobPage.screenshot({ path: path.join(OUT_DIR, '05-mobile-loading-avatar.png'), fullPage: true });
  console.log('Saved 05-mobile-loading-avatar.png');

  // 6. Mobile Suggested Paths & Bento
  await mobPage.goto(`${BASE}/onboarding?stage=career_direction&substep=suggested_paths`, { waitUntil: 'domcontentloaded' });
  await mobPage.waitForTimeout(800);
  await mobPage.screenshot({ path: path.join(OUT_DIR, '06-mobile-suggested-paths.png'), fullPage: true });
  console.log('Saved 06-mobile-suggested-paths.png');

  await mobileContext.close();
  await browser.close();
  console.log('Diagnosis capture finished successfully!');
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
