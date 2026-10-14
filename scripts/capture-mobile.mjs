import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;

async function run() {
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--remote-allow-origins=*',
    '--no-sandbox',
    '--disable-gpu',
    '--user-data-dir=' + path.resolve('.chrome-temp-user-data')
  ]);

  // Wait for Chrome to listen
  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    const verRes = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    const verData = await verRes.json();
    const browserWs = new WebSocket(verData.webSocketDebuggerUrl);
    await new Promise((resolve) => { browserWs.onopen = resolve; });

    let bId = 1;
    function bSend(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = bId++;
        const handler = (e) => {
          const data = JSON.parse(e.data);
          if (data.id === msgId) {
            browserWs.removeEventListener('message', handler);
            if (data.error) reject(data.error);
            else resolve(data.result);
          }
        };
        browserWs.addEventListener('message', handler);
        browserWs.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    const { targetId } = await bSend('Target.createTarget', { url: 'http://localhost:3003' });
    const pageWsUrl = `ws://127.0.0.1:${PORT}/devtools/page/${targetId}`;
    const ws = new WebSocket(pageWsUrl);
    await new Promise((resolve) => { ws.onopen = resolve; });

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        const handler = (e) => {
          const data = JSON.parse(e.data);
          if (data.id === msgId) {
            ws.removeEventListener('message', handler);
            if (data.error) reject(data.error);
            else resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 0, type: 'portraitPrimary' }
    });

    await send('Page.navigate', { url: 'http://localhost:3003' });

    // Wait for network and DOM to settle
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Get metrics
    const metrics = await send('Page.getLayoutMetrics');
    const contentSize = metrics.contentSize || metrics.cssContentSize;
    console.log('Page content size:', contentSize);

    // 1. Capture full page
    const fullShot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: {
        x: 0,
        y: 0,
        width: 390,
        height: contentSize.height,
        scale: 1
      }
    });
    fs.writeFileSync('d:\\cuti\\enhancement-mobile-full.png', Buffer.from(fullShot.data, 'base64'));
    console.log('Saved enhancement-mobile-full.png, total height:', contentSize.height);

    // 2. Capture consecutive viewports (scrollY = 0, 750, 1500...)
    const totalHeight = contentSize.height;
    let index = 0;
    for (let y = 0; y < totalHeight; y += 750) {
      await send('Runtime.evaluate', {
        expression: `window.scrollTo(0, ${y})`
      });
      await new Promise((resolve) => setTimeout(resolve, 300));
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`d:\\cuti\\enhancement-mobile-part-${index}.png`, Buffer.from(shot.data, 'base64'));
      console.log(`Saved enhancement-mobile-part-${index}.png at y=${y}`);
      index++;
    }

    ws.close();
  } finally {
    chromeProcess.kill();
  }
}

run().catch(console.error);
