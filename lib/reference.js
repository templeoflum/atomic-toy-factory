const fs = require('node:fs');
const path = require('node:path');

const MAX_REFERENCE_BYTES = 25_000_000;

function validateReference(reference) {
  if (!reference) return '';
  if (typeof reference !== 'string' || !path.isAbsolute(reference)) throw new Error('Reference must be an absolute local file path.');
  let canonical;
  try { canonical = fs.realpathSync(reference); }
  catch { throw new Error('Reference file does not exist or cannot be read.'); }
  const stat = fs.statSync(canonical);
  if (!stat.isFile()) throw new Error('Reference must identify a local file.');
  if (stat.size > MAX_REFERENCE_BYTES) throw new Error('Reference exceeds the 25 MB local limit.');
  return canonical;
}

module.exports = { validateReference, MAX_REFERENCE_BYTES };
