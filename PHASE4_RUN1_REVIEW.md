# Phase 4 — Run 1 process review

Review date: 2026-09-16

Source records: `PRODUCTION_RUN_1_LOG.md`, persisted candidate lineage, attempts, and worker activity.

Subsequent hands-on operator observations are recorded separately in `PHASE4_OPERATOR_REVIEW_NOTES.md`. They do not retroactively alter Run 1 decisions or authorize fixes during review.

## Outcome

Ten planned concepts produced twelve real Worker 01 attempts. Nine concepts reached a kept candidate. Eleven candidate versions were presented because Type Pressure needed two reworks. Standing Wave completed in the worker but was rejected by candidate validation.

The factory preserved all presented versions and exact rework corrections. No worker received write access outside its attempt workspace, no additional access was granted, and no security boundary was changed during the run.

A complete post-run backup is preserved at `data/backups/phase4-run1-2026-09-16.json`; it contains 12 orders, 15 attempts, and 13 total candidates including the pre-run local-v1 work.

## Process signals

### Systemic — production latency and activity noise

All twelve attempts took 86–163 seconds, with a median of 127 seconds. Every completed run filled the panel's 80-item raw activity view even though durable meaningful events ranged from 37 to 59.

This is a factory-process signal, not a candidate-quality failure. Run 2 should gather the same timing data before deciding whether prompt, protocol, event filtering, or worker behavior is responsible.

### Isolated but confirmed tool defect — SVG namespace false positive

Standing Wave was rejected because its script called `document.createElementNS('http://www.w3.org/2000/svg', ...)`. The validator treated the SVG DOM namespace identifier as an external resource URL even though it cannot perform a network load.

This is a concrete validator defect. The narrow corrective proposal is to allow the exact SVG namespace literal only in namespace-aware DOM creation while retaining URL rejection in resource-bearing and executable contexts. Add a regression test before Run 2 and repeat Standing Wave as the first verification order.

### Workflow gap — rejected output cannot be retried as lineage

A validation failure leaves an attempt record but no candidate, so the operator cannot use Rework to carry the rejected source and a correction into a new attempt. Do not solve this before Run 2 unless the repeated Standing Wave attempt demonstrates a need; preserve it as a workflow observation.

### Isolated candidate failure — responsive typography

Type Pressure V1 clipped the word on the left. V2 satisfied the local direction but clipped the final letter on the right. V3 derived spacing from available width and passed at both extremes.

One concept is insufficient for a supplied typography component, but the repeated correction within that lineage justifies a second responsive-type order in Run 2.

### Recurring concept behavior — state requires settling

Biased Rain and Flocking Threshold both respond over time rather than instantaneously. Immediate inspection can misread the previous state. The toys were understandable after observation, but Run 2 should test whether a transition or settling cue improves stateful concepts without adding controls.

### Isolated scope interpretation — secondary direct manipulation

Spring Weight added a draggable weight alongside the requested stiffness slider. It supported the same mechanic and was kept, but the occurrence should be repeated deliberately before deciding whether the SOP should allow or prohibit direct manipulation beyond the slider.

## Periodic QC sample

Sample:

- First produced candidate: Complementary Field V1
- Operator-selected animated candidate: Flocking Threshold V1
- Reworked candidate: Type Pressure V3
- Run-end sample: Contour Island V1

Each sample was loaded directly at 320, 375, 620, 900, 1024, and 1800 CSS pixels. All 24 observations had exactly one range slider, no document or body horizontal overflow, and a slider fully within the 800-pixel-high viewport. Type Pressure V3 was also visually inspected at 320px with the full word visible and side padding intact.

QC result: process sample passed. No systematic responsive-layout failure was observed.

Later operator review found a slider/description collision with the outer path in Orbit Resonance at the reviewed viewport. The original audit therefore remains accurate only for the properties it measured; it did not establish semantic non-overlap. See `PHASE4_OPERATOR_REVIEW_NOTES.md`.

## Decisions before Run 2

1. Correct and regression-test only the confirmed SVG namespace validator false positive.
2. Make no SOP, supplied-material, or layout-system change from a single candidate lineage.
3. Keep the worker prompt and sandbox unchanged.
4. Retain timing and activity measurements for comparison.
5. Use Run 2 to repeat typography, stateful behavior, and direct manipulation before proposing broader adjustments.
