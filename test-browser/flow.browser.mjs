import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const projectRoot = path.resolve(import.meta.dirname, '..');
const chromeBin = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function eventually(check, timeout = 8000) {
  const deadline = Date.now() + timeout;
  let last;
  while (Date.now() < deadline) {
    try { if (await check()) return; } catch (error) { last = error; }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw last || new Error('Condition did not become true before timeout.');
}

function startServer(port, dataRoot) {
  return spawn(process.execPath, ['server.js'], {
    cwd: projectRoot,
    env: { ...process.env, PORT: String(port), ATOMIC_DATA_DIR: dataRoot, ATOMIC_TEST_MODE: '1', ATOMIC_FAKE_DELAY: '450' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

async function connectCdp(debugPort) {
  let pages;
  await eventually(async () => {
    const response = await fetch(`http://127.0.0.1:${debugPort}/json`);
    pages = await response.json();
    return pages.some((item) => item.type === 'page');
  });
  const page = pages.find((item) => item.type === 'page');
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let nextId = 1;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });
  return {
    send(method, params = {}) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() { socket.close(); }
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

test('browser workflow covers lifecycle, failure recovery, backup, and restart', { timeout: 60000 }, async (t) => {
  assert.equal(fs.existsSync(chromeBin), true, `Chrome not found at ${chromeBin}`);
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-browser-'));
  const dataRoot = path.join(scratch, 'data');
  const profile = path.join(scratch, 'chrome');
  const port = 4600 + (process.pid % 200);
  const debugPort = 9400 + (process.pid % 200);
  let server = startServer(port, dataRoot);
  let chrome;
  let cdp;
  t.after(async () => {
    cdp?.close();
    chrome?.kill('SIGTERM');
    server?.kill('SIGTERM');
  });
  await eventually(async () => (await fetch(`http://127.0.0.1:${port}/api/state`)).ok);
  chrome = spawn(chromeBin, [
    '--headless=new', '--disable-gpu', '--disable-background-networking', '--no-first-run',
    `--user-data-dir=${profile}`, `--remote-debugging-port=${debugPort}`, `http://127.0.0.1:${port}/`
  ], { stdio: 'ignore' });
  cdp = await connectCdp(debugPort);
  t.diagnostic('connected to browser');
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await eventually(() => evaluate(cdp, 'document.readyState === "complete" && !!document.querySelector("#issue")'));
  t.diagnostic('panel ready');

  await evaluate(cdp, `(() => {
    document.querySelector('#concept').value = 'Browser test toy';
    const transfer = new DataTransfer();
    transfer.items.add(new File(['read only reference'], 'reference.txt', {type:'text/plain'}));
    document.querySelector('#referenceFile').files = transfer.files;
    document.querySelector('#issue').click();
  })()`);
  await eventually(() => evaluate(cdp, `fetch('/api/state').then(r=>r.json()).then(s=>s.candidates.length===1&&!s.worker.busy)`));
  t.diagnostic('initial candidate completed');

  await evaluate(cdp, `(() => { document.querySelector('#rework').click(); document.querySelector('#correction').value='Make the test warmer'; document.querySelector('#submitRework').click(); })()`);
  await eventually(() => evaluate(cdp, `fetch('/api/state').then(r=>r.json()).then(s=>s.candidates.length===2&&!s.worker.busy)`));
  t.diagnostic('rework completed');
  await evaluate(cdp, `document.querySelectorAll('.history-item')[1].click()`);
  await evaluate(cdp, `document.querySelector('#provenance').open=true`);
  assert.match(await evaluate(cdp, `document.querySelector('#provenanceBody').innerText`), /Make the test warmer/);
  t.diagnostic('provenance verified');

  await evaluate(cdp, `document.querySelectorAll('.history-item')[0].click()`);
  await evaluate(cdp, `document.querySelector('#compareCandidate').click()`);
  const comparison = await evaluate(cdp, `({visible:!document.querySelector('#comparePanel').hidden,frames:[...document.querySelectorAll('#comparePanel iframe')].map(f=>f.getAttribute('src'))})`);
  assert.equal(comparison.visible, true);
  assert.equal(comparison.frames.every((src) => src.startsWith('/preview/candidate-')), true);
  await evaluate(cdp, `document.querySelector('#closeCompare').click()`);
  await evaluate(cdp, `document.querySelector('#keep').click()`);
  await eventually(() => evaluate(cdp, `fetch('/api/state').then(r=>r.json()).then(s=>s.candidates[0].status==='kept')`));
  await evaluate(cdp, `(() => { document.querySelector('#candidateName').value='Warm Browser Toy'; document.querySelector('#saveCandidateName').click(); })()`);
  await eventually(() => evaluate(cdp, `fetch('/api/state').then(r=>r.json()).then(s=>s.candidates[0].name==='Warm Browser Toy')`));
  t.diagnostic('keep and rename verified');

  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: false });
  await new Promise((resolve) => setTimeout(resolve, 300));
  const responsive = await evaluate(cdp, `(() => {
    const boxes=[...document.querySelectorAll('.order-card,.floor,.status-card,.history-card')].map(e=>e.getBoundingClientRect());
    return {layout:document.querySelector('main').dataset.layout, overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth, overlap:boxes.some((a,i)=>boxes.slice(i+1).some(b=>a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y))};
  })()`);
  assert.deepEqual(responsive, { layout: 'stack', overflow: false, overlap: false });
  t.diagnostic('responsive layout verified');
  const accessibility = await evaluate(cdp, `(() => ({
    unlabeledInputs:[...document.querySelectorAll('input,textarea')].filter(e=>!e.hidden&&!document.querySelector('label[for="'+e.id+'"]')).map(e=>e.id),
    untitledFrames:[...document.querySelectorAll('iframe')].filter(e=>!e.title).length,
    unnamedButtons:[...document.querySelectorAll('button')].filter(e=>!e.textContent.trim()&&!e.getAttribute('aria-label')).length
  }))()`);
  assert.deepEqual(accessibility, { unlabeledInputs: [], untitledFrames: 0, unnamedButtons: 0 });
  await cdp.send('Emulation.clearDeviceMetricsOverride');

  await evaluate(cdp, `(() => { document.querySelector('#concept').value='Cancelled browser test'; document.querySelector('#referenceFile').value=''; document.querySelector('#issue').click(); })()`);
  await eventually(() => evaluate(cdp, `fetch('/api/state').then(r=>r.json()).then(s=>s.worker.busy)`));
  await evaluate(cdp, `document.querySelector('#stop').click()`);
  await eventually(() => evaluate(cdp, `fetch('/api/state').then(r=>r.json()).then(s=>s.active.status==='cancelled')`));
  t.diagnostic('stop verified');

  for (const scenario of [
    ['MALFORMED_TEST', 'Candidate validation failed'],
    ['FAILED_TEST', 'Synthetic worker failure'],
    ['DISCONNECT_TEST', 'Worker disconnected']
  ]) {
    await evaluate(cdp, `(() => { document.querySelector('#concept').value=${JSON.stringify(scenario[0])}; document.querySelector('#issue').click(); })()`);
    await eventually(() => evaluate(cdp, `fetch('/api/state').then(r=>r.json()).then(s=>!s.worker.busy&&s.active.status==='failed'&&s.active.label.includes(${JSON.stringify(scenario[1])}))`));
    assert.equal(await evaluate(cdp, `fetch('/api/state').then(r=>r.json()).then(s=>s.candidates.length)`), 2);
    t.diagnostic(`${scenario[0]} recovered without presenting a candidate`);
  }
  assert.equal(await evaluate(cdp, `fetch('/api/state').then(r=>r.json()).then(s=>s.worker.connected)`), false);
  const backup = await evaluate(cdp, `fetch('/api/backup').then(r=>r.json()).then(b=>({format:b.format,count:b.candidates.length}))`);
  assert.deepEqual(backup, { format: 'atomic-factory-backup', count: 2 });
  t.diagnostic('backup verified');

  server.kill('SIGTERM');
  await new Promise((resolve) => server.once('exit', resolve));
  server = startServer(port, dataRoot);
  await eventually(async () => (await fetch(`http://127.0.0.1:${port}/api/state`)).ok);
  await cdp.send('Page.reload', { ignoreCache: true });
  await eventually(() => evaluate(cdp, `document.readyState==='complete' && document.querySelectorAll('.history-item').length===2`));
  t.diagnostic('panel reloaded after restart');
  const restored = await evaluate(cdp, `fetch('/api/state').then(r=>r.json()).then(s=>({count:s.candidates.length,kept:s.candidates.some(c=>c.status==='kept'&&c.name==='Warm Browser Toy')}))`);
  assert.deepEqual(restored, { count: 2, kept: true });
  const stored = JSON.parse(fs.readFileSync(path.join(dataRoot, 'state.json')));
  assert.equal(stored.version, 2);
  const referencedOrder = stored.orders.find((order) => order.concept === 'Browser test toy');
  assert.equal(referencedOrder.reference.includes(path.join('references', 'reference-')), true);
});
