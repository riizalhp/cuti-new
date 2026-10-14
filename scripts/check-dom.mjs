import fs from 'fs';

async function run() {
  const ver = await (await fetch('http://127.0.0.1:9222/json/version')).json();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (m, p={}) => new Promise((res, rej) => {
    const cur = id++;
    const h = e => {
      const d = JSON.parse(e.data);
      if (d.id === cur) { ws.removeEventListener('message', h); d.error ? rej(d.error) : res(d.result); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: cur, method: m, params: p }));
  });
  const { targetId } = await send('Target.createTarget', { url: 'http://localhost:3003' });
  const pws = new WebSocket('ws://127.0.0.1:9222/devtools/page/' + targetId);
  await new Promise(r => pws.onopen = r);
  let pid = 1;
  const psend = (m, p={}) => new Promise((res, rej) => {
    const cur = pid++;
    const h = e => {
      const d = JSON.parse(e.data);
      if (d.id === cur) { pws.removeEventListener('message', h); d.error ? rej(d.error) : res(d.result); }
    };
    pws.addEventListener('message', h);
    pws.send(JSON.stringify({ id: cur, method: m, params: p }));
  });
  await psend('Page.enable');
  await new Promise(r => setTimeout(r, 1500));
  const res = await psend('Runtime.evaluate', {
    expression: `(() => {
      const els = Array.from(document.querySelectorAll('*'));
      return els.filter(el => {
        const style = window.getComputedStyle(el);
        return style.position === 'fixed' || style.position === 'sticky';
      }).map(el => ({
        tag: el.tagName,
        id: el.id,
        className: el.className,
        position: window.getComputedStyle(el).position,
        zIndex: window.getComputedStyle(el).zIndex,
        rect: {
          top: el.getBoundingClientRect().top,
          bottom: el.getBoundingClientRect().bottom,
          left: el.getBoundingClientRect().left,
          width: el.getBoundingClientRect().width,
          height: el.getBoundingClientRect().height
        }
      }));
    })()`,
    returnByValue: true
  });
  console.log('Fixed/Sticky elements:', JSON.stringify(res.result.value, null, 2));
  pws.close();
  ws.close();
}

run().catch(console.error);
