# Atomic Factory operations

## Prerequisites

- macOS or another host capable of running Node.js 20 or newer.
- The `codex` executable installed, authenticated, and available on `PATH`.
- A modern Chromium-based or equivalent browser.

The project is buildless and has no package dependencies to install.

## Launch and stop

From the project directory:

```sh
npm start
```

Open <http://127.0.0.1:4317>. A green Worker 01 indicator confirms that the installed app-server initialized with the existing Codex authentication and configured model. Stop the application with `Ctrl-C`; shutdown closes live event streams and the worker process.

To use a different local port:

```sh
PORT=4318 npm start
```

## Normal operation

1. Enter one focused concept and optionally select a local reference file.
2. Issue work and inspect real worker activity.
3. Operate the candidate's one slider in the isolated preview.
4. Keep, Shelve, or Rework it. Rework records the exact correction and parent candidate.
5. Use candidate history to inspect provenance, compare related versions, rename, or export HTML.

Uploaded references are copied into factory storage. Absolute-path references remain read-only to the worker. Every attempt receives a new isolated writable workspace.

## Data and recovery

Persistent data lives under `data/`:

- `state.json`: authoritative versioned metadata.
- `candidates/`: immutable presented HTML candidates.
- `references/`: factory-owned reference copies.
- `workspaces/`: isolated attempt workspaces.
- `state.v*.backup.json`: pre-migration state backups.

Use **Download backup** before moving or repairing a project. **Import backup** validates and merges records without replacing candidates already present. Re-importing the same backup is idempotent.

After an unexpected shutdown, launch normally. The factory marks work that was starting, running, or stopping as interrupted and preserves all previously presented candidates. Unknown future state schemas fail closed instead of being rewritten.

## Verification

Run the dependency-free unit and integration suite:

```sh
npm test
```

Run the real browser regression (Google Chrome is auto-detected at its standard macOS path, or set `CHROME_BIN`):

```sh
npm run test:browser
```

The browser suite uses a deterministic fake worker and a temporary data directory. It never touches the live `data/` store. It covers issue, rework, provenance, comparison, responsive layout, accessibility structure, Keep, Stop, malformed output, failed and disconnected runs, backup, and restart persistence.

## Troubleshooting

- **Worker disconnected:** restart the application. Any active attempt is reconciled as interrupted; saved candidates remain intact.
- **Codex executable not found or authentication fails:** verify `codex app-server --stdio` can initialize in the same shell. The factory does not collect credentials.
- **Port already in use:** stop the existing process or launch with a different `PORT`.
- **Candidate rejected:** expand worker activity and inspect the validation message. Rework or issue a narrower order; rejected output is never presented.
- **Reference rejected:** select an existing regular file no larger than 25 MB. Directories and missing or relative paths are not accepted.
- **State schema error:** preserve the entire `data/` directory and use the matching application version or a validated backup. Do not hand-edit candidate IDs or paths.

## Clean-machine acceptance checklist

- `node --version` reports 20 or newer.
- `codex` is installed and already authenticated.
- `npm test` passes without installing dependencies.
- `npm start` prints the loopback URL and the panel loads.
- Worker 01 connects, one test order completes, and the candidate slider responds.
- A kept candidate remains after stopping and relaunching the application.
