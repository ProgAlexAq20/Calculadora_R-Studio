/**
 * rendering/draw2D.ts
 * All 2D Canvas drawing routines.
 */
import type { Viewport } from '../hooks/useGraph2D';
import type { Point2D } from '../math/sampler';

// ── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg:           '#0a0a0f',
  gridMajor:    'rgba(255,255,255,0.05)',
  gridMinor:    'rgba(255,255,255,0.025)',
  axis:         'rgba(255,255,255,0.25)',
  axisLabel:    'rgba(160,154,186,0.8)',
  curve:        '#8b5cf6',
  derivative:   '#06b6d4',
  tangent:      '#f59e0b',
  tangentDot:   '#fbbf24',
  integralFill: 'rgba(139,92,246,0.22)',
  integralEdge: 'rgba(139,92,246,0.7)',
};

// ── Helpers ───────────────────────────────────────────────────
function toCanvas(
  mx: number, my: number,
  vp: Viewport, w: number, h: number
): [number, number] {
  return [
    ((mx - vp.xMin) / (vp.xMax - vp.xMin)) * w,
    ((vp.yMax - my)  / (vp.yMax - vp.yMin)) * h,
  ];
}

/** Nice grid step for current viewport span */
function niceStep(span: number, targetLines = 10): number {
  const raw = span / targetLines;
  const exp = Math.floor(Math.log10(raw));
  const frac = raw / Math.pow(10, exp);
  let nice: number;
  if (frac < 1.5) nice = 1;
  else if (frac < 3.5) nice = 2;
  else if (frac < 7.5) nice = 5;
  else nice = 10;
  return nice * Math.pow(10, exp);
}

// ── Grid ──────────────────────────────────────────────────────
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  vp: Viewport,
  w: number,
  h: number
) {
  const stepX = niceStep(vp.xMax - vp.xMin);
  const stepY = niceStep(vp.yMax - vp.yMin);

  ctx.save();
  ctx.font = `10px 'JetBrains Mono', monospace`;
  ctx.fillStyle = COLORS.axisLabel;
  ctx.textAlign = 'center';

  // Vertical grid lines
  const x0 = Math.ceil(vp.xMin / stepX) * stepX;
  for (let x = x0; x <= vp.xMax + stepX * 0.01; x += stepX) {
    const [cx] = toCanvas(x, 0, vp, w, h);
    const isMajor = Math.abs(Math.round(x / stepX) % 5) === 0;
    ctx.strokeStyle = isMajor ? COLORS.gridMajor : COLORS.gridMinor;
    ctx.lineWidth = isMajor ? 1 : 0.5;
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

    // Label
    if (Math.abs(x) > stepX * 0.01) {
      const labelY = Math.min(h - 15, Math.max(15, toCanvas(0, 0, vp, w, h)[1] + 14));
      ctx.fillText(formatNum(x), cx, labelY);
    }
  }

  // Horizontal grid lines
  const y0 = Math.ceil(vp.yMin / stepY) * stepY;
  ctx.textAlign = 'right';
  for (let y = y0; y <= vp.yMax + stepY * 0.01; y += stepY) {
    const [, cy] = toCanvas(0, y, vp, w, h);
    const isMajor = Math.abs(Math.round(y / stepY) % 5) === 0;
    ctx.strokeStyle = isMajor ? COLORS.gridMajor : COLORS.gridMinor;
    ctx.lineWidth = isMajor ? 1 : 0.5;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

    if (Math.abs(y) > stepY * 0.01) {
      const labelX = Math.min(w - 5, Math.max(35, toCanvas(0, 0, vp, w, h)[0] - 6));
      ctx.fillText(formatNum(y), labelX, cy + 4);
    }
  }

  ctx.restore();
}

