import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.resolve(__dirname, '../screenshots/audit-saran-fitur');
fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const sessionUser = {
  id: '32abe112-5239-40b3-b21c-51d5bcde0c31',
  name: 'Rizal Hanifa Pratama',
  email: 'pengguna@gmail.com',
  role: 'MEMBER',
  onboarded: true,
};

const BANNED_TERMS = [
  'ai', 'artificial intelligence', 'gpt', 'llm', 'prompt', 'prompting',
  'algorithm', 'machine learning', 'bot', 'robot', 'generate', 'generated',
  'subscription', 'langganan', 'bulanan', 'tahunan', 'monthly', 'yearly'
];

const TERMINOLOGY_CHECKS = [
  { wrong: 'lowongan', correct: 'loker' },
  { wrong: 'job', correct: 'loker' },
  { wrong: 'pelacak', correct: 'tracker' },
  { wrong: 'tracking', correct: 'tracker' },
  { wrong: 'reward', correct: 'cuan tambahan' },
  { wrong: 'earnings', correct: 'cuan tambahan' },
  { wrong: 'quest', correct: 'misi' },
];

async function runAudit() {
  console.log('Launching browser for /saran-fitur audit...');
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const results = {
    consoleErrors: [],
    bannedWords: [],
    terminologyIssues: [],
    a11yIssues: [],
    elementsChecked: {},
  };

  const serializedUser = encodeURIComponent(JSON.stringify(sessionUser));

  // Desktop Context
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await desktopContext.addCookies([
    { name: 'employr_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
  ]);

  const page = await desktopContext.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(msg.text());
    }
  });
  page.on('response', (res) => {
    if (res.status() >= 400) {
      console.log('HTTP ERROR:', res.url(), res.status());
    }
  });

  console.log('Navigating to http://localhost:3000/saran-fitur...');
  await page.goto('http://localhost:3000/saran-fitur', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Screenshot Tab 1 (Explore / Roadmap / List)
  await page.screenshot({ path: path.join(OUT_DIR, '01-desktop-explore.png'), fullPage: true });

  // Open first feature card drawer if present
  const firstCard = await page.locator('div[class*="cursor-pointer"]:has-text("SFT-"), div[class*="cursor-pointer"]:has-text("Dukungan")').first();
  if (await firstCard.isVisible()) {
    console.log('Opening feature detail drawer...');
    await firstCard.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, '02-desktop-drawer.png') });

    // Close drawer
    const closeBtn = await page.locator('button[aria-label*="Tutup"], button:has-text("Tutup")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // Switch to Tab 2 (Form Ajukan Ide)
  console.log('Switching to Ajukan Ide tab...');
  const formTrigger = await page.locator('button[role="tab"]:has-text("Ajukan Ide"), button[role="tab"]:has-text("Formulir")').first();
  if (await formTrigger.isVisible()) {
    await formTrigger.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, '03-desktop-form.png'), fullPage: true });
  }

  // Check texts
  const bodyText = await page.innerText('body');
  for (const term of BANNED_TERMS) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(bodyText)) {
      results.bannedWords.push(term);
    }
  }

  for (const { wrong, correct } of TERMINOLOGY_CHECKS) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'i');
    if (regex.test(bodyText)) {
      results.terminologyIssues.push({ wrong, correct });
    }
  }

  // Mobile Viewport
  console.log('Capturing Mobile Viewport (375x812)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
  });
  await mobileContext.addCookies([
    { name: 'employr_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: serializedUser, domain: 'localhost', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
  ]);

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/saran-fitur', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(OUT_DIR, '04-mobile-explore.png'), fullPage: true });

  await browser.close();

  console.log('=== AUDIT REPORT DATA ===');
  console.log(JSON.stringify(results, null, 2));
}

runAudit().catch(console.error);
