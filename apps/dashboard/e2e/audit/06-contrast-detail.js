// Temporary: per-route contrast + small-target detail with class names. Usage: node 06-contrast-detail.js /scrape-jobs [/tracker ...]
const { newSession, settle, save } = require('./lib');

const DETAIL = () => {
  const scope = document.querySelector('main') || document.body;
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const rgba = (c) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); const d = ctx.getImageData(0, 0, 1, 1).data; let a = 1; const m = /(?:\/\s*|,\s*)([\d.]+%?)\s*\)$/.exec(c); if (m && /rgba|\//.test(c)) a = m[1].endsWith('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1]); return [d[0], d[1], d[2], a]; };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const zoomOf = (el) => { let p = 1, e = el; while (e && e.nodeType === 1) { p *= parseFloat(getComputedStyle(e).zoom) || 1; e = e.parentElement; } return p; };
  const dark = document.documentElement.classList.contains('dark');
  const bgOf = (el) => { const st = []; let e = el; let src = null; while (e) { const cs = getComputedStyle(e); if (cs.backgroundImage !== 'none') return null; const c = rgba(cs.backgroundColor); if (c[3] > 0) { if (!src) src = e; st.push(c); if (c[3] >= 1) break; } e = e.parentElement; } let b = e ? [255, 255, 255] : dark ? [15, 16, 19] : [248, 250, 252]; for (let i = st.length - 1; i >= 0; i--) { const [r, g, bb, a] = st[i]; b = [r * a + b[0] * (1 - a), g * a + b[1] * (1 - a), bb * a + b[2] * (1 - a)]; } return { b, src }; };
  const vis = (e) => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.05; };
  const cls = (e) => (e && typeof e.className === 'string' ? e.className : '').replace(/\s+/g, ' ').slice(0, 160);
  const fails = {}; const seen = new Set();
  const w = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const t = w.currentNode, el = t.parentElement; if (!el || seen.has(el) || !t.textContent.trim()) continue; seen.add(el); if (!vis(el)) continue;
    const cs = getComputedStyle(el), px = parseFloat(cs.fontSize) * zoomOf(el);
    const bo = bgOf(el); if (!bo) continue; const bg = bo.b;
    const fg = rgba(cs.color); const c = [fg[0] * fg[3] + bg[0] * (1 - fg[3]), fg[1] * fg[3] + bg[1] * (1 - fg[3]), fg[2] * fg[3] + bg[2] * (1 - fg[3])];
    const L1 = lum(c), L2 = lum(bg), r = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const large = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700);
    if (r < (large ? 3 : 4.5)) {
      const key = `${cls(el)} || bg:${cls(bo.src)} || op:${cs.opacity}`;
      fails[key] = fails[key] || { n: 0, r: +r.toFixed(2), px: +px.toFixed(1), color: cs.color, ex: t.textContent.trim().slice(0, 40) };
      fails[key].n++;
    }
  }
  const tiny = {};
  const ctl = [...scope.querySelectorAll('button, a[href], [role="button"], [role="tab"], select, input:not([type="hidden"]), textarea')].filter(vis);
  for (const e of ctl) {
    const b = e.getBoundingClientRect(), cs = getComputedStyle(e), txt = (e.innerText || '').trim();
    const inlineText = cs.display === 'inline' && txt && e.closest('p, li');
    if (!inlineText && e.type !== 'checkbox' && e.type !== 'radio' && (b.width < 24 || b.height < 24)) {
      const key = `${e.tagName} ${cls(e)}`; tiny[key] = tiny[key] || { n: 0, size: `${Math.round(b.width)}x${Math.round(b.height)}`, label: (e.getAttribute('aria-label') || txt).slice(0, 30) }; tiny[key].n++;
    }
  }
  return { fails: Object.entries(fails).sort((a, b) => b[1].n - a[1].n), tiny: Object.entries(tiny).sort((a, b) => b[1].n - a[1].n) };
};

(async () => {
  const routes = process.argv.slice(2);
  const { browser, page } = await newSession();
  const out = {};
  for (const r of routes) {
    await page.goto('http://localhost:3000' + r);
    await settle(page, 6000);
    out[r] = await page.evaluate(DETAIL);
    console.log(`\n===== ${r}: ${out[r].fails.reduce((s, f) => s + f[1].n, 0)} contrast fails, ${out[r].tiny.reduce((s, f) => s + f[1].n, 0)} tiny`);
    for (const [k, v] of out[r].fails.slice(0, 40)) console.log(`  [${v.n}] r=${v.r} ${v.px}px ${v.color} "${v.ex}" :: ${k}`);
    console.log('  -- tiny --');
    for (const [k, v] of out[r].tiny.slice(0, 25)) console.log(`  [${v.n}] ${v.size} "${v.label}" :: ${k}`);
  }
  save('contrast-detail', out);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
