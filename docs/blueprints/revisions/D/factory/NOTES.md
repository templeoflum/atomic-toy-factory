# F-01 revision D — operating notes

Draft, approval pending. Diagram is schematic; three concurrent workers are proposed, not currently implemented. Toy construction drawings are unchanged.

## Routing and filtering are independent

Direction selects exactly one order recipient (01–03). Issue sends to that worker only. A busy recipient requires explicit queue policy or a visible rejection; no silent reassignment.

The rack starts at All. Clicking a worker chip filters output to that worker; All restores combined output. Filtering never changes recipient, starts work, stops work or selects an arbitrary toy. Every item identifies its worker, toy, version and disposition. Preserve rack positions per filter and retain current toy inspection with a visible identity even if that toy is outside the active filter.

## Direct Stop per worker

Each cell's Stop remains visible and directly operable regardless of filter or order recipient. No selection or menu is required. Stop targets the active run ID displayed by that cell; stale run identity must not interrupt a newer replacement run.

Running → Stopping… → runtime-confirmed cancelled / completed / failed outcome. Interruption is a request, not instantaneous cancellation. Keep progress visible until confirmation. Other workers are unaffected. Disable Stop for idle/terminal cells; do not silently dismiss unsuccessful interruption.

Three concurrent workspaces must retain existing sandbox, network, reference, candidate-preservation and explicit-access boundaries. Actual status comes from events. This tool is not a safety-certified emergency-stop system and must not be represented as one.

## Spatial scope

Output fills the right lane. Factory Home provides access to factory-level operations and administration. Direction and toy occupy the left and center lanes. The fixed outer frame and bottom bar do not scroll. Only individual content interiors scroll, without document or sibling scroll chaining. Stop controls may not be displaced by activity expansion or hidden by horizontal worker-bar scrolling.

Worker cell status covers running, stopping, idle, failure and access needs; activity can be opened without losing direct Stop access. Explore remains initially closed; blueprint and analysis views restore the prior object and navigation origin.

## Minor review-strip correction — operator-authorized in-place amendment

## Primary judgment

PASS accepts this candidate. FAIL marks it as failed and opens the next-step choice: provide a short rework note, or Toss. Rework starts a fresh attempt with the original order, candidate and correction preserved. Closing the failed-review step leaves the failed judgment visible; it must not turn into a silent pass.

Toss removes the failed candidate from the default active rack, not from storage. Preserve its source, failed judgment and history for inspection. Destructive deletion is not implied. Record each judgment and follow-up with timestamp and reviewer; later changes append history, not overwrite it.

## Information on request

One Details entry opens deeper analysis, references, work order, worker identity, blueprint revision, candidate lineage and review/rework history. No separate provenance, exploration or shelving controls in the primary strip. Details is not initially expanded and returns to the same inspection and rack position.

PASS is operator judgment, not static-validator success. Candidate safety remains a prerequisite for presentation.
