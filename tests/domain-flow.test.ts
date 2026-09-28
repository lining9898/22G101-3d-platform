import { describe, expect, it } from 'vitest';
import { approveEvidence, createEvidence, requestEvidenceReview } from '@g101/schemas/evidence';
import type { G101Rule } from '@g101/schemas/domain';
import { resolveRule, RuleResolutionError } from '@g101/g101-rule-engine';
import { buildRebarGeometry } from '@g101/geometry-engine';
import { toThreeCurve } from '@g101/viewer-3d';

describe('Batch 0 boundary contracts, illustrative values only', () => {
  it('defaults evidence to UNVERIFIED and requires explicit review for approval', () => {
    const draft = createEvidence({
      id: 'example-source', atlas: 'illustrative source', edition: 'sample', page: 'A1',
      description: 'synthetic fixture', sourceType: 'ATLAS',
    });
    expect(draft.status).toBe('UNVERIFIED');
    expect(() => approveEvidence(draft, { reviewedBy: 'reviewer', reviewedAt: '2026-09-28T00:00:00Z' })).toThrow();
    const reviewed = approveEvidence(requestEvidenceReview(draft), {
      reviewedBy: 'reviewer', reviewedAt: '2026-09-28T00:00:00Z',
    });
    expect(reviewed.status).toBe('VERIFIED');
  });

  it('passes an explicitly synthetic rule through geometry to the viewer curve', () => {
    const rule: G101Rule = {
      id: 'synthetic-only', componentKind: 'SAMPLE', nodeKind: 'SAMPLE', priority: 1,
      parameters: [{ key: 'span', type: 'number', required: true, unit: 'mm', min: 1 }],
      condition: { operator: 'gt', parameter: 'span', value: 0 }, evidenceIds: ['example-source'],
      reinforcement: [{ id: 'example-bar', shape: 'STRAIGHT', diameterMm: 12, count: 1,
        centerline: [
          { x: 0, y: 0, z: 0 },
          { x: { parameter: 'span' }, y: 0, z: 0 },
        ],
      }],
    };
    const result = resolveRule(
      { id: 'example', kind: 'SAMPLE', parameters: { span: 1000 } },
      { id: 'example-node', kind: 'SAMPLE', componentId: 'example' }, [rule],
    );
    expect(result.evidenceIds).toEqual(['example-source']);
    const geometry = buildRebarGeometry(result.reinforcement[0]!);
    expect(geometry.centerline).toHaveLength(1);
    expect(toThreeCurve(geometry).getLength()).toBeCloseTo(1000);
    expect(() => resolveRule(
      { id: 'example', kind: 'SAMPLE', parameters: { span: 0 } },
      { id: 'example-node', kind: 'SAMPLE', componentId: 'example' }, [rule],
    )).toThrow(RuleResolutionError);
  });
});
