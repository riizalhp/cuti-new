const { BASE, OUT, newSession, settle, MEASURE, auditLayer, save, path } = require('./lib');

(async () => {
  const { browser, page, blocked } = await newSession();
  const out = { loginUrl: page.url() };
  try {
    // IDs for dynamic routes
    out.ids = await page.evaluate(async () => {
      const j = async (u) => { try { const r = await fetch(u); return { status: r.status, body: await r.json().catch(() => null) }; } catch (e) { return { err: String(e) }; } };
      const pick = (b) => { const d = b?.body?.data ?? b?.body; const arr = Array.isArray(d) ? d : d?.items || d?.history || d?.analyses || d?.data || []; return { status: b?.status, count: Array.isArray(arr) ? arr.length : 0, ids: Array.isArray(arr) ? arr.slice(0, 3).map((x) => x.id) : [], keys: d && !Array.isArray(d) ? Object.keys(d).slice(0, 8) : null }; };
      return { cv: pick(await j('/api/cv')), linkedin: pick(await j('/api/linkedin/history')) };
    });

    // Career Intelligence: first load (may call AI) and cached reload
    const t0 = Date.now();
    await page.goto(BASE + '/career-intelligence');
    let state = 'timeout';
    for (let i = 0; i < 120; i++) {
      await page.waitForTimeout(1000);
      if (await page.locator('h1:has-text("Career Intelligence")').count()) { state = 'loaded'; break; }
      if (await page.locator('text=Gagal memuat data analisis').count()) { state = 'error'; break; }
    }
    out.ci = { state, firstLoadSec: Math.round((Date.now() - t0) / 1000) };
    await settle(page, 1500);
    await page.screenshot({ path: path.join(OUT, 'ci-top.png') });
    await page.screenshot({ path: path.join(OUT, 'ci-full.png'), fullPage: true });
    out.ci.metrics = await page.evaluate(MEASURE);
    const t1 = Date.now();
    await page.reload();
    for (let i = 0; i < 120; i++) { await page.waitForTimeout(500); if (await page.locator('h1:has-text("Career Intelligence")').count()) break; }
    out.ci.reloadSec = Math.round((Date.now() - t1) / 1000);
    await settle(page, 1200);
    out.ci.layers = [];
    out.ci.layers.push(await auditLayer(page, 'ci-custom-role', async () => { const b = page.getByRole('button', { name: 'Tentukan target posisi pekerjaan baru' }); await b.click(); return b; }));
    out.ci.layers.push(await auditLayer(page, 'ci-evidence', async () => {
      const b = page.locator('main button').filter({ hasText: /bukti|evidence|detail|lihat/i }).first();
      if (!(await b.count())) throw new Error('tombol evidence tidak ditemukan');
      await b.scrollIntoViewIfNeeded(); await b.click(); return b;
    }));

    // Dynamic routes
    out.dynamic = {};
    const cvId = out.ids.cv.ids[0];
    if (cvId) {
      await page.goto(`${BASE}/cv/${cvId}`); await settle(page, 6000);
      await page.screenshot({ path: path.join(OUT, 'cv-id-top.png') });
      await page.screenshot({ path: path.join(OUT, 'cv-id-full.png'), fullPage: true });
      out.dynamic.cvId = { url: page.url(), metrics: await page.evaluate(MEASURE) };
    }
    const liId = out.ids.linkedin.ids[0];
    if (liId) {
      await page.goto(`${BASE}/linkedin/${liId}`); await settle(page, 6000);
      await page.screenshot({ path: path.join(OUT, 'linkedin-id-top.png') });
      await page.screenshot({ path: path.join(OUT, 'linkedin-id-full.png'), fullPage: true });
      out.dynamic.linkedinId = { url: page.url(), metrics: await page.evaluate(MEASURE) };
    } else {
      out.dynamic.linkedinId = 'tidak ada riwayat analisis linkedin untuk akun ini';
    }
    // cv-screener/report: visiting /cv-screener seeds history in localStorage
    await page.goto(BASE + '/cv-screener'); await settle(page, 5000);
    out.dynamic.screenerSeed = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.includes('screener')));
    await page.goto(BASE + '/cv-screener/report'); await settle(page, 6000);
    await page.screenshot({ path: path.join(OUT, 'screener-report-top.png') });
    await page.screenshot({ path: path.join(OUT, 'screener-report-full.png'), fullPage: true });
    out.dynamic.screenerReport = { url: page.url(), metrics: await page.evaluate(MEASURE) };
  } catch (e) {
    out.fatal = String(e).split('\n')[0];
  }
  out.blockedWrites = blocked;
  save('01-ci-dynamic', out);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
