// One-off codemod: light-mode text/background tokens that fail WCAG AA -> nearest AA-passing shade.
// Only bare (un-prefixed) tokens are touched; dark:/hover:/etc variants stay as-is.
// When a light text token is darkened and the same class string has no dark:text-*,
// the original light shade is appended as dark:text-* so dark mode keeps its contrast.
// Usage: node e2e/audit/contrast-codemod.js [--dry]
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const DIRS = ['components', 'app', 'lib', 'hooks', 'context'];
const DRY = process.argv.includes('--dry');

const TEXT_MAP = {
  'text-slate-400': ['text-slate-500', 'dark:text-slate-400'],
  'text-gray-400': ['text-gray-500', 'dark:text-gray-400'],
  'text-orange-500': ['text-orange-700', 'dark:text-orange-400'],
  'text-orange-600': ['text-orange-700', 'dark:text-orange-400'],
  'text-amber-500': ['text-amber-700', 'dark:text-amber-400'],
  'text-amber-600': ['text-amber-700', 'dark:text-amber-400'],
  'text-yellow-500': ['text-yellow-700', 'dark:text-yellow-400'],
  'text-yellow-600': ['text-yellow-700', 'dark:text-yellow-400'],
  'text-emerald-500': ['text-emerald-700', 'dark:text-emerald-400'],
  'text-emerald-600': ['text-emerald-700', 'dark:text-emerald-400'],
  'text-green-500': ['text-green-700', 'dark:text-green-400'],
  'text-green-600': ['text-green-700', 'dark:text-green-400'],
  'text-rose-500': ['text-rose-700', 'dark:text-rose-400'],
  'text-rose-600': ['text-rose-700', 'dark:text-rose-400'],
  'text-red-500': ['text-red-700', 'dark:text-red-400'],
  'text-red-600': ['text-red-700', 'dark:text-red-400'],
  'text-blue-500': ['text-blue-600', 'dark:text-blue-400'],
  'text-teal-500': ['text-teal-700', 'dark:text-teal-400'],
  'text-teal-600': ['text-teal-700', 'dark:text-teal-400'],
  'text-violet-500': ['text-violet-700', 'dark:text-violet-400'],
  'text-purple-500': ['text-purple-700', 'dark:text-purple-400'],
};

// Solid fills that carry white text below 4.5:1.
const FILL_MAP = {
  'bg-blue-500': 'bg-blue-600',
  'bg-emerald-500': 'bg-emerald-700',
  'bg-emerald-600': 'bg-emerald-700',
  'bg-green-500': 'bg-green-700',
  'bg-green-600': 'bg-green-700',
  'bg-rose-500': 'bg-rose-600',
  'bg-red-500': 'bg-red-600',
  'bg-amber-500': 'bg-amber-700',
  'bg-amber-600': 'bg-amber-700',
  'bg-yellow-500': 'bg-yellow-700',
  'bg-teal-500': 'bg-teal-700',
  'bg-orange-600': 'bg-orange-700',
};

// Class strings that sit on a dark surface even in light mode: leave their light text alone.
const DARK_SURFACE = /(^|\s)(bg-(slate|gray|zinc|neutral|stone)-(700|800|900|950)|bg-black|bg-navy-(600|700|800|900|950)|bg-cobalt-(500|600|700|800|900)|bg-white\/\d+|bg-\[#0)/;
const tok = (t) => new RegExp(`(?<=^|[\\s"'\`])${t.replace(/[-/]/g, '\\$&')}(?=(\\/\\d+)?(?:$|[\\s"'\`]))`, 'g');
const has = (s, t) => tok(t).test(s);
const LIT = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g;

const INNER = /('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")/;

function fixLiteral(lit, stats) {
  const q = lit[0];
  if (q === '`') {
    const parts = lit.slice(1, -1).split(INNER);
    for (let i = 1; i < parts.length; i += 2) parts[i] = fixLiteral(parts[i], stats);
    const staticIdx = parts.map((_, i) => i).filter((i) => i % 2 === 0);
    const staticText = staticIdx.map((i) => parts[i]).join(' ');
    const fixedStatic = fixClasses(staticText, stats, true);
    if (fixedStatic.changed) {
      // re-apply per static part with flags from the whole static text
      for (const i of staticIdx) parts[i] = fixClasses(parts[i], stats, false, fixedStatic.flags).s;
      if (fixedStatic.appendDark.length) parts[staticIdx[staticIdx.length - 1]] += ' ' + fixedStatic.appendDark.join(' ');
    }
    return '`' + parts.join('') + '`';
  }
  const r = fixClasses(lit.slice(1, -1), stats, false);
  return q + r.s + (r.appendDark.length ? ' ' + r.appendDark.join(' ') : '') + q;
}

// dryRun: only compute flags/changes (no stats). flags: precomputed context for template parts.
function fixClasses(s, stats, dryRun, flags) {
  const out = { s, changed: false, appendDark: [], flags: null };
  if (!/(^|\s)(text|bg)-/.test(s)) return out;
  const f = flags || { darkSurface: DARK_SURFACE.test(s), whiteText: has(s, 'text-white'), hasDarkText: /(^|\s)dark:text-/.test(s) };
  out.flags = f;
  const count = (k) => { out.changed = true; if (!dryRun) stats[k]++; };

  // Orange fills with white text: interactive -> cobalt CTA, static badge -> orange-700.
  if (f.whiteText && has(s, 'bg-orange-500')) {
    if (/hover:bg-orange-/.test(s)) {
      s = s.replace(tok('bg-orange-500'), 'bg-cobalt-500').replace(/(?<=^|\s)hover:bg-orange-(600|700)(?=$|\s)/g, 'hover:bg-cobalt-600');
      s = s.replace(/(?<=^|\s)(focus-visible:ring|ring|shadow)-orange-(\d+)/g, '$1-cobalt-500');
    } else {
      s = s.replace(tok('bg-orange-500'), 'bg-orange-700');
    }
    count('fill');
  }
  if (f.whiteText) {
    for (const [from, to] of Object.entries(FILL_MAP)) {
      if (has(s, from)) { s = s.replace(tok(from), to); count('fill'); }
    }
  }
  if (!f.darkSurface && !f.whiteText) {
    for (const [from, [to, darkTo]] of Object.entries(TEXT_MAP)) {
      if (!has(s, from)) continue;
      s = s.replace(tok(from), to);
      if (!f.hasDarkText && !out.appendDark.includes(darkTo)) out.appendDark.push(darkTo);
      count('text');
    }
  }
  out.s = s;
  return out;
}

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!['node_modules', '.next'].includes(e.name)) walk(p, out); }
    else if (/\.(tsx|ts)$/.test(e.name) && !/\.d\.ts$/.test(e.name)) out.push(p);
  }
  return out;
}

const stats = { files: 0, text: 0, fill: 0 };
for (const f of DIRS.flatMap((d) => walk(path.join(ROOT, d), []))) {
  const src = fs.readFileSync(f, 'utf8');
  const before = { ...stats };
  const next = src.replace(LIT, (m) => fixLiteral(m, stats));
  if (next !== src) {
    stats.files++;
    console.log(`${path.relative(ROOT, f)}  text+${stats.text - before.text} fill+${stats.fill - before.fill}`);
    if (!DRY) fs.writeFileSync(f, next);
  }
}
console.log(stats);
