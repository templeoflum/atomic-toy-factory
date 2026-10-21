# Phase 4 — Run 2 plan

Run 2 is derived from the evidence in `PHASE4_RUN1_REVIEW.md` and the subsequent observations in `PHASE4_OPERATOR_REVIEW_NOTES.md`. Freeze the validator correction and all other factory behavior before issuing the first order.

Execution status: complete — 2026-09-16. Production evidence is in `PRODUCTION_RUN_2_LOG.md`; the completed sample, comparison, and adjustment disposition are in `PHASE4_DISCOVERY_REVIEW.md` and `PHASE4_ADJUSTMENTS.md`.

## Entry gate

- [x] Narrow SVG namespace validator correction implemented.
- [x] Regression test proves the exact SVG namespace in `document.createElementNS` is allowed while resource use, unrelated namespace strings, other external URLs, and network calls remain rejected.
- [x] Local-v1 regressions pass: 19 unit tests, browser lifecycle flow, and syntax checks on `server.js` and `public/app.js` (2026-09-16).
- [x] Run 1 backup is preserved and parseable at `data/backups/phase4-run1-2026-09-16.json` with 12 orders, 15 attempts, and 13 candidates.

## Frozen change record

Run 2 starts with one factory behavior change: the validator recognizes the exact SVG DOM namespace only when it is the first argument to `document.createElementNS`. Candidate sandboxing, CSP, URL rejection, worker prompt, model, attempt isolation, persistence, layout, and activity handling remain unchanged.

Existing candidates remain immutable. In particular, Orbit Resonance is preserved as kept even though later operator review identified a composition overlap; that observation becomes evidence rather than an in-place repair.

## Four weak-area repetitions

### 01 — Standing wave retry

> Make a toy showing a standing wave between two fixed ends. One slider changes the number of nodes.

Evidence target: verify the validator correction using the exact failed Run 1 concept.

### 02 — Expanding headline

> Make a toy showing the word COUNTERPOINT expanding from tightly packed to widely spaced. One slider controls the letter spacing, and the entire word must remain visible.

Evidence target: repeat responsive typography with a longer word and explicit outcome.

### 03 — Memory stream

> Make a toy where recent moving points leave a fading directional trail. One slider changes how long the system remembers its recent motion.

Evidence target: stateful change and whether transition state is legible without an extra control.

### 04 — Consensus field

> Make a toy showing many small needles gradually agreeing on one direction. One slider controls how strongly each needle follows its neighbors.

Evidence target: repeat collective settling behavior and measure whether the transition explains itself.

## Two process-interpretation probes

### 05 — Plucked string

> Make a toy showing a plucked string vibrating. One slider changes string tension.

Evidence target: observe whether Worker 01 adds direct manipulation and whether it remains one coherent mechanic.

### 06 — Responsive constellation

> Make a toy showing a constellation connected by elastic lines. One slider changes the spacing between its stars.

Evidence target: challenge spatial fitting across aspect ratios without prescribing a layout technique.

## Two successful-pattern analogues

### 07 — Catenary tension

> Make a toy showing a hanging cable changing from a deep sag to a taut curve. One slider controls the cable tension.

Evidence target: repeat the successful simple-geometry pattern from Bézier Bow.

### 08 — Eclipse threshold

> Make a toy showing one circular body passing in front of another. One slider controls the amount of overlap.

Evidence target: repeat the successful layered-state clarity of Contour Island.

## Two new territories

### 09 — Lever balance

> Make a toy showing two unequal weights balancing on a lever. One slider moves the fulcrum.

Evidence target: new mechanical relationship and explanatory clarity.

### 10 — Pulse interval

> Make a toy showing two repeating pulses drifting into and out of sync. One slider changes the interval of one pulse.

Evidence target: new temporal comparison without accumulated state.

## Run 2 comparison

Use the same production record, operator decisions, duration calculation, and four-toy periodic sample as Run 1. Compare:

- First-pass keep rate
- Rework count and causes
- Validation failures
- Median and range of attempt duration
- Activity volume
- Responsive sample results
- Repeated versus newly observed process signals

For each presented candidate, normal operation should include a brief visual check at the viewport in which it is being judged. Record obvious collisions as operator observations; do not turn production into exhaustive per-part inspection.

The four-toy periodic sample must now distinguish geometric containment from semantic coherence. At every responsive-matrix width, record:

- Document and body overflow.
- Slider visibility and reachability.
- Collision among the toy's stage, explanation/readout, slider, and labels.
- Whether the main visual remains legible rather than merely clipped inside its frame.

## Archive-orientation observation

Run 2 will grow the archive from 13 to approximately 23 candidates. At candidates 15, 20, and the run end, perform the same navigation trace:

1. Start at the newly presented candidate.
2. Inspect its provenance.
3. If it has a related version, move to that version and return.
4. Select an older candidate from the output rack.
5. Return to the current work and locate the work-order controls.

Record unexpected page movement, loss of selected-object context, ambiguous scroll ownership, hidden destinations, and inability to return to the prior location. Do not redesign the interface during the run.

## Visual-language inventory

After production, classify all ten candidates using descriptive evidence rather than taste alone:

- Monochrome or one-bit compatible.
- Color essential to the mechanic.
- Color used for legibility or state distinction.
- Color or styling primarily decorative.
- Presentation mode unclear or inconsistent with the concept.

Compare this with the Run 1 corpus before proposing a default aesthetic or a small family of presentation modes. No style standard is supplied to Worker 01 during Run 2.

## Deferred architecture review

After the production comparison, identify the minimum worker-provider contract required for a local/offline model: session creation, event normalization, interruption confirmation, writable-root enforcement, network policy, output handoff, model identity, and provenance. This is planning evidence only; Run 2 does not add a provider or weaken the existing `codex app-server` boundary.
