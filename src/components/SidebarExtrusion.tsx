/**
 * components/SidebarExtrusion.tsx
 * Control panel for the experimental extrusion mode.
 */
import React from 'react';
import { Layers, FlaskConical } from 'lucide-react';

interface Props {
  expr: string;
  setExpr: (v: string) => void;
  exprError: string | null;
  a: number; setA: (v: number) => void;
  b: number; setB: (v: number) => void;
  h: number; setH: (v: number) => void;
}

export const SidebarExtrusion: React.FC<Props> = ({
  expr, setExpr, exprError,
  a, setA, b, setB, h, setH,
}) => (
  <div className="sidebar-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

    {/* Badge */}
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <span className="neon-badge"><FlaskConical size={10} /> Experimental</span>
    </div>

    <div className="glass-card fade-in" style={{ padding: 14 }}>
      <div className="section-title"><Layers size={12} /> Extrusão de f(x)</div>

      <label className="label">f(x) =</label>
      <input
        className={`math-input${exprError ? ' error' : ''}`}
        value={expr}
        onChange={e => setExpr(e.target.value)}
        placeholder="ex: sin(x)"
        spellCheck={false}
        autoCapitalize="none"
      />
      {exprError && <div className="error-msg"><span>⚠</span> {exprError}</div>}
    </div>

    <div className="glass-card fade-in" style={{ padding: 14 }}>
      <div className="section-title">Intervalo [a, b]</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label className="label">a</label>
          <input type="number" value={a} onChange={e => setA(Number(e.target.value))} step={0.5} />
        </div>
        <div>
          <label className="label">b</label>
          <input type="number" value={b} onChange={e => setB(Number(e.target.value))} step={0.5} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="label">Altura h: {h.toFixed(1)}</label>
        <input
          type="range"
          min={0.2} max={10} step={0.1}
          value={h}
          onChange={e => setH(Number(e.target.value))}
        />
      </div>
    </div>

    <div className="glass-card" style={{ padding: 12, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
      <div className="section-title" style={{ fontSize: '0.68rem' }}>Como funciona</div>
      <p>
        A curva f(x) sobre o intervalo [a, b] é extrudada em 3D ao longo do eixo Z com altura h.
        Isso gera uma superfície sólida que representa o volume sob a curva.
      </p>
    </div>

  </div>
);
