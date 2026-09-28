import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyRuleCoverage } from './verify-rule-coverage.mjs';

const roots: string[] = [];
function fixture(rule: object, withTest = false) {
  const root = mkdtempSync(join(tmpdir(), 'g101-qa-'));
  roots.push(root);
  const directory = join(root, 'data', '22g101', 'rules', 'beam');
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'fixture.json'), JSON.stringify(rule));
  if (withTest) {
    const testDirectory = join(root, 'tests', 'verified-rules');
    mkdirSync(testDirectory, { recursive: true });
    writeFileSync(join(testDirectory, 'sample.test.ts'), 'import { it } from "vitest"; it("sample", () => {});');
  }
  return root;
}
afterEach(() => roots.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true })));

describe('verified rule coverage gate', () => {
  it('accepts an empty Batch 0 rule directory', () => {
    const root = mkdtempSync(join(tmpdir(), 'g101-qa-'));
    roots.push(root);
    expect(verifyRuleCoverage(root)).toEqual({ checked: 0, verified: 0, errors: [] });
  });
  it('requires a named test for a VERIFIED rule', () => {
    expect(verifyRuleCoverage(fixture({ id: 'sample', status: 'VERIFIED' })).errors).toContain(
      'data/22g101/rules/beam/fixture.json: VERIFIED rule sample requires tests/verified-rules/sample.test.ts',
    );
  });
  it('accepts a VERIFIED rule with an associated executable test file', () => {
    expect(verifyRuleCoverage(fixture({ id: 'sample', status: 'VERIFIED' }, true)).errors).toEqual([]);
  });
  it('rejects invalid ids before they can escape the test directory', () => {
    expect(verifyRuleCoverage(fixture({ id: '../../escape', status: 'VERIFIED' })).errors[0]).toMatch(/id must contain/);
  });
  it('treats missing status as UNVERIFIED and rejects unknown statuses', () => {
    expect(verifyRuleCoverage(fixture({ id: 'sample' })).verified).toBe(0);
    expect(verifyRuleCoverage(fixture({ id: 'sample', status: 'APPROVED' })).errors[0]).toMatch(/invalid status/);
  });
});
