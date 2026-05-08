/**
 * math/derivative.ts
 * Symbolic differentiation via math.js derivative().
 */
import * as math from 'mathjs';
import type { CompiledExpr } from './parser';
import { evalAt } from './parser';

/**
 * Compute symbolic derivative of expr with respect to variable.
 * Returns null if derivation fails.
 */
export function computeDerivative(expr: string, variable = 'x'): CompiledExpr | null {
  try {
    const node = math.parse(expr.trim());
    const derived = math.derivative(node, variable);
    return derived;
  } catch {
    return null;
  }
}

/**
 * Evaluate derivative at a specific point x0.
 */
export function derivativeAt(derivNode: CompiledExpr, x0: number): number {
  return evalAt(derivNode, { x: x0 });
}

/**
 * Build tangent line: y = m*(x - x0) + y0
 */
export function tangentLine(m: number, x0: number, y0: number) {
  return (x: number) => m * (x - x0) + y0;
}
