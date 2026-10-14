const { BASE, OUT, newSession, settle, MEASURE, auditLayer, save, path } = require('./lib');

const ROUTES = ['/beranda', '/career-intelligence', '/cv', '/cv-screener', '/interview', '/lapor-bug', '/latihan-soal', '/linkedin', '/mailer', '/match-cv', '/misi-cuan', '/pengaturan', '/readiness', '/referral', '/saran-fitur', '/scrape-jobs', '/surat-lamaran', '/tracker', '/design-system'];

(async () => {
  const out = { states: {}, mobile: {}, w1280: {}, focus: {}, forced: {}, motion: {} };
  const { browser, context, page, errors } = await newSession();

  // Tracker states with the right endpoint
  const cases = [
    ['tracker-empty', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })],
    ['tracker-error', (r) => r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Server error' }) })],
    ['tracker-loading', async (r) => { await new Promise((s) => setTimeout(s, 9000)); r.continue().catch(() => {}); }],
  ];
  for (const [name, handler] of cases) {
    await page.route(/\/api\/applications(\?.*)?$/, handler);
    await page.goto(BASE + '/tracker'); await page.waitForTimeout(name === 'tracker-loading' ? 2000 : 5000);
    await page.screenshot({ path: path.join(OUT, `state-${name}.png`) });
    out.states[name] = { text: (await page.locator('main').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300), metrics: await page.evaluate(MEASURE), live: await page.evaluate(() => [...document.querySelectorAll('[role="alert"],[role="status"],[aria-live],[aria-busy="true"]')].map((e) => e.getAttribute('role') || e.getAttribute('aria-live') || 'busy')) };
    await page.unroute(/\/api\/applications(\?.*)?$/);
  }

  // Interview schedule modal from kanban card
  await page.goto(BASE + '/tracker'); await settle(page, 3500);
  out.interviewModal = await auditLayer(page, 'jadwal-interview', async () => { const b = page.locator('button').filter({ hasText: /Atur Jam|Jadwal|Checklist/ }).first(); await b.scrollIntoViewIfNeeded({ timeout: 6000 }); await b.click({ timeout: 6000 }); return b; }, { closeSel: 'button[aria-label*="Tutup" i], button:has-text("Tutup"), button:has-text("Batal")' });

  // Keyboard focus visibility: first 30 Tab stops on each route
  for (const r of ROUTES) {
    await page.goto(BASE + r); await settle(page, 3000);
    await page.evaluate(() => document.activeElement && document.activeElement.blur()).catch(() => {});
    const none = new Set(); let total = 0;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      if (!page.url().startsWith(BASE + r)) break;
      const f = await page.evaluate(() => {
        const e = document.activeElement; if (!e || e === document.body) return null;
        const cs = getComputedStyle(e);
        const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow !== 'none' && /0px 0px 0px [1-9]/.test(cs.boxShadow));
        return { t: (e.getAttribute('aria-label') || e.innerText || e.getAttribute('placeholder') || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 22), ring, inMain: !!e.closest('main') };
      }).catch(() => null);
      if (f) { total++; if (!f.ring && f.inMain) none.add(f.t); }
    }
    out.focus[r] = { checked: total, noIndicatorInMain: [...none].slice(0, 8), count: none.size };
  }

  // Reduced motion: infinite animations still running
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const r of ROUTES) {
    await page.goto(BASE + r); await settle(page, 2500);
    out.motion[r] = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => { const cs = getComputedStyle(e); return cs.animationName !== 'none' && cs.animationIterationCount === 'infinite' && e.getBoundingClientRect().width > 0 && !/spin/.test(cs.animationName); }).map((e) => `${getComputedStyle(e).animationName}:${String(e.className).slice(0, 40)}`).slice(0, 4)).catch((e) => `error: ${String(e).slice(0, 60)}`);
  }
  await page.emulateMedia({ reducedMotion: null });

  // Forced colors: key pages
  await page.emulateMedia({ forcedColors: 'active' });
  for (const r of ['/beranda', '/latihan-soal', '/cv-screener', '/pengaturan', '/career-intelligence']) {
    await page.goto(BASE + r); await settle(page, 3000);
    await page.screenshot({ path: path.join(OUT, `forced${r.replace(/\//g, '-')}.png`) });
    await page.waitForTimeout(500);
    out.forced[r] = await page.evaluate(() => {
      const a = document.querySelector('[data-slot="gooey-nav-item"][data-active="true"]'); const n = document.querySelector('[data-slot="gooey-nav-item"]:not([data-active="true"])');
      const s = (e) => e && `${getComputedStyle(e).color} bg ${getComputedStyle(e.parentElement).backgroundColor} border ${getComputedStyle(e).borderStyle}`;
      const borderless = [...document.querySelectorAll('main button')].filter((b) => (b.innerText || '').trim() && getComputedStyle(b).borderStyle === 'none').length;
      return { activeTab: s(a), inactiveTab: s(n), buttonsWithoutBorder: borderless, totalButtons: document.querySelectorAll('main button').length };
    }).catch((e) => `error: ${String(e).slice(0, 60)}`);
  }
  await page.emulateMedia({ forcedColors: 'none' });
  out.errors = [...new Set(errors)].slice(0, 20);
  save('04-responsive-a11y', out);
  await browser.close();

  // Mobile 390 and laptop 1280
  for (const [key, w, h] of [['mobile', 390, 844], ['w1280', 1280, 800]]) {
    const s = await newSession({ width: w, height: h, ...(w === 390 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}) });
    for (const r of ROUTES) {
      try {
        await s.page.goto(BASE + r); await settle(s.page, 3500);
        await s.page.screenshot({ path: path.join(OUT, `${key}${r.replace(/\//g, '-')}.png`) });
        await s.page.waitForTimeout(500);
        const m = await s.page.evaluate(MEASURE, 'body');
        const extra = await s.page.evaluate(() => {
          const W = innerWidth; const over = [];
          document.querySelectorAll('main *').forEach((e) => { const b = e.getBoundingClientRect(); if (b.width > 0 && b.right > W + 2 && over.length < 3) { let p = e.parentElement, clip = false; while (p) { const o = getComputedStyle(p).overflowX; if (/hidden|clip|auto|scroll/.test(o)) { clip = true; break; } p = p.parentElement; } if (!clip) over.push(`${e.tagName}.${String(e.className).slice(0, 50)} r=${Math.round(b.right)}`); } });
          const bottomNav = [...document.querySelectorAll('nav')].find((n) => { const b = n.getBoundingClientRect(); return getComputedStyle(n).position === 'fixed' && b.bottom >= innerHeight - 2 && b.width > W * 0.8; });
          const bn = bottomNav && [...bottomNav.querySelectorAll('a,button')].map((a) => { const b = a.getBoundingClientRect(); return `${(a.innerText || a.getAttribute('aria-label') || '?').trim().replace(/\s+/g, ' ').slice(0, 14)} ${Math.round(b.width)}x${Math.round(b.height)} ${getComputedStyle(a).fontSize}`; });
          const fab = [...document.querySelectorAll('button[aria-label="Tanya Herdi"]')].map((b) => { const r = b.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`; });
          return { zoom: getComputedStyle(document.documentElement).zoom, scrollX: document.documentElement.scrollWidth - W, overflowing: over, bottomNav: bn, fab };
        });
        s.page.evaluate(() => window.scrollTo(400, 0)); await s.page.waitForTimeout(200);
        extra.canPanX = await s.page.evaluate(() => scrollX);
        out[key][r] = { font: m.ctlFont, under24: m.under24, tiny: m.tiny.slice(0, 3), contrast: m.contrast, small: m.textBuckets['<9'] || 0, small10: (m.textBuckets['<9'] || 0) + (m.textBuckets['9-10'] || 0) + (m.textBuckets['10-11'] || 0), ...extra };
      } catch (e) { out[key][r] = { error: String(e).split('\n')[0].slice(0, 120) }; }
    }
    await s.browser.close();
  }
  save('04-responsive-a11y', out);
  console.log(JSON.stringify(out).slice(0, 30000));
})();
