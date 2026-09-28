import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const STATUSES = new Set(['UNVERIFIED', 'REVIEW_REQUIRED', 'VERIFIED']);
const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

function jsonFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(path);
    if (entry.isFile() && entry.name.endsWith('.json')) return [path];
    return [];
  });
}

/** Validate every rule record, then require executable tests for VERIFIED rules. */
export function verifyRuleCoverage(root) {
  const ruleDirectory = join(root, 'data', '22g101', 'rules');
  const testDirectory = join(root, 'tests', 'verified-rules');
  const errors = [];
  const seen = new Set();
  let verified = 0;

  for (const file of jsonFiles(ruleDirectory)) {
    let rule;
    try {
      rule = JSON.parse(readFileSync(file, 'utf8'));
    } catch (error) {
      errors.push(`${relative(root, file)}: invalid JSON (${error.message})`);
      continue;
    }
    if (!rule || Array.isArray(rule) || typeof rule !== 'object') {
      errors.push(`${relative(root, file)}: expected one rule object`);
      continue;
    }
    const id = rule.id;
    const status = rule.status ?? 'UNVERIFIED';
    if (typeof id !== 'string' || !SAFE_ID.test(id)) {
      errors.push(`${relative(root, file)}: id must contain only letters, digits, dots, hyphens or underscores`);
      continue;
    }
    if (seen.has(id)) errors.push(`${relative(root, file)}: duplicate rule id ${id}`);
    seen.add(id);
    if (!STATUSES.has(status)) {
      errors.push(`${relative(root, file)}: invalid status ${String(status)}`);
      continue;
    }
    if (status !== 'VERIFIED') continue;
    verified += 1;
    const testFile = join(testDirectory, `${id}.test.ts`);
    if (!existsSync(testFile)) {
      errors.push(`${relative(root, file)}: VERIFIED rule ${id} requires tests/verified-rules/${id}.test.ts`);
    }
  }
  return { errors, checked: seen.size, verified };
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const root = resolve(process.cwd());
  const result = verifyRuleCoverage(root);
  if (result.errors.length) {
    for (const error of result.errors) console.error(error);
    process.exitCode = 1;
  } else {
    console.log(`Rule coverage: ${result.checked} rule(s), ${result.verified} VERIFIED rule(s).`);
  }
}
