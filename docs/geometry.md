# BATCH 0: rebar geometry contract

`buildRebarGeometry` is a pure, deterministic TypeScript function. It consumes one
reinforcement definition's ID, diameter, explicit polyline vertices, and optional
centerline bending radius, all in millimetres. It emits ordered straight and
circular centerline segments plus the circular cross-section radius. A viewer may
sweep the section along that centerline, sampling arcs precisely. The output is
independent of Three.js and any 22G101 construction rule.

`STRAIGHT`, `L`, `U`, `BENT`, `CLOSED_STIRRUP`, `OPEN_STIRRUP`, and
`MULTI_SEGMENT` are rule-layer names for paths, not seven duplicate geometric
algorithms. Closed stirrups close by repeating the first vertex at the end;
their start/end seam and hooks must be supplied by the rule layer. Count and
spacing belong to the rule/distribution layer and must not be inferred here.

Rounding is optional only for unverified illustrative paths. Without an explicit
radius, corners remain mathematical sharp polylines; the geometry engine does
not infer physically valid bending. A verified rule must provide a source-backed
bend radius or separately specify why none is needed. Colliding tangent lengths,
zero edges, invalid diameters and 180-degree reversals fail with `RangeError`.
The engine currently returns centerlines rather than manufacture-ready solids,
cutting lengths or IFC entities. Sweeps, dimensional clearances, clash checks,
noncircular bends and bend-by-bend radii belong to later batches.

## Primary-source research

- [FreeCAD BIM `Arch.makeRebar` implementation](https://github.com/FreeCAD/FreeCAD/blob/main/src/Mod/BIM/Arch.py): its sketch/draft wire defines a single bar path; diameter controls section, amount and spacing distribute copies. This validates separating path, section, and placement.
- [FreeCAD Reinforcement `LShapeRebar.py`](https://github.com/amrit3701/FreeCAD-Reinforcement/blob/master/LShapeRebar.py): the source calculates L-shaped bar points from structural host face, covers and orientation, then creates an Arch rebar and carries `Rounding` as a parameter. The host and FreeCAD document operations do not fit a browser runtime.
- [FreeCAD Reinforcement project source overview](https://github.com/amrit3701/FreeCAD-Reinforcement): individual shape scripts produce straight, L, U, bent and stirrup bars; beam, column, slab and footing tools assemble them. This project uses the data flow as design guidance, without copying source or bundling FreeCAD.

No claim in this document supplies a 22G101 figure, value, page, or verified rule.
