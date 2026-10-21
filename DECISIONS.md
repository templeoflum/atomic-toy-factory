# Decision record

## D-001 — Buildless, dependency-free local application

Use Node.js built-ins and browser platform APIs. Do not introduce packages merely for convenience. Reconsider only when a concrete security or correctness requirement cannot be met responsibly with the platform.

## D-002 — One app-server process, fresh ephemeral thread per attempt

The factory maintains one authenticated app-server connection. Each initial build and rework starts a new isolated Codex thread and workspace.

## D-003 — Deterministic adaptive layout rather than simulated physics

Cells report minimum useful widths to a small planner. The planner chooses a stable topology with hysteresis; CSS interpolates within it. This produces the intended repelling behavior without unstable feedback loops.

## D-004 — Immutable presented candidates

Once presented, candidate HTML is copied into its own directory and never edited. Rework always creates a descendant candidate with explicit provenance.

## D-005 — Defense in depth for generated HTML

Static validation reduces malformed and obviously boundary-seeking output. The sandboxed opaque-origin iframe and response CSP remain the authoritative runtime controls.

## D-006 — Loopback-only local v1

Bind the HTTP surface to `127.0.0.1`, reject cross-site or mismatched-origin browser mutations, and keep originless local command-line clients available for diagnostics. Any remote or multi-user deployment requires a new authentication and threat-model design.
