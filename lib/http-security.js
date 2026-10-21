const LOOPBACK = new Set(['127.0.0.1', 'localhost', '[::1]']);

function assertLocalMutation(request) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return;
  const fetchSite = request.headers['sec-fetch-site'];
  if (fetchSite === 'cross-site') throw new Error('Cross-site mutation rejected.');
  const origin = request.headers.origin;
  if (!origin) return;
  let parsed;
  try { parsed = new URL(origin); }
  catch { throw new Error('Invalid request origin.'); }
  const requestHost = String(request.headers.host || '').toLowerCase();
  if (parsed.protocol !== 'http:' || !LOOPBACK.has(parsed.hostname) || parsed.host.toLowerCase() !== requestHost) {
    throw new Error('Mutation origin must match the local factory.');
  }
}

function appDocumentHeaders() {
  return {
    'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
    'cross-origin-resource-policy': 'same-origin',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY'
  };
}

module.exports = { assertLocalMutation, appDocumentHeaders };
