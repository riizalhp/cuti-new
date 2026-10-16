import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.resolve(__dirname, '../screenshots/audit-mobile-saran-fitur');
fs.mkdirSync(OUT_DIR, { recursive: true });

const EDGE_PATH = fs.existsSync('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe')
  ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  : (fs.existsSync('C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe')
      ? 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
      : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');

const sessionUser = {
  id: '32abe112-5239-40b3-b21c-51d5bcde0c31',
  name: 'Rizal Hanifa Pratama',
  email: 'pengguna@gmail.com',
  role: 'MEMBER',
  onboarded: true,
};

async function auditPage() {
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const serializedUser = encodeURIComponent(JSON.stringify(sessionUser));

  // Test at 360px (common small Android / Samsung) and 375px (iPhone SE) and 390px
  const widths = [360, 375, 390];
  const allResults = [];

  for (const w of widths) {
    const context = await browser.newContext({
      viewport: { width: w, height: 750 },
      isMobile: true,
      hasTouch: true,
    });

    await context.addCookies([
      { name: 'employr_user_session', value: serializedUser, domain: 'localhost', path: '/' },
      { name: 'cuti_user_session', value: serializedUser, domain: 'localhost', path: '/' },
      { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
    ]);

    const page = await context.newPage();
    await page.goto('http://localhost:3000/saran-fitur', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const report = await page.evaluate((viewportWidth) => {
      const main = document.getElementById('main-content-scroll');
      const rootLayout = document.getElementById('dashboard-root-layout');
      const doc = document.documentElement;
      const body = document.body;

      function checkLeakingElements(container) {
        const leaks = [];
        const containerRect = container ? container.getBoundingClientRect() : { right: viewportWidth, width: viewportWidth };
        const elements = container ? container.querySelectorAll('*') : document.querySelectorAll('*');

        elements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          // check if element overflows viewport or container
          if (rect.right > viewportWidth + 0.5) {
            leaks.push({
              tag: el.tagName.toLowerCase(),
              id: el.id,
              className: (el.className && typeof el.className === 'string') ? el.className : '',
              rect: {
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                overflowAmount: Math.round(rect.right - viewportWidth)
              },
              text: (el.innerText || el.textContent || '').trim().slice(0, 50)
            });
          }
        });
        return leaks;
      }

      return {
        viewportWidth,
        doc: { clientWidth: doc.clientWidth, scrollWidth: doc.scrollWidth },
        body: { clientWidth: body.clientWidth, scrollWidth: body.scrollWidth },
        main: main ? { clientWidth: main.clientWidth, scrollWidth: main.scrollWidth, offsetWidth: main.offsetWidth } : null,
        rootLayout: rootLayout ? { clientWidth: rootLayout.clientWidth, scrollWidth: rootLayout.scrollWidth } : null,
        leakingInFormTab: checkLeakingElements(main),
      };
    }, w);

    // Scroll down inside main to capture full form
    await page.evaluate(() => {
      const main = document.getElementById('main-content-scroll');
      if (main) main.scrollTop = 400;
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT_DIR, `w${w}-form-scrolled.png`) });

    await page.evaluate(() => {
      const main = document.getElementById('main-content-scroll');
      if (main) main.scrollTop = main.scrollHeight;
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT_DIR, `w${w}-form-bottom.png`) });

    // Switch to Riwayat tab
    const riwayatBtn = await page.locator('button[role="tab"]:has-text("Riwayat")').first();
    if (await riwayatBtn.isVisible()) {
      await riwayatBtn.click();
      await page.waitForTimeout(1000);

      const riwayatLeaks = await page.evaluate((viewportWidth) => {
        const main = document.getElementById('main-content-scroll');
        const leaks = [];
        if (!main) return leaks;

        main.querySelectorAll('*').forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > viewportWidth + 0.5) {
            leaks.push({
              tag: el.tagName.toLowerCase(),
              id: el.id,
              className: (el.className && typeof el.className === 'string') ? el.className : '',
              rect: {
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                overflowAmount: Math.round(rect.right - viewportWidth)
              },
              text: (el.innerText || el.textContent || '').trim().slice(0, 50)
            });
          }
        });
        return leaks;
      }, w);
      report.leakingInRiwayatTab = riwayatLeaks;

      // Click card to open Sheet / Drawer
      const card = await page.locator('div[role="button"]:has-text("REQ-"), div[role="button"]:has-text("SFT-")').first();
      if (await card.isVisible()) {
        await card.click();
        await page.waitForTimeout(800);

        const drawerLeaks = await page.evaluate((viewportWidth) => {
          const drawer = document.querySelector('[role="dialog"]');
          const leaks = [];
          if (!drawer) return { found: false, leaks: [] };

          const drawerRect = drawer.getBoundingClientRect();
          drawer.querySelectorAll('*').forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > viewportWidth + 0.5) {
              leaks.push({
                tag: el.tagName.toLowerCase(),
                className: (el.className && typeof el.className === 'string') ? el.className : '',
                rect: {
                  left: Math.round(rect.left),
                  right: Math.round(rect.right),
                  width: Math.round(rect.width),
                  overflowAmount: Math.round(rect.right - viewportWidth)
                },
                text: (el.innerText || el.textContent || '').trim().slice(0, 40)
              });
            }
          });

          return {
            found: true,
            drawerRect: {
              left: Math.round(drawerRect.left),
              right: Math.round(drawerRect.right),
              width: Math.round(drawerRect.width),
              overflowAmount: Math.round(drawerRect.right - viewportWidth)
            },
            leaks
          };
        }, w);

        report.drawerReport = drawerLeaks;
        await page.screenshot({ path: path.join(OUT_DIR, `w${w}-drawer-open.png`) });
      }
    }

    allResults.push(report);
    await context.close();
  }

  await browser.close();

  fs.writeFileSync(path.join(OUT_DIR, 'overflow-detailed.json'), JSON.stringify(allResults, null, 2));
  console.log(JSON.stringify(allResults, null, 2));
}

auditPage().catch(console.error);