// ── Axes ──────────────────────────────────────────────────────
export function drawAxes(
  ctx: CanvasRenderingContext2D,
  vp: Viewport,
  w: number,
  h: number
) {
  ctx.save();
  ctx.strokeStyle = COLORS.axis;
  ctx.lineWidth = 1.5;

  const [ox, oy] = toCanvas(0, 0, vp, w, h);

  // X axis
  ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(w, oy); ctx.stroke();
  // Y axis
  ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, h); ctx.stroke();

  // Arrows
  ctx.fillStyle = COLORS.axis;
  drawArrow(ctx, w - 1, oy, 'right');
  drawArrow(ctx, ox, 1, 'up');

  // Axis labels
  ctx.font = `bold 12px 'Inter', sans-serif`;
  ctx.fillStyle = COLORS.axisLabel;
  ctx.textAlign = 'left';
  ctx.fillText('x', w - 14, oy - 8);
  ctx.fillText('y', ox + 8, 14);

  // Origin label
  ctx.font = `10px 'JetBrains Mono', monospace`;
  ctx.textAlign = 'right';
  ctx.fillText('0', ox - 4, oy + 12);

  ctx.restore();
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  dir: 'right' | 'up'
) {
  const s = 6;
  ctx.beginPath();
  if (dir === 'right') {
    ctx.moveTo(x, y); ctx.lineTo(x - s, y - s * 0.6); ctx.lineTo(x - s, y + s * 0.6);
  } else {
    ctx.moveTo(x, y); ctx.lineTo(x - s * 0.6, y + s); ctx.lineTo(x + s * 0.6, y + s);
  }
  ctx.closePath();
  ctx.fill();
}

// ── Curve ─────────────────────────────────────────────────────
export function drawCurve(
  ctx: CanvasRenderingContext2D,
  points: Point2D[],
  vp: Viewport,
  w: number, h: number,
  color = COLORS.curve,
  lineWidth = 2.5
) {
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;

  ctx.beginPath();
  let penDown = false;
  for (const pt of points) {
    if (isNaN(pt.y)) { penDown = false; continue; }
    const [cx, cy] = toCanvas(pt.x, pt.y, vp, w, h);
    if (!penDown) { ctx.moveTo(cx, cy); penDown = true; }
    else          { ctx.lineTo(cx, cy); }
  }
  ctx.stroke();
  ctx.restore();
}

// ── Integral fill ─────────────────────────────────────────────
export function drawIntegralFill(
  ctx: CanvasRenderingContext2D,
  areaPoints: Point2D[],
  vp: Viewport,
  w: number, h: number,
  a: number, b: number
) {
  if (areaPoints.length < 2) return;
  const [x0c, y0c] = toCanvas(a, 0, vp, w, h);
  const [x1c]      = toCanvas(b, 0, vp, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0c, y0c);
  for (const pt of areaPoints) {
    const [cx, cy] = toCanvas(pt.x, pt.y, vp, w, h);
    ctx.lineTo(cx, cy);
  }
  ctx.lineTo(x1c, y0c);
  ctx.closePath();

  // Gradient fill
  const grad = ctx.createLinearGradient(x0c, 0, x1c, 0);
  grad.addColorStop(0,   'rgba(139,92,246,0.08)');
  grad.addColorStop(0.5, 'rgba(139,92,246,0.25)');
  grad.addColorStop(1,   'rgba(139,92,246,0.08)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Edge stroke
  ctx.strokeStyle = COLORS.integralEdge;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(x0c, 0); ctx.lineTo(x0c, h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1c, 0); ctx.lineTo(x1c, h); ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}

// ── Tangent line ──────────────────────────────────────────────
export function drawTangentLine(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, slope: number,
  vp: Viewport, w: number, h: number
) {
  ctx.save();
  ctx.strokeStyle = COLORS.tangent;
  ctx.lineWidth = 1.8;
  ctx.shadowColor = COLORS.tangent;
  ctx.shadowBlur = 10;
  ctx.setLineDash([6, 4]);

  // Extend tangent line across viewport
  const xA = vp.xMin, xB = vp.xMax;
  const yA = slope * (xA - x0) + y0;
  const yB = slope * (xB - x0) + y0;
  const [cxA, cyA] = toCanvas(xA, yA, vp, w, h);
  const [cxB, cyB] = toCanvas(xB, yB, vp, w, h);

  ctx.beginPath(); ctx.moveTo(cxA, cyA); ctx.lineTo(cxB, cyB); ctx.stroke();
  ctx.setLineDash([]);

  // Dot at tangent point
  const [cx0, cy0] = toCanvas(x0, y0, vp, w, h);
  ctx.fillStyle = COLORS.tangentDot;
  ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.arc(cx0, cy0, 5, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

// ── Formatting ────────────────────────────────────────────────
function formatNum(n: number): string {
  if (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0)) {
    return n.toExponential(1);
  }
  return parseFloat(n.toPrecision(4)).toString();
}
