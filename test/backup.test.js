const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Store } = require('../lib/store');
const { createBackup, importBackup } = require('../lib/backup');

const html = '<!doctype html><html><body><label for="x">X</label><input id="x" type="range"></body></html>';

test('backup round-trip restores orders, attempts, candidates, provenance, and copied references', () => {
  const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-backup-source-'));
  const source = new Store(sourceRoot);
  const reference = source.saveReference('shape.txt', Buffer.from('reference'));
  const order = source.createOrder('backup toy', reference.path);
  const attempt1 = source.createAttempt(order);
  const candidate1 = source.saveCandidate(attempt1, html);
  source.updateAttempt(attempt1.id, { status: 'completed', candidateId: candidate1.id });
  const attempt2 = source.createAttempt(order, 'make it round', candidate1.id);
  const candidate2 = source.saveCandidate(attempt2, html);
  source.updateAttempt(attempt2.id, { status: 'completed', candidateId: candidate2.id });
  const bundle = createBackup(source);

  const targetRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-backup-target-'));
  const target = new Store(targetRoot);
  const result = importBackup(target, bundle);
  assert.deepEqual(result, { orders: 1, attempts: 2, candidates: 2, references: 1 });
  assert.equal(target.getCandidate(candidate2.id).parentCandidateId, candidate1.id);
  assert.equal(fs.readFileSync(target.getCandidate(candidate1.id).path, 'utf8'), html);
  assert.equal(fs.readFileSync(target.getOrder(order.id).reference, 'utf8'), 'reference');
  assert.deepEqual(importBackup(target, bundle), { orders: 0, attempts: 0, candidates: 0, references: 0 });
});

test('backup import rejects a future state schema before mutation', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-backup-future-'));
  const target = new Store(root);
  const bundle = {
    format: 'atomic-factory-backup', backupVersion: 1,
    state: { version: 999, orders: [], attempts: [], candidates: [], currentCandidateId: null },
    candidates: [], references: []
  };
  assert.throws(() => importBackup(target, bundle), /unsupported state schema/);
  assert.equal(target.state.orders.length, 0);
});

test('backup import validates candidate source before mutation', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-backup-invalid-'));
  const target = new Store(root);
  const bundle = {
    format: 'atomic-factory-backup', backupVersion: 1,
    state: { version: 2, orders: [], attempts: [], candidates: [{ id: 'bad', path: '/bad' }], currentCandidateId: null },
    candidates: [{ id: 'bad', html: '<html>bad</html>' }], references: []
  };
  assert.throws(() => importBackup(target, bundle), /failed validation/);
  assert.equal(target.state.candidates.length, 0);
});
