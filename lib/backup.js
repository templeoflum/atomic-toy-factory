const fs = require('node:fs');
const path = require('node:path');
const { validateCandidate } = require('./validator');
const { CURRENT_VERSION } = require('./store');

const BACKUP_FORMAT = 'atomic-factory-backup';
const BACKUP_VERSION = 1;

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function within(child, parent) { const relative = path.relative(parent, child); return relative && !relative.startsWith('..') && !path.isAbsolute(relative); }

function createBackup(store) {
  const state = clone(store.state);
  const canonicalReferencesDir = fs.realpathSync(store.referencesDir);
  const candidates = state.candidates.map((candidate) => ({ id: candidate.id, html: fs.readFileSync(candidate.path, 'utf8') }));
  const references = [];
  const seen = new Set();
  for (const order of state.orders) {
    if (!order.reference || seen.has(order.reference) || !fs.existsSync(order.reference)) continue;
    const canonical = fs.realpathSync(order.reference);
    if (!within(canonical, canonicalReferencesDir)) continue;
    seen.add(order.reference);
    references.push({ path: order.reference, name: path.basename(canonical), data: fs.readFileSync(canonical).toString('base64') });
  }
  return { format: BACKUP_FORMAT, backupVersion: BACKUP_VERSION, createdAt: new Date().toISOString(), state, candidates, references };
}

function importBackup(store, bundle) {
  if (!bundle || bundle.format !== BACKUP_FORMAT || bundle.backupVersion !== BACKUP_VERSION) throw new Error('Unsupported Atomic Factory backup.');
  if (!bundle.state || !Array.isArray(bundle.state.orders) || !Array.isArray(bundle.state.attempts) || !Array.isArray(bundle.state.candidates)) throw new Error('Backup state is incomplete.');
  if (!Number.isInteger(bundle.state.version) || bundle.state.version > CURRENT_VERSION) throw new Error('Backup uses an unsupported state schema.');
  const htmlById = new Map((bundle.candidates || []).map((item) => [item.id, item.html]));
  for (const candidate of bundle.state.candidates) {
    const html = htmlById.get(candidate.id);
    if (typeof html !== 'string') throw new Error(`Backup is missing HTML for ${candidate.id}.`);
    const validation = validateCandidate(html);
    if (!validation.ok) throw new Error(`Backup candidate ${candidate.id} failed validation: ${validation.errors.join(' ')}`);
  }

  const existingOrderIds = new Set(store.state.orders.map((item) => item.id));
  const incomingOrders = clone(bundle.state.orders).filter((item) => !existingOrderIds.has(item.id));
  const neededReferences = new Set(incomingOrders.map((item) => item.reference).filter(Boolean));
  const referenceMap = new Map();
  for (const reference of bundle.references || []) {
    if (!neededReferences.has(reference.path)) continue;
    const bytes = Buffer.from(reference.data || '', 'base64');
    const restored = store.saveReference(reference.name, bytes);
    referenceMap.set(reference.path, restored.path);
  }

  for (const order of incomingOrders) {
    if (referenceMap.has(order.reference)) order.reference = referenceMap.get(order.reference);
    else if (order.reference && !fs.existsSync(order.reference)) {
      order.referenceMissing = order.reference;
      order.reference = '';
    }
  }

  const existingCandidateIds = new Set(store.state.candidates.map((item) => item.id));
  const incomingCandidates = [];
  for (const candidate of clone(bundle.state.candidates)) {
    if (existingCandidateIds.has(candidate.id)) continue;
    const dir = path.join(store.candidatesDir, candidate.id);
    fs.mkdirSync(dir, { recursive: false });
    candidate.path = path.join(dir, 'index.html');
    fs.writeFileSync(candidate.path, htmlById.get(candidate.id), { flag: 'wx' });
    incomingCandidates.push(candidate);
  }

  const existingAttemptIds = new Set(store.state.attempts.map((item) => item.id));
  const importedAttempts = clone(bundle.state.attempts).filter((item) => !existingAttemptIds.has(item.id)).map((attempt) => ({
    ...attempt,
    workspace: path.join(store.workspacesDir, attempt.id),
    status: ['starting', 'working', 'stopping'].includes(attempt.status) ? 'interrupted' : attempt.status,
    label: ['starting', 'working', 'stopping'].includes(attempt.status) ? 'Interrupted before backup was imported' : attempt.label
  }));
  store.state.orders.unshift(...incomingOrders);
  store.state.attempts.unshift(...importedAttempts);
  store.state.candidates.unshift(...incomingCandidates);
  if (!store.state.currentCandidateId && bundle.state.currentCandidateId && store.getCandidate(bundle.state.currentCandidateId)) {
    store.state.currentCandidateId = bundle.state.currentCandidateId;
  }
  store.write();
  return { orders: incomingOrders.length, attempts: importedAttempts.length, candidates: incomingCandidates.length, references: referenceMap.size };
}

module.exports = { createBackup, importBackup, BACKUP_FORMAT, BACKUP_VERSION };
