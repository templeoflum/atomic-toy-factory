const test = require('node:test');
const assert = require('node:assert/strict');
const { assertLocalMutation, appDocumentHeaders } = require('../lib/http-security');

function request(method, headers = {}) { return { method, headers }; }

test('local same-origin mutations and originless local clients are allowed', () => {
  assert.doesNotThrow(() => assertLocalMutation(request('POST', { host: '127.0.0.1:4317', origin: 'http://127.0.0.1:4317', 'sec-fetch-site': 'same-origin' })));
  assert.doesNotThrow(() => assertLocalMutation(request('POST', { host: '127.0.0.1:4317' })));
});

test('cross-site and mismatched-origin mutations are rejected', () => {
  assert.throws(() => assertLocalMutation(request('POST', { host: '127.0.0.1:4317', origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' })), /Cross-site/);
  assert.throws(() => assertLocalMutation(request('POST', { host: '127.0.0.1:4317', origin: 'http://localhost:4317' })), /must match/);
});

test('the factory document policy is same-origin and non-embeddable', () => {
  const headers = appDocumentHeaders();
  assert.match(headers['content-security-policy'], /default-src 'self'/);
  assert.match(headers['content-security-policy'], /frame-ancestors 'none'/);
  assert.equal(headers['x-frame-options'], 'DENY');
});
