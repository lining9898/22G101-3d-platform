/** Pure millimetre-space geometry contract. No viewer, host CAD, or atlas rules. */
export interface Vec3 { readonly x: number; readonly y: number; readonly z: number }
export interface LineSegment { readonly kind: 'line'; readonly start: Vec3; readonly end: Vec3 }
export interface ArcSegment {
  readonly kind: 'arc'; readonly start: Vec3; readonly end: Vec3;
  readonly center: Vec3; readonly normal: Vec3;
  readonly radiusMm: number; readonly sweepRadians: number;
}
export type CenterlineSegment = LineSegment | ArcSegment;
export interface RebarPathInput {
  readonly id: string;
  readonly diameterMm: number;
  readonly path: { readonly kind: 'polyline'; readonly points: readonly Vec3[] };
  /** Centerline radius in mm. Required to round corners; no atlas default is inferred. */
  readonly bendRadiusMm?: number;
}
export interface RebarGeometry {
  readonly id: string;
  readonly diameterMm: number;
  readonly centerline: readonly CenterlineSegment[];
  /** Radius of the eventual circular section, not a generated solid. */
  readonly sectionRadiusMm: number;
  readonly units: 'mm';
}

const EPS = 1e-9;
const add = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const scale = (a: Vec3, n: number): Vec3 => ({ x: a.x * n, y: a.y * n, z: a.z * n });
const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x,
});
const length = (a: Vec3): number => Math.hypot(a.x, a.y, a.z);
const unit = (a: Vec3): Vec3 => scale(a, 1 / length(a));
const finiteVec = (p: Vec3): boolean => [p.x, p.y, p.z].every(Number.isFinite);

/**
 * Builds one bar centerline. Polyline vertices specify theoretical corners. An
 * explicit radius replaces each turn with a tangent circular arc in its plane.
 * It rejects bends whose tangent lengths overlap; callers must fix the input.
 */
export function buildRebarGeometry(input: RebarPathInput): RebarGeometry {
  const { points } = input.path;
  if (input.path.kind !== 'polyline' || points.length < 2 || points.some(p => !finiteVec(p))) {
    throw new RangeError('A rebar path requires at least two finite polyline points');
  }
  if (!input.id || !Number.isFinite(input.diameterMm) || input.diameterMm <= 0) {
    throw new RangeError('Rebar id and positive finite diameterMm are required');
  }
  const radius = input.bendRadiusMm;
  if (radius !== undefined && (!Number.isFinite(radius) || radius <= 0)) {
    throw new RangeError('bendRadiusMm must be a positive finite centerline radius');
  }
  const distances = points.slice(1).map((p, i) => length(sub(p, points[i]!)));
  if (distances.some(d => d < EPS)) throw new RangeError('Zero-length path edge');
  const trims = points.map(() => 0);
  const arcs = new Map<number, ArcSegment>();
  if (radius !== undefined) {
    for (let i = 1; i < points.length - 1; i++) {
      const a = points[i - 1]!; const corner = points[i]!; const b = points[i + 1]!;
      const incoming = unit(sub(corner, a)); const outgoing = unit(sub(b, corner));
      const cosine = Math.max(-1, Math.min(1, dot(incoming, outgoing)));
      const theta = Math.acos(cosine);
      if (theta < EPS) continue;
      if (Math.PI - theta < EPS) throw new RangeError('A 180-degree reversal is not a valid bend');
      const trim = radius * Math.tan(theta / 2);
      trims[i] = trim;
      const start = sub(corner, scale(incoming, trim));
      const end = add(corner, scale(outgoing, trim));
      const perpendicular = sub(outgoing, scale(incoming, cosine));
      const center = add(start, scale(unit(perpendicular), radius));
      arcs.set(i, { kind: 'arc', start, end, center,
        normal: unit(cross(incoming, outgoing)), radiusMm: radius, sweepRadians: theta });
    }
  }
  for (let i = 0; i < distances.length; i++) {
    if (trims[i]! + trims[i + 1]! >= distances[i]! - EPS) {
      throw new RangeError('Adjacent bend tangent lengths consume a path edge');
    }
  }
  const centerline: CenterlineSegment[] = [];
  for (let i = 0; i < distances.length; i++) {
    const u = unit(sub(points[i + 1]!, points[i]!));
    centerline.push({ kind: 'line', start: add(points[i]!, scale(u, trims[i]!)),
      end: sub(points[i + 1]!, scale(u, trims[i + 1]!)) });
    const arc = arcs.get(i + 1);
    if (arc) centerline.push(arc);
  }
  return { id: input.id, diameterMm: input.diameterMm,
    sectionRadiusMm: input.diameterMm / 2, units: 'mm', centerline };
}
