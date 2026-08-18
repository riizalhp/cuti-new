import { chromium } from 'playwright-core';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text().slice(0, 300));
});
page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message.slice(0, 300)));

await page.goto('http://localhost:3000/linkedin', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(4000);

const url = page.url();
console.log('final URL:', url);
console.log('title:', await page.title());

const text = await page.evaluate(() => document.body.innerText);
const checks = ['Login LinkedIn', 'Hapus Sesi', 'Perlu Login LinkedIn', 'Sesi LinkedIn Aktif', 'Memeriksa sesi', 'Masukkan Link URL Profil LinkedIn'];
for (const c of checks) console.log((text.includes(c) ? 'ADA   ' : 'TIDAK ') + ': ' + c);

console.log('\n--- console errors ---');
console.log(errors.length ? errors.join('\n') : '(tidak ada)');

await browser.close();
