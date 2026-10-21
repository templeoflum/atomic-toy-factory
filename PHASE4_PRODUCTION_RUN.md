# Phase 4 production discovery

## Purpose

Discover the SOPs, supplied materials, fixtures, and periodic quality checks that Atomic Factory actually needs by producing twenty real toys in two evidence-driven runs.

Do not build speculative factory infrastructure during Run 1. Use local v1 as shipped, preserve every presented candidate, and record only facts observed during normal operation.

## Production cadence

1. Produce the ten Run 1 toys sequentially through Worker 01.
2. Operate every presented toy and make normal Keep, Rework, or Shelve decisions.
3. Record production observations without turning them into requirements mid-run.
4. After all ten, conduct one process review and identify repeated signals.
5. Plan Run 2 from those signals: repeat weak areas, verify proposed improvements, and retain enough variety to expose new problems.
6. Produce the second ten, review again, and only then plan factory adjustments.

No factory change should interrupt a run unless production is blocked, data is at risk, or a security boundary fails.

## Run 1 — ten toys

The set intentionally crosses DOM, SVG, canvas, animation, typography, probability, geometry, and responsive composition. The work orders describe outcomes rather than implementation.

### 01 — Complementary field

> Make a toy showing how one color changes against its complement. One slider rotates the foreground hue around the color wheel.

Primary exposure: color calculation, legible readout, CSS composition.

### 02 — Bézier bow

> Make a toy showing a straight line bending into a curve. One slider controls the strength of the bend.

Primary exposure: geometry, SVG or canvas scaling, clear cause and effect.

### 03 — Orbit resonance

> Make a toy showing two bodies moving in orbital resonance. One slider changes their orbital ratio.

Primary exposure: continuous animation, timing, resize behavior.

### 04 — Type pressure

> Make a toy showing a word changing from airy to compressed. One slider controls the spacing between its letters.

Primary exposure: typography, extreme values, text fitting.

### 05 — Biased rain

> Make a toy where falling marks accumulate into a distribution. One slider biases where the marks tend to land.

Primary exposure: probability, state over time, reset-free comprehensibility.

### 06 — Standing wave

> Make a toy showing a standing wave between two fixed ends. One slider changes the number of nodes.

Primary exposure: mathematical visualization, discrete or continuous slider mapping.

### 07 — Spring weight

> Make a toy showing a weight hanging from a spring. One slider changes the stiffness of the spring.

Primary exposure: simulated motion, damping, understandable physical response.

### 08 — Perspective tunnel

> Make a toy showing repeated frames receding into depth. One slider changes the apparent depth of the tunnel.

Primary exposure: spatial illusion, cropping, non-square viewports.

### 09 — Flocking threshold

> Make a toy showing a group shifting between scattered motion and coordinated motion. One slider controls how strongly neighbors align.

Primary exposure: many moving elements, performance, behavioral legibility.

### 10 — Contour island

> Make a toy showing an island as nested elevation contours. One slider raises and lowers the waterline.

Primary exposure: layered shapes, occlusion, state communicated without extra controls.

## Per-toy production record

Record this after the operator decision. Keep prose short and factual.

```text
Toy:
Candidate versions:
Decision: keep / shelve / rework
Rework correction, if any:
What worked without intervention:
Observed production friction:
Possible source: order / worker deviation / missing material / tool / unknown
Pattern seen before: yes / no; where:
```

The source classification is provisional. A single observation does not justify a new SOP or tool.

## Run 1 process review

Review the ten records together, candidate lineage, and worker activity. Count repeated signals in these categories:

- Work-order interpretation
- Responsive stage and composition
- Slider semantics and readout
- Animation and state handling
- Typography and labeling
- Performance
- Accessibility
- Factory workflow friction
- Security or boundary behavior

For each signal, distinguish:

- **Isolated:** appeared once; retain as an observation.
- **Recurring:** appeared at least twice; investigate during Run 2.
- **Systemic:** appeared at least three times across different toy types; propose an SOP, supplied material, or tool adjustment.
- **Critical:** threatens data or a security boundary; stop and correct before continuing.

Periodic QC happens here, after the run. Sample the first toy, one operator-selected toy, one reworked toy, and one randomly selected toy across the existing responsive matrix. This checks process capability without making QC a second production step for every candidate.

## Planning Run 2

Do not select the second ten in advance. Build its plan from Run 1 evidence:

- Four toys should deliberately revisit recurring or systemic weak areas.
- Two should exercise any proposed supplied material or SOP clarification.
- Two should be close analogues of successful Run 1 toys, checking repeatability rather than novelty.
- Two should enter new conceptual territory to guard against overfitting the factory to Run 1.

Freeze any approved adjustment for the duration of Run 2. Do not keep modifying the process between toys unless a critical condition appears.

## Phase completion evidence

Phase 4 production discovery is complete only when:

- [x] Run 1 has ten preserved production records and candidates or documented failed attempts.
- [x] The Run 1 process review and periodic sample audit are complete.
- [x] Run 2 is explicitly derived from Run 1 evidence.
- [x] Run 2 has ten preserved production records and candidates or documented failed attempts.
- [x] The two runs are compared for repeatability and process changes.
- [x] Proposed factory adjustments cite observed evidence and frequency.
- [x] No existing candidate or local-v1 security boundary is weakened.

Completion evidence (2026-09-16): `PRODUCTION_RUN_2_LOG.md`, `PHASE4_DISCOVERY_REVIEW.md`, `PHASE4_ADJUSTMENTS.md`, and the Run 2 backup. Discovery passed with preview-fitting defects explicitly recorded; completion does not mean every kept candidate passed periodic QC.
