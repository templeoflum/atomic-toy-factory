# Atomic Factory

A local, single-worker factory for generating and reviewing one-slider HTML toys through the installed Codex app-server.

The project is buildless and has no npm dependencies. Node.js built-ins serve the panel, persist state, and connect to the installed Codex binary over newline-delimited JSON-RPC.

## Launch

```sh
npm start
```

Then open <http://127.0.0.1:4317>.

The server uses the existing Codex authentication and configured model. Every attempt gets a fresh Codex thread and a unique workspace. The runtime permits writes only in that attempt workspace, disables network access, and never auto-grants additional access. Completed HTML is copied into the factory-owned candidate store and previewed in a sandboxed, opaque-origin iframe with a restrictive content security policy.

## Project status

Planning and acceptance gates live in [ROADMAP.md](ROADMAP.md). The completed production-discovery program is recorded in [PHASE4_PRODUCTION_RUN.md](PHASE4_PRODUCTION_RUN.md), [Run 1 records](PRODUCTION_RUN_1_LOG.md), [Run 2 records](PRODUCTION_RUN_2_LOG.md), and the [two-run review](PHASE4_DISCOVERY_REVIEW.md), with ongoing [operator review notes](PHASE4_OPERATOR_REVIEW_NOTES.md). The next evidence-backed implementation plan is [PHASE4_ADJUSTMENTS.md](PHASE4_ADJUSTMENTS.md). Product scope, architectural invariants, quality requirements, shipped security boundaries, and the operator runbook live in [PROJECT.md](PROJECT.md), [ARCHITECTURE.md](ARCHITECTURE.md), [QUALITY.md](QUALITY.md), [THREAT_MODEL.md](THREAT_MODEL.md), and [OPERATIONS.md](OPERATIONS.md). These documents are the project source of truth.

## Data and recovery

Local state is stored in `data/state.json`. Schema migrations create a versioned backup before changing existing state. Attempts and meaningful worker events are durable, in-flight attempts are reconciled as interrupted after restart, and presented candidate files are immutable.

Candidate history supports provenance inspection, parent/child comparison, naming, HTML export, and validated backup/restore. Import merges by stable ID and preserves existing candidates.

## Verification

```sh
npm test
npm run test:browser
node --check server.js
node --check public/app.js
```

Candidate source is statically checked for a complete one-slider document and forbidden external resources, network APIs, browser storage, navigation, embedding, forms, and host-window access. Static checks supplement rather than replace the preview iframe sandbox and CSP.

## Release captures

- [Running local-v1 panel](docs/atomic-factory-v1.png)
- [Generated Crosshatch V2 toy](docs/crosshatch-v2.png)
