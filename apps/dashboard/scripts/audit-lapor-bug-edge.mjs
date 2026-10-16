import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.resolve(__dirname, '../screenshots/audit-lapor-bug-edge');
fs.mkdirSync(OUT_DIR, { recursive: true });

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const sessionUser = {
  id: '32abe112-5239-40b3-b21c-51d5bcde0c31',
  name: 'Rizal Hanifa Pratama',
  email: 'pengguna@gmail.com',
  role: 'MEMBER',
  onboarded: true,
};

const VIEWPORTS = [
  { name: 'iphone-se', width: 320, height: 667 },
  { name: 'android-small', width: 360, height: 800 },
  { name: 'iphone-standard', width: 375, height: 812 },
  { name: 'iphone-14', width: 390, height: 844 },
  { name: 'pixel-7', width: 412, height: 915 },
];

async function runEdgeAudit() {
  console.log('Launching Microsoft Edge from:', EDGE_PATH);
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const serializedUser = encodeURIComponent(JSON.stringify(sessionUser));
  const fullAuditReport = {
    edgePath: EDGE_PATH,
    timestamp: new Date().toISOString(),
    viewports: {},
    elementsCausingOverflow: [],
    tapTargetIssues: [],
    contrastIssues: [],
    copywritingCheck: {
      bannedTermsFound: [],
      terminologyCheck: [],
    },
    drawerMobileAudit: {},
  };

  // 1. Check each viewport for horizontal overflow
  for (const vp of VIEWPORTS) {
    console.log(`Checking viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: true,
      hasTouch: true,
    });
    await context.addCookies([
      { name: 'employr_user_session', value: serializedUser, domain: 'localhost', path: '/' },
      { name: 'cuti_user_session', value: serializedUser, domain: 'localhost', path: '/' },
      { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
    ]);

    const page = await context.newPage();
    const consoleLogs = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleLogs.push(msg.text());
    });

    await page.goto('http://localhost:3000/lapor-bug', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Screenshot initial form
    await page.screenshot({
      path: path.join(OUT_DIR, `form-${vp.name}-${vp.width}.png`),
      fullPage: true,
    });

    // Detect overflow
    const overflowData = await page.evaluate(() => {
      const winW = window.innerWidth;
      const docScrollW = document.documentElement.scrollWidth;
      const bodyScrollW = document.body.scrollWidth;
      const rootLayout = document.getElementById('dashboard-root-layout');
      const rootScrollW = rootLayout ? rootLayout.scrollWidth : 0;
      const mainScroll = document.getElementById('main-content-scroll');
      const mainScrollW = mainScroll ? mainScroll.scrollWidth : 0;

      const overflowingElements = [];
      const allEls = document.querySelectorAll('*');
      for (const el of allEls) {
        const rect = el.getBoundingClientRect();
        // check if right extends beyond window width by more than 1px
        if (rect.right > winW + 1) {
          overflowingElements.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || '',
            className: el.className ? String(el.className).substring(0, 100) : '',
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            overflowBy: Math.round(rect.right - winW),
            textSnippet: (el.textContent || '').trim().substring(0, 60),
          });
        }
      }

      return {
        winW,
        docScrollW,
        bodyScrollW,
        rootScrollW,
        mainScrollW,
        hasDocOverflow: docScrollW > winW,
        hasBodyOverflow: bodyScrollW > winW,
        hasMainOverflow: mainScrollW > winW,
        overflowingElementsCount: overflowingElements.length,
        topOverflowingElements: overflowingElements.slice(0, 15),
      };
    });

    fullAuditReport.viewports[vp.name] = {
      ...vp,
      overflowData,
      consoleLogs,
    };

    // If this is standard 375px, let's also test History tab and Drawer
    if (vp.width === 375) {
      console.log('Auditing History tab & Drawer on 375px...');
      const historyTabBtn = page.locator('button[role="tab"]:has-text("Riwayat")').first();
      if (await historyTabBtn.isVisible()) {
        await historyTabBtn.click();
        await page.waitForTimeout(1200);

        await page.screenshot({
          path: path.join(OUT_DIR, `history-mobile-375.png`),
          fullPage: true,
        });

        const historyOverflow = await page.evaluate(() => {
          const winW = window.innerWidth;
          const docScrollW = document.documentElement.scrollWidth;
          const bodyScrollW = document.body.scrollWidth;
          const overflowingElements = [];
          const allEls = document.querySelectorAll('*');
          for (const el of allEls) {
            const rect = el.getBoundingClientRect();
            if (rect.right > winW + 1) {
              overflowingElements.push({
                tag: el.tagName.toLowerCase(),
                id: el.id || '',
                className: el.className ? String(el.className).substring(0, 100) : '',
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                overflowBy: Math.round(rect.right - winW),
                textSnippet: (el.textContent || '').trim().substring(0, 60),
              });
            }
          }
          return {
            docScrollW,
            hasDocOverflow: docScrollW > winW,
            overflowCount: overflowingElements.length,
            overflowList: overflowingElements.slice(0, 10),
          };
        });

        fullAuditReport.viewports[vp.name].historyOverflow = historyOverflow;

        // Try opening first ticket
        const ticketCard = page.locator('div[role="button"][aria-label*="Lihat detail tiket"]').first();
        if (await ticketCard.isVisible()) {
          console.log('Clicking ticket card to test Drawer / Sheet...');
          await ticketCard.click();
          await page.waitForTimeout(1000);

          await page.screenshot({
            path: path.join(OUT_DIR, `drawer-mobile-375.png`),
          });

          const drawerCheck = await page.evaluate(() => {
            const sheet = document.querySelector('[role="dialog"]');
            if (!sheet) return { sheetFound: false };
            const rect = sheet.getBoundingClientRect();
            const winW = window.innerWidth;
            const winH = window.innerHeight;
            return {
              sheetFound: true,
              className: sheet.className ? String(sheet.className) : '',
              rect: {
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                top: Math.round(rect.top),
                bottom: Math.round(rect.bottom),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
              },
              winW,
              winH,
              overflowsRight: rect.right > winW + 1,
              isBottomSheet: rect.top > 0,
            };
          });
          fullAuditReport.drawerMobileAudit = drawerCheck;
        }
      }

      // Check tap targets on form
      await page.goto('http://localhost:3000/lapor-bug', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const tapTargets = await page.evaluate(() => {
        const issues = [];
        const interactives = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="tab"]');
        for (const el of interactives) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          // check if visible
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;

          if (rect.width < 44 || rect.height < 44) {
            issues.push({
              tag: el.tagName.toLowerCase(),
              role: el.getAttribute('role') || '',
              type: el.getAttribute('type') || '',
              text: (el.textContent || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').trim().substring(0, 30),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              className: el.className ? String(el.className).substring(0, 80) : '',
            });
          }
        }
        return issues;
      });
      fullAuditReport.tapTargetIssues = tapTargets;

      // Copywriting & Banned Terms Check
      const textContent = await page.innerText('body');
      const bannedList = [
        'ai', 'artificial intelligence', 'gpt', 'llm', 'prompt', 'prompting',
        'algorithm', 'machine learning', 'bot', 'robot', 'generate', 'generated',
        'subscription', 'langganan', 'bulanan', 'tahunan', 'monthly', 'yearly',
        'unlock', 'elevate', 'empower', 'seamless', 'game-changer', 'cutting-edge'
      ];
      for (const b of bannedList) {
        const re = new RegExp(`\\b${b}\\b`, 'i');
        if (re.test(textContent)) {
          fullAuditReport.copywritingCheck.bannedTermsFound.push(b);
        }
      }

      const termPairs = [
        { wrong: 'lowongan', correct: 'loker' },
        { wrong: 'job', correct: 'loker' },
        { wrong: 'pelacak', correct: 'tracker' },
        { wrong: 'tracking', correct: 'tracker' },
        { wrong: 'quest', correct: 'misi' },
        { wrong: 'earnings', correct: 'cuan tambahan' },
      ];
      for (const pair of termPairs) {
        const re = new RegExp(`\\b${pair.wrong}\\b`, 'i');
        if (re.test(textContent)) {
          fullAuditReport.copywritingCheck.terminologyCheck.push(pair);
        }
      }
    }

    await context.close();
  }

  await browser.close();

  const reportPath = path.join(OUT_DIR, 'audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(fullAuditReport, null, 2));
  console.log('Audit completed! Report saved to:', reportPath);
  console.log(JSON.stringify(fullAuditReport, null, 2));
}

runEdgeAudit().catch(console.error);
