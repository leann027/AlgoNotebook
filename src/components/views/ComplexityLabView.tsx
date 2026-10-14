import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Cpu,
  Activity,
  Play,
  CheckSquare,
  Square,
  Sparkles,
  BarChart2,
  Search,
} from 'lucide-react';
import {
  ALGORITHM_COMPLEXITY_PROFILES,
  DEFAULT_SELECTED_ALGORITHM_IDS,
} from './complexityData';

export interface ComplexityLabViewProps {
  onSelectAlgorithm: (id: string) => void;
}

export const ComplexityLabView: React.FC<ComplexityLabViewProps> = ({ onSelectAlgorithm }) => {
  const [inputN, setInputN] = useState<number>(16);
  const [selectedAlgoIds, setSelectedAlgoIds] = useState<Set<string>>(
    new Set(DEFAULT_SELECTED_ALGORITHM_IDS)
  );
  const [hoveredAlgoId, setHoveredAlgoId] = useState<string | null>(null);

  // Dimensiones del gráfico SVG
  const svgWidth = 740;
  const svgHeight = 310;
  const padding = { top: 25, right: 35, bottom: 45, left: 55 };
  const graphW = svgWidth - padding.left - padding.right;
  const graphH = svgHeight - padding.top - padding.bottom;

  const maxN = 50;
  const maxY = 2500; // N² a N=50 es 2500

  const toX = (n: number) => padding.left + (n / maxN) * graphW;
  const toY = (val: number) => padding.top + graphH - (Math.min(val, maxY) / maxY) * graphH;

  const samplePoints = useMemo(() => Array.from({ length: 51 }, (_, i) => i), []);

  // Alternar selección de un algoritmo
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

  // Presets de selección rápida
  const handleSelectSorting = () => {
    setSelectedAlgoIds(new Set(['bubble-sort', 'quick-sort', 'merge-sort']));
  };

  const handleSelectSearchVsSort = () => {
    setSelectedAlgoIds(new Set(['binary-search', 'quick-sort', 'bubble-sort']));
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

  // Algoritmos actualmente seleccionados
  const selectedProfiles = useMemo(
    () => ALGORITHM_COMPLEXITY_PROFILES.filter((a) => selectedAlgoIds.has(a.id)),
    [selectedAlgoIds]
  );

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-paper-base p-4 lg:p-6 select-none">
      {/* 1. Cabecera del Laboratorio */}
      <div className="bg-paper-surface border border-paper-border rounded-lg p-5 shadow-tactile-card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-surface-container border border-paper-border text-ink-primary shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-headline font-extrabold text-lg text-ink-primary tracking-tight">
                Laboratorio de Complejidad Asintótica — Big-O Lab
              </h2>
              <p className="font-mono text-xs text-ink-secondary">
                Curvas matemáticas de costo computacional y comparación interactiva de los 12 algoritmos
              </p>
            </div>
          </div>

          {/* Contador de seleccionados */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-surface-container-low border border-paper-border text-ink-primary font-bold">
              {selectedAlgoIds.size} de {ALGORITHM_COMPLEXITY_PROFILES.length} Seleccionados
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 pb-8">
        {/* 2. Control de Tamaño de Entrada (N) y Presets */}
        <div className="bg-paper-surface border border-paper-border rounded-lg shadow-tactile-card p-5 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Slider N */}
            <div className="lg:col-span-6 space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="lab-n-slider"
                  className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary flex items-center gap-1.5"
                >
                  <Cpu className="w-3.5 h-3.5 text-ink-secondary" />
                  Tamaño de Entrada (N):
                </label>
                <span className="font-mono text-sm font-extrabold px-2.5 py-0.5 rounded bg-surface-container-low border border-paper-border text-ink-primary">
                  N = {inputN}
                </span>
              </div>
              <input
                id="lab-n-slider"
                type="range"
                min="2"
                max="50"
                value={inputN}
                onChange={(e) => setInputN(Number(e.target.value))}
                className="w-full accent-ink-primary cursor-pointer transition-all"
              />
              <div className="flex justify-between font-mono text-[10px] text-ink-muted">
                <span>N = 2</span>
                <span>N = 25</span>
                <span>N = 50</span>
              </div>
            </div>

            {/* Presets de Comparación Rápida */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-2">
              <span className="font-mono text-[11px] font-bold text-ink-secondary uppercase tracking-wider">
                Filtros Rápidos de Comparación:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectSorting}
                  className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container border border-paper-border font-mono text-[11px] font-bold text-ink-primary transition-colors flex items-center gap-1 shadow-xs"
                >
                  <BarChart2 className="w-3 h-3 text-ink-secondary" />
                  <span>Ordenamiento</span>
                </button>
                <button
                  type="button"
                  onClick={handleSelectSearchVsSort}
                  className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container border border-paper-border font-mono text-[11px] font-bold text-ink-primary transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Search className="w-3 h-3 text-ink-secondary" />
                  <span>Búsqueda vs Orden</span>
                </button>
                <button
                  type="button"
                  onClick={handleSelectTop4}
                  className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container border border-paper-border font-mono text-[11px] font-bold text-ink-primary transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Sparkles className="w-3 h-3 text-ink-secondary" />
                  <span>Top 4 Inicial</span>
                </button>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container border border-paper-border font-mono text-[11px] font-bold text-ink-primary transition-colors shadow-xs"
                >
                  <span>Todos (12)</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container border border-paper-border font-mono text-[11px] font-bold text-ink-muted hover:text-ink-primary transition-colors"
                >
                  <span>Limpiar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Chips interactivos de Selección de Algoritmos */}
          <div className="pt-3 border-t border-paper-border">
            <span className="block font-mono text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-2">
              Seleccionar Algoritmos a Comparar en el Gráfico:
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
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-xs transition-all border ${
                      isSelected
                        ? 'bg-paper-surface border-ink-primary font-bold text-ink-primary shadow-xs'
                        : 'bg-surface-container-low/70 border-paper-border text-ink-muted hover:text-ink-primary hover:border-ink-secondary opacity-70'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-ink-primary" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-ink-muted" />
                    )}
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: algo.color }}
                    />
                    <span>{algo.name}</span>
                    <span
                      className="text-[10px] px-1 rounded font-bold"
                      style={{
                        backgroundColor: `${algo.color}18`,
                        color: algo.color,
                      }}
                    >
                      {algo.notation}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Métricas en Tiempo Real de los Algoritmos Seleccionados */}
        {selectedProfiles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {selectedProfiles.map((algo) => {
              const ops = Math.round(algo.fn(inputN));
              const isHovered = hoveredAlgoId === algo.id;

              return (
                <div
                  key={algo.id}
                  onMouseEnter={() => setHoveredAlgoId(algo.id)}
                  onMouseLeave={() => setHoveredAlgoId(null)}
                  className={`flex flex-col justify-between p-3 rounded-lg bg-paper-surface border transition-all shadow-xs ${
                    isHovered
                      ? 'border-ink-primary ring-2 ring-ink-primary/20 scale-[1.02]'
                      : 'border-paper-border'
                  }`}
                  style={{ borderLeftColor: algo.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] font-bold text-ink-secondary truncate">
                      {algo.name}
                    </span>
                    <span
                      className="font-mono text-[10px] font-extrabold px-1 rounded"
                      style={{ backgroundColor: `${algo.color}20`, color: algo.color }}
                    >
                      {algo.notation}
                    </span>
                  </div>
                  <span className="font-mono text-base font-extrabold text-ink-primary my-1">
                    {ops.toLocaleString()}
                  </span>
                  <span className="font-mono text-[9px] text-ink-muted truncate" title={algo.formula}>
                    {algo.formula}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-surface-container-low border border-dashed border-paper-border rounded-lg text-center font-mono text-xs text-ink-muted">
            Ningún algoritmo seleccionado. Haz clic en las etiquetas arriba o en la tabla para comparar en la gráfica.
          </div>
        )}

        {/* 4. Gráfico SVG Fluido y Responsivo */}
        <div className="bg-paper-surface border border-paper-border rounded-lg shadow-tactile-card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="font-mono text-xs font-bold tracking-wide uppercase text-ink-primary flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-ink-secondary" />
              Gráfica Dinámica de Costo Computacional (Operaciones vs N)
            </span>
            <span className="font-mono text-[11px] text-ink-secondary">
              Eje X: N (0..50) | Eje Y: Operaciones (0..2500)
            </span>
          </div>

          <div className="w-full overflow-x-auto flex justify-center py-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full max-w-4xl h-auto select-none"
            >
              <defs>
                {/* Cuadrícula de papel milimétrico */}
                <pattern id="lab-view-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#EAE5DC" strokeWidth="0.8" />
                </pattern>
              </defs>

              <rect
                x={padding.left}
                y={padding.top}
                width={graphW}
                height={graphH}
                fill="url(#lab-view-grid)"
              />

              {/* Ejes */}
              <line
                x1={padding.left}
                y1={padding.top + graphH}
                x2={padding.left + graphW}
                y2={padding.top + graphH}
                stroke="#1E232A"
                strokeWidth="1.5"
              />
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={padding.top + graphH}
                stroke="#1E232A"
                strokeWidth="1.5"
              />

              {/* Ticks Eje Y */}
              <text x={padding.left - 8} y={padding.top + 5} textAnchor="end" className="font-mono text-[9px] fill-[#9DA4B0]">2500</text>
              <text x={padding.left - 8} y={padding.top + graphH * 0.25} textAnchor="end" className="font-mono text-[9px] fill-[#9DA4B0]">1875</text>
              <text x={padding.left - 8} y={padding.top + graphH * 0.5} textAnchor="end" className="font-mono text-[9px] fill-[#9DA4B0]">1250</text>
              <text x={padding.left - 8} y={padding.top + graphH * 0.75} textAnchor="end" className="font-mono text-[9px] fill-[#9DA4B0]">625</text>
              <text x={padding.left - 8} y={padding.top + graphH} textAnchor="end" className="font-mono text-[9px] fill-[#9DA4B0]">0</text>

              {/* Ticks Eje X */}
              <text x={padding.left} y={padding.top + graphH + 16} textAnchor="middle" className="font-mono text-[9px] fill-[#9DA4B0]">0</text>
              <text x={padding.left + graphW * 0.2} y={padding.top + graphH + 16} textAnchor="middle" className="font-mono text-[9px] fill-[#9DA4B0]">10</text>
              <text x={padding.left + graphW * 0.4} y={padding.top + graphH + 16} textAnchor="middle" className="font-mono text-[9px] fill-[#9DA4B0]">20</text>
              <text x={padding.left + graphW * 0.6} y={padding.top + graphH + 16} textAnchor="middle" className="font-mono text-[9px] fill-[#9DA4B0]">30</text>
              <text x={padding.left + graphW * 0.8} y={padding.top + graphH + 16} textAnchor="middle" className="font-mono text-[9px] fill-[#9DA4B0]">40</text>
              <text x={padding.left + graphW} y={padding.top + graphH + 16} textAnchor="middle" className="font-mono text-[9px] fill-[#9DA4B0]">50</text>

              <text
                x={padding.left + graphW / 2}
                y={padding.top + graphH + 32}
                textAnchor="middle"
                className="font-mono text-[10px] font-bold fill-[#5C6470]"
              >
                Tamaño de Entrada (N)
              </text>

              {/* Curvas de los Algoritmos Seleccionados con animaciones suaves */}
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
                  <g key={algo.id} className="transition-opacity duration-200">
                    <path
                      d={pathData}
                      fill="none"
                      stroke={algo.color}
                      strokeWidth={isHovered ? '4' : '2.5'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={hoveredAlgoId && !isHovered ? 0.35 : 1}
                      className="transition-all duration-300 ease-out"
                    />
                  </g>
                );
              })}

              {/* Línea vertical indicadora del N actual con animación fluida */}
              <line
                x1={toX(inputN)}
                y1={padding.top}
                x2={toX(inputN)}
                y2={padding.top + graphH}
                stroke="#1E232A"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="transition-all duration-300 ease-out"
              />

              {/* Puntos y Marcadores Activos en N para cada algoritmo seleccionado */}
              {selectedProfiles.map((algo) => {
                const ops = algo.fn(inputN);
                const cx = toX(inputN);
                const cy = toY(ops);
                const isHovered = hoveredAlgoId === algo.id;

                return (
                  <g key={`point-${algo.id}`} className="transition-all duration-300 ease-out">
                    {/* Anillo exterior suave */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? '9' : '6'}
                      fill={algo.color}
                      fillOpacity={0.25}
                      className="transition-all duration-300 ease-out"
                    />
                    {/* Punto central */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? '5' : '3.5'}
                      fill={algo.color}
                      stroke="#1E232A"
                      strokeWidth="1.5"
                      className="transition-all duration-300 ease-out cursor-pointer"
                    />
                  </g>
                );
              })}

              {/* Base del Indicador de N */}
              <circle
                cx={toX(inputN)}
                cy={padding.top + graphH}
                r="4"
                fill="#1E232A"
                className="transition-all duration-300 ease-out"
              />
            </svg>
          </div>
        </div>

        {/* 5. Tabla Comparativa Exhaustiva con Toggles Interactivos */}
        <div className="bg-paper-surface border border-paper-border rounded-lg shadow-tactile-card overflow-hidden">
          <div className="px-5 py-3 bg-surface-container-low border-b border-paper-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold text-ink-primary uppercase tracking-wider">
              Tabla Comparativa de los 12 Algoritmos del Laboratorio
            </span>
            <span className="font-mono text-[11px] text-ink-secondary">
              Haz clic en cualquier casilla para añadir o retirar de la gráfica
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container text-[10px] text-ink-secondary border-b border-paper-border">
                  <th className="py-2.5 px-4 font-bold w-12 text-center">Comparar</th>
                  <th className="py-2.5 px-4 font-bold">Algoritmo</th>
                  <th className="py-2.5 px-4 font-bold">Categoría</th>
                  <th className="py-2.5 px-4 font-bold">Complejidad (Big-O)</th>
                  <th className="py-2.5 px-4 font-bold">Operaciones a N={inputN}</th>
                  <th className="py-2.5 px-4 font-bold">Fórmula</th>
                  <th className="py-2.5 px-4 text-right font-bold">Visualizador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border">
                {ALGORITHM_COMPLEXITY_PROFILES.map((algo) => {
                  const isSelected = selectedAlgoIds.has(algo.id);
                  const isHovered = hoveredAlgoId === algo.id;
                  const ops = Math.round(algo.fn(inputN));

                  return (
                    <tr
                      key={algo.id}
                      onMouseEnter={() => setHoveredAlgoId(algo.id)}
                      onMouseLeave={() => setHoveredAlgoId(null)}
                      onClick={() => toggleAlgorithm(algo.id)}
                      className={`cursor-pointer transition-colors ${
                        isHovered
                          ? 'bg-surface-container-low'
                          : isSelected
                          ? 'bg-surface-container-low/40'
                          : 'hover:bg-surface-container-low/30'
                      }`}
                    >
                      {/* Checkbox de Selección */}
                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAlgorithm(algo.id);
                          }}
                          className="p-1 rounded text-ink-primary hover:bg-surface-container transition-colors"
                          aria-label={`Comparar ${algo.name}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-ink-primary" />
                          ) : (
                            <Square className="w-4 h-4 text-ink-muted" />
                          )}
                        </button>
                      </td>

                      {/* Nombre con swatch de color */}
                      <td className="py-2.5 px-4 font-bold text-ink-primary">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                            style={{ backgroundColor: algo.color }}
                          />
                          <span>{algo.name}</span>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-2.5 px-4 text-ink-secondary text-[11px] uppercase">
                        {algo.category}
                      </td>

                      {/* Notación */}
                      <td className="py-2.5 px-4">
                        <span
                          className="px-2 py-0.5 rounded font-mono text-[11px] font-bold border"
                          style={{
                            backgroundColor: `${algo.color}15`,
                            color: algo.color,
                            borderColor: `${algo.color}40`,
                          }}
                        >
                          {algo.notation}
                        </span>
                      </td>

                      {/* Operaciones calculadas a N */}
                      <td className="py-2.5 px-4 font-bold text-ink-primary">
                        <span className="font-mono text-xs">
                          {ops.toLocaleString()} ops
                        </span>
                      </td>

                      {/* Fórmula */}
                      <td className="py-2.5 px-4 text-ink-muted text-[11px]">
                        <code>{algo.formula}</code>
                      </td>

                      {/* Botón Cargar en Visualizador */}
                      <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onSelectAlgorithm(algo.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-ink-primary text-paper-surface hover:bg-ink-primary/90 text-[11px] font-bold transition-all shadow-xs active:scale-95"
                        >
                          <Play className="w-2.5 h-2.5" />
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
  );
};
