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

async function inspectLayout() {
  const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });
  const serializedUser = encodeURIComponent(JSON.stringify(sessionUser));

  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
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

  const measurements = await page.evaluate(() => {
    function measure(selector, name) {
      const el = document.querySelector(selector);
      if (!el) return { name, found: false };
      const r = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        name,
        found: true,
        left: Math.round(r.left),
        right: Math.round(r.right),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        width: Math.round(r.width),
        height: Math.round(r.height),
        marginLeft: style.marginLeft,
        marginRight: style.marginRight,
        paddingLeft: style.paddingLeft,
        paddingRight: style.paddingRight,
        display: style.display,
      };
    }

    const items = [
      measure('header', 'Top Header'),
      measure('div.relative.overflow-hidden.bg-\\[\\#162758\\]', 'PageHeader (Blue card)'),
      measure('form', 'Form (White card)'),
      measure('input[placeholder*="Notifikasi"]', 'Input Title'),
      measure('textarea[placeholder*="kendala"]', 'Textarea Problem'),
      measure('textarea[placeholder*="Google Calendar"]', 'Textarea Expected'),
      measure('div[aria-label*="gambar"]', 'Upload Dropzone'),
      measure('button[type="submit"]', 'Submit Button'),
      measure('nav[aria-label="Navigasi Utama Mobile"]', 'Bottom Navigation'),
      measure('#main-content-scroll', 'Main Scroll Container'),
    ];

    // Find any element whose right > 375 or left < 0
    const outOfBounds = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        if (r.left < 0 || r.right > 375) {
          // Ignore html, body, main, fixed root if they match width exactly
          if (el.tagName !== 'HTML' && el.tagName !== 'BODY') {
            outOfBounds.push({
              tag: el.tagName.toLowerCase(),
              className: typeof el.className === 'string' ? el.className.slice(0, 80) : '',
              left: Math.round(r.left),
              right: Math.round(r.right),
              width: Math.round(r.width),
              text: (el.innerText || '').slice(0, 30)
            });
          }
        }
      }
    });

    return {
      viewportWidth: window.innerWidth,
      items,
      outOfBounds
    };
  });

  console.log('=== MEASUREMENTS ===');
  console.log(JSON.stringify(measurements, null, 2));

  await browser.close();
}

inspectLayout().catch(console.error);
