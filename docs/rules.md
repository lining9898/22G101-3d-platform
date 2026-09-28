# BATCH 0 — rule domain and boundary

The rule engine is pure TypeScript. It imports only the domain contracts from `@g101/schemas/domain`; it does not import React, Three.js, a viewer, PDF content, or any actual 22G101 rule. The repository contains no populated rule catalogue in this batch.

## Flow

`Component` holds a kind and parameter values; `Node` identifies the requested detail within that component. A serializable `G101Rule` declares required parameter definitions, a composable condition, a priority, one or more reinforcement templates, and evidence IDs. `resolveRule(component, node, rules)` validates input and chooses exactly one matching rule; equal winning priorities are reported as ambiguity. It evaluates arithmetic without executing arbitrary code, then returns `ReinforcementDefinition` records with centerline coordinates in **mm**, diameter in **mm**, shape, count, optional explicitly supplied bend radius, rule ID and evidence IDs.

The geometry engine consumes each definition's centerline (`path.kind = 'polyline'`) and diameter. A missing `bendRadiusMm` carries no implied engineering radius. `count` is metadata and does not generate an implicit placement array. The viewer consumes geometry output and must not resolve rule conditions itself.

## Evidence and verification

`G101Rule.evidenceIds` refers to independently managed `Evidence.id` records from `packages/schemas/src/evidence.ts`. `ReinforcementDefinition.evidenceIds` preserves those IDs. This engine never upgrades evidence status or declares a rule VERIFIED. Before any real rule is shipped, a reviewed rule registry and CI association of every VERIFIED rule with reviewed evidence and a regression test must be designed and implemented. An empty evidence ID array is possible for a technical prototype, but cannot support a VERIFIED claim.

## Validation boundaries

Every rule for a selected component/node should declare the same parameter schema. Unknown, missing, mistyped, nonfinite, or out of range parameter values fail explicitly; `count` parameters must be integers. A missing rule, mismatch between node and component, conflicting top priority, division by zero, invalid diameter/count/radius, or centerline shorter than two points raises `RuleResolutionError`. Numeric expressions permit parameter lookup and `add`, `subtract`, `multiply`, `divide`; conditions permit logical groups, equality, and numeric comparisons. Rule authoring validation and consistency across multiple candidate parameter schemas are future work.

## Example (synthetic, not 22G101)

An isolated test could pass `spanMm=1000`, a synthetic straight bar template with points `(0,0,0)` and `(spanMm,0,0)`, and verify a 1000 mm output path. This only checks software behavior; it has no 22G101 authority.
