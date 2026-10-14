import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('apps/dashboard/e2e/review/analysis-screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const sessionUser = {
  id: 'a3e09016-eaa6-4394-a939-ee8679c2dc37',
  name: 'Budi Santoso',
  email: 'budi.santoso@gmail.com',
  role: 'MEMBER',
  onboarded: true,
};

async function run() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });

  const serialized = encodeURIComponent(JSON.stringify(sessionUser));

  // 1. Desktop Setup (1440x900)
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await desktopContext.addCookies([
    { name: 'employr_user_session', value: serialized, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: serialized, domain: 'localhost', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
  ]);
  await desktopContext.addInitScript(({ user }) => {
    try {
      localStorage.setItem('employr_user_session', JSON.stringify(user));
      localStorage.setItem('employr_onboarding_completed', 'true');
    } catch (_) {}
  }, { user: sessionUser });

  const pageDesktop = await desktopContext.newPage();
  await pageDesktop.goto('http://localhost:3000/cv-screener', { waitUntil: 'domcontentloaded' });
  await pageDesktop.waitForTimeout(2000);
  await pageDesktop.screenshot({ path: path.join(outDir, 'desktop-setup.png'), fullPage: false });

  // 2. Desktop Report (1440x900)
  await pageDesktop.goto('http://localhost:3000/cv-screener/report', { waitUntil: 'domcontentloaded' });
  await pageDesktop.waitForTimeout(2000);
  await pageDesktop.screenshot({ path: path.join(outDir, 'desktop-report.png'), fullPage: false });

  // 3. Mobile Context (375x812)
  const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
  await mobileContext.addCookies([
    { name: 'employr_user_session', value: serialized, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: serialized, domain: 'localhost', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
  ]);
  await mobileContext.addInitScript(({ user }) => {
    try {
      localStorage.setItem('employr_user_session', JSON.stringify(user));
      localStorage.setItem('employr_onboarding_completed', 'true');
    } catch (_) {}
  }, { user: sessionUser });

  const pageMobile = await mobileContext.newPage();
  await pageMobile.goto('http://localhost:3000/cv-screener', { waitUntil: 'domcontentloaded' });
  await pageMobile.waitForTimeout(2000);
  await pageMobile.screenshot({ path: path.join(outDir, 'mobile-setup-375.png'), fullPage: false });
  // Scroll to bottom of main-content-scroll to inspect dropdown and action button
  await pageMobile.evaluate(() => {
    const main = document.querySelector('#main-content-scroll');
    if (main) main.scrollTop = main.scrollHeight;
  });
  await pageMobile.waitForTimeout(500);
  await pageMobile.screenshot({ path: path.join(outDir, 'mobile-setup-375-bottom.png'), fullPage: false });

  await pageMobile.goto('http://localhost:3000/cv-screener/report', { waitUntil: 'domcontentloaded' });
  await pageMobile.waitForTimeout(2000);
  await pageMobile.screenshot({ path: path.join(outDir, 'mobile-report-375.png'), fullPage: false });

  console.log('Screenshots successfully captured with authenticated session!');
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
