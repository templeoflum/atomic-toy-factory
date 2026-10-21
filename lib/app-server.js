const { spawn } = require('node:child_process');
const readline = require('node:readline');

class AppServerClient {
  constructor({ command = process.env.CODEX_BIN || 'codex', onEvent = () => {} } = {}) {
    this.command = command;
    this.onEvent = onEvent;
    this.nextId = 1;
    this.pending = new Map();
    this.proc = null;
    this.ready = this.start();
  }

  async start() {
    this.proc = spawn(this.command, ['app-server', '--stdio'], { stdio: ['pipe', 'pipe', 'pipe'] });
    this.proc.stderr.on('data', (chunk) => this.onEvent({ method: 'worker/stderr', params: { text: chunk.toString() } }));
    this.proc.on('exit', (code, signal) => {
      const error = new Error(`Codex app-server exited (${code ?? signal})`);
      for (const { reject, timer } of this.pending.values()) {
        clearTimeout(timer);
        reject(error);
      }
      this.pending.clear();
      this.onEvent({ method: 'worker/disconnected', params: { code, signal } });
    });
    readline.createInterface({ input: this.proc.stdout }).on('line', (line) => {
      if (!line.trim()) return;
      let message;
      try { message = JSON.parse(line); }
      catch { return this.onEvent({ method: 'worker/protocolError', params: { line } }); }
      if (Object.hasOwn(message, 'id') && (Object.hasOwn(message, 'result') || Object.hasOwn(message, 'error'))) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        clearTimeout(pending.timer);
        return message.error ? pending.reject(new Error(message.error.message || JSON.stringify(message.error))) : pending.resolve(message.result);
      }
      if (Object.hasOwn(message, 'id') && message.method) return this.denyServerRequest(message);
      this.onEvent(message);
    });
    const result = await this.request('initialize', {
      clientInfo: { name: 'atomic-factory', title: 'Atomic Factory', version: '1.0.0' },
      capabilities: { experimentalApi: true }
    });
    this.notify('initialized', {});
    this.onEvent({ method: 'worker/connected', params: result });
    return result;
  }

  denyServerRequest(message) {
    const method = message.method;
    let result;
    if (method.includes('commandExecution/requestApproval') || method.includes('fileChange/requestApproval')) result = { decision: 'decline' };
    else if (method === 'execCommandApproval' || method === 'applyPatchApproval') result = { decision: 'denied' };
    else return this.send({ id: message.id, error: { code: -32601, message: 'Atomic Factory does not grant additional access' } });
    this.onEvent({ method: 'worker/accessDenied', params: { requestedMethod: method } });
    this.send({ id: message.id, result });
  }

  send(message) {
    if (!this.proc || !this.proc.stdin.writable) throw new Error('Codex app-server is not writable');
    this.proc.stdin.write(`${JSON.stringify(message)}\n`);
  }

  notify(method, params) { this.send({ method, params }); }

  request(method, params, timeoutMs = 30_000) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Codex app-server request timed out: ${method}`));
      }, timeoutMs);
      timer.unref?.();
      this.pending.set(id, { resolve, reject, method, timer });
      this.send({ id, method, params });
    });
  }

  close() { this.proc?.kill('SIGTERM'); }
}

module.exports = { AppServerClient };
