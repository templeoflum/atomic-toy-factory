# Phase 4 — Run 1 production log

Run started: 2026-09-15

Process: local v1, Worker 01, no factory changes during production.

## 01 — Complementary field

- Candidate versions: V1 `candidate-1789534390926-fd2cff`
- Decision: Keep
- Rework correction: none
- What worked without intervention: produced a clear complementary-color comparison, labeled degree readout, one responsive hue slider, and an immediately legible visual relationship.
- Observed production friction: the attempt took roughly 106 seconds and generated a relatively large activity trail for a simple toy; no candidate defect observed. Slider was exercised from its initial value through multiple hues.
- Possible source: tool/process overhead
- Pattern seen before: no

## 02 — Bézier bow

- Candidate versions: V1 `candidate-1789534543250-58d6a1`
- Decision: Keep
- Rework correction: none
- What worked without intervention: clear fixed endpoints, readable curve, strong visual hierarchy, live percentage, accessible SVG description, and smooth response when exercised from 50% to 80%.
- Observed production friction: production again took roughly 90 seconds and filled the 80-event visible activity window; no candidate defect observed.
- Possible source: tool/process overhead
- Pattern seen before: yes; long/simple build and high activity volume also appeared in Toy 01

## 03 — Orbit resonance

- Candidate versions: V1 `candidate-1789534688163-a0476d`
- Decision: Keep
- Rework correction: none
- What worked without intervention: animated orbital paths, concise ratio explanation, readable legend, and a discrete slider that changed the system from 2:1 to 5:1 while preserving the visual relationship.
- Observed production friction: production took roughly 110 seconds and again saturated the 80-event panel window. The accessibility layer exposed the slider's internal index value rather than its displayed ratio, which made generic automation less direct but did not harm normal operation.
- Possible source: tool/process overhead; slider semantic mapping
- Pattern seen before: activity volume and long build time recur in Toys 01–03

## 04 — Type pressure

- Candidate versions: V1 `candidate-1789534888993-27db1a`; V2 `candidate-1789535073123-a21aa6`; V3 `candidate-1789535272183-3d28aa`
- Decision: Keep V3
- Rework correction: V1 clipped the word on the left across its range; V2 moved the failure and still clipped the final E on the right at airy spacing; V3 was instructed to derive maximum spacing from the available width with explicit side padding.
- What worked without intervention: strong typographic presentation, clear labels and live values, and a visually meaningful spacing range. V3 kept the entire seven-letter word visible at both airy and compressed extremes.
- Observed production friction: the initial output failed ordinary visual fitting; the first correction was interpreted locally rather than satisfying the stated all-values/all-viewports constraint. Two reworks and roughly six minutes were needed.
- Possible source: worker deviation; missing responsive text-fitting pattern
- Pattern seen before: new candidate-quality pattern; repeated build-time/activity overhead continues

## 05 — Biased rain

- Candidate versions: V1 `candidate-1789535449271-106c9f`
- Decision: Keep
- Rework correction: none
- What worked without intervention: animated falling marks, accumulating histogram, live sample count, readable bias labels, and an obvious shift from 40% left to 40% right when the slider was exercised.
- Observed production friction: accumulated historical marks do not reset when bias changes, so the distribution takes time to reflect the new setting. This is understandable for an accumulating system and was not treated as a defect. Build-time/activity overhead recurred.
- Possible source: concept/state semantics; tool/process overhead
- Pattern seen before: long build and saturated activity recur in every toy so far

## 06 — Standing wave

- Candidate versions: none presented; failed attempt `attempt-1789535519903-61e933`
- Decision: Rejected by factory validation
- Rework correction: unavailable because rejected output is not represented as a candidate
- What worked without intervention: Worker 01 completed an isolated HTML implementation and the factory correctly withheld it after validation failed.
- Observed production friction: the validator classified SVG namespace strings passed to `document.createElementNS('http://www.w3.org/2000/svg', ...)` as forbidden external URLs. These strings identify the DOM namespace and do not load a resource. The current workflow offers no retry/rework path from a completed-but-rejected attempt.
- Possible source: tool defect; factory workflow gap
- Pattern seen before: first rejected output; build-time/activity overhead continues

## 07 — Spring weight

- Candidate versions: V1 `candidate-1789535874353-9b5a43`
- Decision: Keep
- Rework correction: none
- What worked without intervention: clear animated spring-and-weight presentation, live stiffness units, legible soft/stiff range, and an obvious response when exercised from 70 N/m to 20 N/m.
- Observed production friction: the stage also makes the weight directly draggable, adding an undocumented secondary interaction beyond the requested slider. It supports the same spring mechanic, so it was retained but noted. Build time was roughly 160 seconds.
- Possible source: work-order interpretation; tool/process overhead
- Pattern seen before: long build/activity overhead recurs; first extra direct-manipulation affordance

## 08 — Perspective tunnel

- Candidate versions: V1 `candidate-1789536002273-f93c4e`
- Decision: Keep
- Rework correction: none
- What worked without intervention: strong depth illusion, legible layer count, clean responsive framing, and a clearly visible change from 18 to 6 layers at the slider extremes.
- Observed production friction: no candidate defect observed. Activity again reached the display cap despite the straightforward output.
- Possible source: tool/process overhead
- Pattern seen before: long build/activity overhead recurs across all completed toys

## 09 — Flocking threshold

- Candidate versions: V1 `candidate-1789536194006-a6b7d7`
- Decision: Keep
- Rework correction: none
- What worked without intervention: the particle field clearly transitioned after settling: 0% alignment produced roughly 18% measured coordination and 100% alignment produced roughly 98%. The arrows made heading visible and the live coordination measure clarified the emergent result.
- Observed production friction: a stateful animated system needs a short observation interval after moving the slider; an immediate reading still reflects the previous state. No candidate defect observed.
- Possible source: concept/state semantics; tool/process overhead
- Pattern seen before: settling time resembles Toy 05's accumulating state; build/activity overhead recurs

## 10 — Contour island

- Candidate versions: V1 `candidate-1789536420661-d2c24e`
- Decision: Keep
- Rework correction: none
- What worked without intervention: nested contours, clear waterline units, a live ridge/summit explanation, and a strong visual change from 26 m to 80 m while preserving the island's spatial context.
- Observed production friction: no candidate defect observed. The accessible name combined nearby label text, so generic label-based browser automation used the unique range input instead.
- Possible source: semantic labeling; tool/process overhead
- Pattern seen before: long build/activity overhead recurs across the run

## Run totals

- Planned concepts: 10
- Worker attempts: 12
- Presented candidate versions: 11
- Kept final candidates: 9
- Reworks: 2, both for Toy 04
- Failed attempts: 1, Toy 06 validation rejection
- Attempt duration: 86–163 seconds; median 127 seconds
- Factory or security boundary changes during production: none
