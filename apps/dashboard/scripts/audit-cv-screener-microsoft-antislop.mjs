import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'http://localhost:3000';
const OUT_DIR = path.resolve(__dirname, '../e2e/review/cv-screener-microsoft-antislop');
fs.mkdirSync(OUT_DIR, { recursive: true });

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const AXE_DIR = 'D:\\cuti\\node_modules\\.pnpm';
let AXE_PATH = '';
const pnpmEntries = fs.readdirSync(AXE_DIR);
const axeEntry = pnpmEntries.find((e) => e.startsWith('axe-core@'));
if (axeEntry) {
  AXE_PATH = path.join(AXE_DIR, axeEntry, 'node_modules', 'axe-core', 'axe.js');
}

const sessionUser = {
  id: 'a3e09016-eaa6-4394-a939-ee8679c2dc37',
  name: 'Budi Santoso',
  email: 'budi.santoso@gmail.com',
  role: 'MEMBER',
  onboarded: true,
};

const BANNED_TERMS = [
  'ai', 'artificial intelligence', 'gpt', 'llm', 'prompt', 'prompting',
  'algorithm', 'algoritma', 'machine learning', 'bot', 'robot',
  'subscription', 'langganan', 'bulanan', 'tahunan', 'monthly', 'yearly',
  'generate', 'generated'
];

