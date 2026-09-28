# Evidence contract (BATCH 0)

`packages/schemas/src/evidence.ts` defines reference metadata only. It contains no 22G101 construction values, page images or copyrighted passages. `description` is a short original summary, not reproduced atlas text. Keep source PDFs and scans outside Git.

## Fields and state

| Field | Meaning |
| --- | --- |
| `id` | Stable opaque reference key for rule links. |
| `atlas`, `edition` | Source identity and edition as checked against the copy used. |
| `page` | Printed page label. Required to approve a direct atlas source. |
| `node`, `section` | Optional location labels; copy only short identifiers. |
| `description` | Short original summary; no long verbatim extracts. |
| `sourceType` | `ATLAS`, `OFFICIAL_METADATA` or `OTHER`. Only `ATLAS` is eligible for verification. |
| `status` | `UNVERIFIED`, `REVIEW_REQUIRED`, `VERIFIED`. |
| `reviewedBy`, `reviewedAt` | Required only for `VERIFIED` records. |

`createEvidence(draft)` always creates `UNVERIFIED`, including when called from untyped JavaScript with an extra `status` field. `requestEvidenceReview` promotes a draft to `REVIEW_REQUIRED`; `approveEvidence` demands that state, a direct atlas reference with printed page, reviewer identifier and ISO timestamp. The application must authenticate the reviewer, actually compare the source, record the decision in an audit trail, and control who may call approval. These functions alone cannot prove a human reviewed the source.

## Handoff to rule engine and QA

Rules reference evidence by `EvidenceReference.id`, for example `evidenceIds: string[]`. A rule should remain unverified until **all** supporting evidence has passed an independent human review and the rule itself is reviewed and tested. Evidence verification does not automatically verify a rule. Missing, withdrawn or conflicting evidence must block verified claims. A rule engine must not infer a construction instruction from `description`.

QA should cover the initial default, rejection of implicit status escalation, transition order, source type and page gate, empty reviewer and malformed timestamp. Later CI should fail any verified rule without matching verified references and tests. BATCH 0 contains no real verified evidence or rules.
