const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCandidate, MAX_CANDIDATE_BYTES } = require('../lib/validator');

const safe = `<!doctype html><html><body><label for="x">Angle</label><input id="x" type="range"><script>document.querySelector('#x').oninput=()=>{};</script></body></html>`;

test('accepts a self-contained single-slider toy', () => {
  assert.deepEqual(validateCandidate(safe), { ok: true, errors: [] });
  assert.equal(validateCandidate(safe.replace('</body>', '<style>.x{margin-top:2px}</style></body>')).ok, true);
});

test('rejects missing or multiple sliders', () => {
  assert.match(validateCandidate('<!doctype html><html><body></body></html>').errors.join(' '), /exactly one/);
  assert.match(validateCandidate(safe.replace('</body>', '<input type="range" aria-label="two"></body>')).errors.join(' '), /found 2/);
});

test('rejects remote resources, network APIs, storage, and host access', () => {
  for (const fragment of [
    '<script src="remote.js"></script>', '<link href="theme.css">', '<iframe></iframe>',
    '<script>fetch("/secret")</script>', '<script>localStorage.x=1</script>',
    '<script>window.parent.postMessage("x","*")</script>', '<style>@import "x.css"</style>',
    '<img src="https://example.com/x.png">'
  ]) {
    const result = validateCandidate(safe.replace('</body>', `${fragment}</body>`));
    assert.equal(result.ok, false, fragment);
  }
});

test('allows only the exact SVG namespace in document.createElementNS', () => {
  const svgDom = safe.replace(
    '</script>',
    `;document.createElementNS('http://www.w3.org/2000/svg', 'path');document . createElementNS ( "http://www.w3.org/2000/svg" , "circle" );</script>`
  );
  assert.deepEqual(validateCandidate(svgDom), { ok: true, errors: [] });

  for (const fragment of [
    '<img src="http://www.w3.org/2000/svg">',
    `<script>const namespace = 'http://www.w3.org/2000/svg';</script>`,
    `<script>document.createElementNS('https://example.com/svg', 'path');</script>`,
    `<script>document.createElementNS('http://www.w3.org/2000/svg', 'path');fetch('https://example.com')</script>`
  ]) {
    const result = validateCandidate(safe.replace('</body>', `${fragment}</body>`));
    assert.equal(result.ok, false, fragment);
    assert.match(result.errors.join(' '), /forbidden/);
  }
});

test('rejects oversized output and unlabeled sliders', () => {
  const oversized = safe.replace('</body>', `${'x'.repeat(MAX_CANDIDATE_BYTES)}</body>`);
  assert.match(validateCandidate(oversized).errors.join(' '), /exceeds/);
  assert.match(validateCandidate(safe.replace(' id="x"', '')).errors.join(' '), /accessible/);
});
