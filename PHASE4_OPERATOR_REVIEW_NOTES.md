# Phase 4 — operator review notes

These are observational notes gathered while Donovan reviews preserved production output. They are evidence for the post–Run 2 adjustment review, not approved requirements or authorization to change the factory during the review.

Planning disposition: the observations from session 01 are now represented in the Run 2 measurement plan. No candidate was rewritten, no visual standard was imposed, and no local-model provider was added.

## Review session 01 — 2026-09-16

### Primary takeaway — orientation degrades as output accumulates

The growing number of candidates has made the factory increasingly disorienting to navigate. A webpage is a topological space, not merely a set of responsive rectangles: the operator needs a continuous, comprehensible path through it and must be able to predict which regions move, remain anchored, or retain position after each action.

When scrolling, selecting a candidate, opening provenance, comparing versions, or changing viewport size causes movement that conflicts with that expectation, the interface feels disjointed and the operator loses their place. The eventual design work should investigate a small set of spatial rules—related to the existing cell-field idea—for scroll ownership, anchoring, movement between regions, stable selection, focus transfer, and preservation of location. No particular solution is approved yet.

Provisional classification: recurring factory UX risk exposed by archive growth. It was not measured during Run 1 and should not be mistaken for a candidate defect.

### Missed candidate defect — Orbit Resonance overlap

Orbit Resonance was kept, but in Donovan's current view the slider and its description overlap the outer orbit path. This should have been noted during review even though the candidate passed the automated responsive sample.

The existing audit checked page/body horizontal overflow, slider count, and slider visibility. It did not test semantic overlap between meaningful visual regions. This is evidence that containment is not equivalent to spatial coherence and that the current periodic QC gate has a blind spot.

Provisional classification: one observed candidate composition failure plus one confirmed QC-coverage gap. Preserve the kept decision and candidate unchanged.

### Open product question — toy visual language

It is unclear whether every toy should share one standard aesthetic or whether distinct toy types should use distinct visual languages. Donovan favors a one-bit e-ink character, while recognizing that color-dependent concepts require color.

A possible direction to evaluate later is a small, intentional family of presentation modes rather than either unrestricted styling or one universal skin—for example, a monochrome default with narrowly justified color and other modes tied to a toy's perceptual purpose. This is a hypothesis only. Evidence from both runs should be reviewed before defining styles, supplied materials, or worker instructions.

Provisional classification: open scope and design-system question; no decision.

### Future capability — local model portability

The factory should eventually permit a local model so useful work can continue without internet access. The current worker adapter starts the installed `codex app-server` and relies on its existing authentication and configured model. Attempt isolation, output validation, candidate preservation, and preview isolation are factory-owned boundaries and should remain independent of the model provider.

The eventual architecture question is therefore how to introduce a worker-provider seam with an equivalent event, cancellation, sandbox, and result contract—not merely a model picker. Claims of offline support must be tested end to end, including model availability and any hidden network dependency.

Provisional classification: future capability and architectural constraint; not part of the current Run 2 change set.

## Review session 02 — Run 2 operator calibration — 2026-09-16

Donovan disputes several initial first-pass Keeps. All ten remain historical Codex dispositions, not operator-approved quality outcomes. No candidate source or stored disposition is changed during this review. These are operator observations, not newly instrumented measurements; viewport/device and frame timings were not supplied. Unmentioned candidates are not implicitly approved.

