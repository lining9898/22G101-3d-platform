import { describe, expect, it } from 'vitest';
import { buildRebarGeometry } from '@g101/geometry-engine';
import { createRebarMesh, disposeRebarMesh, toThreeCurve } from './index.js';

describe('geometry to viewer adapter', () => {
  it('preserves straight tangents and circular bend endpoints', () => {
    const bar = buildRebarGeometry({
      id: 'sample-unverified', diameterMm: 16, bendRadiusMm: 40,
      path: { kind: 'polyline', points: [
        { x: 0, y: 0, z: 0 }, { x: 150, y: 0, z: 0 }, { x: 150, y: 150, z: 0 },
      ] },
    });
    const curve = toThreeCurve(bar);
    const arc = curve.curves[1]!;
    expect(curve.curves).toHaveLength(3);
    expect(arc.getPoint(0).distanceTo(curve.curves[0]!.getPoint(1))).toBeLessThan(1e-5);
    expect(arc.getPoint(1).distanceTo(curve.curves[2]!.getPoint(0))).toBeLessThan(1e-5);
    const mesh = createRebarMesh(bar);
    expect(mesh.userData.rebarId).toBe(bar.id);
    expect(mesh.geometry.attributes.position.count).toBeGreaterThan(0);
    disposeRebarMesh(mesh);
  });

  it('rejects a disconnected input instead of drawing a misleading bar', () => {
    const bar = buildRebarGeometry({
      id: 'straight', diameterMm: 12,
      path: { kind: 'polyline', points: [{ x: 0, y: 0, z: 0 }, { x: 100, y: 0, z: 0 }] },
    });
    expect(() => toThreeCurve({ ...bar, centerline: [
      ...bar.centerline,
      { kind: 'line', start: { x: 200, y: 0, z: 0 }, end: { x: 300, y: 0, z: 0 } },
    ] })).toThrow(RangeError);
  });
});
