const MAX_CANDIDATE_BYTES = 1_000_000;

const forbidden = [
  [/<script\b[^>]*\bsrc\s*=/i, 'external scripts'],
  [/<link\b[^>]*\bhref\s*=/i, 'linked resources'],
  [/<(?:iframe|frame|object|embed|form|base)\b/i, 'nested browsing, embedding, forms, or base URLs'],
  [/<meta\b[^>]*http-equiv\s*=\s*["']?refresh/i, 'automatic navigation'],
  [/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/i, 'network APIs'],
  [/navigator\s*\.\s*sendBeacon\s*\(/i, 'network beacons'],
  [/\b(?:localStorage|sessionStorage|indexedDB)\b/i, 'browser storage'],
  [/(?:\bwindow\s*\.\s*(?:parent|top|opener)\b|\b(?:parent|opener)\s*\.)/i, 'host-window access'],
  [/\b(?:location\s*=|location\s*\.\s*(?:assign|replace)\s*\(|window\s*\.\s*open\s*\()/i, 'navigation or popups'],
  [/\b(?:https?:|wss?:|ftp:|file:)\/\//i, 'external URLs'],
  [/@import\b/i, 'CSS imports']
];

const SVG_NAMESPACE_CALL = /(\bdocument\s*\.\s*createElementNS\s*\(\s*)(["'])http:\/\/www\.w3\.org\/2000\/svg\2(\s*,)/gi;

function maskAllowedNamespaces(html) {
  return html.replace(SVG_NAMESPACE_CALL, '$1$2urn:atomic-factory:svg$2$3');
}

function validateCandidate(html) {
  const errors = [];
  if (typeof html !== 'string') return { ok: false, errors: ['Candidate output is not text.'] };
  if (Buffer.byteLength(html, 'utf8') > MAX_CANDIDATE_BYTES) errors.push(`Candidate exceeds ${MAX_CANDIDATE_BYTES} bytes.`);
  if (!/^\s*<!doctype html>/i.test(html)) errors.push('Candidate must begin with an HTML doctype.');
  if (!/<html\b/i.test(html) || !/<body\b/i.test(html)) errors.push('Candidate must contain complete html and body elements.');
  const sliders = html.match(/<input\b[^>]*\btype\s*=\s*["']range["'][^>]*>/gi) || [];
  if (sliders.length !== 1) errors.push(`Candidate must contain exactly one range slider; found ${sliders.length}.`);
  else if (!/\b(?:aria-label|aria-labelledby|id)\s*=/i.test(sliders[0])) errors.push('The range slider must have an accessible identifier or label.');
  const contentForSafetyChecks = maskAllowedNamespaces(html);
  for (const [pattern, label] of forbidden) if (pattern.test(contentForSafetyChecks)) errors.push(`Candidate contains forbidden ${label}.`);
  return { ok: errors.length === 0, errors };
}

module.exports = { validateCandidate, MAX_CANDIDATE_BYTES };
