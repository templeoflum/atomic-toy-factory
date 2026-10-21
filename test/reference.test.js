const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { validateReference, MAX_REFERENCE_BYTES } = require('../lib/reference');

test('canonicalizes an existing local file', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-reference-'));
  const target = path.join(root, 'reference.txt');
  const link = path.join(root, 'link.txt');
  fs.writeFileSync(target, 'reference');
  fs.symlinkSync(target, link);
  assert.equal(validateReference(link), fs.realpathSync(target));
});

test('rejects relative, missing, directory, and oversized references', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-reference-invalid-'));
  assert.throws(() => validateReference('relative.png'), /absolute/);
  assert.throws(() => validateReference(path.join(root, 'missing.png')), /does not exist/);
  assert.throws(() => validateReference(root), /local file/);
  const oversized = path.join(root, 'oversized.bin');
  fs.writeFileSync(oversized, Buffer.alloc(1));
  fs.truncateSync(oversized, MAX_REFERENCE_BYTES + 1);
  assert.throws(() => validateReference(oversized), /25 MB/);
});
