# Evidence-ranked adjustment plan

Status: planned — derived from the completed twenty-concept discovery program on 2026-09-16. This document plans the next implementation phase; it does not claim these changes are shipped.

## 1. Navigation grammar under accumulation

Review amendment: production executed, but operator calibration remains open. Session 02 of `PHASE4_OPERATOR_REVIEW_NOTES.md` adds instruction fidelity, truthful manipulation, perceptual clarity, performance, and teaching-purpose concerns. A permanent factory-owned slider is now the preferred control-placement direction, superseding embedded-control composition as the proposed solution; plan its isolated versioned messaging contract and legacy compatibility first. Gates below remain provisional pending calibration. No toy fixes have been made.

Evidence: Donovan's review plus loss-of-place traces at 15, 20, and 23 candidates.

Establish stable object and location rules before choosing new visual arrangements:

- The current candidate, version, and order remain unambiguous while browsing.
- Archive navigation preserves archive position; selecting an object makes its destination apparent rather than changing it offscreen.
- Provenance/comparison expansion stays associated with its source; closing or returning restores an intelligible origin.
- Each layout topology has explicit scroll ownership and discoverable region boundaries.
- Resizing preserves the operator's current object and intended path; it does not introduce jitter or strand the operator in a different region.

Implementation can group archive versions by order and use topology-appropriate progressive disclosure. Preserve full history and exact corrections; do not delete or flatten lineage to reduce clutter.

Acceptance gate: reproduce the recorded navigation trace at 23 live candidates and a 200-candidate test fixture, at every responsive width and via keyboard. Record where selection, focus, and scroll land; no selection may change only in an offscreen destination with no orienting response. Return paths retain the relevant origin and archive offset. Existing browser lifecycle and provenance tests pass.

## 2. Actual-preview fitting fixture and supplied composition material

Evidence: Type Pressure reworks, Orbit Resonance overlap, Standing Wave hidden controls, Eclipse inner scrolling, minor Consensus edge cropping.

Provide a small buildless HTML/CSS/JavaScript reference pattern for reserving stage, explanation/readout, and slider space. It must permit intentional semantic overlays but avoid hard minimum sizes that push the only control outside a hidden-overflow frame. It is a supplied tool, not a universal toy skin or worker self-evaluation requirement.

Acceptance gate: exercise the material at the shipped frame width/height pairs plus short/wide and tall/narrow probes. The slider and meaningful readouts remain visible, labels do not collide with mechanics, and animation survives resize. Use new isolated work orders to verify at least one geometry, one typography, and one field-animation toy. Existing candidates are not rewritten; any improvement to them is a new rework with provenance.

## 3. Minimal SOP clarification and periodic QC

Evidence: retained state across five concepts and secondary manipulation across three.

Clarify one concept / one adjustable parameter. Direct manipulation may excite or explore that same mechanic, but it cannot introduce another independent concept or hidden adjustable parameter. Explain retained, settling, or phase state when needed to understand the slider's effect. Do not add blanket resets, extra controls, or exhaustive worker grading.

Keep periodic sampling. Include actual preview dimensions and semantic collision checks, distinguish intentional layering from accidental overlap, and preserve both initial operator decision and later QC findings.

Acceptance gate: fresh production probes demonstrate truthful state interpretation and the clarified manipulation rule without increasing control count; periodic records show what was measured, including failed samples. No claim of broad responsive success may be based only on document overflow.

## 4. Meaningful activity and retry health

Evidence: raw display saturation across both runs; two confirmed hosted-stream reset outliers.

Present concise meaningful progress plus connection/retry state, with raw detail expandable. Preserve durable meaningful events, model/session identity, cancellation semantics, and explicit denied-access events. Never invent progress percentages or declare completion before runtime confirmation.

Acceptance gate: protocol fixtures for normal work, retries, failure, and interruption produce truthful visible states; raw/provenance evidence remains inspectable; Stop still waits for confirmed outcome; no new dependency or security reduction.

## Deferred product/architecture decisions

- Visual modes: inventory supports a one-bit default with purpose-specific color, but actual style samples and operator judgment are required before imposing a standard.
- Local worker: define a provider contract for fresh sessions, normalized events, model identity, isolated writes, no-network execution, result validation, explicit permissions, and confirmed interruption. A future offline claim requires an end-to-end disconnected-host test. Do not add a provider or credentials flow without a recorded scope decision.
- Rejected output lineage: preserve the failed source safely and consider lineage-preserving retry later; only one failure exposed this gap.

## Phase acceptance

The implementation phase passes only after adjustments 1–4 meet their gates, the full local-v1 suite passes, all pre-existing candidates remain unchanged, backup recovery passes, and architecture/quality/operations docs match shipped behavior. Style standardization and local-model implementation are not implied by this gate.
