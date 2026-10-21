const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function id(prefix) { return `${prefix}-${crypto.randomBytes(8).toString('hex')}`; }

function fixtureHtml(reworked) {
  const title = reworked ? 'Reworked Test Toy' : 'Test Toy';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:sans-serif;margin:0;display:grid;place-content:center;min-height:100vh}label{display:grid;gap:1rem}</style></head><body><h1>${title}</h1><label for="control">Value <input id="control" type="range" min="0" max="100" value="50"></label><output>50</output><script>const x=document.querySelector('#control'),o=document.querySelector('output');x.oninput=()=>o.textContent=x.value;</script></body></html>`;
}

class FakeAppServerClient {
  constructor({ onEvent = () => {}, delay = Number(process.env.ATOMIC_FAKE_DELAY || 80) } = {}) {
    this.onEvent = onEvent;
    this.delay = delay;
    this.turns = new Map();
    this.ready = Promise.resolve({ serverInfo: { name: 'fake-app-server', version: '1' } });
    setImmediate(() => this.onEvent({ method: 'worker/connected', params: { fake: true } }));
  }

  async request(method, params) {
    if (method === 'thread/start') {
      return { thread: { id: id('thread') }, model: 'test-model', sandbox: { type: 'workspaceWrite' } };
    }
    if (method === 'turn/start') {
      const turnId = id('turn');
      const prompt = params.input?.map((item) => item.text || '').join('\n') || '';
      const invalid = prompt.includes('MALFORMED_TEST');
      const failed = prompt.includes('FAILED_TEST');
      const disconnected = prompt.includes('DISCONNECT_TEST');
      fs.writeFileSync(path.join(params.cwd, 'index.html'), invalid ? '<html><body>invalid</body></html>' : fixtureHtml(prompt.includes('This is a rework.')));
      setImmediate(() => this.onEvent({ method: 'turn/started', params: { threadId: params.threadId, turn: { id: turnId, status: 'inProgress' } } }));
      const timer = setTimeout(() => {
        this.turns.delete(turnId);
        if (disconnected) this.onEvent({ method: 'worker/disconnected', params: { code: 1, signal: null } });
        else this.onEvent({ method: 'turn/completed', params: { threadId: params.threadId, turn: { id: turnId, status: failed ? 'failed' : 'completed', error: failed ? { message: 'Synthetic worker failure' } : null } } });
      }, this.delay);
      this.turns.set(turnId, { timer, threadId: params.threadId });
      return { turn: { id: turnId, status: 'inProgress' } };
    }
    if (method === 'turn/interrupt') {
      const running = this.turns.get(params.turnId);
      if (running) {
        clearTimeout(running.timer);
        this.turns.delete(params.turnId);
        setImmediate(() => this.onEvent({ method: 'turn/completed', params: { threadId: params.threadId, turn: { id: params.turnId, status: 'interrupted' } } }));
      }
      return {};
    }
    throw new Error(`Fake app-server does not implement ${method}.`);
  }

  close() {
    for (const { timer } of this.turns.values()) clearTimeout(timer);
    this.turns.clear();
  }
}

module.exports = { FakeAppServerClient };