async function runComprehensiveAudit() {
  console.log('=== MEMULAI AUDIT /cv-screener: RULES MICROSOFT & /antislop ===');
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const auditReport = {
    timestamp: new Date().toISOString(),
    routesAudited: ['/cv-screener', '/cv-screener/report'],
    setupView: {},
    reportView: {},
    ruleViolations: [],
  };

  try {
    // -------------------------------------------------------------
    // 1. AUDIT /cv-screener (SETUP VIEW) - DESKTOP (1440x900)
    // -------------------------------------------------------------
    console.log('\n[1/4] Audit Desktop Setup View: http://localhost:3000/cv-screener...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });

    const serialized = encodeURIComponent(JSON.stringify(sessionUser));
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

    const setupPage = await desktopContext.newPage();
    await setupPage.goto(`${BASE}/cv-screener`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await setupPage.waitForTimeout(2500);

    // Capture initial screenshot
    await setupPage.screenshot({ path: path.join(OUT_DIR, 'desktop-setup-initial.png'), fullPage: true });

    // Inject axe-core
    let axeSetupViolations = [];
    if (fs.existsSync(AXE_PATH)) {
      const axeScript = fs.readFileSync(AXE_PATH, 'utf8');
      await setupPage.evaluate(axeScript);
      const axeResult = await setupPage.evaluate(async () => {
        // @ts-ignore
        return await window.axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
          },
        });
      });
      axeSetupViolations = axeResult.violations || [];
    }

    // Inspect Setup DOM
    const setupDomDetails = await setupPage.evaluate((bannedList) => {
      // 1. Check Headings & Casing
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) => ({
        tag: h.tagName,
        text: h.textContent?.trim() || '',
        classes: h.className,
        isUppercase: h.className.includes('uppercase') || h.textContent === h.textContent?.toUpperCase() && (h.textContent?.trim().length || 0) > 3,
      }));

      // 2. Check Interactive Buttons & Controls
      const buttons = Array.from(document.querySelectorAll('button, a[href], input, textarea, [role="button"], [role="tab"]')).map((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const text = el.textContent?.trim() || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '';
        const hasAria = Boolean(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.textContent?.trim());
        const isDeadButton = el.tagName === 'BUTTON' && !el.onclick && !el.getAttribute('type') && !el.getAttribute('role');
        return {
          tag: el.tagName,
          text: text.slice(0, 50),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          isVisible: rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden',
          hasAria,
          hasOutlineOrRing: style.outlineStyle !== 'none' || el.className.includes('focus-visible') || el.className.includes('focus:'),
          isSmallDesktop: rect.height > 0 && rect.height < 32 && style.display !== 'none',
        };
      }).filter((b) => b.isVisible);

      // 3. Check Forbidden Terms
      const allText = document.body.innerText || '';
      const lowerText = allText.toLowerCase();
      const detectedBanned = bannedList.filter((term) => {
        const reg = new RegExp(`\\b${term}\\b`, 'i');
        return reg.test(lowerText);
      });

      // 4. Check Em-dash (—) in body
      const emDashCount = (allText.match(/—/g) || []).length;

      // 5. Check Horizontal Overflow
      const bodyWidth = document.body.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const hasHorizontalOverflow = scrollWidth > bodyWidth;

      // 6. Check Emoji in text
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      const emojisFound = allText.match(emojiRegex) || [];

      return {
        headings,
        buttons,
        detectedBanned,
        emDashCount,
        hasHorizontalOverflow,
        emojisFound: Array.from(new Set(emojisFound)),
      };
    }, BANNED_TERMS);

    // Test History Drawer & Escape key
    console.log('Testing History Drawer toggle & Escape key...');
    const historyBtn = await setupPage.locator('button:has-text("Riwayat Screening")').first();
    let historyDrawerOpened = false;
    let historyDrawerClosedWithEscape = false;
    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      await setupPage.waitForTimeout(500);
      const drawer = setupPage.locator('[role="dialog"]').first();
      historyDrawerOpened = await drawer.isVisible();
      await setupPage.keyboard.press('Escape');
      await setupPage.waitForTimeout(600);
      historyDrawerClosedWithEscape = !(await drawer.isVisible());
    }

    auditReport.setupView = {
      desktop: {
        axeViolationsCount: axeSetupViolations.length,
        axeViolations: axeSetupViolations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length,
        })),
        headings: setupDomDetails.headings,
        smallButtonsDesktop: setupDomDetails.buttons.filter((b) => b.isSmallDesktop),
        detectedBannedTerms: setupDomDetails.detectedBanned,
        emDashCount: setupDomDetails.emDashCount,
        hasHorizontalOverflow: setupDomDetails.hasHorizontalOverflow,
        emojisFound: setupDomDetails.emojisFound,
        historyDrawerOpened,
        historyDrawerClosedWithEscape,
      },
    };

    // -------------------------------------------------------------
    // 2. AUDIT /cv-screener (SETUP VIEW) - MOBILE (375x812)
    // -------------------------------------------------------------
    console.log('\n[2/4] Audit Mobile Setup View (375x812)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    });
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

    const mobileSetupPage = await mobileContext.newPage();
    await mobileSetupPage.goto(`${BASE}/cv-screener`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await mobileSetupPage.waitForTimeout(2500);
    await mobileSetupPage.screenshot({ path: path.join(OUT_DIR, 'mobile-setup-initial.png'), fullPage: true });

    const mobileDomDetails = await mobileSetupPage.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const hasHorizontalOverflow = scrollWidth > clientWidth;

      const buttons = Array.from(document.querySelectorAll('button, a[href], [role="button"]')).map((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const text = el.textContent?.trim() || el.getAttribute('aria-label') || '';
        return {
          text: text.slice(0, 40),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          isVisible: rect.width > 0 && rect.height > 0 && style.display !== 'none',
          isSmallTouchTarget: (rect.width < 44 || rect.height < 44) && rect.width > 0 && rect.height > 0,
        };
      }).filter((b) => b.isVisible);

      return {
        hasHorizontalOverflow,
        scrollWidth,
        clientWidth,
        smallTouchTargetsMobile: buttons.filter((b) => b.isSmallTouchTarget),
      };
    });

    auditReport.setupView.mobile = mobileDomDetails;

    // -------------------------------------------------------------
    // 3. AUDIT /cv-screener/report - DESKTOP (1440x900)
    // -------------------------------------------------------------
    console.log('\n[3/4] Audit Desktop Report View: http://localhost:3000/cv-screener/report...');
    const reportContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    await reportContext.addCookies([
      { name: 'employr_user_session', value: serialized, domain: 'localhost', path: '/' },
      { name: 'cuti_user_session', value: serialized, domain: 'localhost', path: '/' },
      { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
    ]);

    const reportPage = await reportContext.newPage();
    await reportPage.goto(`${BASE}/cv-screener/report`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await reportPage.waitForTimeout(3000);
    await reportPage.screenshot({ path: path.join(OUT_DIR, 'desktop-report.png'), fullPage: true });

    let axeReportViolations = [];
    if (fs.existsSync(AXE_PATH)) {
      const axeScript = fs.readFileSync(AXE_PATH, 'utf8');
      await reportPage.evaluate(axeScript);
      const axeReportRes = await reportPage.evaluate(async () => {
        // @ts-ignore
        return await window.axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
          },
        });
      });
      axeReportViolations = axeReportRes.violations || [];
    }

    const reportDomDetails = await reportPage.evaluate((bannedList) => {
      const allText = document.body.innerText || '';
      const lowerText = allText.toLowerCase();
      const detectedBanned = bannedList.filter((term) => {
        const reg = new RegExp(`\\b${term}\\b`, 'i');
        return reg.test(lowerText);
      });
      const emDashCount = (allText.match(/—/g) || []).length;

      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) => ({
        tag: h.tagName,
        text: h.textContent?.trim() || '',
        classes: h.className,
        isUppercase: h.className.includes('uppercase') || h.textContent === h.textContent?.toUpperCase() && (h.textContent?.trim().length || 0) > 3,
      }));

      const buttons = Array.from(document.querySelectorAll('button, a[href], [role="button"], [role="tab"]')).map((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const text = el.textContent?.trim() || el.getAttribute('aria-label') || '';
        return {
          text: text.slice(0, 40),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          isVisible: rect.width > 0 && rect.height > 0 && style.display !== 'none',
          isSmallDesktop: rect.height > 0 && rect.height < 32,
        };
      }).filter((b) => b.isVisible);

      return {
        detectedBanned,
        emDashCount,
        headings,
        smallButtonsDesktop: buttons.filter((b) => b.isSmallDesktop),
      };
    }, BANNED_TERMS);

    auditReport.reportView = {
      axeViolationsCount: axeReportViolations.length,
      axeViolations: axeReportViolations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })),
      dom: reportDomDetails,
    };

    // -------------------------------------------------------------
    // 4. THEME & DARK MODE AUDIT
    // -------------------------------------------------------------
    console.log('\n[4/4] Audit Dark Mode Compliance...');
    await setupPage.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await setupPage.waitForTimeout(1000);
    await setupPage.screenshot({ path: path.join(OUT_DIR, 'desktop-setup-dark.png'), fullPage: true });

    const darkContrastCheck = await setupPage.evaluate(() => {
      // Check whether background changed to dark
      const bg = window.getComputedStyle(document.body).backgroundColor;
      return { bodyBg: bg };
    });
    auditReport.darkMode = darkContrastCheck;

    // Save final raw JSON
    fs.writeFileSync(path.join(OUT_DIR, 'raw-audit-results.json'), JSON.stringify(auditReport, null, 2));
    console.log('\n=== AUDIT SELESAI ===');
    console.log('Hasil mentah disimpan di:', path.join(OUT_DIR, 'raw-audit-results.json'));

  } finally {
    await browser.close();
  }
}

runComprehensiveAudit().catch((err) => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
