# Atomic Factory threat model

This document describes the security boundary shipped in local v1. It is reviewed against the implementation in `server.js`, `lib/app-server.js`, `lib/validator.js`, `lib/reference.js`, `lib/http-security.js`, and the preview iframe in `public/index.html`.

## Protected assets

- Codex credentials and the authenticated app-server session.
- Factory application code, persistent state, references, and saved candidates.
- Files elsewhere on the host.
- Operator control over requests for additional access.

## Trust boundaries and controls

### Generated code

Worker output is untrusted. It is accepted only after static validation confirms a complete, self-contained document with exactly one labeled range control and no known network, storage, navigation, embedding, form, or host-window capabilities. Accepted output runs in an iframe with `allow-scripts` but without `allow-same-origin`. Its response CSP denies connections, forms, remote assets, base URLs, and framing outside the factory.

Static validation is a rejection layer, not an HTML sanitizer and not the primary runtime boundary. The opaque-origin iframe and response CSP remain mandatory.

### Worker runtime

Each attempt uses a fresh ephemeral Codex thread and a unique workspace. The runtime receives only that workspace as writable, has network disabled, excludes temporary-directory write shortcuts, and uses approval policy `never`. The app-server client explicitly declines approval requests. Factory code, persistent data, saved candidates, and references are outside the writable root.

### References and imports

Path references must resolve to canonical local regular files under the size limit. Uploaded references are copied into factory-owned storage before use. Backup import validates the format, supported state schema, and every candidate before mutation; it merges by stable IDs rather than replacing existing records. References restored from a backup are new factory-owned copies.

### Local web surface

The HTTP server binds only to `127.0.0.1`. Browser mutations reject cross-site Fetch Metadata and mismatched `Origin` headers; originless requests remain available to local command-line tools. Factory documents cannot be framed and use a same-origin-only CSP. State and downloads are served with no-store and same-origin resource policies.

### Persistence and interruption

State writes use a temporary file and atomic rename. Schema migration creates a versioned backup first. Presented candidates are never rewritten. A restart marks nonterminal attempts interrupted; Stop remains in a stopping state until the worker confirms cancellation.

## Abuse cases covered by regression tests

- Candidate source attempts remote loading, network calls, browser storage, navigation, embedding, forms, or parent access.
- A cross-site page attempts a state-changing request.
- A backup contains malformed candidate HTML or a future state schema.
- Worker output is malformed, the turn fails, the worker disconnects, or cancellation is requested.
- The app restarts with an in-flight attempt or a kept candidate.
- A backup is imported more than once.

## Residual risks and scope

- A process already running as the same operating-system user can read local project data and is outside this application's confidentiality boundary.
- A compromised Codex binary, Node.js runtime, browser, kernel, or operating-system account is out of scope.
- Source validation is intentionally conservative but cannot prove arbitrary JavaScript harmless; runtime browser isolation is required.
- Local denial of service through CPU-heavy generated JavaScript is reduced by iframe isolation and Stop for worker runs, but the browser may still need the preview reloaded.
- The factory is single-user and local-only. Exposing the port beyond loopback, enabling toy networking, or adding multiple users requires a new threat-model review.

## Review outcome

Local v1 preserves the documented boundaries for the intended single-user, loopback-only deployment. No known data-loss or sandbox-escape defect remains in the release regression suite.
