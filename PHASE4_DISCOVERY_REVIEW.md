# Phase 4 — two-run discovery review

Review date: 2026-09-16

Sources: both production logs, persisted attempts/events/candidates, `PHASE4_OPERATOR_REVIEW_NOTES.md`, and the Run 2 periodic sample. This closes the discovery program, not the defects discovered by it.

## Production comparison

| Measure | Run 1 | Run 2 |
| --- | --- | --- |
| Concepts | 10 | 10 |
| Attempts | 12 | 10 |
| Presented versions | 11 | 10 |
| Initial first-pass keeps | 8 | 10 |
| Final kept concepts | 9 | 10 |
| Reworks | 2 | 0 |
| Validation failures | 1 | 0 |
| Median attempt duration | 127s | 137s |
| Duration range | 86–163s | 66–2,502s |

The narrow validator correction worked. Keep counts above are historical Codex dispositions only; Donovan disputes several. They are not evidence of improved candidate quality. The earlier typography-success claim is withdrawn: Donovan reports COUNTERPOINT clipping toward the left slider endpoint, missed by the recorded sample. That sample describes only its exercised settings, not full-range fitting. Session 02 of `PHASE4_OPERATOR_REVIEW_NOTES.md` records operator findings; quality calibration remains open.

Two Run 2 latency outliers have concrete connectivity evidence: Catenary's 965s event gap ended in a stream-reset retry warning; Eclipse also recorded reset/retry warnings and long gaps. Do not attribute these to toy complexity or remove them from reported timing. A local-provider proposal now has operational evidence, but offline support is not implemented.

## Periodic QC evidence

Sample: Standing Wave (first), Expanding Headline (typography-risk substitute because Run 2 had no reworked candidate), Eclipse Threshold (operator-observed tall composition), and Consensus Field (random draw from the seven remaining candidates).

All four were inspected through the factory's `allow-scripts` sandboxed iframe, not as unsandboxed top-level generated documents. Factory viewport height was 800px. At widths 320, 375, 620, 900, 1024, and 1800, effective previews were approximately 298×296, 353×351, 598×596, 554×441, 631×503, and 1026×768.

| Sample | Recorded fitting result |
| --- | --- |
| Standing Wave | Fail: slider absent/cropped at 320, 375, 900, and 1024; partially cropped at 620; fully present at 1800. Smallest readout also clips horizontally. Hidden overflow prevents ordinary internal-scroll recovery. |
| Expanding Headline | Fitted word, labels, and slider across all six actual frame sizes. Widest spacing was additionally exercised during production in the narrow view. |
| Eclipse Threshold | At 320 and 375 the default view puts the control below the frame; internal scrolling can recover it. Other sampled sizes showed the control without a stage/control collision. This is reachable but not well fitted at the smallest sizes. |
| Consensus Field | Slider/readouts legible across the matrix; smallest frame crops a panel edge. Controls intentionally overlay the full-field background; no accidental label collision observed. |

All 24 outer-page observations had no horizontal document overflow. A separate six-width major-panel rectangle check found no factory-panel overlap and confirmed `sandbox="allow-scripts"`. The toy-fitting sample therefore failed while outer factory geometry passed.

Run 1's fixed-height standalone candidate sample is not directly comparable to this actual embedded-frame audit. Its pass should not be interpreted as proof of compact-preview compatibility. The fixture must name both width and height and test the shipped container.

## Archive orientation

The same narrow-layout trace selected the newest candidate, inspected provenance, selected the oldest version, and returned to the newest candidate. None of these newest candidates had a related version, so lineage traversal was skipped explicitly.

| Candidate count | Starting scroll | Old candidate selection | Return to current | Work-order top after return |
| --- | --- | --- | --- | --- |
| 15 | 740px | 2,827px | 1,902px | Above the returned viewport |
| 20 | 717px | 3,312px | 1,803px | −1,471px |
| 23 | 771px | 3,597px | 1,809px | −1,477px |

Selection remained correct, but location did not. The flat archive and page scroll cooperate poorly: activating an archive item leaves the operator deep in the archive while the object changes elsewhere. This repeats Donovan's report at three measured archive scales and justifies a navigation-grammar adjustment.

## Visual-language inventory — Run 2

| Toy | Role of color/style | One-bit potential |
| --- | --- | --- |
| Standing Wave | Mint/gold distinguish wave and endpoints; dark glow decorative | High with distinct marks/line weights |
| Expanding Headline | Accent readout/track decorative; typography is the mechanic | High |
| Memory Stream | Bright directional trails against dark field; glow decorative | High with luminance/shape |
| Consensus Field | Gold needles/track aid legibility; no hue-dependent mechanic | High |
| Plucked String | Wave-study paper/ink character with accents | High |
| Responsive Constellation | Glow/star treatment decorative | High |
| Catenary Tension | Cable/support/readout accents aid legibility | High |
| Eclipse Threshold | Colored shaded bodies largely decorative | High with distinct fills/patterns |
| Lever Balance | Color helps identify masses/pivot, also labeled numerically | High |
| Pulse Interval | Two colors identify pulse streams | High with distinct shape/dash/fill coding |

No Run 2 concept intrinsically requires hue. Run 1 Complementary Field does. Evidence supports exploring a monochrome default plus purpose-specific color, not banning color or adopting a universal skin immediately. No style standard was imposed during either run.

## Repeated signals and disposition

- Spatial fitting: Run 1 Type Pressure, operator-reported Orbit Resonance, Run 2 Standing Wave/Eclipse, and minor Consensus cropping. Systemic across distinct types: prioritize an actual-preview fitting fixture and a minimal stage/control composition material.
- Orientation under archive growth: operator report plus three measured traces. Systemic factory UX: prioritize stable selection/location and explicit scroll ownership.
- Retained/settling state: Biased Rain, Flocking Threshold, Memory Stream, Consensus Field, and Pulse Interval. Recurring: require truthful state explanation; investigate a lightweight settling/phase cue where it prevents misreading, not a universal reset control.
- Secondary direct manipulation: Spring Weight, Memory Stream, Plucked String. Recurring: clarify that interaction may excite the same mechanic but must not add an independent adjustable concept.
- Activity noise: all attempts in both runs filled the live display cap. Systemic: separate meaningful operator activity from raw expandable protocol detail without deleting durable provenance.
- Hosted connectivity: two Run 2 reset/retry outliers. Recurring within one run: normalize retry/connection health in worker status and plan a provider-equivalence seam; do not claim offline capability yet.
- Rejected-output lineage: one confirmed gap, not repeated after the validator repair. Retain as a deferred workflow item.

The evidence-ranked implementation plan and acceptance gates are in `PHASE4_ADJUSTMENTS.md`.

## Preservation and regression evidence

All 13 pre–Run 2 candidate HTML files exactly match their Run 1 backup content. All 23 current candidates still pass static safety validation. Post-run backup contains schema 2, 22 orders, 25 attempts, and 23 embedded candidate files. Nineteen unit tests, browser lifecycle/failure/recovery/backup/restart regression, and server/panel syntax checks pass. No additional access was granted.
