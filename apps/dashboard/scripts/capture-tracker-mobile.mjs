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
  id: 'a0000000-0000-4000-8000-000000000001',
  name: 'Budi Santoso',
  email: 'budi.santoso@gmail.com',
  role: 'MEMBER',
  onboarded: true,
};

const sampleApps = [
  {
    id: 'app-1',
    company: 'PT Fintek Nusantara',
    position: 'Junior Frontend Engineer',
    location: 'Jakarta Selatan',
    appliedDate: '2026-10-01',
    status: 'Terkirim',
    salary: 'Rp 8.000.000',
    notes: 'Follow-up jika belum ada kabar setelah 3 hari.',
    portal: 'LinkedIn',
    matchScore: 88,
  },
  {
    id: 'app-2',
    company: 'PT Digital Kreatif Solusindo',
    position: 'UI/UX Designer',
    location: 'Bandung (Remote)',
    appliedDate: '2026-09-28',
    status: 'Screening',
    salary: 'Rp 7.500.000',
    notes: 'Portfolio review tahap HRD.',
    portal: 'Glints',
    matchScore: 92,
  },
  {
    id: 'app-3',
    company: 'GoTo Indonesia Digital',
    position: 'Associate Product Specialist',
    location: 'Jakarta Pusat',
    appliedDate: '2026-09-20',
    status: 'Interview',
    salary: 'Rp 10.000.000',
    notes: 'Interview user via Google Meet jam 10 pagi.',
    portal: 'JobStreet',
    interviewDate: '2026-10-07',
    interviewTime: '10:00',
    matchScore: 85,
  },
  {
    id: 'app-4',
    company: 'PT Bank Central Digital',
    position: 'QA Engineer Entry Level',
    location: 'Jakarta Barat',
    appliedDate: '2026-09-15',
    status: 'Offering',
    salary: 'Rp 9.000.000',
    notes: 'Offering letter diterima, review kontrak kerja.',
    portal: 'Karirhub',
    matchScore: 90,
  },
];

async function run() {
  console.log('Launching browser for tracker mobile test...');
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

  // Mock essential auth endpoints & applications
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

  await context.route('**/api/applications', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: sampleApps }),
    });
  });

  const page = await context.newPage();

  console.log('Navigating to /tracker on mobile...');
  await page.goto(`${BASE}/tracker`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  const ssPath = path.join(OUT_DIR, 'mobile-tracker-initial.png');
  await page.screenshot({ path: ssPath, fullPage: false });
  console.log('Viewport screenshot saved to:', ssPath);

  // Copy to brain artifacts
  const ARTIFACT_DIR = 'C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\1d4fbb0f-6295-4eac-b072-bb18e65711e1';
  fs.copyFileSync(ssPath, path.join(ARTIFACT_DIR, 'mobile-tracker-semua.png'));

  // Test filter click: Interview
  console.log('Clicking filter Interview...');
  const interviewPill = page.locator('button[role="tab"]').filter({ hasText: 'Interview' });
  if (await interviewPill.count() > 0) {
    await interviewPill.first().click();
    await page.waitForTimeout(500);
    const ssFiltered = path.join(OUT_DIR, 'mobile-tracker-interview.png');
    await page.screenshot({ path: ssFiltered, fullPage: false });
    fs.copyFileSync(ssFiltered, path.join(ARTIFACT_DIR, 'mobile-tracker-interview.png'));
    console.log('Filtered screenshot saved.');
  }

  // Test Table mode
  console.log('Clicking mode Tabel...');
  const tableToggle = page.locator('button[role="tab"]').filter({ hasText: 'Tabel' });
  if (await tableToggle.count() > 0) {
    await tableToggle.first().click();
    await page.waitForTimeout(500);

    // Click filter Semua in table mode
    const semuaPill = page.locator('button[role="tab"]').filter({ hasText: 'Semua' });
    if (await semuaPill.count() > 0) {
      await semuaPill.first().click();
      await page.waitForTimeout(500);
    }

    const ssTable = path.join(OUT_DIR, 'mobile-tracker-tabel.png');
    await page.screenshot({ path: ssTable, fullPage: false });
    fs.copyFileSync(ssTable, path.join(ARTIFACT_DIR, 'mobile-tracker-tabel.png'));
    console.log('Table mode screenshot saved.');
  }

  await browser.close();
}

run().catch((err) => {
  console.error('Error running mobile capture:', err);
  process.exit(1);
});
