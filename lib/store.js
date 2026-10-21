const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const CURRENT_VERSION = 2;
const IN_FLIGHT = new Set(['starting', 'working', 'stopping']);

function defaultState() {
  return { version: CURRENT_VERSION, orders: [], attempts: [], candidates: [], currentCandidateId: null };
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }

class Store {
  constructor(root, { now = () => new Date() } = {}) {
    this.root = root;
    this.file = path.join(root, 'state.json');
    this.candidatesDir = path.join(root, 'candidates');
    this.workspacesDir = path.join(root, 'workspaces');
    this.referencesDir = path.join(root, 'references');
    this.now = now;
    fs.mkdirSync(this.candidatesDir, { recursive: true });
    fs.mkdirSync(this.workspacesDir, { recursive: true });
    fs.mkdirSync(this.referencesDir, { recursive: true });
    this.state = this.load();
  }

  timestamp() { return this.now().toISOString(); }

  load() {
    let state;
    try { state = JSON.parse(fs.readFileSync(this.file, 'utf8')); }
    catch (error) {
      if (error.code !== 'ENOENT') throw new Error(`Cannot read state: ${error.message}`);
      state = defaultState();
      this.write(state);
      return state;
    }
    if (!Number.isInteger(state.version)) throw new Error('State schema version is missing.');
    if (state.version > CURRENT_VERSION) throw new Error(`State schema ${state.version} is newer than supported schema ${CURRENT_VERSION}.`);
    if (state.version < CURRENT_VERSION) state = this.migrate(state);
    this.assertShape(state);
    return state;
  }

  migrate(original) {
    let state = clone(original);
    const originalVersion = state.version;
    const backup = path.join(this.root, `state.v${originalVersion}.backup.json`);
    if (!fs.existsSync(backup)) fs.writeFileSync(backup, `${JSON.stringify(original, null, 2)}\n`, { flag: 'wx' });
    if (state.version === 1) {
      const attempts = [];
      for (const order of state.orders || []) {
        order.attemptIds ||= [];
        for (const attemptId of order.attemptIds) {
          const candidate = (state.candidates || []).find((item) => item.attemptId === attemptId);
          attempts.push({
            id: attemptId,
            orderId: order.id,
            correction: candidate?.correction || '',
            parentCandidateId: candidate?.parentCandidateId || null,
            workspace: path.join(this.workspacesDir, attemptId),
            createdAt: candidate?.createdAt || order.createdAt || this.timestamp(),
            completedAt: candidate?.createdAt || null,
            status: candidate ? 'completed' : 'legacy',
            label: candidate ? 'Candidate preserved during migration' : 'Imported attempt with unknown terminal state',
            candidateId: candidate?.id || null,
            workerThreadId: candidate?.workerThreadId || null,
            model: candidate?.model || null,
            events: []
          });
        }
      }
      state.attempts = attempts;
      state.version = 2;
    }
    this.assertShape(state);
    this.write(state);
    return state;
  }

  assertShape(state) {
    if (state.version !== CURRENT_VERSION) throw new Error(`Unsupported state schema ${state.version}.`);
    for (const key of ['orders', 'attempts', 'candidates']) {
      if (!Array.isArray(state[key])) throw new Error(`State field ${key} must be an array.`);
    }
  }

  write(state = this.state) {
    fs.mkdirSync(this.root, { recursive: true });
    const temp = `${this.file}.tmp`;
    fs.writeFileSync(temp, `${JSON.stringify(state, null, 2)}\n`);
    fs.renameSync(temp, this.file);
  }

  id(prefix) { return `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`; }

  createOrder(concept, reference = '') {
    const order = { id: this.id('order'), concept, reference, createdAt: this.timestamp(), attemptIds: [] };
    this.state.orders.unshift(order);
    this.write();
    return order;
  }

