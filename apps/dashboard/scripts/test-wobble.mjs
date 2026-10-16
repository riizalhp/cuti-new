import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const sessionUser = {
  id: '32abe112-5239-40b3-b21c-51d5bcde0c31',
  name: 'Rizal Hanifa Pratama',
  email: 'pengguna@gmail.com',
  role: 'MEMBER',
  onboarded: true,
};

async function testWobble() {
  const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });
  const serializedUser = encodeURIComponent(JSON.stringify(sessionUser));

  const context = await browser.newContext({
    viewport: { width: 360, height: 740 },
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

  // Check scrollLeft on main, body, doc
  const scrollTest = await page.evaluate(async () => {
    const main = document.getElementById('main-content-scroll');
    const doc = document.documentElement;
    const body = document.body;

    // Try scrolling right
    if (main) main.scrollLeft = 100;
    doc.scrollLeft = 100;
    body.scrollLeft = 100;

    const canMainScrollX = main ? main.scrollLeft > 0 : false;
    const canDocScrollX = doc.scrollLeft > 0;
    const canBodyScrollX = body.scrollLeft > 0;

    // Check all computed styles for overflow-x on ancestors
    const chain = [];
    let curr = main;
    while (curr) {
      const cs = window.getComputedStyle(curr);
      chain.push({
        tag: curr.tagName.toLowerCase(),
        id: curr.id,
        className: curr.className?.slice(0, 50),
        overflowX: cs.overflowX,
        overflowY: cs.overflowY,
        width: curr.offsetWidth,
        scrollWidth: curr.scrollWidth,
        clientWidth: curr.clientWidth,
      });
      curr = curr.parentElement;
    }

    return {
      canMainScrollX,
      canDocScrollX,
      canBodyScrollX,
      chain
    };
  });

  console.log('SCROLL TEST:', JSON.stringify(scrollTest, null, 2));

  // Now switch to Riwayat and check drawer
  const riwayatBtn = await page.locator('button[role="tab"]:has-text("Riwayat")').first();
  if (await riwayatBtn.isVisible()) {
    await riwayatBtn.click();
    await page.waitForTimeout(1000);

    const card = await page.locator('div[role="button"]:has-text("REQ-BICNY")').first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(1000);

      const drawerTest = await page.evaluate(() => {
        const drawer = document.querySelector('[role="dialog"]');
        if (!drawer) return { found: false };

        const cs = window.getComputedStyle(drawer);
        drawer.scrollLeft = 100;

        return {
          found: true,
          scrollLeft: drawer.scrollLeft,
          overflowX: cs.overflowX,
          offsetWidth: drawer.offsetWidth,
          scrollWidth: drawer.scrollWidth,
          clientWidth: drawer.clientWidth,
        };
      });

      console.log('DRAWER TEST:', JSON.stringify(drawerTest, null, 2));
    }
  }

  await browser.close();
}

testWobble().catch(console.error);
