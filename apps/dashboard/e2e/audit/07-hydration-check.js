const { newSession, settle } = require('./lib');

(async () => {
  const routes = ['/cv', '/design-system', '/beranda', '/tracker'];
  const { browser, page, errors } = await newSession();
  
  console.log('--- Testing Hydration and Console Errors ---');
  let hasHydrationError = false;

  for (const r of routes) {
    const routeErrors = [];
    const onConsole = (msg) => {
      const text = msg.text();
      if (msg.type() === 'error' || /hydration|react-dom|did not match|mismatch/i.test(text)) {
        routeErrors.push(text);
      }
    };
    page.on('console', onConsole);

    await page.goto('http://localhost:3000' + r);
    await settle(page, 4000);

    const hydrationFails = routeErrors.filter((e) => /hydration|did not match|hydrating/i.test(e));
    if (hydrationFails.length > 0) {
      console.log(`[FAIL] ${r} has hydration errors:`);
      hydrationFails.forEach((f) => console.log('   ->', f));
      hasHydrationError = true;
    } else {
      console.log(`[PASS] ${r}: 0 hydration errors`);
    }

    page.off('console', onConsole);
  }

  await browser.close();
  if (hasHydrationError) {
    process.exit(1);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
