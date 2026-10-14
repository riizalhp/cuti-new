const { BASE, newSession, settle, MEASURE, DIALOG_INFO, save, path } = require('./lib');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../review/pengaturan');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  const report = {
    url: `${BASE}/pengaturan`,
    timestamp: new Date().toISOString(),
    desktop: {},
    mobile: {},
    darkMode: {},
    drawers: {},
    dialogs: {},
    forbiddenTerms: [],
    emojiFindings: [],
    touchTargetViolations: [],
    contrastViolations: [],
    unnamedControls: [],
    errors: [],
  };

  // 1. DESKTOP RUN
  console.log('Testing Desktop 1440x900...');
  const { browser, page, errors: desktopErrors } = await newSession({ width: 1440, height: 900 });
  report.errors.push(...desktopErrors);

  await page.goto(`${BASE}/pengaturan`);
  await settle(page, 2500);

  const tabs = [
    { key: 'profil', label: 'Profil' },
    { key: 'karir', label: 'Karir' },
    { key: 'keamanan', label: 'Keamanan' },
    { key: 'pengaturan', label: 'Sistem' },
  ];

  for (const t of tabs) {
    console.log(`Checking Desktop Tab: ${t.key}`);
    const tabBtn = page.getByRole('tab', { name: new RegExp(t.label, 'i') }).first();
    if (await tabBtn.isVisible().catch(() => false)) {
      await tabBtn.click();
      await page.waitForTimeout(800);
    }
    const shotPath = path.join(OUT_DIR, `desktop-${t.key}.png`);
    await page.screenshot({ path: shotPath, fullPage: true });

    const measures = await page.evaluate(MEASURE);
    report.desktop[t.key] = {
      screenshot: shotPath,
      measures,
    };
  }

  // Check forbidden copy & emojis on Desktop
  const copyCheck = await page.evaluate(() => {
    const text = document.body.innerText;
    const forbidden = [
      '\\bAI\\b',
      'Artificial Intelligence',
      '\\bGPT\\b',
      '\\bLLM\\b',
      'Generate',
      'Generated',
      'Prompt',
      'Prompting',
      'Algorithm',
      'Machine Learning',
      'Subscription',
      'Langganan',
    ];
    const foundForbidden = [];
    for (const term of forbidden) {
      const regex = new RegExp(term, 'gi');
      const matches = text.match(regex);
      if (matches) {
        foundForbidden.push({ term, count: matches.length });
      }
    }

    // Emoji check
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const foundEmojis = text.match(emojiRegex) || [];

    return {
      forbidden: foundForbidden,
      emojis: [...new Set(foundEmojis)],
    };
  });
  report.forbiddenTerms = copyCheck.forbidden;
  report.emojiFindings = copyCheck.emojis;

  // Drawer Test: Ubah Identitas
  console.log('Testing Drawer Identitas on Tab Profil...');
  const tabProfil = page.getByRole('tab', { name: /Profil/i }).first();
  await tabProfil.click();
  await page.waitForTimeout(600);
  const editIdentitasBtn = page.getByRole('button', { name: /Ubah data identitas/i }).first();
  if (await editIdentitasBtn.isVisible().catch(() => false)) {
    await editIdentitasBtn.click();
    await page.waitForTimeout(800);
    const drawerShot = path.join(OUT_DIR, `drawer-identitas.png`);
    await page.screenshot({ path: drawerShot });
    const drawerInfo = await page.evaluate(DIALOG_INFO);
    report.drawers.identitas = {
      info: drawerInfo,
      screenshot: drawerShot,
    };

    // Test ESC closes
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    report.drawers.identitas.escCloses = !(await page.locator('[role="dialog"]').isVisible().catch(() => false));
  }

  // Dialog Test: Hapus Akun on Tab Pengaturan (Sistem & Tampilan)
  console.log('Testing Dialog Hapus Akun on Tab Sistem/Pengaturan...');
  const tabSistem = page.getByRole('tab', { name: /Sistem/i }).first();
  if (await tabSistem.isVisible().catch(() => false)) {
    await tabSistem.click();
    await page.waitForTimeout(600);
    const deleteBtn = page.getByRole('button', { name: /Hapus Akun Permanen/i }).first();
    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.scrollIntoViewIfNeeded();
      await deleteBtn.click();
      await page.waitForTimeout(600);
      const dialogShot = path.join(OUT_DIR, `dialog-hapus-akun.png`);
      await page.screenshot({ path: dialogShot });
      const dialogInfo = await page.evaluate(DIALOG_INFO);
      report.dialogs.hapusAkun = {
        info: dialogInfo,
        screenshot: dialogShot,
      };
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }
  }

  await browser.close();

  // 2. MOBILE RUN (390x844 - iPhone 14 / modern Android)
  console.log('Testing Mobile 390x844...');
  const { browser: mobileBrowser, page: mobilePage, errors: mobileErrors } = await newSession({
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
  });
  report.errors.push(...mobileErrors);

  await mobilePage.goto(`${BASE}/pengaturan`);
  await settle(mobilePage, 2500);

  for (const t of tabs) {
    console.log(`Checking Mobile Tab: ${t.key}`);
    const tabBtn = mobilePage.getByRole('tab', { name: new RegExp(t.label, 'i') }).first();
    if (await tabBtn.isVisible().catch(() => false)) {
      await tabBtn.click();
      await mobilePage.waitForTimeout(600);
    }
    const shotPath = path.join(OUT_DIR, `mobile-${t.key}.png`);
    await mobilePage.screenshot({ path: shotPath, fullPage: true });

    // Measure tap targets (< 44px)
    const touchCheck = await mobilePage.evaluate(() => {
      const interactives = [...document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="tab"]')];
      const under44 = [];
      for (const el of interactives) {
        const rect = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (rect.width > 0 && rect.height > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.05) {
          if (rect.width < 44 || rect.height < 44) {
            const txt = (el.getAttribute('aria-label') || el.innerText || el.getAttribute('title') || el.tagName).trim().slice(0, 30);
            under44.push({
              tag: el.tagName.toLowerCase(),
              text: txt,
              size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
              className: el.className ? el.className.slice(0, 50) : '',
            });
          }
        }
      }
      return under44;
    });

    report.mobile[t.key] = {
      screenshot: shotPath,
      under44: touchCheck,
      hScroll: await mobilePage.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    };
  }

  await mobileBrowser.close();

  // 3. DARK MODE RUN
  console.log('Testing Dark Mode...');
  const { browser: darkBrowser, page: darkPage } = await newSession({ width: 1440, height: 900 });
  await darkPage.goto(`${BASE}/pengaturan?tab=pengaturan`);
  await settle(darkPage, 2000);

  // Toggle Dark Mode button in Sistem & Tampilan tab
  const darkThemeBtn = darkPage.getByRole('button', { name: /Gelap/i }).first();
  if (await darkThemeBtn.isVisible().catch(() => false)) {
    await darkThemeBtn.click();
    await darkPage.waitForTimeout(600);
  } else {
    await darkPage.evaluate(() => document.documentElement.classList.add('dark'));
  }

  for (const t of tabs) {
    const tabBtn = darkPage.getByRole('tab', { name: new RegExp(t.label, 'i') }).first();
    if (await tabBtn.isVisible().catch(() => false)) {
      await tabBtn.click();
      await darkPage.waitForTimeout(600);
    }
    const shotPath = path.join(OUT_DIR, `dark-${t.key}.png`);
    await darkPage.screenshot({ path: shotPath, fullPage: true });

    const measures = await darkPage.evaluate(MEASURE);
    report.darkMode[t.key] = {
      screenshot: shotPath,
      measures,
    };
  }

  await darkBrowser.close();

  fs.writeFileSync(path.join(OUT_DIR, 'audit-result.json'), JSON.stringify(report, null, 2));
  console.log('Audit completed successfully. Report saved to audit-result.json');
}

run().catch((e) => {
  console.error('Audit failed:', e);
  process.exit(1);
});
