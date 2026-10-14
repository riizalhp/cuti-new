import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'http://127.0.0.1:3000';
const TARGET_URL = `${BASE}/profil`;
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve(__dirname, '../screenshots/audit-profil');
fs.mkdirSync(OUT_DIR, { recursive: true });

const user = {
  id: 'a3e09016-eaa6-4394-a939-ee8679c2dc37',
  name: 'Rizal Hanifa Pratama',
  email: 'pengguna@gmail.com',
  role: 'FREE',
  onboarded: true,
};

async function main() {
  console.log('--- Launching Edge for Profile Audit on ' + TARGET_URL + ' ---');
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const serializedUser = encodeURIComponent(JSON.stringify(user));
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  await context.addCookies([
    { name: 'employr_user_session', value: serializedUser, domain: '127.0.0.1', path: '/' },
    { name: 'cuti_user_session', value: serializedUser, domain: '127.0.0.1', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: '127.0.0.1', path: '/' },
    { name: 'employr_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
  ]);

  await context.addInitScript((u) => {
    try {
      localStorage.setItem('employr_user_session', JSON.stringify(u));
      localStorage.setItem('employr_onboarding_completed', 'true');
    } catch (_) {}
  }, user);

  await context.route('**/api/auth/session', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, session: { user } }),
    });
  });

  const page = await context.newPage();
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Desktop screenshot
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop-profil.png'), fullPage: false });

  // Mobile context
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });

  await mobileContext.addCookies([
    { name: 'employr_user_session', value: serializedUser, domain: '127.0.0.1', path: '/' },
    { name: 'cuti_user_session', value: serializedUser, domain: '127.0.0.1', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: '127.0.0.1', path: '/' },
    { name: 'employr_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
  ]);

  await mobileContext.addInitScript((u) => {
    try {
      localStorage.setItem('employr_user_session', JSON.stringify(u));
      localStorage.setItem('employr_onboarding_completed', 'true');
    } catch (_) {}
  }, user);

  await mobileContext.route('**/api/auth/session', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, session: { user } }),
    });
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mobilePage.waitForTimeout(3000);

  // Mobile screenshot viewport
  await mobilePage.screenshot({ path: path.join(OUT_DIR, 'mobile-profil.png'), fullPage: false });
  // Mobile screenshot full page
  await mobilePage.screenshot({ path: path.join(OUT_DIR, 'mobile-profil-full.png'), fullPage: true });

  console.log('Screenshots saved to:', OUT_DIR);
  await browser.close();
}

main().catch(console.error);
