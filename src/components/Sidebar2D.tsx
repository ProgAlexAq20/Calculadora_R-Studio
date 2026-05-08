/**
 * components/Sidebar2D.tsx
 * Control panel for the 2D graph mode.
 */
import React from 'react';
import {
  SquareFunction as FnIcon, Sigma, GitBranch, TrendingUp,
} from 'lucide-react';

interface Props {
  // Function
  expr: string;
  setExpr: (v: string) => void;
  exprError: string | null;

  // Integral
  showIntegral: boolean;
  setShowIntegral: (v: boolean) => void;
  integralA: number;
  setIntegralA: (v: number) => void;
  integralB: number;
  setIntegralB: (v: number) => void;
  integralResult: number | null;

  // Tangent
  showTangent: boolean;
  setShowTangent: (v: boolean) => void;
  tangentX0: number;
  setTangentX0: (v: number) => void;
  tangentSlope: number | null;
  tangentY0: number | null;

  // Derivative
  showDerivative: boolean;
  setShowDerivative: (v: boolean) => void;

  // Presets
  onPreset: (p: string) => void;
}

const PRESETS = [
  { label: 'x²',        expr: 'x^2' },
  { label: 'sin(x)',    expr: 'sin(x)' },
  { label: 'cos(x)',    expr: 'cos(x)' },
  { label: 'tan(x)',    expr: 'tan(x)' },
  { label: 'eˣ',        expr: 'exp(x)' },
  { label: 'ln(x)',     expr: 'log(x)' },
  { label: '√x',        expr: 'sqrt(x)' },
  { label: '1/x',       expr: '1/x' },
  { label: 'x³−3x',    expr: 'x^3 - 3*x' },
  { label: '|x|',       expr: 'abs(x)' },
];

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> =
  ({ checked, onChange, label }) => (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-track" />
      {label}
    </label>
  );

export const Sidebar2D: React.FC<Props> = ({
  expr, setExpr, exprError,
  showIntegral, setShowIntegral, integralA, setIntegralA, integralB, setIntegralB, integralResult,
  showTangent, setShowTangent, tangentX0, setTangentX0, tangentSlope, tangentY0,
  showDerivative, setShowDerivative,
  onPreset,
}) => {
  return (
    <div className="sidebar-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Function input ────────────────────── */}
      <div className="glass-card fade-in" style={{ padding: 14 }}>
        <div className="section-title"><FnIcon size={12} /> Função f(x)</div>

        <label className="label">f(x) =</label>
        <input
          className={`math-input${exprError ? ' error' : ''}`}
          value={expr}
          onChange={e => setExpr(e.target.value)}
          placeholder="ex: sin(x) * x^2"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
        />
        {exprError && (
          <div className="error-msg">
            <span>⚠</span> {exprError}
          </div>
        )}

        {/* Presets */}
        <div style={{ marginTop: 10 }}>
          <label className="label">Exemplos</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {PRESETS.map(p => (
              <button
                key={p.expr}
                className="btn btn-ghost btn-sm"
                onClick={() => onPreset(p.expr)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Derivative toggle ─────────────────── */}
      <div className="glass-card fade-in" style={{ padding: 14 }}>
        <div className="section-title"><TrendingUp size={12} /> Derivada</div>
        <Toggle checked={showDerivative} onChange={setShowDerivative} label="Mostrar f′(x)" />
        {showDerivative && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#06b6d4' }}>
            <span style={{ width: 20, height: 2, background: '#06b6d4', display: 'inline-block', borderRadius: 2 }} />
            Curva derivada f′(x)
          </div>
        )}
      </div>

      {/* ── Integral ─────────────────────────── */}
      <div className="glass-card fade-in" style={{ padding: 14 }}>
        <div className="section-title"><Sigma size={12} /> Integral</div>
        <Toggle checked={showIntegral} onChange={setShowIntegral} label="Calcular integral" />

        {showIntegral && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label className="label">Limite a</label>
                <input
                  type="number"
                  value={integralA}
                  onChange={e => setIntegralA(Number(e.target.value))}
                  step={0.5}
                />
              </div>
              <div>
                <label className="label">Limite b</label>
                <input
                  type="number"
                  value={integralB}
                  onChange={e => setIntegralB(Number(e.target.value))}
                  step={0.5}
                />
              </div>
            </div>

            {integralResult !== null && (
              <div className="result-chip">
                <div className="result-label">∫ f(x) dx de {integralA} a {integralB}</div>
                <div className="result-value">
                  {isNaN(integralResult) ? '—' : integralResult.toFixed(6)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Tangent line ──────────────────────── */}
      <div className="glass-card fade-in" style={{ padding: 14 }}>
        <div className="section-title"><GitBranch size={12} /> Reta Tangente</div>
        <Toggle checked={showTangent} onChange={setShowTangent} label="Mostrar tangente" />

        {showTangent && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label className="label">Ponto x₀</label>
              <input
                type="number"
                value={tangentX0}
                onChange={e => setTangentX0(Number(e.target.value))}
                step={0.1}
              />
            </div>

            {tangentSlope !== null && tangentY0 !== null && !isNaN(tangentSlope) && !isNaN(tangentY0) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="result-chip">
                  <div className="result-label">Inclinação f′(x₀)</div>
                  <div className="result-value" style={{ color: '#f59e0b' }}>
                    {tangentSlope.toFixed(4)}
                  </div>
                </div>
                <div className="result-chip">
                  <div className="result-label">Equação da reta</div>
                  <div className="result-value" style={{ fontSize: '0.9rem', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                    y = {tangentSlope.toFixed(3)}(x − {tangentX0}) + {tangentY0.toFixed(3)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Legend ───────────────────────────── */}
      <div className="glass-card" style={{ padding: 12 }}>
        <div className="section-title">Legenda</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 24, height: 2.5, background: '#8b5cf6', display: 'inline-block', borderRadius: 2, boxShadow: '0 0 6px #8b5cf6' }} />
            f(x) — Função
          </div>
          {showDerivative && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 24, height: 2, background: '#06b6d4', display: 'inline-block', borderRadius: 2 }} />
              f′(x) — Derivada
            </div>
          )}
          {showTangent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 24, height: 1.5, background: '#f59e0b', display: 'inline-block', borderRadius: 2, opacity: 0.85 }} />
              Reta tangente
            </div>
          )}
          {showIntegral && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 24, height: 12, background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.6)', display: 'inline-block', borderRadius: 3 }} />
              Área integral
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
