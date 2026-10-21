const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Store, CURRENT_VERSION } = require('../lib/store');

test('kept candidates persist across Store restarts and rework preserves its parent', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-store-'));
  const first = new Store(root);
  const order = first.createOrder('one toy');
  const attempt1 = first.createAttempt(order);
  const candidate1 = first.saveCandidate(attempt1, '<!doctype html><input type="range">');
  first.mark(candidate1.id, 'kept');
  const attempt2 = first.createAttempt(order, 'make it warmer', candidate1.id);
  const candidate2 = first.saveCandidate(attempt2, '<!doctype html><input type="range">');
  const restarted = new Store(root);
  assert.equal(restarted.getCandidate(candidate1.id).status, 'kept');
  assert.equal(restarted.getCandidate(candidate2.id).parentCandidateId, candidate1.id);
  assert.equal(restarted.state.candidates.length, 2);
});

test('schema v1 migrates to the current version and preserves a backup', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-migrate-'));
  fs.writeFileSync(path.join(root, 'state.json'), JSON.stringify({
    version: 1,
    orders: [{ id: 'order-1', concept: 'test', reference: '', createdAt: '2026-01-01T00:00:00.000Z', attemptIds: ['attempt-1'] }],
    candidates: [{ id: 'candidate-1', attemptId: 'attempt-1', orderId: 'order-1', parentCandidateId: null, correction: '', status: 'kept', createdAt: '2026-01-01T00:01:00.000Z', path: '/preserved/index.html' }],
    currentCandidateId: 'candidate-1'
  }));
  const store = new Store(root);
  assert.equal(store.state.version, CURRENT_VERSION);
  assert.equal(store.state.attempts[0].candidateId, 'candidate-1');
  assert.equal(store.state.attempts[0].status, 'completed');
  assert.equal(fs.existsSync(path.join(root, 'state.v1.backup.json')), true);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'state.v1.backup.json'))).version, 1);
});

test('restart recovery interrupts in-flight attempts and preserves terminal attempts', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-recover-'));
  const store = new Store(root, { now: () => new Date('2026-02-01T00:00:00.000Z') });
  const order = store.createOrder('recovery');
  const running = store.createAttempt(order);
  store.updateAttempt(running.id, { status: 'working', label: 'building' });
  const terminal = store.createAttempt(order);
  store.updateAttempt(terminal.id, { status: 'cancelled', label: 'cancelled' });
  const recovered = store.recoverInFlightAttempts();
  assert.deepEqual(recovered.map((item) => item.id), [running.id]);
  assert.equal(store.getAttempt(running.id).status, 'interrupted');
  assert.equal(store.getAttempt(running.id).events.at(-1).method, 'factory/recovered');
  assert.equal(store.getAttempt(terminal.id).status, 'cancelled');
});

test('meaningful attempt events persist across reloads', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-events-'));
  const first = new Store(root);
  const order = first.createOrder('events');
  const attempt = first.createAttempt(order);
  first.appendAttemptEvent(attempt.id, { at: '2026-01-01T00:00:00.000Z', method: 'turn/started', detail: 'inProgress' });
  const restarted = new Store(root);
  assert.deepEqual(restarted.getAttempt(attempt.id).events, [{ at: '2026-01-01T00:00:00.000Z', method: 'turn/started', detail: 'inProgress' }]);
});

test('unknown future state schemas fail closed', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-future-'));
  fs.writeFileSync(path.join(root, 'state.json'), JSON.stringify({ version: CURRENT_VERSION + 1 }));
  assert.throws(() => new Store(root), /newer than supported/);
});

test('bounded activity and a substantial candidate history remain reloadable', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-history-'));
  const store = new Store(root);
  const order = store.createOrder('history');
  for (let index = 0; index < 150; index += 1) {
    const attempt = store.createAttempt(order, `revision ${index}`);
    store.saveCandidate(attempt, '<!doctype html><html><body><label for="x">X</label><input id="x" type="range"></body></html>');
  }
  const latest = store.state.attempts[0];
  for (let index = 0; index < 450; index += 1) store.appendAttemptEvent(latest.id, { at: new Date().toISOString(), method: 'test/event', detail: String(index) });
  assert.equal(store.getAttempt(latest.id).events.length, 300);
  const started = performance.now();
  const restarted = new Store(root);
  assert.equal(restarted.state.candidates.length, 150);
  assert.ok(performance.now() - started < 1000);
});
