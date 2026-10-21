# F-01 revision E — review controls

Draft, not implemented. Supersedes D's five-choice review strip only; routing, filtering, fixed frame and worker Stop behavior remain as D specifies.

## Primary judgment

PASS accepts this candidate. FAIL marks it as failed and opens the next-step choice: provide a short rework note, or Toss. Rework starts a fresh attempt with the original order, candidate and correction preserved. Closing the failed-review step leaves the failed judgment visible; it must not turn into a silent pass.

Toss removes the failed candidate from the default active rack, not from storage. Preserve its source, failed judgment and history for inspection. Destructive deletion is not implied. Record each judgment and follow-up with timestamp and reviewer; later changes append history, not overwrite it.

## Information on request

One Details entry opens deeper analysis, references, work order, worker identity, blueprint revision, candidate lineage and review/rework history. No separate provenance, exploration or shelving controls in the primary strip. Details is not initially expanded and returns to the same inspection and rack position.

PASS is operator judgment, not static-validator success. Candidate safety remains a prerequisite for presentation.
