const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const { Store } = require('./lib/store');
const { AppServerClient } = require('./lib/app-server');
const { FakeAppServerClient } = require('./lib/fake-app-server');
const { validateCandidate } = require('./lib/validator');
const { validateReference } = require('./lib/reference');
const { createBackup, importBackup } = require('./lib/backup');
const { assertLocalMutation, appDocumentHeaders } = require('./lib/http-security');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4317);
const HOST = '127.0.0.1';
const DATA_ROOT = process.env.ATOMIC_DATA_DIR ? path.resolve(process.env.ATOMIC_DATA_DIR) : path.join(ROOT, 'data');
const store = new Store(DATA_ROOT);
const clients = new Set();

function activeFromAttempt(attempt) {
  if (!attempt) return null;
  const order = store.getOrder(attempt.orderId);
  return {
    orderId: attempt.orderId, attemptId: attempt.id, concept: order?.concept || '',
    correction: attempt.correction || '', parentCandidateId: attempt.parentCandidateId || null,
    status: attempt.status, label: attempt.label || attempt.status, activity: [...(attempt.events || [])],
    startedAt: attempt.createdAt, completedAt: attempt.completedAt || undefined,
    candidateId: attempt.candidateId || undefined, threadId: attempt.workerThreadId || undefined,
    turnId: attempt.turnId || undefined, model: attempt.model || undefined
  };
}

const recoveredAttempts = store.recoverInFlightAttempts();
let active = activeFromAttempt(recoveredAttempts[0] || store.latestAttempt());
let workerConnected = false;

function attemptIsBusy(attempt = active) {
  return !!attempt && ['starting', 'working', 'stopping'].includes(attempt.status);
}

function cleanEvent(message) {
  const method = message.method || 'unknown';
  const params = message.params || {};
  let detail = '';
  const item = params.item;
  if (item?.type === 'commandExecution') detail = item.command || item.aggregatedOutput || '';
  else if (item?.type === 'fileChange') detail = `${item.changes?.length || 0} file change(s)`;
  else if (item?.type === 'agentMessage') detail = item.text || '';
  else if (method === 'worker/stderr') detail = params.text || '';
  else if (params.turn?.status) detail = params.turn.status;
  return { at: new Date().toISOString(), method, detail: detail.slice(0, 600) };
}

function broadcast(type, payload) {
  const body = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const response of clients) response.write(body);
}

function workerEvent(message) {
  if (message.method === 'worker/connected') workerConnected = true;
  if (message.method === 'worker/disconnected') workerConnected = false;
  const event = cleanEvent(message);
  if (attemptIsBusy()) {
    active.activity.push(event);
    if (active.activity.length > 200) active.activity.shift();
    if (!/delta$/i.test(message.method || '') && !/(tokenUsage|rateLimits|startupStatus)/i.test(message.method || '')) {
      store.appendAttemptEvent(active.attemptId, event);
    }
  }
  broadcast('activity', event);
  if (message.method === 'turn/completed' && active && message.params?.turn?.id === active.turnId) finishAttempt(message.params.turn);
  if (message.method === 'turn/started' && active) setStatus('working', 'Worker 01 is building');
  if (message.method === 'worker/disconnected' && attemptIsBusy()) {
    setStatus('failed', 'Worker disconnected before the attempt reached a terminal state');
  }
}

const WorkerClient = process.env.ATOMIC_TEST_MODE === '1' ? FakeAppServerClient : AppServerClient;
const appServer = new WorkerClient({ onEvent: workerEvent });

function setStatus(status, label, extra = {}) {
  if (active) {
    Object.assign(active, { status, label }, extra);
    store.updateAttempt(active.attemptId, {
      status, label, candidateId: active.candidateId || null,
      workerThreadId: active.threadId || null, turnId: active.turnId || null,
      model: active.model || null, completedAt: active.completedAt || null
    });
  }
  broadcast('state', snapshot());
}

function publicCandidate(candidate) {
  if (!candidate) return null;
  const order = store.getOrder(candidate.orderId);
  return { ...candidate, path: undefined, concept: order?.concept || '', previewUrl: `/preview/${candidate.id}` };
}

function snapshot() {
  const safeActive = active ? { ...active, activity: active.activity.slice(-80) } : null;
  if (safeActive) delete safeActive.workspace;
  return {
    worker: { name: 'Worker 01', connected: workerConnected, busy: attemptIsBusy() },
    active: safeActive,
    currentCandidateId: store.state.currentCandidateId,
    candidates: store.state.candidates.map(publicCandidate),
    orders: store.state.orders
  };
}

