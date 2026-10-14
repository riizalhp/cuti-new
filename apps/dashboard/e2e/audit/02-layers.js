const { BASE, newSession, settle, auditLayer, save } = require('./lib');

// Each entry: [route, layerName, opener(page) => locator]
const btn = (name) => async (page) => { const b = page.getByRole('button', { name }).first(); await b.scrollIntoViewIfNeeded(); await b.click({ timeout: 8000 }); return b; };
const sel = (css) => async (page) => { const b = page.locator(css).first(); await b.scrollIntoViewIfNeeded(); await b.click({ timeout: 8000 }); return b; };

const LAYERS = [
  ['/beranda', 'notifikasi', btn(/Notifikasi/)],
  ['/beranda', 'herdi-ai', btn('Tanya Herdi')],
  ['/beranda', 'detail-loker', sel('[aria-label^="Buka detail lowongan"]')],
  ['/career-intelligence', 'ci-evidence', btn(/^Bukti$/)],
  ['/tracker', 'tambah-lamaran', btn('Tambah Lamaran')],
  ['/tracker', 'pusat-pengingat', btn(/Pusat Pengingat/)],
  ['/tracker', 'persiapan-offering', btn(/Persiapan Offering/)],
  ['/tracker', 'jadwal-interview', btn(/Atur Jam/)],
  ['/linkedin', 'riwayat-linkedin', btn(/^Riwayat/)],
  ['/linkedin', 'panduan-bookmarklet', async (page) => { await page.getByRole('button', { name: /Bookmarklet/ }).first().click(); await page.waitForTimeout(800); return btn(/Panduan Lengkap/)(page); }],
  ['/cv-screener', 'riwayat-screening', btn(/Riwayat Screening/)],
  ['/cv-screener', 'ganti-cv', btn(/Ganti CV/)],
  ['/mailer', 'form-pengiriman', btn(/Form Pengiriman/)],
  ['/mailer', 'akun-smtp', async (page) => { await page.getByRole('button', { name: /Akun Pengirim/ }).first().click(); await page.waitForTimeout(800); return btn(/Hubungkan Akun/)(page); }],
  ['/cv', 'cv-hrd', btn(/Buatkan CV|Chat Tim HR/)],
  ['/design-system', 'demo-drawer', async (page) => { await page.getByRole('button', { name: /Komponen & Drawer/ }).click(); await page.waitForTimeout(800); return btn(/Drawer|Demo/)(page); }],
  ['/pengaturan', 'edit-profil', btn(/Ubah data identitas/)],
  ['/latihan-soal', 'konfirmasi-selesai', async (page) => { await btn(/Mulai Kerjakan Soal/)(page); await page.waitForTimeout(2500); return btn(/Selesaikan Test/)(page); }],
];

(async () => {
  const { browser, page, blocked, errors } = await newSession();
  const results = [];
  for (const [route, name, open] of LAYERS) {
    await page.goto(BASE + route); await settle(page, 3500);
    const r = await auditLayer(page, name, () => open(page), { closeSel: 'button[aria-label*="Tutup" i], button:has-text("Tutup"), button:has-text("Batal"), button:has-text("Kembali Periksa")' });
    r.route = route;
    results.push(r);
    console.log(JSON.stringify({ name, role: r.role, modal: r.ariaModal, label: r.name, focusIn: r.focusInside, tabEsc: r.tabEscapes, esc: r.escCloses, ret: r.focusReturned, err: r.error, font: r.metrics?.ctlFont, u24: r.metrics?.under24, tiny: r.metrics?.tiny?.slice(0, 3), c: r.metrics?.contrast, worst: r.metrics?.worst?.slice(0, 2), noName: r.metrics?.unnamed }));
  }
  save('02-layers', { results, blocked: [...new Set(blocked.filter((b) => !b.includes('/api/track')))], errors: [...new Set(errors)] });
  console.log('BLOCKED', [...new Set(blocked.filter((b) => !b.includes('/api/track')))]);
  console.log('ERRORS', [...new Set(errors)].slice(0, 15));
  await browser.close();
})();
