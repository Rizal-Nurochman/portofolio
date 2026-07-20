import http from 'node:http';
// Node 22 has a built-in global WebSocket

const PORT = 4477;

function get(path) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: PORT, path }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

// find chrome
import { execSync, spawn } from 'node:child_process';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const proc = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--remote-debugging-port=9333',
  '--window-size=1280,900', 'about:blank'
], { stdio: 'ignore' });

await new Promise(r => setTimeout(r, 1500));

// get ws target
const targets = JSON.parse(await new Promise((resolve, reject) => {
  http.get({ host: '127.0.0.1', port: 9333, path: '/json' }, (res) => {
    let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve(d));
  }).on('error', reject);
}));
const page = targets.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
function send(method, params={}) {
  return new Promise((resolve) => { const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({id:i,method,params})); });
}
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
});
await new Promise(r => ws.addEventListener('open', r, { once: true }));

await send('Page.enable');
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
await new Promise(r => setTimeout(r, 3500));

async function sampleCanvas() {
  const r = await send('Runtime.evaluate', { expression: `(() => {
    const c = document.querySelector('canvas');
    if (!c) return 'NO_CANVAS';
    const g = c.getContext('2d');
    // sample a horizontal strip in the middle where clouds drift
    const d = g.getImageData(0, Math.floor(c.height/2), c.width, 1).data;
    let sum = 0; for (let i=0;i<d.length;i+=40) sum += d[i];
    return String(sum);
  })()`, returnByValue: true });
  return r.result.value;
}

async function sampleGopher() {
  const r = await send('Runtime.evaluate', { expression: `(() => {
    const el = document.querySelector('[class*=companion]');
    if (!el) return 'NO_GOPHER';
    return el.style.transform || getComputedStyle(el).transform;
  })()`, returnByValue: true });
  return r.result.value;
}

const c1 = await sampleCanvas();
const g1 = await sampleGopher();
await new Promise(r => setTimeout(r, 900));
const c2 = await sampleCanvas();
const g2 = await sampleGopher();

console.log('reduce-motion FORCED ON (the condition that froze the old CSS version)');
console.log('canvas pixel-sum t1:', c1);
console.log('canvas pixel-sum t2:', c2);
console.log('canvas CHANGED:', c1 !== c2);
console.log('gopher transform t1:', g1);
console.log('gopher transform t2:', g2);
console.log('gopher CHANGED:', g1 !== g2);

ws.close();
proc.kill();
process.exit(0);
