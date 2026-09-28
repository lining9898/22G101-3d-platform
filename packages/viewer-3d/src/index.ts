import {
  Curve,
  CurvePath,
  LineCurve3,
  Mesh,
  MeshStandardMaterial,
  TubeGeometry,
  Vector3,
  type Group,
  Group as ThreeGroup,
  type Material,
} from 'three';
import type { ArcSegment, RebarGeometry, Vec3 } from '@g101/geometry-engine';

/** Exact circular arc; spline interpolation would round off intentionally straight segments. */
class CircularArc3 extends Curve<Vector3> {
  private readonly center: Vector3;
  private readonly radial: Vector3;
  private readonly tangent: Vector3;
  private readonly sweep: number;

  constructor(segment: ArcSegment) {
    super();
    this.center = vector(segment.center);
    this.radial = vector(segment.start).sub(this.center);
    const normal = vector(segment.normal).normalize();
    if (!Number.isFinite(segment.radiusMm) || segment.radiusMm <= 0 ||
        !Number.isFinite(segment.sweepRadians) || segment.sweepRadians === 0 ||
        Math.abs(this.radial.length() - segment.radiusMm) > 1e-4 ||
        Math.abs(normal.length() - 1) > 1e-5 ||
        Math.abs(normal.dot(this.radial)) > 1e-4) {
      throw new RangeError('Invalid circular rebar arc');
    }
    this.tangent = normal.cross(this.radial);
    this.sweep = segment.sweepRadians;
    if (this.getPoint(1).distanceTo(vector(segment.end)) > 1e-4) {
      throw new RangeError('Arc end does not match center, normal and sweep');
    }
  }

  override getPoint(t: number, target = new Vector3()): Vector3 {
    const angle = this.sweep * t;
    return target.copy(this.center)
      .addScaledVector(this.radial, Math.cos(angle))
      .addScaledVector(this.tangent, Math.sin(angle));
  }
}

function vector(p: Vec3): Vector3 {
  if (![p.x, p.y, p.z].every(Number.isFinite)) throw new RangeError('Non-finite rebar point');
  return new Vector3(p.x, p.y, p.z);
}

/** Keeps semantic segments intact; it does not infer bends or any construction rule. */
export function toThreeCurve(bar: RebarGeometry): CurvePath<Vector3> {
  if (bar.centerline.length === 0) throw new RangeError('Rebar centerline is empty');
  const path = new CurvePath<Vector3>();
  let previousEnd: Vector3 | undefined;
  for (const segment of bar.centerline) {
    const start = vector(segment.start);
    const end = vector(segment.end);
    if (previousEnd && previousEnd.distanceTo(start) > 1e-4) {
      throw new RangeError('Rebar centerline segments must meet');
    }
    if (segment.kind === 'line') {
      if (start.distanceTo(end) < 1e-7) throw new RangeError('Zero-length line segment');
      path.add(new LineCurve3(start, end));
    } else {
      path.add(new CircularArc3(segment));
    }
    previousEnd = end;
  }
  return path;
}

export interface RebarMeshOptions {
  /** Larger values smooth bends at a cost in triangles. Default 12. */
  readonly radialSegments?: number;
  /** Target axial edge length in millimetres. Default 12 mm. */
  readonly segmentLengthMm?: number;
  readonly color?: number;
}

/** Returns one selectable object per bar; caller owns disposal through disposeRebarMesh. */
export function createRebarMesh(bar: RebarGeometry, options: RebarMeshOptions = {}): Mesh {
  if (!bar.id || !Number.isFinite(bar.diameterMm) || bar.diameterMm <= 0) {
    throw new RangeError('Rebar requires a stable ID and positive diameter');
  }
  const curve = toThreeCurve(bar);
  const length = curve.getLength();
  const edge = options.segmentLengthMm ?? 12;
  const radial = options.radialSegments ?? 12;
  if (!Number.isFinite(edge) || edge <= 0 || !Number.isInteger(radial) || radial < 3) {
    throw new RangeError('Invalid mesh tessellation');
  }
  const steps = Math.max(8, Math.ceil(length / edge), bar.centerline.length * 4);
  const closed = vector(bar.centerline[0]!.start)
    .distanceTo(vector(bar.centerline[bar.centerline.length - 1]!.end)) < 1e-4;
  const geometry = new TubeGeometry(curve, steps, bar.diameterMm / 2, radial, closed);
  const material = new MeshStandardMaterial({ color: options.color ?? 0xc87939, metalness: 0.35, roughness: 0.46 });
  const mesh = new Mesh(geometry, material);
  mesh.name = bar.id;
  mesh.userData.rebarId = bar.id;
  return mesh;
}

export function createRebarGroup(bars: readonly RebarGeometry[], options: RebarMeshOptions = {}): Group {
  const group = new ThreeGroup();
  group.name = 'rebars';
  for (const bar of bars) group.add(createRebarMesh(bar, options));
  return group;
}

export function disposeRebarMesh(mesh: Mesh): void {
  mesh.geometry.dispose();
  const materials: Material[] = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  materials.forEach((material) => material.dispose());
}

export function disposeRebarGroup(group: Group): void {
  group.traverse((object) => {
    if (object instanceof Mesh) disposeRebarMesh(object);
  });
  group.clear();
}
