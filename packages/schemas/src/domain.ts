/** Pure, serializable contracts. Lengths and coordinates are millimetres. */
export type ParameterValue = number | string | boolean;

export interface ParameterDefinition {
  readonly key: string;
  readonly type: 'number' | 'string' | 'boolean';
  readonly required: boolean;
  readonly unit?: 'mm' | 'count' | 'none';
  readonly min?: number;
  readonly max?: number;
}

export interface Component {
  readonly id: string;
  readonly kind: string;
  readonly parameters: Readonly<Record<string, ParameterValue>>;
}

export interface Node {
  readonly id: string;
  readonly kind: string;
  readonly componentId: string;
}

export type RuleCondition =
  | { readonly operator: 'all' | 'any'; readonly conditions: readonly RuleCondition[] }
  | { readonly operator: 'not'; readonly condition: RuleCondition }
  | {
      readonly operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';
      readonly parameter: string;
      readonly value: ParameterValue;
    };

/** Arithmetic expressions are evaluated by the rule engine, never by eval(). */
export type NumericExpression =
  | number
  | { readonly parameter: string }
  | {
      readonly operator: 'add' | 'subtract' | 'multiply' | 'divide';
      readonly left: NumericExpression;
      readonly right: NumericExpression;
    };

export interface PointExpression {
  readonly x: NumericExpression;
  readonly y: NumericExpression;
  readonly z: NumericExpression;
}

export type RebarShape =
  | 'STRAIGHT'
  | 'L'
  | 'U'
  | 'BENT'
  | 'CLOSED_STIRRUP'
  | 'OPEN_STIRRUP'
  | 'MULTI_SEGMENT';

/** Input to the geometry engine. Path is a centerline, in millimetres. */
export interface ReinforcementDefinition {
  readonly id: string;
  readonly shape: RebarShape;
  readonly diameterMm: number;
  readonly count: number;
  /** Explicit centerline bend radius; absent means geometry must not assume one. */
  readonly bendRadiusMm?: number;
  readonly path: {
    readonly kind: 'polyline';
    readonly points: readonly { readonly x: number; readonly y: number; readonly z: number }[];
  };
  readonly evidenceIds: readonly string[];
  readonly ruleId: string;
}

/** A template produces geometry definitions; no 22G101 detail is embedded here. */
export interface ReinforcementTemplate {
  readonly id: string;
  readonly shape: RebarShape;
  readonly diameterMm: NumericExpression;
  readonly count: NumericExpression;
  readonly bendRadiusMm?: NumericExpression;
  readonly centerline: readonly PointExpression[];
}

export interface G101Rule {
  readonly id: string;
  readonly componentKind: string;
  readonly nodeKind: string;
  readonly parameters: readonly ParameterDefinition[];
  readonly condition: RuleCondition;
  /** Larger number wins. Equal top priorities are a conflict. */
  readonly priority: number;
  readonly reinforcement: readonly ReinforcementTemplate[];
  /** References to Evidence records, which are reviewed independently. */
  readonly evidenceIds: readonly string[];
}
