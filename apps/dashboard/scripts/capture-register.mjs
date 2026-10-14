import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:3000/register', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const outPath = path.resolve(__dirname, '../e2e/review/council-audit/register.png');
  await page.screenshot({ path: outPath });
  console.log('Saved register screenshot to:', outPath);
  await browser.close();
}

main().catch(console.error);
