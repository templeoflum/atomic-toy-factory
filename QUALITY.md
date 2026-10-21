# Quality gates

## Required on every implementation change

```sh
npm test
npm run test:browser
node --check server.js
node --check public/app.js
```

## Candidate safety

Accepted candidate HTML must be complete, reasonably bounded in size, self-contained, contain exactly one range input, and omit remote resources, nested browsing contexts, form submission, browser storage, network APIs, navigation, and host-window access. Runtime CSP and iframe sandboxing remain mandatory even after static validation.

## Persistence

- State writes are atomic within the local filesystem.
- Migrations preserve a backup of the prior schema.
- Unknown future schema versions fail closed.
- In-flight attempts become interrupted during restart recovery.
- Existing candidate files are never rewritten during migration.

## Responsive matrix

Widths: 320, 375, 620, 900, 1024, and 1800 CSS pixels.

At each width:

- No horizontal document overflow.
- No overlap among work order, test bench, worker status, and output rack.
- Candidate controls remain reachable.
- Provenance remains inspectable.

## Phase completion rule

A roadmap phase may be marked `passed` only when every checkbox in its acceptance gate has objective evidence from tests or a recorded manual exercise.
