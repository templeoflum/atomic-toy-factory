# Atomic Factory Roadmap

Status values: `planned`, `active`, `blocked`, `passed`.

## Phase 0 — Working vertical slice

**Status: passed — 2026-09-15**

Delivered one real work order through the installed Codex app-server, played the generated toy, preserved and reworked it, kept V2 across restart, and confirmed cancellation during a separate run. Added provenance inspection and adaptive layouts verified from 320px through 1800px.

Acceptance gate:

- [x] Real Codex run produces a runnable local candidate.
- [x] Fresh isolated workspace for every attempt.
- [x] Network disabled and extra access denied.
- [x] Preview isolated from host and credentials.
- [x] Keep, Rework, Shelve, Stop, activity, and candidate history operate.
- [x] Rework preserves both versions and exact correction provenance.
- [x] Kept candidate survives restart.
- [x] Stop waits for runtime-confirmed cancellation.
- [x] Panel has no overlap or horizontal overflow across tested widths.

## Phase 1 — Reliable alpha

**Status: passed — 2026-09-15**

Objective: make the existing workflow recoverable, auditable, and safe against malformed worker output without expanding the product surface.

Acceptance gate:

- [x] State has an explicit schema version and tested migration with backup.
- [x] Attempts and meaningful worker events are durable.
- [x] Restart reconciles in-flight work without losing candidates.
- [x] Candidate validation rejects non-self-contained or boundary-escaping HTML.
- [x] Reference paths are canonicalized and verified as read-only inputs.
- [x] Existing candidates survive migration and remain playable.
- [x] Automated store, migration, recovery, and validator tests pass.
- [x] README and architecture documentation match the implementation.

## Phase 2 — Usable beta

**Status: passed — 2026-09-15**

Objective: make repeated daily use clear and recoverable for an operator.

Acceptance gate:

- [x] Native local reference selection with explicit copied/read-only semantics.
- [x] Candidate naming, comparison, export, and backup/restore.
- [x] Clear permission, validation, worker-disconnect, and recovery UI states.
- [x] Keyboard and structural accessibility audit passes.
- [x] Automated browser coverage for issue, rework, provenance, restart, and stop.
- [x] Large-history and long-running activity behavior remains responsive.

## Phase 3 — Local v1

**Status: passed — 2026-09-15**

Objective: release a trustworthy local tool whose data and security behavior are documented and regression-tested.

Acceptance gate:

- [x] Threat model reviewed against the shipped implementation.
- [x] Persistence migrations and backup recovery tested from every released schema.
- [x] Malformed, failed, cancelled, and disconnected worker runs recover cleanly.
- [x] Clean-machine launch and operator documentation pass.
- [x] Full regression checklist passes without known data-loss or sandbox-escape defects.
- [x] Version is tagged `1.0.0` only after all gates above pass.

Release evidence: 18 dependency-free unit/integration tests and the full headless-browser lifecycle regression pass; the production app-server reconnects after restart; the two original candidates retain distinct checksums; V2 remains kept; and a mismatched-origin mutation is rejected. Operator and security review records are in `OPERATIONS.md` and `THREAT_MODEL.md`.

## Phase 4 — Production discovery

**Status: active — production executed; operator quality calibration open 2026-09-16**

Objective: run the factory twice before redesigning it. Produce ten varied toys, review the process as a batch, derive a second set of ten from the evidence, and use both runs to identify justified SOP, material, fixture, and periodic-QC adjustments.

The working plan, Run 1 orders, observation record, sampling policy, and completion gate live in `PHASE4_PRODUCTION_RUN.md`.

Run 1 evidence is recorded in `PRODUCTION_RUN_1_LOG.md` and `PHASE4_RUN1_REVIEW.md`. The evidence-derived second run is defined in `PHASE4_RUN2_PLAN.md`.

Run 2 evidence is in `PRODUCTION_RUN_2_LOG.md`. `PHASE4_DISCOVERY_REVIEW.md` compares both runs and records the failed actual-preview fitting sample, repeated archive-orientation loss, and two hosted connection-reset outliers. `PHASE4_ADJUSTMENTS.md` ranks justified changes and defines their acceptance gates. Both backups and all presented candidates are preserved. Discovery completion is not a blanket candidate-quality approval.

Principles:

Acceptance amendment: both batches ran, but the review gate is reopened after Donovan disputed several Run 2 Keeps. Preserve historical decisions, record operator findings, and calibrate acceptance before declaring discovery review complete or using Keep counts as quality evidence. Session 02 of `PHASE4_OPERATOR_REVIEW_NOTES.md` is the current record. No candidate fixes during this notes-only review.

- Worker 01 builds; it does not grade its own work.
- Quality is designed into the production process, not inspected into every candidate.
- Operator decisions remain the product judgment.
- A single failure is an observation, not automatically a new rule.
- Production runs remain stable unless data or security is at risk.

## Phase 5 — Evidence-backed usability and production materials

**Status: planned**

Objective: implement the bounded navigation, preview-fitting material/fixture, SOP/QC, and truthful-activity adjustments defined in `PHASE4_ADJUSTMENTS.md`. Work in that priority order and pass each acceptance gate before declaring the phase complete. No existing candidate may be edited in place.

Visual-language standardization and local-model implementation remain explicit deferred decisions, not silent additions to this phase.

## Post-v1 exploration

- Extract the adaptive cell planner into a reusable layout grammar.
- Formalize an atomic-toy manifest and compatibility contract.
- Explore additional workers only if single-worker provenance and safety remain intact.
- Evaluate a local/offline worker-provider contract without weakening any factory-owned boundary.
