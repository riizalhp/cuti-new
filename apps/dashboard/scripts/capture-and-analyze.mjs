import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'http://localhost:3000';
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

const BANNED_TERMS = [
  'ai', 'artificial intelligence', 'gpt', 'llm', 'prompt', 'prompting',
  'algorithm', 'machine learning', 'bot', 'robot', 'subscription', 'langganan',
  'bulanan', 'tahunan', 'monthly', 'yearly', 'generate', 'generated'
];

const CREDENTIAL_PATTERNS = [
  /password/i, /secret/i, /api[-_]?key/i, /token/i, /bearer/i,
  /database/i, /postgres/i, /pg_/i, /localhost:\d+/i, /usr_[a-zA-Z0-9_-]+/i,
  /undefined/i, /null/i, /\[object Object\]/i, /NaN/i
];

async function run() {
  console.log('Launching browser with Edge executable...');
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const serialized = encodeURIComponent(JSON.stringify(sessionUser));
  await context.addCookies([
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

  const pagesToTest = [
    { name: 'beranda', path: '/beranda' },
    { name: 'tracker', path: '/tracker' },
    { name: 'cv', path: '/cv' },
    { name: 'pengaturan', path: '/pengaturan' },
    { name: 'referral', path: '/referral' },
    { name: 'misi-cuan', path: '/misi-cuan' },
    { name: 'career-intelligence', path: '/career-intelligence' },
    { name: 'readiness', path: '/readiness' },
  ];

  const report = {};

  for (const item of pagesToTest) {
    console.log(`\nNavigating to ${item.name} (${item.path})...`);
    try {
      await page.goto(`${BASE}${item.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);

      // Screenshot
      const screenshotPath = path.join(OUT_DIR, `${item.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Saved screenshot to ${screenshotPath}`);

      // Extract text content & analyze
      const pageData = await page.evaluate((bannedList) => {
        const bodyText = document.body.innerText || '';
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
          tag: h.tagName.toLowerCase(),
          text: h.innerText.trim(),
        })).filter(h => h.text.length > 0);

        const buttons = Array.from(document.querySelectorAll('button, a[role="button"]')).map(b => b.innerText.trim()).filter(Boolean);
        const badges = Array.from(document.querySelectorAll('[class*="badge"], [class*="rounded-full"], [class*="rounded-[10px]"]'))
          .map(el => el.innerText.trim())
          .filter(t => t.length > 0 && t.length < 50);

        // Check for banned words in all text nodes
        const bannedFound = [];
        const words = bodyText.toLowerCase().split(/\s+/);
        for (const bw of bannedList) {
          if (bodyText.toLowerCase().includes(bw)) {
            // Find snippet
            const regex = new RegExp(`([^.\\n]{0,35}\\b${bw}\\b[^.\\n]{0,35})`, 'i');
            const match = bodyText.match(regex);
            bannedFound.push({
              term: bw,
              snippet: match ? match[0].trim() : bw,
            });
          }
        }

        // Duplicate / Redundant checks
        const textSnippets = Array.from(document.querySelectorAll('p, span, div')).map(e => e.innerText?.trim()).filter(t => t && t.length > 20 && t.length < 200);
        const freq = {};
        for (const s of textSnippets) {
          freq[s] = (freq[s] || 0) + 1;
        }
        const duplicateTexts = Object.entries(freq).filter(([_, count]) => count > 2).map(([text, count]) => ({ text, count }));

        return {
          title: document.title,
          url: window.location.href,
          headings,
          buttons: Array.from(new Set(buttons)),
          bannedFound,
          duplicateTexts: duplicateTexts.slice(0, 10),
          rawTextSample: bodyText.slice(0, 3000),
        };
      }, BANNED_TERMS);

      // Check credentials/technical leak patterns
      const credentialLeaks = [];
      const lines = pageData.rawTextSample.split('\n');
      for (const line of lines) {
        for (const pattern of CREDENTIAL_PATTERNS) {
          if (pattern.test(line)) {
            credentialLeaks.push(line.trim());
            break;
          }
        }
      }

      report[item.name] = {
        title: pageData.title,
        url: pageData.url,
        screenshot: screenshotPath,
        headings: pageData.headings,
        bannedTerms: pageData.bannedFound,
        credentialOrJargonLeaks: Array.from(new Set(credentialLeaks)),
        redundantSnippets: pageData.duplicateTexts,
        buttons: pageData.buttons,
      };

    } catch (err) {
      console.error(`Error processing ${item.name}:`, err.message);
      report[item.name] = { error: err.message };
    }
  }

  const reportPath = path.resolve(__dirname, '../e2e/review/audit-result.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nAudit completed! Report saved to ${reportPath}`);

  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
