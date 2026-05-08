/**
 * hooks/useGraph2D.ts
 * Manages canvas viewport state (pan + zoom) with mouse/touch interaction.
 */
import { useRef, useCallback, useState } from 'react';

export interface Viewport {
  xMin: number; xMax: number;
  yMin: number; yMax: number;
}

const DEFAULT_VIEWPORT: Viewport = { xMin: -8, xMax: 8, yMin: -6, yMax: 6 };

export function useGraph2D(initialViewport = DEFAULT_VIEWPORT) {
  const [viewport, setViewport] = useState<Viewport>(initialViewport);
  const dragStart = useRef<{ x: number; y: number; vp: Viewport } | null>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  const resetViewport = useCallback(() => setViewport(DEFAULT_VIEWPORT), []);

  /** Convert canvas pixel → math coordinate */
  const toMath = useCallback(
    (px: number, py: number, w: number, h: number): [number, number] => {
      const vp = viewport;
      return [
        vp.xMin + (px / w) * (vp.xMax - vp.xMin),
        vp.yMax - (py / h) * (vp.yMax - vp.yMin),
      ];
    },
    [viewport]
  );

  /** Convert math coordinate → canvas pixel */
  const toCanvas = useCallback(
    (mx: number, my: number, w: number, h: number): [number, number] => {
      const vp = viewport;
      return [
        ((mx - vp.xMin) / (vp.xMax - vp.xMin)) * w,
        ((vp.yMax - my)  / (vp.yMax - vp.yMin)) * h,
      ];
    },
    [viewport]
  );

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    setViewport(vp => {
      const [mx, my] = [
        vp.xMin + (px / canvas.width) * (vp.xMax - vp.xMin),
        vp.yMax - (py / canvas.height) * (vp.yMax - vp.yMin),
      ];
      const factor = e.deltaY > 0 ? 1.12 : 0.89;
      return {
        xMin: mx + (vp.xMin - mx) * factor,
        xMax: mx + (vp.xMax - mx) * factor,
        yMin: my + (vp.yMin - my) * factor,
        yMax: my + (vp.yMax - my) * factor,
      };
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (e.button !== 0) return;
    dragStart.current = {
      x: e.clientX, y: e.clientY,
      vp: { ...viewport },
    };
  }, [viewport]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragStart.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const vp0 = dragStart.current.vp;
    const spanX = vp0.xMax - vp0.xMin;
    const spanY = vp0.yMax - vp0.yMin;
    const dMathX = -(dx / canvas.width)  * spanX;
    const dMathY =  (dy / canvas.height) * spanY;
    setViewport({
      xMin: vp0.xMin + dMathX,
      xMax: vp0.xMax + dMathX,
      yMin: vp0.yMin + dMathY,
      yMax: vp0.yMax + dMathY,
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    dragStart.current = null;
  }, []);

  return {
    viewport, setViewport, resetViewport,
    canvasRef,
    toMath, toCanvas,
    handleWheel,
    handleMouseDown, handleMouseMove, handleMouseUp,
  };
}
