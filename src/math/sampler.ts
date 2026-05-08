/**
 * math/sampler.ts
 * Sample function points for 2D plotting.
 * Handles discontinuities by inserting NaN gaps.
 */
import type { CompiledExpr } from './parser';
import { evalAt } from './parser';

export interface Point2D { x: number; y: number }

/**
 * Sample n points of f(x) over [xMin, xMax].
 * Inserts NaN breaks for large jumps (discontinuities).
 */
export function sampleFunction2D(
  node: CompiledExpr,
  xMin: number,
  xMax: number,
  n = 800
): Point2D[] {
  const points: Point2D[] = [];
  const dx = (xMax - xMin) / (n - 1);
  let prevY: number | null = null;
  const JUMP_THRESHOLD = 1e6;

  for (let i = 0; i < n; i++) {
    const x = xMin + i * dx;
    const y = evalAt(node, { x });

    if (isNaN(y) || !isFinite(y)) {
      points.push({ x, y: NaN });
      prevY = null;
      continue;
    }

    // Detect large jump → discontinuity → insert break
    if (prevY !== null && Math.abs(y - prevY) > JUMP_THRESHOLD) {
      points.push({ x, y: NaN });
    }

    points.push({ x, y });
    prevY = y;
  }

  return points;
}

/**
 * Sample 2D grid for 3D surface z = f(x,y).
 * Returns flat arrays for Three.js BufferGeometry.
 */
export function sampleSurface3D(
  node: CompiledExpr,
  xMin: number, xMax: number,
  yMin: number, yMax: number,
  resX = 60, resY = 60
): {
  positions: Float32Array;
  indices: Uint32Array;
  colors: Float32Array;
  minZ: number;
  maxZ: number;
} {
  const nx = resX + 1;
  const ny = resY + 1;
  const positions = new Float32Array(nx * ny * 3);
  const colors    = new Float32Array(nx * ny * 3);

  let minZ = Infinity, maxZ = -Infinity;

  // First pass: compute z values
  const zValues = new Float32Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x = xMin + (i / resX) * (xMax - xMin);
      const y = yMin + (j / resY) * (yMax - yMin);
      const z = evalAt(node, { x, y });
      const v = isNaN(z) || !isFinite(z) ? 0 : Math.max(-50, Math.min(50, z));
      zValues[j * nx + i] = v;
      if (v < minZ) minZ = v;
      if (v > maxZ) maxZ = v;
    }
  }

  // Second pass: set positions & colors
  const zRange = maxZ - minZ || 1;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const idx = j * nx + i;
      const x = xMin + (i / resX) * (xMax - xMin);
      const y = yMin + (j / resY) * (yMax - yMin);
      const z = zValues[idx];
      positions[idx * 3 + 0] = x;
      positions[idx * 3 + 1] = z; // Three.js Y = up
      positions[idx * 3 + 2] = y;

      // Color: violet → cyan gradient by z
      const t = (z - minZ) / zRange;
      colors[idx * 3 + 0] = 0.34 + t * (0.02 - 0.34); // R
      colors[idx * 3 + 1] = 0.23 + t * (0.71 - 0.23); // G
      colors[idx * 3 + 2] = 0.96 + t * (0.83 - 0.96); // B
    }
  }

  // Build triangle indices
  const idxCount = resX * resY * 6;
  const indices = new Uint32Array(idxCount);
  let k = 0;
  for (let j = 0; j < resY; j++) {
    for (let i = 0; i < resX; i++) {
      const a = j * nx + i;
      const b = a + 1;
      const c = a + nx;
      const d = c + 1;
      indices[k++] = a; indices[k++] = c; indices[k++] = b;
      indices[k++] = b; indices[k++] = c; indices[k++] = d;
    }
  }

  return { positions, indices, colors, minZ, maxZ };
}

/**
 * Sample extrusion mesh: take f(x) over [a,b], extrude height h along Z.
 */
export function sampleExtrusion(
  node: CompiledExpr,
  a: number, b: number,
  h: number,
  steps = 80
): {
  positions: Float32Array;
  indices: Uint32Array;
  colors: Float32Array;
} {
  const n = steps + 1;
  // 4 rows: bottom-front, top-front, top-back, bottom-back
  const totalVerts = n * 4;
  const positions = new Float32Array(totalVerts * 3);
  const colors    = new Float32Array(totalVerts * 3);

  for (let i = 0; i < n; i++) {
    const x  = a + (i / steps) * (b - a);
    const y  = evalAt(node, { x });
    const fy = isNaN(y) ? 0 : Math.max(-50, Math.min(50, y));

    // Row 0: bottom front (z=0)
    positions[(0 * n + i) * 3 + 0] = x; positions[(0 * n + i) * 3 + 1] = 0;  positions[(0 * n + i) * 3 + 2] = 0;
    // Row 1: top front (z=0)
    positions[(1 * n + i) * 3 + 0] = x; positions[(1 * n + i) * 3 + 1] = fy; positions[(1 * n + i) * 3 + 2] = 0;
    // Row 2: top back (z=h)
    positions[(2 * n + i) * 3 + 0] = x; positions[(2 * n + i) * 3 + 1] = fy; positions[(2 * n + i) * 3 + 2] = h;
    // Row 3: bottom back (z=h)
    positions[(3 * n + i) * 3 + 0] = x; positions[(3 * n + i) * 3 + 1] = 0;  positions[(3 * n + i) * 3 + 2] = h;

    // Color: purple-ish for extrusion
    for (let r = 0; r < 4; r++) {
      colors[(r * n + i) * 3 + 0] = 0.55;
      colors[(r * n + i) * 3 + 1] = 0.36 + (fy > 0 ? 0.3 : 0);
      colors[(r * n + i) * 3 + 2] = 0.96;
    }
  }

  // Build quads for front face (rows 0,1), back face (rows 2,3), top face (rows 1,2)
  const faceCount = steps * 3 * 2; // 3 faces × 2 triangles × steps
  const indices = new Uint32Array(faceCount * 3);
  let k = 0;

  const addFace = (rowA: number, rowB: number) => {
    for (let i = 0; i < steps; i++) {
      const a = rowA * n + i, b = rowA * n + i + 1;
      const c = rowB * n + i, d = rowB * n + i + 1;
      indices[k++] = a; indices[k++] = b; indices[k++] = c;
      indices[k++] = b; indices[k++] = d; indices[k++] = c;
    }
  };

  addFace(0, 1); // front face
  addFace(1, 2); // top face
  addFace(2, 3); // back face

  return { positions, indices, colors };
}
