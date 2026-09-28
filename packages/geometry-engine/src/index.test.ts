import { describe, expect, it } from 'vitest';
import { buildRebarGeometry } from './index';

describe('centerline geometry (illustrative inputs, no 22G101 rule)', () => {
  it('rounds an L corner with tangent arc and explicit radius', () => {
    const result = buildRebarGeometry({ id: 'example', diameterMm: 12, bendRadiusMm: 20,
      path: { kind: 'polyline', points: [
        { x: 0, y: 0, z: 0 }, { x: 100, y: 0, z: 0 }, { x: 100, y: 100, z: 0 },
      ] } });
    expect(result.centerline.map(s => s.kind)).toEqual(['line', 'arc', 'line']);
    const arc = result.centerline[1];
    if (arc?.kind !== 'arc') throw new Error('expected circular arc');
    expect(arc.center.x).toBeCloseTo(80);
    expect(arc.center.y).toBeCloseTo(20);
    expect(arc.radiusMm).toBe(20);
    expect(arc.sweepRadians).toBeCloseTo(Math.PI / 2);
    expect(result.sectionRadiusMm).toBe(6);
  });

  it('refuses overlapping bends and zero edges', () => {
    const path = { kind: 'polyline' as const, points: [
      { x: 0, y: 0, z: 0 }, { x: 30, y: 0, z: 0 },
      { x: 30, y: 30, z: 0 }, { x: 0, y: 30, z: 0 },
    ] };
    expect(() => buildRebarGeometry({ id: 'stirrup', diameterMm: 8, bendRadiusMm: 20, path }))
      .toThrow(/consume/);
    expect(() => buildRebarGeometry({ id: 'bad', diameterMm: 8, path: {
      kind: 'polyline', points: [path.points[0]!, path.points[0]!],
    } })).toThrow(/Zero-length/);
  });

  it('preserves an arbitrary multi segment path with no invented bend radius', () => {
    const points = [
      { x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 },
      { x: 10, y: 10, z: 0 }, { x: 10, y: 10, z: 20 },
    ];
    const geometry = buildRebarGeometry({ id: 'path', diameterMm: 10,
      path: { kind: 'polyline', points } });
    expect(geometry.centerline).toHaveLength(3);
    expect(geometry.centerline.every(s => s.kind === 'line')).toBe(true);
  });
});
