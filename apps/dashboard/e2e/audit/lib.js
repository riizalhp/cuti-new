// Shared helpers for the dashboard audit. Temporary; delete after audit.
const path = require('path');
const fs = require('fs');
const { chromium } = require(path.resolve(__dirname, '../../../../node_modules/.pnpm/playwright-core@1.62.1/node_modules/playwright-core'));

const BASE = 'http://localhost:3000';
const OUT = path.resolve(__dirname, '../review/d2');
fs.mkdirSync(OUT, { recursive: true });

// Block every write to the API except auth, so the audit never mutates real data.
async function blockWrites(context, log) {
  await context.route('**/api/**', async (route) => {
    const req = route.request();
    const url = req.url();
    if (req.method() === 'GET' || /\/api\/auth\/(login|session|me)/.test(url)) return route.continue();
    log.push(`${req.method()} ${url.replace(BASE, '')}`);
    return route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Diblokir oleh audit (read-only)' }) });
  });
}

async function newSession({ width = 1440, height = 900, loggedIn = true, ...opts } = {}) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width, height }, ...opts });
  const blocked = [];
  await blockWrites(context, blocked);

  const sessionUser = {
    id: 'usr_audit_pengguna',
    name: 'Pengguna Audit',
    email: 'pengguna@gmail.com',
    role: 'MEMBER',
    onboarded: true,
  };
  const serialized = encodeURIComponent(JSON.stringify(sessionUser));
  await context.addCookies([
    { name: 'employr_user_session', value: serialized, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: serialized, domain: 'localhost', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
  ]);
  await context.addInitScript((user) => {
    try {
      localStorage.setItem('employr_user_session', JSON.stringify(user));
      localStorage.setItem('employr_onboarding_completed', 'true');
    } catch (_) {}
  }, sessionUser);

  await context.route('**/api/auth/login', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Login berhasil.', data: { ...sessionUser, token: 'mock-token' } }),
    });
  });
  await context.route('**/api/auth/me', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, user: sessionUser }),
    });
  });
  await context.route('**/api/auth/session', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, session: { user: sessionUser } }),
    });
  });

  const page = await context.newPage();
  // Dev server compiles routes on demand; wait for DOM only, with a generous timeout.
  const rawGoto = page.goto.bind(page);
  page.goto = (u, o = {}) => rawGoto(u, { waitUntil: 'domcontentloaded', timeout: 120000, ...o });
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(`[pageerror] ${page.url().replace(BASE, '')} ${String(e.message).slice(0, 180)}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/403|Diblokir|Failed to load resource/.test(m.text())) errors.push(`[console] ${page.url().replace(BASE, '')} ${m.text().slice(0, 180)}`); });
  return { browser, context, page, blocked, errors };
}

async function settle(page, ms = 3000) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(ms);
}

// Measures controls and text inside a scope (default: main). Runs in the page.
const MEASURE = (scopeSel) => {
  const scope = (scopeSel && document.querySelector(scopeSel)) || document.querySelector('main') || document.body;
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const rgba = (c) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); const d = ctx.getImageData(0, 0, 1, 1).data; let a = 1; const m = /(?:\/\s*|,\s*)([\d.]+%?)\s*\)$/.exec(c); if (m && /rgba|\//.test(c)) a = m[1].endsWith('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1]); return [d[0], d[1], d[2], a]; };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const zoomOf = (el) => { let p = 1, e = el; while (e && e.nodeType === 1) { p *= parseFloat(getComputedStyle(e).zoom) || 1; e = e.parentElement; } return p; };
  const dark = document.documentElement.classList.contains('dark');
  const bgOf = (el) => { const st = []; let e = el; while (e) { const cs = getComputedStyle(e); if (cs.backgroundImage !== 'none') return null; const c = rgba(cs.backgroundColor); if (c[3] > 0) { st.push(c); if (c[3] >= 1) break; } e = e.parentElement; } let b = e ? [255, 255, 255] : dark ? [15, 16, 19] : [248, 250, 252]; for (let i = st.length - 1; i >= 0; i--) { const [r, g, bb, a] = st[i]; b = [r * a + b[0] * (1 - a), g * a + b[1] * (1 - a), bb * a + b[2] * (1 - a)]; } return b; };
  const vis = (e) => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.05; };
  const label = (e) => (e.getAttribute('aria-label') || e.innerText || e.getAttribute('title') || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 26);

  const ctl = [...scope.querySelectorAll('button, a[href], [role="button"], [role="tab"], select, input:not([type="hidden"]), textarea')].filter(vis);
  const ctlFont = {}, pads = new Set(), weights = new Set(), icons = {}; let under24 = 0, noName = 0; const tiny = [], unnamed = [];
  for (const e of ctl) {
    const cs = getComputedStyle(e), b = e.getBoundingClientRect(), z = zoomOf(e), txt = (e.innerText || '').trim();
    const isField = /INPUT|SELECT|TEXTAREA/.test(e.tagName);
    if (txt || isField) { const f = (parseFloat(cs.fontSize) * z).toFixed(1); ctlFont[f] = (ctlFont[f] || 0) + 1; }
    if (txt && !isField) { pads.add(cs.paddingTop + '/' + cs.paddingLeft); weights.add(cs.fontWeight); }
    e.querySelectorAll('svg').forEach((s) => { const w = s.getBoundingClientRect().width.toFixed(1); if (+w > 0) icons[w] = (icons[w] || 0) + 1; });
    const inlineText = cs.display === 'inline' && txt && e.closest('p, li');
    if (!inlineText && e.type !== 'checkbox' && e.type !== 'radio' && (b.width < 24 || b.height < 24)) { under24++; if (tiny.length < 6) tiny.push(`${label(e)} ${Math.round(b.width)}x${Math.round(b.height)}`); }
    const named = txt || e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || e.getAttribute('title') || (e.id && document.querySelector(`label[for="${CSS.escape(e.id)}"]`)) || e.closest('label') || e.getAttribute('placeholder');
    if (!named) { noName++; if (unnamed.length < 4) unnamed.push(`${e.tagName.toLowerCase()} ${Math.round(b.width)}x${Math.round(b.height)}`); }
  }
  const fails = []; let checked = 0; const buckets = {}; const seen = new Set();
  const w = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const t = w.currentNode, el = t.parentElement; if (!el || seen.has(el) || !t.textContent.trim()) continue; seen.add(el); if (!vis(el)) continue;
    const cs = getComputedStyle(el), px = parseFloat(cs.fontSize) * zoomOf(el);
    const k = px < 9 ? '<9' : px < 10 ? '9-10' : px < 11 ? '10-11' : px < 12 ? '11-12' : '>=12'; buckets[k] = (buckets[k] || 0) + 1;
    const bg = bgOf(el); if (!bg) continue;
    const fg = rgba(cs.color); const c = [fg[0] * fg[3] + bg[0] * (1 - fg[3]), fg[1] * fg[3] + bg[1] * (1 - fg[3]), fg[2] * fg[3] + bg[2] * (1 - fg[3])];
    const L1 = lum(c), L2 = lum(bg), r = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const large = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700); checked++;
    if (r < (large ? 3 : 4.5)) fails.push({ t: t.textContent.trim().replace(/\s+/g, ' ').slice(0, 30), r: +r.toFixed(2), px: +px.toFixed(1) });
  }
  fails.sort((a, b) => a.r - b.r);
  return {
    controls: ctl.length, ctlFont, paddingCombos: pads.size, weights: [...weights].sort().join(','), icons, under24, tiny, noName, unnamed,
    textBuckets: buckets, contrast: `${fails.length}/${checked}`, worst: fails.slice(0, 5).map((f) => `${f.t} ${f.r} (${f.px}px)`),
    hScroll: document.documentElement.scrollWidth - innerWidth,
  };
};

// Finds the topmost visible dialog-like layer and checks its semantics.
const DIALOG_INFO = () => {
  const cands = [...document.querySelectorAll('[role="dialog"], [role="alertdialog"], [aria-modal="true"], .fixed')].filter((e) => {
    const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return b.width > 200 && b.height > 150 && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && (cs.position === 'fixed' || e.getAttribute('role'));
  });
  if (!cands.length) return null;
  const el = cands.sort((a, b) => (+getComputedStyle(b).zIndex || 0) - (+getComputedStyle(a).zIndex || 0))[0];
  const dlg = el.closest('[role="dialog"],[role="alertdialog"]') || el.querySelector('[role="dialog"],[role="alertdialog"]') || el;
  if (!dlg.dataset.auditScope) dlg.dataset.auditScope = '1';
  const active = document.activeElement;
  const lblId = dlg.getAttribute('aria-labelledby');
  return {
    role: dlg.getAttribute('role') || '(none)',
    ariaModal: dlg.getAttribute('aria-modal') || '(none)',
    name: dlg.getAttribute('aria-label') || (lblId && document.getElementById(lblId)?.innerText?.slice(0, 40)) || '(none)',
    focusInside: dlg.contains(active),
    focused: (active?.getAttribute('aria-label') || active?.innerText || active?.tagName || '').trim().replace(/\s+/g, ' ').slice(0, 24),
    size: `${Math.round(dlg.getBoundingClientRect().width)}x${Math.round(dlg.getBoundingClientRect().height)}`,
  };
};

// Opens a layer with `open`, measures it, checks Escape + focus trap + focus return.
async function auditLayer(page, name, open, { closeSel } = {}) {
  const res = { name };
  try {
    await page.evaluate(() => document.querySelectorAll('[data-audit-scope]').forEach((e) => delete e.dataset.auditScope));
    const opener = await open();
    await page.waitForTimeout(900);
    const info = await page.evaluate(DIALOG_INFO);
    if (!info) { res.error = 'layer tidak muncul'; return res; }
    Object.assign(res, info);
    res.metrics = await page.evaluate(MEASURE, '[data-audit-scope]');
    await page.screenshot({ path: path.join(OUT, `layer-${name}.png`) });
    // focus trap: 20 tabs, count how many land outside
    let outside = 0;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(() => { const s = document.querySelector('[data-audit-scope]'); return !s || s.contains(document.activeElement); });
      if (!inside) outside++;
    }
    res.tabEscapes = `${outside}/20`;
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
    res.escCloses = !(await page.evaluate(() => { const s = document.querySelector('[data-audit-scope]'); if (!s) return false; const b = s.getBoundingClientRect(); return b.width > 0 && getComputedStyle(s).visibility !== 'hidden' && +getComputedStyle(s).opacity > 0.05; }));
    if (!res.escCloses && closeSel) { await page.locator(closeSel).first().click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(500); }
    if (opener) res.focusReturned = await opener.evaluate((el) => el === document.activeElement).catch(() => 'n/a');
  } catch (e) { res.error = String(e).split('\n')[0].slice(0, 140); }
  return res;
}

function save(name, data) {
  fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(data, null, 1));
}

module.exports = { BASE, OUT, newSession, settle, MEASURE, DIALOG_INFO, auditLayer, save, path };
