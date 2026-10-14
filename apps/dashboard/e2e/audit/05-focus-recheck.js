const { BASE, newSession, settle, save } = require('./lib');

const ROUTES = ['/beranda', '/career-intelligence', '/cv', '/cv-screener', '/interview', '/lapor-bug', '/latihan-soal', '/linkedin', '/mailer', '/saran-fitur', '/scrape-jobs', '/surat-lamaran', '/tracker'];

(async () => {
  const { browser, page } = await newSession();
  const out = {};
  for (const r of ROUTES) {
    await page.goto(BASE + r); await settle(page, 3000);
    await page.evaluate(() => document.activeElement && document.activeElement.blur()).catch(() => {});
    const none = new Set(); let total = 0;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(350); // let focus transitions finish
      if (!page.url().startsWith(BASE + r)) break;
      const f = await page.evaluate(() => {
        const e = document.activeElement; if (!e || e === document.body || !e.closest('main')) return null;
        const cs = getComputedStyle(e);
        const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
        const ring = cs.boxShadow !== 'none' && /0px 0px 0px [1-9]/.test(cs.boxShadow);
        return { t: (e.getAttribute('aria-label') || e.innerText || e.getAttribute('placeholder') || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 26), ok: outline || ring, tag: e.tagName.toLowerCase() };
      }).catch(() => null);
      if (f) { total++; if (!f.ok) none.add(`${f.tag}: ${f.t}`); }
    }
    out[r] = { checked: total, missing: [...none] };
    console.log(r, JSON.stringify(out[r]));
  }
  save('05-focus-recheck', out);
  await browser.close();
})();
