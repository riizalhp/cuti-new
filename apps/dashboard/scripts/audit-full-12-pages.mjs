import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.resolve(__dirname, '../e2e/review/audit-all');
fs.mkdirSync(OUT_DIR, { recursive: true });

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const sessionUser = {
  id: 'a3e09016-eaa6-4394-a939-ee8679c2dc37',
  name: 'Budi Santoso',
  email: 'budi.santoso@gmail.com',
  role: 'MEMBER',
  onboarded: true,
};

const PAGES = [
  { id: 'beranda', name: 'Beranda', url: 'http://localhost:3000/beranda' },
  { id: 'cv', name: 'CV Saya', url: 'http://localhost:3000/cv' },
  { id: 'cv-screener', name: 'Screening & Evaluasi ATS', url: 'http://localhost:3000/cv-screener' },
  { id: 'linkedin', name: 'Optimasi LinkedIn', url: 'http://localhost:3000/linkedin' },
  { id: 'career-intelligence', name: 'Career Intelligence', url: 'http://localhost:3000/career-intelligence' },
  { id: 'tracker', name: 'Tracker Lamaran', url: 'http://localhost:3000/tracker' },
  { id: 'mailer', name: 'Email & Cover Letter', url: 'http://localhost:3000/mailer' },
  { id: 'scrape-jobs', name: 'Pencarian Loker', url: 'http://localhost:3000/scrape-jobs' },
  { id: 'marketplace', name: 'Cari Lowongan (Loker Portal)', url: 'http://localhost:3003' },
  { id: 'pengaturan', name: 'Pengaturan', url: 'http://localhost:3000/pengaturan' },
  { id: 'saran-fitur', name: 'Saran Fitur', url: 'http://localhost:3000/saran-fitur' },
  { id: 'lapor-bug', name: 'Lapor Kendala', url: 'http://localhost:3000/lapor-bug' },
];

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

const JARGON_OR_DEV_PATTERNS = [
  /password/i, /secret/i, /api[-_]?key/i, /token/i, /bearer/i,
  /database/i, /postgres/i, /pg_/i, /localhost:\d+/i, /usr_[a-zA-Z0-9_-]+/i,
  /undefined/i, /null/i, /\[object Object\]/i, /NaN/i, /lorem ipsum/i,
  /dummy/i, /todo:/i, /mock/i, /kalibrr/i
];

async function run() {
  console.log('Launching browser with Edge...');
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

  // Mock essential auth endpoints for dashboard
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
  const fullReport = {};

  for (const p of PAGES) {
    console.log(`\nAuditing: ${p.name} -> ${p.url}`);
    try {
      await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(2000);

      // Screenshot
      const screenshotPath = path.join(OUT_DIR, `${p.id}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled', timeout: 25000 });

      // In-page deep inspection
      const pageData = await page.evaluate(({ bannedList, termChecks }) => {
        const bodyText = document.body.innerText || '';

        // Extract headings
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
          tag: h.tagName.toLowerCase(),
          text: h.innerText.trim(),
        })).filter(h => h.text.length > 0);

        // Extract interactive buttons/links
        const buttons = Array.from(document.querySelectorAll('button, a[role="button"]')).map(b => b.innerText.trim()).filter(Boolean);
        const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
          text: a.innerText.trim(),
          href: a.getAttribute('href'),
        })).filter(a => a.text.length > 0 && a.text.length < 50);

        // Extract inputs & placeholders
        const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(i => ({
          tag: i.tagName.toLowerCase(),
          placeholder: i.getAttribute('placeholder') || '',
          value: i.value || '',
          name: i.getAttribute('name') || '',
          label: i.getAttribute('aria-label') || (i.id ? document.querySelector(`label[for="${i.id}"]`)?.textContent?.trim() : '') || '',
        }));

        // Banned AI / Subscription terms check
        const bannedMatches = [];
        const lowerBody = bodyText.toLowerCase();
        for (const term of bannedList) {
          const regex = new RegExp(`\\b${term}\\b`, 'i');
          if (regex.test(bodyText)) {
            // Find surrounding sentence
            const snippetRegex = new RegExp(`([^.\\n]{0,40}\\b${term}\\b[^.\\n]{0,40})`, 'i');
            const match = bodyText.match(snippetRegex);
            bannedMatches.push({
              term,
              snippet: match ? match[0].trim() : term,
            });
          }
        }

        // Terminology checks (lowongan vs loker, dll)
        const termViolations = [];
        for (const tc of termChecks) {
          const regex = new RegExp(`\\b${tc.wrong}\\b`, 'gi');
          const matches = bodyText.match(regex);
          if (matches && matches.length > 0) {
            const snippetRegex = new RegExp(`([^.\\n]{0,30}\\b${tc.wrong}\\b[^.\\n]{0,30})`, 'i');
            const snippetMatch = bodyText.match(snippetRegex);
            termViolations.push({
              wrongWord: tc.wrong,
              expected: tc.correct,
              count: matches.length,
              sample: snippetMatch ? snippetMatch[0].trim() : tc.wrong,
            });
          }
        }

        // Redundancies / duplicate strings
        const textElements = Array.from(document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6'))
          .map(e => e.innerText?.trim())
          .filter(t => t && t.length > 15 && t.length < 150 && !t.includes('\n'));
        const freq = {};
        for (const s of textElements) {
          freq[s] = (freq[s] || 0) + 1;
        }
        const duplicateSnippets = Object.entries(freq)
          .filter(([_, count]) => count >= 2)
          .map(([text, count]) => ({ text, count }));

        return {
          title: document.title,
          headings,
          buttons: Array.from(new Set(buttons)),
          links: links.slice(0, 15),
          inputs,
          bannedMatches,
          termViolations,
          duplicateSnippets: duplicateSnippets.slice(0, 10),
          fullTextSample: bodyText.slice(0, 4000),
        };
      }, { bannedList: BANNED_TERMS, termChecks: TERMINOLOGY_CHECKS });

      // Jargon and technical leak checks
      const devLeaks = [];
      const lines = pageData.fullTextSample.split('\n');
      for (const line of lines) {
        for (const pattern of JARGON_OR_DEV_PATTERNS) {
          if (pattern.test(line)) {
            devLeaks.push(line.trim());
            break;
          }
        }
      }

      fullReport[p.id] = {
        name: p.name,
        url: p.url,
        title: pageData.title,
        screenshot: screenshotPath,
        headings: pageData.headings,
        bannedTerms: pageData.bannedMatches,
        terminologyViolations: pageData.termViolations,
        devOrJargonLeaks: Array.from(new Set(devLeaks)),
        duplicateSnippets: pageData.duplicateSnippets,
        buttons: pageData.buttons,
        inputs: pageData.inputs,
      };

      console.log(`✓ Completed audit for ${p.name}`);
    } catch (err) {
      console.error(`✗ Error auditing ${p.name}:`, err.message);
      fullReport[p.id] = {
        name: p.name,
        url: p.url,
        error: err.message,
      };
    }
  }

  const reportOut = path.resolve(__dirname, '../e2e/review/audit-all/full-report.json');
  fs.writeFileSync(reportOut, JSON.stringify(fullReport, null, 2), 'utf-8');
  console.log(`\nAll 12 pages audited! Full report saved to ${reportOut}`);

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
