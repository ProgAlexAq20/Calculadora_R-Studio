/**
 * components/Graph2D.tsx
 * 2D canvas graph with zoom, pan, integral fill, tangent line, derivative curve.
 */
import React, { useEffect, useRef, useCallback } from 'react';
import type { Viewport } from '../hooks/useGraph2D';
import type { Point2D } from '../math/sampler';
import {
  drawGrid, drawAxes, drawCurve,
  drawIntegralFill, drawTangentLine,
} from '../rendering/draw2D';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface Props {
  viewport: Viewport;
  setViewport: (vp: Viewport) => void;
  resetViewport: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  handleWheel: (e: WheelEvent) => void;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: () => void;

  curvePoints: Point2D[];
  derivPoints: Point2D[];
  showDerivative: boolean;

  showIntegral: boolean;
  integralA: number;
  integralB: number;
  integralAreaPoints: Point2D[];

  showTangent: boolean;
  tangentX0: number;
  tangentY0: number;
  tangentSlope: number;
}

export const Graph2D: React.FC<Props> = ({
  viewport, setViewport, resetViewport,
  canvasRef,
  handleWheel, handleMouseDown, handleMouseMove, handleMouseUp,
  curvePoints, derivPoints, showDerivative,
  showIntegral, integralA, integralB, integralAreaPoints,
  showTangent, tangentX0, tangentY0, tangentSlope,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    drawGrid(ctx, viewport, w, h);
    drawAxes(ctx, viewport, w, h);

    // Integral area (behind curve)
    if (showIntegral && integralAreaPoints.length > 1) {
      drawIntegralFill(ctx, integralAreaPoints, viewport, w, h, integralA, integralB);
    }

    // Main curve
    if (curvePoints.length > 1) {
      drawCurve(ctx, curvePoints, viewport, w, h);
    }

    // Derivative curve
    if (showDerivative && derivPoints.length > 1) {
      drawCurve(ctx, derivPoints, viewport, w, h, '#06b6d4', 1.8);
    }

    // Tangent line
    if (showTangent && !isNaN(tangentSlope) && !isNaN(tangentY0)) {
      drawTangentLine(ctx, tangentX0, tangentY0, tangentSlope, viewport, w, h);
    }
  }, [
    viewport, curvePoints, derivPoints, showDerivative,
    showIntegral, integralAreaPoints, integralA, integralB,
    showTangent, tangentX0, tangentY0, tangentSlope,
  ]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = container.clientWidth  * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width  = container.clientWidth  + 'px';
      canvas.style.height = container.clientHeight + 'px';
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      draw();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [draw]);

  // Draw on every state change
  useEffect(() => {
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(draw);
  }, [draw]);

  // Wheel listener (passive: false required for preventDefault)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const zoom = (factor: number) => {
    setViewport({
      xMin: viewport.xMin * factor,
      xMax: viewport.xMax * factor,
      yMin: viewport.yMin * factor,
      yMax: viewport.yMax * factor,
    });
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', background: '#0a0a0f', borderRadius: '14px', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        className="graph-canvas"
        style={{ cursor: 'crosshair' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Zoom controls */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <button className="btn-icon" onClick={() => zoom(0.8)} data-tooltip="Zoom in">
          <ZoomIn size={15} />
        </button>
        <button className="btn-icon" onClick={() => zoom(1.25)} data-tooltip="Zoom out">
          <ZoomOut size={15} />
        </button>
        <button className="btn-icon" onClick={resetViewport} data-tooltip="Reset view">
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Viewport info */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        fontSize: '0.65rem', color: 'rgba(160,154,186,0.5)',
        fontFamily: "'JetBrains Mono', monospace",
        pointerEvents: 'none',
      }}>
        [{viewport.xMin.toFixed(1)}, {viewport.xMax.toFixed(1)}] × [{viewport.yMin.toFixed(1)}, {viewport.yMax.toFixed(1)}]
      </div>
    </div>
  );
};
