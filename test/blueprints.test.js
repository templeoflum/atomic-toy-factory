const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { createHash } = require('node:crypto');
const { pathToFileURL } = require('node:url');
const { resolve } = require('node:path');

test('blueprint archives match their append-only checksum ledger', () => {
  const base = pathToFileURL(resolve(__dirname, '../docs/blueprints') + '/');
  const entries = JSON.parse(readFileSync(new URL('revision-ledger.json', base)));
  const paths = new Set();
  for (const entry of entries) {
    assert.match(entry.path, /^revisions\/[A-Z][A-Z0-9]*\/(?:worker\/|factory\/)?(?:[TWF]-\d{2}\.svg|NOTES\.md)$/);
    assert.ok(!paths.has(entry.path), 'duplicate archive path');
    paths.add(entry.path);
    const bytes = readFileSync(new URL(entry.path, base));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.path + ' was changed');
    assert.ok(entry.provenance && entry.status);
  }
  function walk(url, prefix) {
    return readdirSync(url, { withFileTypes: true }).flatMap(e =>
      e.isDirectory() ? walk(new URL(e.name + '/', url), prefix + e.name + '/') : [prefix + e.name]);
  }
  assert.deepEqual(walk(new URL('revisions/', base), 'revisions/').sort(), [...paths].sort());
});
