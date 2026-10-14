const { BASE, newSession, settle, MEASURE, DIALOG_INFO, auditLayer, path } = require('./lib');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../../../../.playwright-mcp/review/mailer-audit-live');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  console.log('=== STARTING AUDIT /mailer (Desktop & Mobile) ===');
  const report = {
    url: `${BASE}/mailer`,
    timestamp: new Date().toISOString(),
    desktop: {},
    mobile: {},
    drawers: {},
    forbiddenTerms: [],
    violations: {
      tinyTouchTargetsMobile: [],
      contrastFails: [],
      horizontalOverflowMobile: [],
      unnamedControls: [],
    },
  };

  // Helper to check touch targets specifically for mobile (width < 44 or height < 44)
  const CHECK_MOBILE_TARGETS = () => {
    const scope = document.querySelector('main') || document.body;
    const elements = [...scope.querySelectorAll('button, a[href], [role="button"], [role="tab"], select, input:not([type="hidden"]), textarea')];
    const results = [];
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (rect.width === 0 || rect.height === 0 || style.visibility === 'hidden' || style.display === 'none') continue;
      // Skip inline links inside paragraphs that naturally wrap
      if (style.display === 'inline' && el.closest('p, li')) continue;

      const label = (el.getAttribute('aria-label') || el.innerText || el.getAttribute('title') || el.getAttribute('placeholder') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);
      if (rect.width < 44 || rect.height < 44) {
        results.push({
          tag: el.tagName.toLowerCase(),
          label,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          classes: el.className ? String(el.className).slice(0, 60) : '',
        });
      }
    }
    return results;
  };

  // Helper to check drawer elements touch targets
  const CHECK_DRAWER_TARGETS = (drawerSel) => {
    const scope = document.querySelector(drawerSel || '[role="dialog"]') || document.body;
    const elements = [...scope.querySelectorAll('button, a[href], [role="button"], select, input:not([type="hidden"]), textarea')];
    const results = [];
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (rect.width === 0 || rect.height === 0 || style.visibility === 'hidden' || style.display === 'none') continue;
      const label = (el.getAttribute('aria-label') || el.innerText || el.getAttribute('title') || el.getAttribute('placeholder') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);
      if (rect.width < 44 || rect.height < 44) {
        results.push({
          tag: el.tagName.toLowerCase(),
          label,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          classes: el.className ? String(el.className).slice(0, 60) : '',
        });
      }
    }
    return results;
  };

  // 1. DESKTOP AUDIT
  console.log('\n--- 1. DESKTOP AUDIT (1440x900) ---');
  const desktop = await newSession({ width: 1440, height: 900 });
  await desktop.page.goto(`${BASE}/mailer`);
  await settle(desktop.page, 2000);

  const tabs = [
    { key: 'cover-letter', label: 'Surat Lamaran' },
    { key: 'single', label: 'Kirim Cepat' },
    { key: 'batch', label: 'Kirim Massal' },
    { key: 'smtp', label: 'Akun Pengirim' },
  ];

  for (const t of tabs) {
    console.log(`Checking Desktop Tab: ${t.key}`);
    const tabBtn = desktop.page.getByRole('tab', { name: new RegExp(t.label, 'i') }).first();
    if (await tabBtn.isVisible().catch(() => false)) {
      await tabBtn.click();
      await desktop.page.waitForTimeout(600);
    }
    const measures = await desktop.page.evaluate(MEASURE);
    report.desktop[t.key] = measures;
    await desktop.page.screenshot({ path: path.join(OUT_DIR, `desktop-tab-${t.key}.png`), fullPage: true });
  }

  // 2. MOBILE AUDIT (390x844 - iPhone 14/15 standard)
  console.log('\n--- 2. MOBILE AUDIT (390x844) ---');
  const mobile = await newSession({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobile.page.goto(`${BASE}/mailer`);
  await settle(mobile.page, 2000);

  for (const t of tabs) {
    console.log(`Checking Mobile Tab: ${t.key}`);
    const tabBtn = mobile.page.getByRole('tab', { name: new RegExp(t.label, 'i') }).first();
    if (await tabBtn.isVisible().catch(() => false)) {
      await tabBtn.click();
      await mobile.page.waitForTimeout(600);
    }
    const measures = await mobile.page.evaluate(MEASURE);
    const touchFails = await mobile.page.evaluate(CHECK_MOBILE_TARGETS);
    const hScroll = await mobile.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

    report.mobile[t.key] = {
      measures,
      touchFails,
      hScroll,
    };

    if (hScroll > 0) {
      report.violations.horizontalOverflowMobile.push({ tab: t.key, overflowPx: hScroll });
    }
    for (const tf of touchFails) {
      if (!report.violations.tinyTouchTargetsMobile.some(x => x.label === tf.label && x.tag === tf.tag)) {
        report.violations.tinyTouchTargetsMobile.push({ tab: t.key, ...tf });
      }
    }

    await mobile.page.screenshot({ path: path.join(OUT_DIR, `mobile-tab-${t.key}.png`), fullPage: true });
  }

  // 3. DRAWERS AUDIT ON MOBILE
  console.log('\n--- 3. MOBILE DRAWERS AUDIT ---');
  // A. Drawer Kirim Cepat (Single Send)
  console.log('Testing Single Send Drawer on mobile...');
  const openSingleBtn = mobile.page.getByRole('button', { name: /Form Pengiriman Email|Buka Form Pengiriman/i }).first();
  if (await openSingleBtn.isVisible().catch(() => false)) {
    await openSingleBtn.click();
    await mobile.page.waitForTimeout(800);
    const singleDrawerFails = await mobile.page.evaluate(CHECK_DRAWER_TARGETS, '[role="dialog"]');
    const singleDrawerMeasures = await mobile.page.evaluate(MEASURE, '[role="dialog"]');
    report.drawers['singleSend'] = {
      touchFails: singleDrawerFails,
      measures: singleDrawerMeasures,
    };
    await mobile.page.screenshot({ path: path.join(OUT_DIR, `mobile-drawer-single-send.png`) });
    // Test Escape to close
    await mobile.page.keyboard.press('Escape');
    await mobile.page.waitForTimeout(600);
  }

  // B. Drawer Hubungkan Akun (SMTP)
  console.log('Testing SMTP Drawer on mobile...');
  const smtpTabBtn = mobile.page.getByRole('tab', { name: /Akun Pengirim/i }).first();
  if (await smtpTabBtn.isVisible().catch(() => false)) {
    await smtpTabBtn.click();
    await mobile.page.waitForTimeout(600);
  }
  const openSmtpBtn = mobile.page.getByRole('button', { name: /Hubungkan Akun/i }).first();
  if (await openSmtpBtn.isVisible().catch(() => false)) {
    await openSmtpBtn.click();
    await mobile.page.waitForTimeout(800);
    const smtpDrawerFails = await mobile.page.evaluate(CHECK_DRAWER_TARGETS, '[role="dialog"]');
    const smtpDrawerMeasures = await mobile.page.evaluate(MEASURE, '[role="dialog"]');
    report.drawers['smtpConnect'] = {
      touchFails: smtpDrawerFails,
      measures: smtpDrawerMeasures,
    };
    await mobile.page.screenshot({ path: path.join(OUT_DIR, `mobile-drawer-smtp-connect.png`) });
    await mobile.page.keyboard.press('Escape');
    await mobile.page.waitForTimeout(600);
  }

  // C. Drawer Tempel Loker (Job Description) in Cover Letter tab
  console.log('Testing Job Description Drawer on mobile...');
  const clTabBtn = mobile.page.getByRole('tab', { name: /Surat Lamaran/i }).first();
  if (await clTabBtn.isVisible().catch(() => false)) {
    await clTabBtn.click();
    await mobile.page.waitForTimeout(600);
  }
  const openJdBtn = mobile.page.getByRole('button', { name: /Tempel Teks Loker|Tempel Lengkap/i }).first();
  if (await openJdBtn.isVisible().catch(() => false)) {
    await openJdBtn.click();
    await mobile.page.waitForTimeout(800);
    const jdDrawerFails = await mobile.page.evaluate(CHECK_DRAWER_TARGETS, '[role="dialog"]');
    report.drawers['jobDescription'] = {
      touchFails: jdDrawerFails,
    };
    await mobile.page.screenshot({ path: path.join(OUT_DIR, `mobile-drawer-job-desc.png`) });
    await mobile.page.keyboard.press('Escape');
    await mobile.page.waitForTimeout(600);
  }

  // 4. FORBIDDEN WORDS CHECK (R-02 Em dash, AI words, etc.)
  const pageText = await mobile.page.evaluate(() => document.body.innerText);
  const emDashes = (pageText.match(/—/g) || []).length;
  if (emDashes > 0) {
    report.forbiddenTerms.push(`Found ${emDashes} em dashes (—)`);
  }
  const aiKeywords = pageText.match(/\b(AI|Artificial Intelligence|GPT|LLM|Generate|Generated|Prompt)\b/gi) || [];
  if (aiKeywords.length > 0) {
    report.forbiddenTerms.push(`Found forbidden AI keywords: ${[...new Set(aiKeywords)].join(', ')}`);
  }

  fs.writeFileSync(path.join(OUT_DIR, 'audit-summary.json'), JSON.stringify(report, null, 2));

  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`- Total Mobile Tiny Touch Targets (<44px): ${report.violations.tinyTouchTargetsMobile.length}`);
  console.log(`- Horizontal Overflow on Mobile: ${report.violations.horizontalOverflowMobile.length === 0 ? 'NONE (PASSED)' : JSON.stringify(report.violations.horizontalOverflowMobile)}`);
  console.log(`- Forbidden Terms: ${report.forbiddenTerms.length === 0 ? 'NONE (PASSED)' : report.forbiddenTerms.join(', ')}`);
  console.log('Sample Tiny Touch Targets on Mobile:');
  report.violations.tinyTouchTargetsMobile.slice(0, 10).forEach(t => {
    console.log(`  * [${t.tag}] "${t.label}" (${t.width}x${t.height}px) on tab ${t.tab}`);
  });

  await desktop.browser.close();
  await mobile.browser.close();
  console.log('\nAudit complete! Results saved in .playwright-mcp/review/mailer-audit-live');
}

run().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
