/**
 * math/parser.ts
 * Wraps math.js to safely compile and evaluate expressions.
 * Never uses native eval().
 */
import * as math from 'mathjs';

export type { MathNode } from 'mathjs';
/** Alias kept for readability across the codebase */
export type CompiledExpr = math.MathNode;

/**
 * Parse a math expression string into a compiled node.
 * Throws a user-friendly error if the expression is invalid.
 */
export function parseExpression(expr: string): CompiledExpr {
  if (!expr.trim()) throw new Error('Expressão vazia');
  try {
    return math.parse(expr.trim());
  } catch {
    throw new Error(`Expressão inválida: "${expr}"`);
  }
}

/**
 * Evaluate a compiled expression for a given variable scope.
 * Returns NaN on runtime errors (e.g. log of negative).
 */
export function evalAt(node: CompiledExpr, scope: Record<string, number>): number {
  try {
    const result = node.compile().evaluate(scope);
    if (typeof result !== 'number' || !isFinite(result)) return NaN;
    return result;
  } catch {
    return NaN;
  }
}

/**
 * Validate expression string, returns error message or null.
 */
export function validateExpr(expr: string): string | null {
  if (!expr.trim()) return 'Campo obrigatório';
  try {
    math.parse(expr.trim());
    return null;
  } catch (e: unknown) {
    return e instanceof Error ? e.message : 'Expressão inválida';
  }
}
