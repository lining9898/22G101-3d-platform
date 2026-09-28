# BATCH 0 quality gates

`npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `node tests/verify-rule-coverage.mjs`, and `npm run build` run on pull requests and pushes to `main`. A failed gate blocks a green CI run. Geometry and rule tests use explicitly illustrative inputs; no Batch 0 example establishes a 22G101 construction rule.

## Rule verification contract

The canonical public rule records live under `data/22g101/rules/**/*.json`, with one JSON object per file. Each record needs a unique safe `id` and may carry `status: "UNVERIFIED" | "REVIEW_REQUIRED" | "VERIFIED"`; omitted status means `UNVERIFIED`. A rule can become `VERIFIED` only after human review of its evidence and an executable regression test named `tests/verified-rules/<id>.test.ts`. The CI checker fails when a VERIFIED rule lacks that file. The test must assert outputs and boundaries against reviewed source material; a trivial test that only calls a function does not provide technical verification. Rule review and evidence review remain separate: a matching filename alone does not certify the source or engineering result. Do not add scanned pages or full atlas text to public fixtures.

`G101Rule` runtime schema and verification metadata are separate in BATCH 0. The JSON `status` above is the publication/review gate for future canonical data files; it does not override Evidence status, whose default is `UNVERIFIED`. Before releasing real rules, enforce the link between every VERIFIED rule, human-reviewed VERIFIED Evidence records, and regression test cases.

## Next tests by boundary

| Boundary | Test with source available | Expected result |
| --- | --- | --- |
| Rule conditions | Two matching rules at equal priority, missing inputs | Explicit ambiguity/validation error |
| Geometry | Paths with arcs, invalid radius, degenerate segments | Valid ordered centerline or error |
| Viewer | Selection maps to rebar IDs, hide/isolate and mobile orbit | Browser interaction and screenshots |
| Evidence | Missing source, incomplete page/node or unreviewed status | Not displayed as verified atlas fact |
| Integration | Parameter change through rule to geometry to viewer | Stable IDs, reproducible output |

Future viewer browser tests should run with Playwright on desktop and a narrow mobile viewport, and capture screenshots for visual review. Add regression fixtures only for independently checked examples; record the reviewed edition, page, node, reviewer, and test case association without storing copyrighted pages in the public repository.
