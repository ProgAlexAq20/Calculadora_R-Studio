/**
 * components/Sidebar3D.tsx
 * Control panel for the 3D surface mode.
 */
import React from 'react';
import { Box, Sliders } from 'lucide-react';

interface Props {
  expr: string;
  setExpr: (v: string) => void;
  exprError: string | null;

  xMin: number; setXMin: (v: number) => void;
  xMax: number; setXMax: (v: number) => void;
  yMin: number; setYMin: (v: number) => void;
  yMax: number; setYMax: (v: number) => void;
  resolution: number; setResolution: (v: number) => void;

  onPreset: (p: string) => void;
}

const PRESETS_3D = [
  { label: 'Paraboloid',   expr: 'x^2 + y^2' },
  { label: 'Saddle',       expr: 'x^2 - y^2' },
  { label: 'Ripple',       expr: 'sin(x) * cos(y)' },
  { label: 'Peaks',        expr: '3*(1-x)^2*exp(-x^2-(y+1)^2)-10*(x/5-x^3-y^5)*exp(-x^2-y^2)-exp(-(x+1)^2-y^2)/3' },
  { label: 'Wave',         expr: 'sin(sqrt(x^2 + y^2))' },
  { label: 'Cone',         expr: 'sqrt(x^2 + y^2)' },
  { label: 'sin+cos',      expr: 'sin(x) + cos(y)' },
  { label: 'Egg crate',    expr: 'sin(x)*sin(y)' },
];

export const Sidebar3D: React.FC<Props> = ({
  expr, setExpr, exprError,
  xMin, setXMin, xMax, setXMax,
  yMin, setYMin, yMax, setYMax,
  resolution, setResolution,
  onPreset,
}) => {
  return (
    <div className="sidebar-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Expression ───────────────────────── */}
      <div className="glass-card fade-in" style={{ padding: 14 }}>
        <div className="section-title"><Box size={12} /> Superfície z = f(x, y)</div>

        <label className="label">z = f(x, y)</label>
        <input
          className={`math-input${exprError ? ' error' : ''}`}
          value={expr}
          onChange={e => setExpr(e.target.value)}
          placeholder="ex: x^2 + y^2"
          spellCheck={false}
          autoCapitalize="none"
        />
        {exprError && <div className="error-msg"><span>⚠</span> {exprError}</div>}

        <div style={{ marginTop: 10 }}>
          <label className="label">Exemplos</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {PRESETS_3D.map(p => (
              <button
                key={p.expr}
                className="btn btn-ghost btn-sm"
                onClick={() => onPreset(p.expr)}
                style={{ fontFamily: 'var(--font-sans)', fontSize: '0.73rem' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Domain ───────────────────────────── */}
      <div className="glass-card fade-in" style={{ padding: 14 }}>
        <div className="section-title"><Sliders size={12} /> Domínio</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label className="label">x mín</label>
            <input type="number" value={xMin} onChange={e => setXMin(Number(e.target.value))} step={1} />
          </div>
          <div>
            <label className="label">x máx</label>
            <input type="number" value={xMax} onChange={e => setXMax(Number(e.target.value))} step={1} />
          </div>
          <div>
            <label className="label">y mín</label>
            <input type="number" value={yMin} onChange={e => setYMin(Number(e.target.value))} step={1} />
          </div>
          <div>
            <label className="label">y máx</label>
            <input type="number" value={yMax} onChange={e => setYMax(Number(e.target.value))} step={1} />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="label">Resolução: {resolution}×{resolution}</label>
          <input
            type="range"
            min={20} max={100} step={5}
            value={resolution}
            onChange={e => setResolution(Number(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3 }}>
            <span>Rápido</span><span>Alta qualidade</span>
          </div>
        </div>
      </div>

      {/* ── Tips ─────────────────────────────── */}
      <div className="glass-card" style={{ padding: 12, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <div className="section-title" style={{ fontSize: '0.68rem' }}>Dicas</div>
        <ul style={{ paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <li>Arraste para rotacionar</li>
          <li>Scroll para zoom</li>
          <li>Clique com botão direito para mover</li>
          <li>Use <code style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>x</code> e <code style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>y</code> na expressão</li>
        </ul>
      </div>

    </div>
  );
};
