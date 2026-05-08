/**
 * App.tsx
 * Root application component — manages all state, tabs, and layout.
 */
import { useState, useEffect, useMemo } from 'react';
import { Atom, ChartLine, Box, Layers, Menu, X, FlaskConical } from 'lucide-react';

import { Graph2D } from './components/Graph2D';
import { Graph3D } from './components/Graph3D';
import { Extrusion3D } from './components/Extrusion3D';
import { Sidebar2D } from './components/Sidebar2D';
import { Sidebar3D } from './components/Sidebar3D';
import { SidebarExtrusion } from './components/SidebarExtrusion';

import { useGraph2D } from './hooks/useGraph2D';
import { useDebounce } from './hooks/useDebounce';

import { parseExpression, validateExpr, evalAt } from './math/parser';
import { computeDerivative, derivativeAt } from './math/derivative';
import { simpsonIntegral, sampleAreaPoints } from './math/integral';
import { sampleFunction2D } from './math/sampler';

type Tab = '2d' | '3d' | 'extrusion';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('2d');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── 2D state ──────────────────────────────────────────────
  const [expr2D, setExpr2D] = useState('sin(x) * x');
  const [showDerivative, setShowDerivative] = useState(false);
  const [showIntegral,   setShowIntegral]   = useState(false);
  const [integralA, setIntegralA] = useState(-Math.PI);
  const [integralB, setIntegralB] = useState(Math.PI);
  const [showTangent, setShowTangent] = useState(false);
  const [tangentX0,   setTangentX0]   = useState(1);

  // ── 3D state ──────────────────────────────────────────────
  const [expr3D, setExpr3D]       = useState('sin(x) * cos(y)');
  const [x3Min, setX3Min]         = useState(-5);
  const [x3Max, setX3Max]         = useState(5);
  const [y3Min, setY3Min]         = useState(-5);
  const [y3Max, setY3Max]         = useState(5);
  const [resolution, setResolution] = useState(50);

  // ── Extrusion state ───────────────────────────────────────
  const [exprExt, setExprExt]   = useState('sin(x)');
  const [extA, setExtA]         = useState(0);
  const [extB, setExtB]         = useState(Math.PI * 2);
  const [extH, setExtH]         = useState(3);

  // ── Graph 2D hook ─────────────────────────────────────────
  const {
    viewport, setViewport, resetViewport,
    canvasRef, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp,
  } = useGraph2D();

  // ── Debounced expressions ─────────────────────────────────
  const dExpr2D  = useDebounce(expr2D,  400);
  const dExpr3D  = useDebounce(expr3D,  600);
  const dExprExt = useDebounce(exprExt, 500);
  const dX0      = useDebounce(tangentX0, 300);
  const dIntA    = useDebounce(integralA, 300);
  const dIntB    = useDebounce(integralB, 300);

  // ── Parse & validate 2D ───────────────────────────────────
  const expr2DError = useMemo(() => validateExpr(dExpr2D), [dExpr2D]);
  const compiledExpr2D = useMemo(() => {
    if (expr2DError) return null;
    try { return parseExpression(dExpr2D); } catch { return null; }
  }, [dExpr2D, expr2DError]);

  // ── Sample 2D curve ───────────────────────────────────────
  const curvePoints = useMemo(() => {
    if (!compiledExpr2D) return [];
    return sampleFunction2D(compiledExpr2D, viewport.xMin, viewport.xMax);
  }, [compiledExpr2D, viewport]);

  // ── Derivative ────────────────────────────────────────────
  const derivNode = useMemo(() => {
    if (!dExpr2D || expr2DError) return null;
    return computeDerivative(dExpr2D);
  }, [dExpr2D, expr2DError]);

  const derivPoints = useMemo(() => {
    if (!derivNode || !showDerivative) return [];
    return sampleFunction2D(derivNode, viewport.xMin, viewport.xMax);
  }, [derivNode, showDerivative, viewport]);

  // ── Integral ──────────────────────────────────────────────
  const integralResult = useMemo((): number | null => {
    if (!showIntegral || !compiledExpr2D) return null;
    return simpsonIntegral(compiledExpr2D, dIntA, dIntB);
  }, [showIntegral, compiledExpr2D, dIntA, dIntB]);

  const integralAreaPoints = useMemo(() => {
    if (!showIntegral || !compiledExpr2D) return [];
    return sampleAreaPoints(compiledExpr2D, dIntA, dIntB);
  }, [showIntegral, compiledExpr2D, dIntA, dIntB]);

  // ── Tangent ───────────────────────────────────────────────
  const tangentSlope = useMemo((): number | null => {
    if (!showTangent || !derivNode) return null;
    return derivativeAt(derivNode, dX0);
  }, [showTangent, derivNode, dX0]);

  const tangentY0 = useMemo((): number | null => {
    if (!showTangent || !compiledExpr2D) return null;
    return evalAt(compiledExpr2D, { x: dX0 });
  }, [showTangent, compiledExpr2D, dX0]);

  // ── Parse 3D expression ───────────────────────────────────
  const expr3DError = useMemo(() => validateExpr(dExpr3D), [dExpr3D]);
  const compiled3D  = useMemo(() => {
    if (expr3DError) return null;
    try { return parseExpression(dExpr3D); } catch { return null; }
  }, [dExpr3D, expr3DError]);

  // ── Parse Extrusion expression ────────────────────────────
  const exprExtError = useMemo(() => validateExpr(dExprExt), [dExprExt]);
  const compiledExt  = useMemo(() => {
    if (exprExtError) return null;
    try { return parseExpression(dExprExt); } catch { return null; }
  }, [dExprExt, exprExtError]);

  // ── Responsive: close sidebar on mobile ───────────────────
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const tabConfig = [
    { key: '2d' as Tab,        icon: <ChartLine size={14} />, label: 'R²' },
    { key: '3d' as Tab,        icon: <Box size={14} />,       label: 'R³' },
    { key: 'extrusion' as Tab, icon: <Layers size={14} />,    label: 'Extrusão' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>

      {/* ── Header ────────────────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 18px',
        height: 54,
        background: 'rgba(10,10,15,0.95)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(139,92,246,0.4)',
          }}>
            <Atom size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1, letterSpacing: '-0.01em' }}>
              R³ Studio
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Visual Math Lab
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div className="tab-bar" style={{ width: 'fit-content', minWidth: 200 }}>
            {tabConfig.map(t => (
              <button
                key={t.key}
                className={`tab${activeTab === t.key ? ' active' : ''}`}
                onClick={() => setActiveTab(t.key)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar toggle */}
        <button
          className="btn-icon"
          onClick={() => setSidebarOpen(o => !o)}
          style={{ marginLeft: 'auto' }}
          title={sidebarOpen ? 'Fechar painel' : 'Abrir painel'}
        >
          {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
        </button>
      </header>

      {/* ── Body ──────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Graph area */}
        <div style={{
          flex: 1,
          padding: 14,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}>
          {activeTab === '2d' && (
            <Graph2D
              viewport={viewport} setViewport={setViewport} resetViewport={resetViewport}
              canvasRef={canvasRef} handleWheel={handleWheel}
              handleMouseDown={handleMouseDown} handleMouseMove={handleMouseMove} handleMouseUp={handleMouseUp}
              curvePoints={curvePoints} derivPoints={derivPoints} showDerivative={showDerivative}
              showIntegral={showIntegral} integralA={dIntA} integralB={dIntB} integralAreaPoints={integralAreaPoints}
              showTangent={showTangent}
              tangentX0={dX0} tangentY0={tangentY0 ?? NaN} tangentSlope={tangentSlope ?? NaN}
            />
          )}

          {activeTab === '3d' && (
            <Graph3D
              expr3D={compiled3D}
              xRange={[x3Min, x3Max]}
              yRange={[y3Min, y3Max]}
              resolution={resolution}
            />
          )}

          {activeTab === 'extrusion' && (
            <Extrusion3D expr={compiledExt} a={extA} b={extB} h={extH} />
          )}
        </div>

        {/* Sidebar */}
        <aside style={{
          width: sidebarOpen ? 280 : 0,
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 280, height: '100%',
            padding: '12px 12px 12px 0',
            display: 'flex', flexDirection: 'column',
            gap: 0,
          }}>
            {activeTab === '2d' && (
              <Sidebar2D
                expr={expr2D} setExpr={setExpr2D} exprError={expr2DError}
                showIntegral={showIntegral} setShowIntegral={setShowIntegral}
                integralA={integralA} setIntegralA={setIntegralA}
                integralB={integralB} setIntegralB={setIntegralB}
                integralResult={integralResult}
                showTangent={showTangent} setShowTangent={setShowTangent}
                tangentX0={tangentX0} setTangentX0={setTangentX0}
                tangentSlope={tangentSlope} tangentY0={tangentY0}
                showDerivative={showDerivative} setShowDerivative={setShowDerivative}
                onPreset={setExpr2D}
              />
            )}

            {activeTab === '3d' && (
              <Sidebar3D
                expr={expr3D} setExpr={setExpr3D} exprError={expr3DError}
                xMin={x3Min} setXMin={setX3Min}
                xMax={x3Max} setXMax={setX3Max}
                yMin={y3Min} setYMin={setY3Min}
                yMax={y3Max} setYMax={setY3Max}
                resolution={resolution} setResolution={setResolution}
                onPreset={setExpr3D}
              />
            )}

            {activeTab === 'extrusion' && (
              <SidebarExtrusion
                expr={exprExt} setExpr={setExprExt} exprError={exprExtError}
                a={extA} setA={setExtA}
                b={extB} setB={setExtB}
                h={extH} setH={setExtH}
              />
            )}
          </div>
        </aside>
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer style={{
        height: 32,
        background: 'rgba(10,10,15,0.95)',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 18px',
        fontSize: '0.65rem',
        color: 'var(--text-muted)',
        flexShrink: 0,
      }}>
        <span>
          {activeTab === '2d' && !expr2DError && (
            <>f(x) = <code style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{dExpr2D}</code></>
          )}
          {activeTab === '3d' && !expr3DError && (
            <>z = f(x,y) = <code style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{dExpr3D}</code></>
          )}
          {activeTab === 'extrusion' && !exprExtError && (
            <>Extrusão: <code style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{dExprExt}</code></>
          )}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="neon-badge" style={{ fontSize: '0.6rem', padding: '1px 7px' }}>
            <FlaskConical size={8} /> Math.js + Three.js
          </span>
          R³ Studio
        </span>
      </footer>
    </div>
  );
}
