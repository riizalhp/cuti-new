const { BASE, OUT, newSession, settle, MEASURE, auditLayer, save, path } = require('./lib');

const TABS = {
  '/career-intelligence': ['Kecocokan Role', 'Kesenjangan Skill', 'Arah Karier'],
  '/tracker': ['Tabel', 'Interview'],
  '/mailer': ['Kirim Cepat', 'Kirim Massal (CSV)', /Akun Pengirim/],
  '/latihan-soal': ['Latihan Soal Saya'],
  '/interview': ['Bank Pertanyaan & STAR Guide', 'Taktik Pertanyaan Jebakan', /Checklist Persiapan/],
  '/pengaturan': ['Preferensi Karir', 'Keamanan & Akun', 'Tampilan & Sistem'],
  '/linkedin': ['Upload PDF', 'Ekstensi Chrome', 'Bookmarklet', 'Manual'],
  '/cv-screener': [/Mode B/],
  '/misi-cuan': ['Sedang Berjalan', 'Selesai'],
  '/design-system': [/Palet Warna/, /Standar Skor/, /Tipografi/, /Komponen & Drawer/],
  '/readiness': [/Asesmen Diagnostik/, /Roadmap Pencapaian/],
  '/lapor-bug': [/^Riwayat/],
  '/saran-fitur': [/^Riwayat/],
};