function promptFor(order, attempt, parentHtml = '') {
  const referenceLine = order.reference
    ? `A selected reference is available read-only at ${JSON.stringify(order.reference)}. Inspect it only if useful; never modify it.`
    : 'No reference material was selected.';
  const rework = attempt.correction ? `\nThis is a rework. Operator correction: ${JSON.stringify(attempt.correction)}\nThe previous presented candidate follows for context. Preserve what works, but create the new file from this correction:\n<previous_candidate>\n${parentHtml}\n</previous_candidate>` : '';
  return `You are Worker 01 in Atomic Factory. Build exactly one small, polished, playable atomic toy for this work order:\n\n${order.concept}\n\nAn atomic toy expresses one mechanic or concept and has exactly one range slider. Choose a fitting visual presentation. Create a complete, self-contained index.html in the current working directory using only inline HTML, CSS, and JavaScript. No libraries, network requests, external assets, forms, navigation, storage, popups, parent-window access, or credentials. It must work in a sandboxed iframe at any practical size. Include a concise title and a live value/readout. Use pointer-friendly controls and accessible labeling. Do not create any other files. Test the markup locally if useful. ${referenceLine}${rework}\n\nFinish only after index.html exists and is runnable.`;
}

async function begin({ concept, reference = '', orderId = null, candidateId = null, correction = '' }) {
  if (attemptIsBusy()) throw new Error('Worker 01 is already occupied.');
  await appServer.ready;
  let order;
  let parent = null;
  if (candidateId) {
    parent = store.getCandidate(candidateId);
    if (!parent) throw new Error('Previous candidate not found.');
    order = store.getOrder(parent.orderId);
  } else if (orderId) order = store.getOrder(orderId);
  else {
    if (!concept?.trim()) throw new Error('Enter a concept for the work order.');
    reference = validateReference(reference.trim());
    order = store.createOrder(concept.trim(), reference);
  }
  if (!order) throw new Error('Work order not found.');
  const attempt = store.createAttempt(order, correction.trim(), parent?.id || null);
  active = activeFromAttempt(attempt);
  broadcast('state', snapshot());
  const parentHtml = parent ? fs.readFileSync(parent.path, 'utf8') : '';
  try {
    const threadResult = await appServer.request('thread/start', {
      cwd: attempt.workspace,
      ephemeral: true,
      approvalPolicy: 'never',
      sandbox: 'workspace-write',
      runtimeWorkspaceRoots: [attempt.workspace],
      developerInstructions: 'Work only inside the provided attempt workspace. Never request broader access. Do not use the network. Follow the work order exactly.'
    });
    active.threadId = threadResult.thread.id;
    active.model = threadResult.model;
    active.sandbox = threadResult.sandbox;
    setStatus('starting', `Session ready · ${threadResult.model}`);
    const turnResult = await appServer.request('turn/start', {
      threadId: active.threadId,
      cwd: attempt.workspace,
      input: [{ type: 'text', text: promptFor(order, attempt, parentHtml) }],
      approvalPolicy: 'never',
      sandboxPolicy: { type: 'workspaceWrite', writableRoots: [attempt.workspace], networkAccess: false, excludeSlashTmp: true, excludeTmpdirEnvVar: true },
      runtimeWorkspaceRoots: [attempt.workspace]
    });
    active.turnId = turnResult.turn.id;
    setStatus('working', 'Worker 01 is building');
    return snapshot();
  } catch (error) {
    setStatus('failed', error.message);
    throw error;
  }
}

function finishAttempt(turn) {
  const current = active;
  if (!current) return;
  if (turn.status === 'interrupted' || turn.status === 'cancelled') return setStatus('cancelled', 'Work stopped and runtime confirmed cancellation');
  if (turn.status !== 'completed') return setStatus('failed', turn.error?.message || `Worker ended: ${turn.status}`);
  const attemptPath = path.join(store.workspacesDir, current.attemptId, 'index.html');
  try {
    const html = fs.readFileSync(attemptPath, 'utf8');
    const validation = validateCandidate(html);
    if (!validation.ok) throw new Error(`Candidate validation failed: ${validation.errors.join(' ')}`);
    const candidate = store.saveCandidate({ id: current.attemptId, orderId: current.orderId, correction: current.correction, parentCandidateId: current.parentCandidateId }, html, { workerThreadId: current.threadId, model: current.model });
    current.candidateId = candidate.id;
    setStatus('completed', 'Candidate ready', { completedAt: new Date().toISOString() });
  } catch (error) { setStatus('failed', error.message); }
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) throw new Error('Request too large.');
  }
  return body ? JSON.parse(body) : {};
}

async function readBytes(request, limit = 25_000_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw new Error(`Upload exceeds the ${Math.round(limit / 1_000_000)} MB local limit.`);
    chunks.push(chunk);
  }
  if (!size) throw new Error('Uploaded reference is empty.');
  return Buffer.concat(chunks, size);
}

function json(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'cross-origin-resource-policy': 'same-origin', 'x-content-type-options': 'nosniff' });
  response.end(JSON.stringify(value));
}

