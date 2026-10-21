# Blueprint revision history

All sheets are drafts, not approved for production. Archives are append-only: never edit or delete an archived sheet. Publish a new unique revision path and append its ledger entry before changing any current link. Do not update an old checksum to conceal a revision.

| Revision | Drawings | Change / provenance |
| --- | --- | --- |
| A | [T-01](revisions/A/T-01.svg), [T-02](revisions/A/T-02.svg), [T-03](revisions/A/T-03.svg), [T-04](revisions/A/T-04.svg), [T-05](revisions/A/T-05.svg) | Existing original-set files snapshotted; includes pre-review drafting corrections. |
| B | [W-01](revisions/B/worker/W-01.svg), [W-02](revisions/B/worker/W-02.svg), [F-01](revisions/B/factory/F-01.svg) | Worker/factory split. W-01 and F-01 recovered from recorded conversation content, not byte-exact original archives; formatting and thumbnail corrections may differ. W-02 snapshotted directly. |
| B1 | [W-01](revisions/B1/worker/W-01.svg) | Identity + description blocks added. Direct snapshot. Drawing originally mislabeled B; archive B1 distinguishes this change without altering preserved source. |
| C | [F-01](revisions/C/factory/F-01.svg) | Workers to fixed bottom bar; output expands in existing lane; section-only scrolling. Direct snapshot. |
| D | [F-01](revisions/D/factory/F-01.svg), [operating notes](revisions/D/factory/NOTES.md) | Output-only rack, all-worker default filter, independent order recipient, three status cells with direct individual Stop. New draft; not implemented. |

## Current review set

Worker sheets received minor in-place alignment: W-01 uses Details and accurately labels B1; W-02 includes identity, parameter specification and description/reference metadata in the assembly ports. Factory-management commentary removed. Supplied parts and exact schema remain proposed, not implemented. Prior checksums recorded in ledger.

Operator-authorized minor correction applied in place to D: PASS / FAIL, then rework note or Toss; one Details entry. No new revision warranted. E was created prematurely and is retained only as a redundant non-current artifact. Ledger records the prior D checksums and reason for this explicit exception. Minor drafting corrections may be amended in place when Donovan directs; substantive revisions still get separate paths.

- [W-01 / B1](revisions/B1/worker/W-01.svg)
- [W-02 / B](revisions/B/worker/W-02.svg)
- [F-01 / D](revisions/D/factory/F-01.svg) and [operating + review notes](revisions/D/factory/NOTES.md).

Existing unversioned paths are legacy working copies, not provenance references. Use archive paths for review and future work-order pinning. New changes must be archived under new IDs first, never made only in place.

The ledger records SHA-256 for every archived sheet; `npm test` checks archived content and completeness. Checksums detect accidental mutation, not OS-level write prevention. Future viewer/worker dispatch must resolve only approved revision IDs; none are approved yet.