(async () => {
  const { browser, page, context, blocked, errors } = await newSession();
  const out = { tabs: {}, layers: [], states: {}, auth: {} };
  const shot = (n) => page.screenshot({ path: path.join(OUT, `${n}.png`) });

  // 1. Sub-tabs
  for (const [route, labels] of Object.entries(TABS)) {
    await page.goto(BASE + route); await settle(page, 3500);
    out.tabs[route] = [];
    for (const label of labels) {
      const name = String(label).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 30);
      try {
        const b = page.getByRole('button', { name: label }).first();
        await b.scrollIntoViewIfNeeded({ timeout: 6000 }); await b.click({ timeout: 6000 }); await page.waitForTimeout(1500);
        await shot(`tab${route.replace(/\//g, '-')}-${name}`);
        const m = await page.evaluate(MEASURE);
        out.tabs[route].push({ tab: String(label), font: m.ctlFont, under24: m.under24, tiny: m.tiny.slice(0, 3), contrast: m.contrast, worst: m.worst.slice(0, 2), noName: m.unnamed, pads: m.paddingCombos, weights: m.weights, small: m.textBuckets['<9'] || 0 });
      } catch (e) { out.tabs[route].push({ tab: String(label), error: String(e).split('\n')[0].slice(0, 100) }); }
    }
  }

  save('03-tabs-partial', out);
  // 2. Layers missed in 02
  await page.goto(BASE + '/beranda'); await settle(page, 3000);
  try {
    await page.getByRole('button', { name: /Notifikasi/ }).first().click(); await page.waitForTimeout(1000);
    await shot('layer-notifikasi');
    out.layers.push({ name: 'notifikasi', info: await page.evaluate(() => {
      const close = document.querySelector('[aria-label="Tutup notifikasi"]'); const panel = close?.closest('div[class*="absolute"], div[class*="fixed"], [role="dialog"], [role="menu"]') || close?.parentElement?.parentElement;
      if (!panel) return 'panel tidak ditemukan';
      panel.dataset.auditScope = '1';
      return { role: panel.getAttribute('role') || '(none)', size: `${Math.round(panel.getBoundingClientRect().width)}x${Math.round(panel.getBoundingClientRect().height)}`, focusInside: panel.contains(document.activeElement) };
    }), metrics: await page.evaluate(MEASURE, '[data-audit-scope]') });
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    out.layers[0].escCloses = !(await page.locator('[aria-label="Tutup notifikasi"]').isVisible().catch(() => false));
  } catch (e) { out.layers.push({ name: 'notifikasi', error: String(e).split('\n')[0] }); }

  for (const [name, label] of [['persiapan-offering', /Persiapan Offering/], ['jadwal-interview', /Atur Jam/], ['detail-lamaran', /^Detail$/]]) {
    await page.goto(BASE + '/tracker'); await settle(page, 3000);
    await page.getByRole('button', { name: 'Tabel' }).first().click().catch(() => {}); await page.waitForTimeout(1200);
    const r = await auditLayer(page, name, async () => { const b = page.getByRole('button', { name: label }).first(); await b.scrollIntoViewIfNeeded({ timeout: 6000 }); await b.click({ timeout: 6000 }); return b; }, { closeSel: 'button[aria-label*="Tutup" i], button:has-text("Tutup"), button:has-text("Batal")' });
    out.layers.push(r);
  }
  const cvList = await page.evaluate(async () => (await (await fetch('/api/cv')).json())?.data?.map((x) => x.id) || []);
  for (const [name, label] of [['cv-pratinjau', /Pratinjau Draf CV/], ['cv-chat-hr', /Chat Tim HR/], ['cv-buatkan', /Buatkan CV/], ['cv-ats-analysis', /Analisis ATS|Detail ATS|opsi optimasi|Potensi/i], ['cv-ai-drawer', /AI|Herdi|Perbaiki dengan AI|Tulis dengan AI/]]) {
    for (const route of ['/cv', `/cv/${cvList[0]}`]) {
      await page.goto(BASE + route); await settle(page, 5000);
      if (!(await page.getByRole('button', { name: label }).count())) continue;
      const r = await auditLayer(page, name, async () => { const b = page.getByRole('button', { name: label }).first(); await b.scrollIntoViewIfNeeded({ timeout: 6000 }); await b.click({ timeout: 6000 }); return b; }, { closeSel: 'button[aria-label*="Tutup" i], button:has-text("Tutup"), button:has-text("Batal")' });
      r.route = route; out.layers.push(r); break;
    }
  }

  // 3. States
  // validation: submit empty "Tambah Lamaran" form (writes blocked anyway)
  await page.goto(BASE + '/tracker'); await settle(page, 3000);
  await page.getByRole('button', { name: 'Tambah Lamaran' }).first().click(); await page.waitForTimeout(900);
  await page.getByRole('button', { name: /Simpan Lamaran/ }).first().click().catch(() => {}); await page.waitForTimeout(1200);
  await shot('state-validasi-tambah-lamaran');
  out.states.validasiTambahLamaran = await page.evaluate(() => ({
    invalid: [...document.querySelectorAll('[aria-invalid="true"], :invalid')].filter((e) => e.tagName !== 'FORM').map((e) => e.getAttribute('name') || e.getAttribute('placeholder') || e.tagName).slice(0, 5),
    alerts: [...document.querySelectorAll('[role="alert"], .text-rose-500, .text-rose-600, .text-red-500, [data-sonner-toast]')].map((e) => e.innerText.trim().slice(0, 80)).filter(Boolean).slice(0, 5),
    describedBy: [...document.querySelectorAll('input[aria-describedby]')].length,
  }));

  // empty + error + loading via mocked GETs
  const mock = async (pattern, handler) => { await page.unrouteAll({ behavior: 'ignoreErrors' }).catch(() => {}); await page.route(pattern, handler); };
  const cases = [
    ['tracker-empty', '/tracker', '**/api/tracker**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })],
    ['tracker-error', '/tracker', '**/api/tracker**', (r) => r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Server error' }) })],
    ['tracker-loading', '/tracker', '**/api/tracker**', async (r) => { await new Promise((s) => setTimeout(s, 8000)); r.continue().catch(() => {}); }],
    ['cv-empty', '/cv', '**/api/cv', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })],
    ['ci-error', '/career-intelligence', '**/api/career-intelligence**', (r) => r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false }) })],
    ['error-boundary', '/career-intelligence', '**/api/career-intelligence**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { availableRoles: [] } }) })],
  ];
  for (const [name, route, pattern, handler] of cases) {
    try {
      await mock(pattern, handler);
      await page.goto(BASE + route); await page.waitForTimeout(name.endsWith('loading') ? 1500 : 5000);
      await shot(`state-${name}`);
      out.states[name] = { text: (await page.locator('main').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 260), metrics: await page.evaluate(MEASURE), live: await page.evaluate(() => [...document.querySelectorAll('[role="alert"],[role="status"],[aria-live],[aria-busy="true"]')].length) };
    } catch (e) { out.states[name] = { error: String(e).split('\n')[0] }; }
  }
  await page.unrouteAll({ behavior: 'ignoreErrors' }).catch(() => {});

  // 4. 404 (logged in)
  await page.goto(BASE + '/halaman-tidak-ada-audit'); await settle(page, 3000); await shot('page-404');
  out.auth['404'] = { status: 'ok', metrics: await page.evaluate(MEASURE, 'body') };

  save('03-tabs-states', { ...out, blocked: [...new Set(blocked.filter((b) => !b.includes('/api/track')))], errors: [...new Set(errors)].slice(0, 30) });
  await browser.close();

  // 5. Auth pages logged out
  const anon = await newSession({ loggedIn: false });
  for (const r of ['/login', '/register', '/forgot-password', '/reset-password?token=audit&email=audit%40example.com']) {
    await anon.page.goto(BASE + r); await settle(anon.page, 3000);
    const n = r.split('?')[0].slice(1);
    await anon.page.screenshot({ path: path.join(OUT, `auth-${n}.png`) });
    out.auth[n] = await anon.page.evaluate(MEASURE, 'body');
    // empty submit validation
    await anon.page.locator('button[type="submit"]').first().click({ timeout: 4000 }).catch(() => {}); await anon.page.waitForTimeout(1200);
    await anon.page.screenshot({ path: path.join(OUT, `auth-${n}-submit-kosong.png`) });
    out.auth[n].emptySubmit = await anon.page.evaluate(() => ({ invalid: [...document.querySelectorAll(':invalid, [aria-invalid="true"]')].filter((e) => e.tagName !== 'FORM').length, alerts: [...document.querySelectorAll('[role="alert"], [data-sonner-toast]')].map((e) => e.innerText.trim().slice(0, 60)).filter(Boolean).slice(0, 3) }));
  }
  out.authBlocked = [...new Set(anon.blocked.filter((b) => !b.includes('/api/track')))];
  await anon.browser.close();

  save('03-tabs-states', { ...out, blocked: [...new Set(blocked.filter((b) => !b.includes('/api/track')))], errors: [...new Set(errors)].slice(0, 30) });
  console.log(JSON.stringify(out, null, 0).slice(0, 28000));
})();