| Candidate | Operator finding / review direction |
| --- | --- |
| Standing Wave — `candidate-1789538157673-1b7063` | Previously identified fitting failure; animation is also choppy and below the expected standard. Not a clean Keep; fitting and performance need investigation. |
| COUNTERPOINT — `candidate-1789538293650-e1f8b7` | Text clips at canvas edges toward the left end of the slider. Instruction failure missed by Codex; rework warranted. Withdraw the broad typography-success claim. |
| Vector Echo — `candidate-1789538500885-21483d` | Works, but teaching purpose and intuition developed are unclear. Donovan would probably Shelve (tentative). Weak concept grounding is partly a planning/work-order problem. |
| Common Direction — `candidate-1789538717829-07eaa8` | Mostly works, but response is subtle; could be more apparent and reactive. No final disposition supplied. |
| Plucked String — `candidate-1789538894029-b776c1` | Implies plucking where dragged, but does not pluck at that location. Misleading interaction/model correspondence, not merely an extra-control concern. |
| Elastic / Responsive Constellation — `candidate-1789539075009-2ab975` | Essentially zooms an unchanged pattern; never becomes unsettled, so does not demonstrate elastic settling. Concept demonstration failure. |
| Overlap Orbit — `candidate-1789542736358-971f06` | Appears to suffer performance drops. Cause and severity not yet measured. |
| Drift — `candidate-1789542970610-8cf6c3` | Equal speed can be restored but true synchronization does not return. Technically follows the request, yet intended concept is unclear. Revisit grounding and phase/rate interpretation, not automatically add a reset. |

### Product direction — permanent factory-owned slider

Donovan proposes a separate, permanent slider in the factory interface, outside the toy canvas/preview, interacting with each toy. Intended benefits are consistent placement and removal of recurring stage/control fitting issues. This is a requested design direction, not shipped behavior or authorization to rewrite existing candidates during review.

Planning must define a versioned control contract for range, step, initial value, label/unit and readout, with messages scoped to the active isolated preview. No same-origin access, host credentials, arbitrary host operations, or relaxation of sandbox/CSP is implied. Legacy candidates retain embedded controls until explicitly reworked or a tested compatibility approach is adopted.

### Quality calibration takeaway

Runnable output and a visibly changing slider are insufficient acceptance criteria. Distinguish instruction fidelity, honest interaction, perceptual clarity, animation quality, and identifiable teaching purpose. Periodic QC and supplied tools remain the approach, not exhaustive worker self-grading. Frame-rate complaints require measurement before diagnosing causes or inventing numeric targets.

Equal frequency with retained phase offset is distinct from phase synchronization. That may be valid physics, but does not alone make Drift an effective teaching exercise. A future work order must state the intended intuition and make the distinction perceptible.

No fixes executed. Operator calibration remains open.

## Codex review notes

- Run 1 tested whether toys could be produced and contained across widths, but did not adequately test whether the factory remains navigable as its archive grows. Archive scale is now a real production input.
- The interface currently combines page scrolling, a sticky work-order card in wide mode, a separately scrolling activity list, topology changes among wide/balanced/stacked layouts, programmatic scrolling when comparison opens, and an ungrouped chronological candidate rack. Each behavior can be reasonable alone; their combined navigation path needs deliberate evaluation.
- Stable orientation likely depends on invariants rather than more breakpoints: the operator should know what is the current object, where its lineage lives, what will remain fixed, where an action will take them, and how to return. These are candidates for later acceptance tests, not adopted requirements yet.
- Candidate QC needs a distinction between geometric containment and semantic collision. The Orbit Resonance observation shows why viewport overflow checks alone can produce a false sense of responsive quality.
- A visual-language decision should follow classification of the toys actually produced. Color is sometimes the mechanic, so a one-bit default should not become a blanket ban. A constrained palette of purposeful modes is worth testing against the full corpus.
- Local-worker portability is compatible with the existing trust-boundary design only if every provider is held to the same workspace, approval, event, cancellation, validation, and preview contracts. Provider equivalence is a security and operability problem as well as a generation-quality problem.

## Deferred questions for the adjustment review

1. What is the intended navigation path for issuing work, observing it, reviewing a candidate, inspecting lineage, and returning to the archive?
2. Which region, if any, owns scrolling at each topology, and which context must remain anchored?
3. How should archive growth change presentation: grouping, indexing, filtering, progressive disclosure, or another structure?
4. What measurable checks identify collision between semantically distinct candidate regions?
5. Which visual properties are factory identity, which are presentation modes, and which remain worker choice?
6. What minimum provider contract would make local and hosted workers interchangeable without weakening boundaries or provenance?
