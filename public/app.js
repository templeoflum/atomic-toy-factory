const $ = (selector) => document.querySelector(selector);
let state = null;
let selectedId = null;
let lastPresentedCandidateId = null;

// Cells publish minimum useful widths. The planner selects the least
// disruptive topology that satisfies them; CSS interpolates within it.
const layoutRoot = document.querySelector('main');
const layoutNeeds = Object.freeze({ order: 260, player: 470, rail: 250, gap: 18 });
let currentLayout = '';
let pendingLayoutFrame = 0;

function chooseLayout(width, previous = '') {
  const wideNeed = layoutNeeds.order + layoutNeeds.player + layoutNeeds.rail + layoutNeeds.gap * 2;
  const balancedNeed = layoutNeeds.order + 390 + layoutNeeds.gap;
  const hysteresis = 40;
  if (previous === 'wide' && width >= wideNeed - hysteresis) return 'wide';
  if (previous === 'balanced') {
    if (width >= wideNeed + hysteresis) return 'wide';
    if (width >= balancedNeed - hysteresis) return 'balanced';
  }
  if (previous === 'stack' && width < balancedNeed + hysteresis) return 'stack';
  if (width >= wideNeed) return 'wide';
  if (width >= balancedNeed) return 'balanced';
  return 'stack';
}

function applyLayout(width) {
  currentLayout = chooseLayout(width, currentLayout);
  layoutRoot.dataset.layout = currentLayout;
  const orderShare = currentLayout === 'wide' ? .22 : .35;
  const orderSize = Math.min(350, Math.max(260, width * orderShare));
  const railSize = Math.min(330, Math.max(250, width * .205));
  layoutRoot.style.setProperty('--order-size', `${Math.round(orderSize)}px`);
  layoutRoot.style.setProperty('--rail-size', `${Math.round(railSize)}px`);
}

new ResizeObserver(([entry]) => {
  cancelAnimationFrame(pendingLayoutFrame);
  pendingLayoutFrame = requestAnimationFrame(() => applyLayout(entry.contentRect.width));
}).observe(layoutRoot);

applyLayout(layoutRoot.getBoundingClientRect().width);

async function post(url, data = {}) {
  const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || 'Request failed');
  return value;
}

async function uploadReference(file) {
  const response = await fetch('/api/references', {
    method: 'POST',
    headers: { 'content-type': file.type || 'application/octet-stream', 'x-file-name': encodeURIComponent(file.name) },
    body: file
  });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || 'Reference upload failed');
  return value;
}