function staticFile(response, file, type) {
  const security = type.startsWith('text/html') ? appDocumentHeaders() : { 'x-content-type-options': 'nosniff', 'cross-origin-resource-policy': 'same-origin' };
  response.writeHead(200, { 'content-type': type, 'cache-control': 'no-store', ...security });
  fs.createReadStream(file).pipe(response);
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || HOST}`);
  try {
    assertLocalMutation(request);
    if (request.method === 'GET' && url.pathname === '/api/state') return json(response, 200, snapshot());
    if (request.method === 'GET' && url.pathname === '/api/backup') {
      const body = Buffer.from(`${JSON.stringify(createBackup(store), null, 2)}\n`);
      response.writeHead(200, {
        'content-type': 'application/json; charset=utf-8',
        'content-disposition': `attachment; filename="atomic-factory-${new Date().toISOString().slice(0, 10)}.json"`,
        'content-length': body.length,
        'cache-control': 'no-store',
        'cross-origin-resource-policy': 'same-origin',
        'x-content-type-options': 'nosniff'
      });
      return response.end(body);
    }
    if (request.method === 'POST' && url.pathname === '/api/backup/import') {
      const bundle = JSON.parse((await readBytes(request, 100_000_000)).toString('utf8'));
      const imported = importBackup(store, bundle);
      broadcast('state', snapshot());
      return json(response, 200, imported);
    }
    if (request.method === 'GET' && url.pathname === '/api/events') {
      response.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
      clients.add(response);
      response.write(`event: state\ndata: ${JSON.stringify(snapshot())}\n\n`);
      request.on('close', () => clients.delete(response));
      return;
    }
    if (request.method === 'POST' && url.pathname === '/api/orders') return json(response, 202, await begin(await readJson(request)));
    if (request.method === 'POST' && url.pathname === '/api/rework') return json(response, 202, await begin(await readJson(request)));
    if (request.method === 'POST' && url.pathname === '/api/references') {
      const name = request.headers['x-file-name'];
      if (!name || Array.isArray(name)) throw new Error('Reference filename is required.');
      const reference = store.saveReference(decodeURIComponent(name), await readBytes(request));
      return json(response, 201, reference);
    }
    if (request.method === 'POST' && url.pathname === '/api/stop') {
      if (!active?.threadId || !active?.turnId || !['starting', 'working', 'stopping'].includes(active.status)) throw new Error('No active work to stop.');
      setStatus('stopping', 'Interruption requested · waiting for runtime confirmation');
      await appServer.request('turn/interrupt', { threadId: active.threadId, turnId: active.turnId });
      return json(response, 202, snapshot());
    }
    if (request.method === 'POST' && url.pathname.startsWith('/api/candidates/')) {
      const [, , , id, action] = url.pathname.split('/');
      if (action === 'rename') {
        const candidate = store.renameCandidate(id, (await readJson(request)).name);
        if (!candidate) throw new Error('Candidate not found.');
        broadcast('state', snapshot());
        return json(response, 200, publicCandidate(candidate));
      }
      if (!['keep', 'shelve'].includes(action)) throw new Error('Unknown candidate action.');
      const candidate = store.mark(id, action === 'keep' ? 'kept' : 'shelved');
      if (!candidate) throw new Error('Candidate not found.');
      broadcast('state', snapshot());
      return json(response, 200, publicCandidate(candidate));
    }
    if (request.method === 'GET' && url.pathname.startsWith('/preview/')) {
      const candidate = store.getCandidate(url.pathname.slice('/preview/'.length));
      if (!candidate) return json(response, 404, { error: 'Candidate not found.' });
      response.writeHead(200, {
        'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store',
        'content-security-policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'self'",
        'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff'
      });
      return fs.createReadStream(candidate.path).pipe(response);
    }
    if (request.method === 'GET' && url.pathname.startsWith('/api/candidates/') && url.pathname.endsWith('/export')) {
      const id = url.pathname.split('/')[3];
      const candidate = store.getCandidate(id);
      if (!candidate) return json(response, 404, { error: 'Candidate not found.' });
      const filename = `${(candidate.name || id).replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-|-$/g, '') || id}.html`;
      response.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'content-disposition': `attachment; filename="${filename}"`,
        'content-length': fs.statSync(candidate.path).size,
        'cache-control': 'no-store',
        'cross-origin-resource-policy': 'same-origin',
        'x-content-type-options': 'nosniff'
      });
      return fs.createReadStream(candidate.path).pipe(response);
    }
    if (request.method === 'GET' && url.pathname === '/') return staticFile(response, path.join(ROOT, 'public/index.html'), 'text/html; charset=utf-8');
    if (request.method === 'GET' && url.pathname === '/app.js') return staticFile(response, path.join(ROOT, 'public/app.js'), 'text/javascript; charset=utf-8');
    if (request.method === 'GET' && url.pathname === '/styles.css') return staticFile(response, path.join(ROOT, 'public/styles.css'), 'text/css; charset=utf-8');
    json(response, 404, { error: 'Not found.' });
  } catch (error) { json(response, 400, { error: error.message }); }
});

server.listen(PORT, HOST, () => console.log(`Atomic Factory ready at http://${HOST}:${PORT}`));
let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const response of clients) response.end();
  clients.clear();
  appServer.close();
  server.close(() => process.exit(0));
  server.closeAllConnections?.();
  setTimeout(() => process.exit(0), 2000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
