import type {
  Component,
  G101Rule,
  Node,
  NumericExpression,
  ParameterDefinition,
  ParameterValue,
  ReinforcementDefinition,
  RuleCondition,
} from '@g101/schemas/domain';

export class RuleResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuleResolutionError';
  }
}

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new RuleResolutionError(`${label} must be finite`);
  return value;
}

function getNumber(values: Readonly<Record<string, ParameterValue>>, key: string): number {
  const value = values[key];
  if (typeof value !== 'number') throw new RuleResolutionError(`${key} must be a number`);
  return finite(value, key);
}

export function validateParameters(
  values: Readonly<Record<string, ParameterValue>>,
  definitions: readonly ParameterDefinition[],
): readonly string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const definition of definitions) {
    if (seen.has(definition.key)) errors.push(`duplicate parameter definition: ${definition.key}`);
    seen.add(definition.key);
    const value = values[definition.key];
    if (value === undefined) {
      if (definition.required) errors.push(`missing parameter: ${definition.key}`);
      continue;
    }
    if (typeof value !== definition.type) {
      errors.push(`${definition.key} must be ${definition.type}`);
      continue;
    }
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) errors.push(`${definition.key} must be finite`);
      if (definition.unit === 'count' && !Number.isInteger(value)) errors.push(`${definition.key} must be an integer`);
      if (definition.min !== undefined && value < definition.min) errors.push(`${definition.key} below minimum`);
      if (definition.max !== undefined && value > definition.max) errors.push(`${definition.key} above maximum`);
    }
  }
  for (const key of Object.keys(values)) {
    if (!seen.has(key)) errors.push(`unexpected parameter: ${key}`);
  }
  return errors;
}

export function evaluateExpression(
  expr: NumericExpression,
  values: Readonly<Record<string, ParameterValue>>,
): number {
  if (typeof expr === 'number') return finite(expr, 'literal');
  if ('parameter' in expr) return getNumber(values, expr.parameter);
  const left = evaluateExpression(expr.left, values);
  const right = evaluateExpression(expr.right, values);
  switch (expr.operator) {
    case 'add': return finite(left + right, 'sum');
    case 'subtract': return finite(left - right, 'difference');
    case 'multiply': return finite(left * right, 'product');
    case 'divide':
      if (right === 0) throw new RuleResolutionError('division by zero');
      return finite(left / right, 'quotient');
  }
}

export function matchesCondition(
  condition: RuleCondition,
  values: Readonly<Record<string, ParameterValue>>,
): boolean {
  if (condition.operator === 'all') return condition.conditions.every((part) => matchesCondition(part, values));
  if (condition.operator === 'any') return condition.conditions.some((part) => matchesCondition(part, values));
  if (condition.operator === 'not') return !matchesCondition(condition.condition, values);
  const actual = values[condition.parameter];
  if (actual === undefined) throw new RuleResolutionError(`missing condition parameter: ${condition.parameter}`);
  if (typeof actual !== typeof condition.value) throw new RuleResolutionError(`condition type mismatch: ${condition.parameter}`);
  if (condition.operator !== 'eq' && condition.operator !== 'neq' &&
      (typeof actual !== 'number' || typeof condition.value !== 'number')) {
    throw new RuleResolutionError(`ordered condition requires numbers: ${condition.parameter}`);
  }
  switch (condition.operator) {
    case 'eq': return actual === condition.value;
    case 'neq': return actual !== condition.value;
    case 'gt': return Number(actual) > Number(condition.value);
    case 'gte': return Number(actual) >= Number(condition.value);
    case 'lt': return Number(actual) < Number(condition.value);
    case 'lte': return Number(actual) <= Number(condition.value);
  }
}

export interface RuleResolution {
  readonly ruleId: string;
  readonly evidenceIds: readonly string[];
  readonly reinforcement: readonly ReinforcementDefinition[];
}

/** Exactly one winning rule per component/node. No match is a reported error. */
export function resolveRule(
  component: Component,
  node: Node,
  rules: readonly G101Rule[],
): RuleResolution {
  if (node.componentId !== component.id) throw new RuleResolutionError('node does not belong to component');
  const applicable = rules.filter((rule) => rule.componentKind === component.kind && rule.nodeKind === node.kind);
  const matches: G101Rule[] = [];
  for (const rule of applicable) {
    if (!Number.isFinite(rule.priority)) throw new RuleResolutionError(`${rule.id}: priority must be finite`);
    const errors = validateParameters(component.parameters, rule.parameters);
    if (errors.length) throw new RuleResolutionError(`${rule.id}: ${errors.join('; ')}`);
    if (matchesCondition(rule.condition, component.parameters)) matches.push(rule);
  }
  matches.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
  const rule = matches[0];
  if (!rule) throw new RuleResolutionError(`no rule matches ${component.kind}/${node.kind}`);
  if (matches[1]?.priority === rule.priority) throw new RuleResolutionError(`conflicting rules at priority ${rule.priority}`);
  const ids = new Set<string>();
  const reinforcement = rule.reinforcement.map((template): ReinforcementDefinition => {
    if (ids.has(template.id)) throw new RuleResolutionError(`${rule.id}: duplicate reinforcement id ${template.id}`);
    ids.add(template.id);
    const diameterMm = evaluateExpression(template.diameterMm, component.parameters);
    const count = evaluateExpression(template.count, component.parameters);
    if (diameterMm <= 0) throw new RuleResolutionError(`${template.id}: diameterMm must be positive`);
    if (!Number.isInteger(count) || count <= 0) throw new RuleResolutionError(`${template.id}: count must be a positive integer`);
    if (template.centerline.length < 2) throw new RuleResolutionError(`${template.id}: centerline needs two points`);
    const bendRadiusMm = template.bendRadiusMm === undefined
      ? undefined
      : evaluateExpression(template.bendRadiusMm, component.parameters);
    if (bendRadiusMm !== undefined && bendRadiusMm <= 0) throw new RuleResolutionError(`${template.id}: bendRadiusMm must be positive`);
    return {
      id: template.id,
      shape: template.shape,
      diameterMm,
      count,
      ...(bendRadiusMm === undefined ? {} : { bendRadiusMm }),
      path: { kind: 'polyline', points: template.centerline.map((point) => ({
        x: evaluateExpression(point.x, component.parameters),
        y: evaluateExpression(point.y, component.parameters),
        z: evaluateExpression(point.z, component.parameters),
      })) },
      evidenceIds: [...rule.evidenceIds],
      ruleId: rule.id,
    };
  });
  return { ruleId: rule.id, evidenceIds: [...rule.evidenceIds], reinforcement };
}
