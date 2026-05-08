/**
 * math/integral.ts
 * Numerical integration via composite Simpson's 1/3 rule.
 */
import type { CompiledExpr } from './parser';
import { evalAt } from './parser';

/**
 * Composite Simpson's rule numerical integration.
 * n must be even; uses n=1000 subdivisions for accuracy.
 */
export function simpsonIntegral(
  node: CompiledExpr,
  a: number,
  b: number,
  n = 1000
): number {
  if (a >= b) return 0;

  // Make n even
  if (n % 2 !== 0) n += 1;

  const h = (b - a) / n;
  let sum = evalAt(node, { x: a }) + evalAt(node, { x: b });

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const fx = evalAt(node, { x });
    if (!isNaN(fx)) {
      sum += fx * (i % 2 === 0 ? 2 : 4);
    }
  }

  return (h / 3) * sum;
}

/**
 * Sample curve points for filling integral area.
 * Returns array of {x, y} objects clipped to canvas domain.
 */
export function sampleAreaPoints(
  node: CompiledExpr,
  a: number,
  b: number,
  steps = 400
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  const dx = (b - a) / steps;
  for (let i = 0; i <= steps; i++) {
    const x = a + i * dx;
    const y = evalAt(node, { x });
    points.push({ x, y: isNaN(y) ? 0 : y });
  }
  return points;
}