  createAttempt(order, correction = '', parentCandidateId = null) {
    const id = this.id('attempt');
    const workspace = path.join(this.workspacesDir, id);
    fs.mkdirSync(workspace, { recursive: false });
    const attempt = {
      id, orderId: order.id, correction, parentCandidateId, workspace,
      createdAt: this.timestamp(), completedAt: null, status: 'starting',
      label: 'Opening a fresh Codex session', candidateId: null,
      workerThreadId: null, turnId: null, model: null, events: []
    };
    order.attemptIds.push(id);
    this.state.attempts.unshift(attempt);
    this.write();
    return attempt;
  }

  updateAttempt(id, patch) {
    const attempt = this.getAttempt(id);
    if (!attempt) return null;
    Object.assign(attempt, patch);
    if (['completed', 'failed', 'cancelled', 'interrupted'].includes(attempt.status) && !attempt.completedAt) attempt.completedAt = this.timestamp();
    this.write();
    return attempt;
  }

  appendAttemptEvent(id, event) {
    const attempt = this.getAttempt(id);
    if (!attempt) return null;
    attempt.events ||= [];
    attempt.events.push(event);
    if (attempt.events.length > 300) attempt.events.splice(0, attempt.events.length - 300);
    this.write();
    return attempt;
  }

  recoverInFlightAttempts() {
    const recovered = [];
    for (const attempt of this.state.attempts) {
      if (!IN_FLIGHT.has(attempt.status)) continue;
      attempt.status = 'interrupted';
      attempt.label = 'Interrupted by application restart';
      attempt.completedAt = this.timestamp();
      attempt.events ||= [];
      attempt.events.push({ at: attempt.completedAt, method: 'factory/recovered', detail: 'In-flight work was reconciled after application restart.' });
      recovered.push(attempt);
    }
    if (recovered.length) this.write();
    return recovered;
  }

  latestAttempt() {
    return [...this.state.attempts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] || null;
  }

  saveCandidate(attempt, html, metadata = {}) {
    const id = this.id('candidate');
    const dir = path.join(this.candidatesDir, id);
    fs.mkdirSync(dir, { recursive: false });
    const candidatePath = path.join(dir, 'index.html');
    fs.writeFileSync(candidatePath, html, { flag: 'wx' });
    const candidate = {
      id, attemptId: attempt.id, orderId: attempt.orderId, parentCandidateId: attempt.parentCandidateId,
      correction: attempt.correction, status: 'candidate', createdAt: this.timestamp(),
      path: candidatePath, ...metadata
    };
    this.state.candidates.unshift(candidate);
    this.state.currentCandidateId = id;
    const storedAttempt = this.getAttempt(attempt.id);
    if (storedAttempt) storedAttempt.candidateId = id;
    this.write();
    return candidate;
  }

  mark(id, status) {
    const candidate = this.state.candidates.find((item) => item.id === id);
    if (!candidate) return null;
    candidate.status = status;
    candidate.updatedAt = this.timestamp();
    if (status !== 'shelved') this.state.currentCandidateId = id;
    this.write();
    return candidate;
  }

  renameCandidate(id, name) {
    const candidate = this.getCandidate(id);
    if (!candidate) return null;
    const clean = String(name || '').trim().replace(/\s+/g, ' ').slice(0, 80);
    if (!clean) throw new Error('Candidate name cannot be empty.');
    candidate.name = clean;
    candidate.updatedAt = this.timestamp();
    this.write();
    return candidate;
  }

  saveReference(name, bytes) {
    const id = this.id('reference');
    const safeName = path.basename(String(name || 'reference.bin')).replace(/[^a-zA-Z0-9._ -]/g, '_').slice(0, 120) || 'reference.bin';
    const dir = path.join(this.referencesDir, id);
    fs.mkdirSync(dir, { recursive: false });
    const referencePath = path.join(dir, safeName);
    fs.writeFileSync(referencePath, bytes, { flag: 'wx' });
    return { id, name: safeName, path: referencePath, size: bytes.length };
  }

  getAttempt(id) { return this.state.attempts.find((item) => item.id === id); }
  getCandidate(id) { return this.state.candidates.find((item) => item.id === id); }
  getOrder(id) { return this.state.orders.find((item) => item.id === id); }
}

module.exports = { Store, defaultState, CURRENT_VERSION };
