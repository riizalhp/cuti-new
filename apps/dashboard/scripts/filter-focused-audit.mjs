import fs from 'fs';
import path from 'path';

const file = path.resolve('apps/dashboard/e2e/review/council-audit/all-pages-text-audit.json');
const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));

// Exclude pure legal static pages
const targetPages = [
  'login', 'register', 'forgot-password', 'reset-password',
  'onboarding', 'beranda', 'cv', 'cv-screener', 'tracker',
  'career-intelligence', 'misi-cuan', 'referral', 'pengaturan',
  'readiness', 'mailer', 'scrape-jobs', 'interview',
  'latihan-soal', 'saran-fitur', 'lapor-bug', 'pembayaran'
];

const report = [];

for (const pid of targetPages) {
  const p = raw[pid];
  if (!p) continue;
  
  const items = (p.longTexts || []).filter(item => {
    // filter out whole-page aggregate div dumps
    if (item.tag === 'div' && item.charCount > 600) return false;
    // Keep actual text elements like p, span, li, or short div cards
    return true;
  });

  report.push({
    id: pid,
    name: p.name,
    path: p.path,
    screenshot: p.screenshot,
    count: items.length,
    items: items.map(it => ({
      tag: it.tag,
      role: it.role,
      sentences: it.sentences.map(s => s.trim()),
      sentenceCount: it.sentences.length,
      charCount: it.charCount,
      text: it.text.replace(/\s+/g, ' ').trim()
    }))
  });
}

fs.writeFileSync(path.resolve('apps/dashboard/e2e/review/council-audit/focused-ui-copy-audit.json'), JSON.stringify(report, null, 2), 'utf-8');
console.log('Saved focused-ui-copy-audit.json!');