function busy() { return state?.worker?.busy; }
function selected() { return state?.candidates.find((candidate) => candidate.id === selectedId); }
function shortDate(value) { return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

function render(next) {
  state = next;
  const connection = state.worker.connected;
  $('#workerDot').className = `dot ${connection ? 'live' : ''}`;
  $('#workerConnection').textContent = connection ? (busy() ? 'occupied' : 'connected') : 'connecting';
  $('#issue').disabled = busy();
  $('#stop').disabled = !busy() || state.active?.status === 'stopping';
  const status = state.active;
  $('#statusLabel').textContent = status?.label || 'Idle';
  $('#statusMeta').textContent = status ? `${status.status.toUpperCase()} · ${status.model || 'configured model'} · ${status.attemptId}` : 'No active session';
  $('#statusDot').className = `dot ${busy() ? 'busy' : status?.status === 'completed' ? 'live' : ''}`;
  const activity = status?.activity || [];
  $('#activityCount').textContent = activity.length;
  $('#activity').innerHTML = activity.map((item) => `<li><b>${escapeHtml(item.method)}</b>${item.detail ? `<br>${escapeHtml(item.detail)}` : ''}</li>`).join('');
  $('#candidateCount').textContent = state.candidates.length;
  $('#history').innerHTML = state.candidates.length ? state.candidates.map((candidate) => `<button class="history-item ${candidate.id === selectedId ? 'active' : ''}" data-id="${candidate.id}"><strong>${escapeHtml(candidate.name || candidate.concept)}</strong><small>v${versionFor(candidate)} · ${candidate.status.toUpperCase()} · ${shortDate(candidate.createdAt)}</small></button>`).join('') : '<p class="muted">Previous candidates will appear here.</p>';
  document.querySelectorAll('.history-item').forEach((button) => button.onclick = () => showCandidate(button.dataset.id));
  if (status?.candidateId && status.candidateId !== lastPresentedCandidateId) {
    lastPresentedCandidateId = status.candidateId;
    showCandidate(status.candidateId, false);
  }
  const candidate = selected();
  $('#keep').disabled = !candidate || busy();
  $('#rework').disabled = !candidate || busy();
  $('#shelve').disabled = !candidate || busy();
}

function versionFor(candidate) {
  return [...state.candidates].filter((item) => item.orderId === candidate.orderId).sort((a,b) => a.createdAt.localeCompare(b.createdAt)).findIndex((item) => item.id === candidate.id) + 1;
}

function versionLabel(candidate) {
  return candidate ? `V${versionFor(candidate)}` : 'Unknown version';
}

function renderProvenance(candidate) {
  const panel = $('#provenance');
  if (!candidate) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  const order = state.orders.find((item) => item.id === candidate.orderId);
  const parent = candidate.parentCandidateId ? state.candidates.find((item) => item.id === candidate.parentCandidateId) : null;
  const children = state.candidates
    .filter((item) => item.parentCandidateId === candidate.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const family = state.candidates
    .filter((item) => item.orderId === candidate.orderId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  $('#provenanceBrief').textContent = family.map(versionLabel).join(' → ');
  const origin = parent
    ? `<section class="provenance-event"><span>Created from <button class="provenance-link" data-candidate-id="${parent.id}">${versionLabel(parent)}</button></span><blockquote>${escapeHtml(candidate.correction || 'No correction was recorded.')}</blockquote></section>`
    : '<section class="provenance-event"><span>Original candidate</span><p>No earlier candidate.</p></section>';
  const reworks = children.length
    ? children.map((child) => `<section class="provenance-event"><span>Rework issued from this version → <button class="provenance-link" data-candidate-id="${child.id}">${versionLabel(child)}</button></span><blockquote>${escapeHtml(child.correction || 'No correction was recorded.')}</blockquote></section>`).join('')
    : '<section class="provenance-event"><span>Subsequent rework</span><p>None issued from this version.</p></section>';

  $('#provenanceBody').innerHTML = `
    <dl class="provenance-facts">
      <div><dt>Work order</dt><dd>${escapeHtml(order?.concept || candidate.concept)}</dd></div>
      ${order?.reference ? `<div><dt>Reference</dt><dd>${escapeHtml(order.reference)}</dd></div>` : ''}
      <div><dt>Presented</dt><dd>${escapeHtml(new Date(candidate.createdAt).toLocaleString())}</dd></div>
      <div><dt>Result</dt><dd>${escapeHtml(candidate.status.toUpperCase())}</dd></div>
      <div><dt>Worker</dt><dd>${escapeHtml(candidate.model || 'configured model')}</dd></div>
      <div><dt>Attempt</dt><dd>${escapeHtml(candidate.attemptId)}</dd></div>
      <div><dt>Session</dt><dd>${escapeHtml(candidate.workerThreadId || 'not recorded')}</dd></div>
    </dl>
    <div class="provenance-events">${origin}${reworks}</div>`;
  document.querySelectorAll('.provenance-link').forEach((button) => {
    button.onclick = () => showCandidate(button.dataset.candidateId);
  });
}

function showCandidate(id, rerender = true) {
  const candidate = state.candidates.find((item) => item.id === id);
  if (!candidate) return;
  selectedId = id;
  $('#emptyPlayer').hidden = true;
  $('#player').hidden = false;
  $('#player').src = `${candidate.previewUrl}?t=${Date.now()}`;
  $('#candidateTitle').textContent = candidate.name || candidate.concept;
  $('#candidateBadge').textContent = `V${versionFor(candidate)} · ${candidate.status.toUpperCase()}`;
  $('#candidateTools').hidden = false;
  $('#candidateName').value = candidate.name || '';
  const relative = candidate.parentCandidateId
    ? state.candidates.find((item) => item.id === candidate.parentCandidateId)
    : state.candidates.find((item) => item.parentCandidateId === candidate.id);
  $('#compareCandidate').disabled = !relative;
  $('#compareCandidate').dataset.relativeId = relative?.id || '';
  $('#compareCandidate').textContent = relative ? `Compare ${versionLabel(candidate)} ↔ ${versionLabel(relative)}` : 'No related version';
  $('#comparePanel').hidden = true;
  renderProvenance(candidate);
  if (rerender) render(state);
  else {
    $('#keep').disabled = busy(); $('#rework').disabled = busy(); $('#shelve').disabled = busy();
  }
}

function escapeHtml(value = '') { const node = document.createElement('div'); node.textContent = value; return node.innerHTML; }
function fail(error) { $('#formError').textContent = error.message; }

$('#issue').onclick = async () => {
  $('#formError').textContent = '';
  selectedId = null;
  try {
    const file = $('#referenceFile').files[0];
    const reference = file ? (await uploadReference(file)).path : $('#reference').value;
    render(await post('/api/orders', { concept: $('#concept').value, reference }));
  }
  catch (error) { fail(error); }
};
$('#stop').onclick = async () => { try { render(await post('/api/stop')); } catch (error) { fail(error); } };
$('#keep').onclick = async () => { try { await post(`/api/candidates/${selectedId}/keep`); } catch (error) { fail(error); } };
$('#shelve').onclick = async () => { try { await post(`/api/candidates/${selectedId}/shelve`); } catch (error) { fail(error); } };
$('#rework').onclick = () => { $('#reworkForm').hidden = !$('#reworkForm').hidden; if (!$('#reworkForm').hidden) $('#correction').focus(); };
$('#submitRework').onclick = async () => {
  const correction = $('#correction').value.trim();
  if (!correction) return fail(new Error('Enter an operator correction.'));
  $('#formError').textContent = '';
  try { render(await post('/api/rework', { candidateId: selectedId, correction })); $('#reworkForm').hidden = true; }
  catch (error) { fail(error); }
};
$('#saveCandidateName').onclick = async () => {
  try { await post(`/api/candidates/${selectedId}/rename`, { name: $('#candidateName').value }); }
  catch (error) { fail(error); }
};
$('#exportCandidate').onclick = () => {
  if (!selectedId) return;
  const link = document.createElement('a');
  link.href = `/api/candidates/${selectedId}/export`;
  link.download = '';
  link.click();
};
$('#compareCandidate').onclick = () => {
  const candidate = selected();
  const relative = state.candidates.find((item) => item.id === $('#compareCandidate').dataset.relativeId);
  if (!candidate || !relative) return;
  const ordered = [candidate, relative].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  $('#compareLeftLabel').textContent = `${versionLabel(ordered[0])} · ${ordered[0].name || 'original'}`;
  $('#compareRightLabel').textContent = `${versionLabel(ordered[1])} · ${ordered[1].name || 'rework'}`;
  $('#compareLeft').src = `${ordered[0].previewUrl}?compare=left`;
  $('#compareRight').src = `${ordered[1].previewUrl}?compare=right`;
  $('#comparePanel').hidden = false;
  $('#compareTitle').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};
$('#closeCompare').onclick = () => {
  $('#comparePanel').hidden = true;
  $('#compareLeft').src = 'about:blank';
  $('#compareRight').src = 'about:blank';
};
$('#backupFactory').onclick = () => {
  const link = document.createElement('a');
  link.href = '/api/backup';
  link.download = '';
  link.click();
};
$('#restoreFactory').onchange = async () => {
  const file = $('#restoreFactory').files[0];
  if (!file) return;
  try {
    const response = await fetch('/api/backup/import', { method: 'POST', headers: { 'content-type': 'application/json' }, body: file });
    const value = await response.json();
    if (!response.ok) throw new Error(value.error || 'Backup import failed');
    $('#formError').textContent = `Imported ${value.candidates} candidate(s), ${value.orders} order(s), and ${value.references} reference(s).`;
  } catch (error) { fail(error); }
  finally { $('#restoreFactory').value = ''; }
};

fetch('/api/state').then((response) => response.json()).then((value) => { selectedId = value.currentCandidateId || value.candidates[0]?.id || null; render(value); if (selectedId) showCandidate(selectedId); });
const events = new EventSource('/api/events');
events.addEventListener('state', (event) => render(JSON.parse(event.data)));
events.addEventListener('activity', () => {});
