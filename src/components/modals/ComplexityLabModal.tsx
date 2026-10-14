import React, { useState, useId } from 'react';
import {
  X,
  TrendingUp,
  Cpu,
  Activity,
  Play,
  CheckSquare,
  Square,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import {
  ALGORITHM_COMPLEXITY_PROFILES,
  DEFAULT_SELECTED_ALGORITHM_IDS,
} from '../views/complexityData';

export interface ComplexityLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAlgorithm: (id: string) => void;
}

export const ComplexityLabModal: React.FC<ComplexityLabModalProps> = ({
  isOpen,
  onClose,
  onSelectAlgorithm,
}) => {
  const [inputN, setInputN] = useState<number>(16);
  const [selectedAlgoIds, setSelectedAlgoIds] = useState<Set<string>>(
    new Set(DEFAULT_SELECTED_ALGORITHM_IDS)
  );
  const [hoveredAlgoId, setHoveredAlgoId] = useState<string | null>(null);
  const titleId = useId();

  if (!isOpen) return null;

  // Parámetros para el gráfico SVG
  const svgWidth = 640;
  const svgHeight = 260;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const graphW = svgWidth - padding.left - padding.right;
  const graphH = svgHeight - padding.top - padding.bottom;

  const maxN = 50;
  const maxY = 2500;

  const toX = (n: number) => padding.left + (n / maxN) * graphW;
  const toY = (val: number) => padding.top + graphH - (Math.min(val, maxY) / maxY) * graphH;

  const samplePoints = Array.from({ length: 51 }, (_, i) => i);

  const toggleAlgorithm = (id: string) => {
    setSelectedAlgoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectSorting = () => {
    setSelectedAlgoIds(new Set(['bubble-sort', 'quick-sort', 'merge-sort']));
  };

  const handleSelectTop4 = () => {
    setSelectedAlgoIds(new Set(DEFAULT_SELECTED_ALGORITHM_IDS));
  };

  const handleSelectAll = () => {
    setSelectedAlgoIds(new Set(ALGORITHM_COMPLEXITY_PROFILES.map((a) => a.id)));
  };

  const handleClearAll = () => {
    setSelectedAlgoIds(new Set());
  };

  const selectedProfiles = ALGORITHM_COMPLEXITY_PROFILES.filter((a) =>
    selectedAlgoIds.has(a.id)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 bg-ink-primary/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-paper-surface border border-paper-border rounded-lg shadow-tactile-card w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-ink-primary relative select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Laboratorio */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-paper-border bg-paper-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-surface-container border border-paper-border text-ink-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 id={titleId} className="font-headline font-bold text-sm tracking-tight text-ink-primary">
                Laboratorio de Complejidad Asintótica — Big-O Lab
              </h3>
              <p className="font-mono text-[11px] text-ink-secondary">
                Comparación interactiva de costos computacionales y selección dinámica de algoritmos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-surface-container-low text-ink-secondary hover:text-ink-primary transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Slider de N y Filtros */}
          <div className="bg-surface-container-low/60 border border-paper-border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-6 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="modal-n-slider" className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-ink-secondary" />
                    Tamaño de Entrada (N):
                  </label>
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-paper-surface border border-paper-border text-ink-primary">
                    N = {inputN}
                  </span>
                </div>
                <input
                  id="modal-n-slider"
                  type="range"
                  min="2"
                  max="50"
                  value={inputN}
                  onChange={(e) => setInputN(Number(e.target.value))}
                  className="w-full accent-ink-primary cursor-pointer"
                />
              </div>

              {/* Botones de acción rápida */}
              <div className="sm:col-span-6 flex flex-wrap gap-1.5 items-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleSelectSorting}
                  className="px-2 py-1 rounded bg-paper-surface border border-paper-border font-mono text-[10px] font-bold text-ink-primary hover:bg-surface-container transition-colors flex items-center gap-1"
                >
                  <BarChart2 className="w-2.5 h-2.5" />
                  <span>Ordenamiento</span>
                </button>
                <button
                  type="button"
                  onClick={handleSelectTop4}
                  className="px-2 py-1 rounded bg-paper-surface border border-paper-border font-mono text-[10px] font-bold text-ink-primary hover:bg-surface-container transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Top 4</span>
                </button>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2 py-1 rounded bg-paper-surface border border-paper-border font-mono text-[10px] font-bold text-ink-primary hover:bg-surface-container transition-colors"
                >
                  <span>Todos (12)</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2 py-1 rounded bg-paper-surface border border-paper-border font-mono text-[10px] font-bold text-ink-muted hover:text-ink-primary transition-colors"
                >
                  <span>Limpiar</span>
                </button>
              </div>
            </div>

            {/* Chips de selección de algoritmos */}
            <div className="pt-2 border-t border-paper-border/60">
              <span className="block font-mono text-[10px] font-bold text-ink-secondary uppercase tracking-wider mb-1.5">
                Algoritmos en Comparación ({selectedAlgoIds.size} de {ALGORITHM_COMPLEXITY_PROFILES.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ALGORITHM_COMPLEXITY_PROFILES.map((algo) => {
                  const isSelected = selectedAlgoIds.has(algo.id);
                  return (
                    <button
                      key={algo.id}
                      type="button"
                      onClick={() => toggleAlgorithm(algo.id)}
                      onMouseEnter={() => setHoveredAlgoId(algo.id)}
                      onMouseLeave={() => setHoveredAlgoId(null)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] transition-all border ${
                        isSelected
                          ? 'bg-paper-surface border-ink-primary font-bold text-ink-primary shadow-xs'
                          : 'bg-paper-surface/50 border-paper-border text-ink-muted hover:text-ink-primary opacity-60'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-3 h-3 text-ink-primary" />
                      ) : (
                        <Square className="w-3 h-3 text-ink-muted" />
                      )}
                      <span
                        className="w-2 h-2 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: algo.color }}
                      />
                      <span>{algo.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tarjetas de Operaciones */}
          {selectedProfiles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {selectedProfiles.map((algo) => {
                const ops = Math.round(algo.fn(inputN));
                const isHovered = hoveredAlgoId === algo.id;
                return (
                  <div
                    key={algo.id}
                    onMouseEnter={() => setHoveredAlgoId(algo.id)}
                    onMouseLeave={() => setHoveredAlgoId(null)}
                    className={`flex flex-col justify-between p-2.5 rounded bg-surface-container-low border transition-all ${
                      isHovered ? 'border-ink-primary ring-2 ring-ink-primary/20 scale-[1.02]' : 'border-paper-border'
                    }`}
                    style={{ borderLeftColor: algo.color, borderLeftWidth: '3px' }}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono font-bold text-ink-secondary truncate">{algo.name}</span>
                      <span className="font-mono font-bold px-1 rounded" style={{ backgroundColor: `${algo.color}20`, color: algo.color }}>
                        {algo.notation}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-extrabold text-ink-primary my-0.5">
                      {ops.toLocaleString()}
                    </span>
                    <span className="font-mono text-[9px] text-ink-muted truncate">{algo.formula}</span>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Gráfico SVG */}
          <div className="bg-paper-surface border border-paper-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold uppercase text-ink-primary flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-ink-secondary" />
                Gráfica Dinámica (Operaciones vs N)
              </span>
            </div>

            <div className="w-full overflow-x-auto flex justify-center">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-2xl h-auto select-none">
                <defs>
                  <pattern id="modal-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#EAE5DC" strokeWidth="0.8" />
                  </pattern>
                </defs>

                <rect x={padding.left} y={padding.top} width={graphW} height={graphH} fill="url(#modal-grid)" />

                {/* Ejes */}
                <line x1={padding.left} y1={padding.top + graphH} x2={padding.left + graphW} y2={padding.top + graphH} stroke="#1E232A" strokeWidth="1.5" />
                <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + graphH} stroke="#1E232A" strokeWidth="1.5" />

                {/* Ticks Eje Y */}
                <text x={padding.left - 6} y={padding.top + 5} textAnchor="end" className="font-mono text-[9px] fill-[#9DA4B0]">2500</text>
                <text x={padding.left - 6} y={padding.top + graphH / 2} textAnchor="end" className="font-mono text-[9px] fill-[#9DA4B0]">1250</text>
                <text x={padding.left - 6} y={padding.top + graphH} textAnchor="end" className="font-mono text-[9px] fill-[#9DA4B0]">0</text>

                {/* Ticks Eje X */}
                <text x={padding.left} y={padding.top + graphH + 16} textAnchor="middle" className="font-mono text-[9px] fill-[#9DA4B0]">0</text>
                <text x={padding.left + graphW / 2} y={padding.top + graphH + 16} textAnchor="middle" className="font-mono text-[9px] fill-[#9DA4B0]">25</text>
                <text x={padding.left + graphW} y={padding.top + graphH + 16} textAnchor="middle" className="font-mono text-[9px] fill-[#9DA4B0]">50</text>

                {/* Curvas Seleccionadas con transiciones */}
                {selectedProfiles.map((algo) => {
                  const isHovered = hoveredAlgoId === algo.id;
                  const pathData = samplePoints
                    .map((n, idx) => {
                      const x = toX(n);
                      const y = toY(algo.fn(n));
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ');

                  return (
                    <path
                      key={algo.id}
                      d={pathData}
                      fill="none"
                      stroke={algo.color}
                      strokeWidth={isHovered ? '4' : '2.5'}
                      strokeLinecap="round"
                      opacity={hoveredAlgoId && !isHovered ? 0.35 : 1}
                      className="transition-all duration-300 ease-out"
                    />
                  );
                })}

                {/* Línea vertical indicadora del N actual */}
                <line
                  x1={toX(inputN)}
                  y1={padding.top}
                  x2={toX(inputN)}
                  y2={padding.top + graphH}
                  stroke="#1E232A"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  className="transition-all duration-300 ease-out"
                />

                {/* Puntos y Marcadores Activos en N */}
                {selectedProfiles.map((algo) => {
                  const ops = algo.fn(inputN);
                  const cx = toX(inputN);
                  const cy = toY(ops);
                  const isHovered = hoveredAlgoId === algo.id;

                  return (
                    <g key={`point-${algo.id}`} className="transition-all duration-300 ease-out">
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? '8' : '5'}
                        fill={algo.color}
                        fillOpacity={0.25}
                        className="transition-all duration-300 ease-out"
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? '4.5' : '3'}
                        fill={algo.color}
                        stroke="#1E232A"
                        strokeWidth="1.5"
                        className="transition-all duration-300 ease-out"
                      />
                    </g>
                  );
                })}

                <circle cx={toX(inputN)} cy={padding.top + graphH} r="3" fill="#1E232A" className="transition-all duration-300 ease-out" />
              </svg>
            </div>
          </div>

          {/* Tabla de Algoritmos */}
          <div className="border border-paper-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container text-[10px] text-ink-secondary border-b border-paper-border">
                    <th className="py-2 px-3 font-bold w-10 text-center">Comparar</th>
                    <th className="py-2 px-3 font-bold">Algoritmo</th>
                    <th className="py-2 px-3 font-bold">Categoría</th>
                    <th className="py-2 px-3 font-bold">Complejidad</th>
                    <th className="py-2 px-3 font-bold">Operaciones</th>
                    <th className="py-2 px-3 text-right font-bold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-border">
                  {ALGORITHM_COMPLEXITY_PROFILES.map((algo) => {
                    const isSelected = selectedAlgoIds.has(algo.id);
                    const ops = Math.round(algo.fn(inputN));

                    return (
                      <tr
                        key={algo.id}
                        onClick={() => toggleAlgorithm(algo.id)}
                        className={`cursor-pointer hover:bg-surface-container-low/70 transition-colors ${
                          isSelected ? 'bg-surface-container-low/40' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAlgorithm(algo.id);
                            }}
                            className="p-1 rounded text-ink-primary hover:bg-surface-container"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-3.5 h-3.5 text-ink-primary" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-ink-muted" />
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 font-bold text-ink-primary">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: algo.color }} />
                            <span>{algo.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-ink-secondary text-[10px] uppercase">
                          {algo.category}
                        </td>
                        <td className="py-2 px-3 font-bold">
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] border"
                            style={{
                              backgroundColor: `${algo.color}15`,
                              color: algo.color,
                              borderColor: `${algo.color}40`,
                            }}
                          >
                            {algo.notation}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold text-ink-primary">
                          {ops.toLocaleString()} ops
                        </td>
                        <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectAlgorithm(algo.id);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-ink-primary text-paper-surface hover:bg-ink-primary/90 text-[10px] font-bold transition-all shadow-xs"
                          >
                            <Play className="w-2 h-2" />
                            <span>Cargar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
