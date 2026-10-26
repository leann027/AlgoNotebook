import React, { useState, useMemo, useCallback } from 'react';
import {
  GraduationCap,
  Network,
  CheckCircle2,
  ArrowRight,
  Search,
  Layers,
} from 'lucide-react';
import { ALGORITHM_REGISTRY } from '../../algorithms';
import {
  TACTILE_CARD,
  ARCHIVAL_STAMP,
} from '../../design-system/tokens';

export interface CurriculumViewProps {
  onSelectAlgorithm: (id: string) => void;
  selectedAlgorithm: string;
}

import {
  ALGORITHM_LEVELS,
  CURRICULUM_UNITS,
  DSA_PREREQUISITES,
  type AlgorithmLevel,
} from '../../data/curriculumData';

const STORAGE_KEY = 'algonotebook_completed_topics';

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  onSelectAlgorithm,
  selectedAlgorithm,
}) => {
  const [activeTab, setActiveTab] = useState<'units' | 'roadmap'>('units');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<'all' | AlgorithmLevel>('all');

  // Estado de temas completados con persistencia en localStorage
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const toggleComplete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // Ignorar fallos de cuota
      }
      return next;
    });
  }, []);

  const totalAlgorithms = useMemo(
    () => CURRICULUM_UNITS.reduce((sum, u) => sum + u.algorithms.length, 0),
    []
  );

  const completedCount = useMemo(() => {
    let count = 0;
    for (const unit of CURRICULUM_UNITS) {
      for (const algoId of unit.algorithms) {
        if (completedTopics.has(algoId)) count++;
      }
    }
    return count;
  }, [completedTopics]);

  const progressPercentage = Math.round((completedCount / totalAlgorithms) * 100);

  // Filtrado de algoritmos para la vista de unidades
  const filteredUnits = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return CURRICULUM_UNITS.map((unit) => {
      const matchingAlgos = unit.algorithms.filter((algoId) => {
        const algo = ALGORITHM_REGISTRY[algoId];
        if (!algo) return false;

        const level = ALGORITHM_LEVELS[algoId] ?? 'intermediate';
        if (levelFilter !== 'all' && level !== levelFilter) return false;

        if (!q) return true;
        return (
          algo.metadata.name.toLowerCase().includes(q) ||
          algo.metadata.category.toLowerCase().includes(q) ||
          algo.metadata.description.toLowerCase().includes(q) ||
          algo.metadata.timeComplexity.worst.toLowerCase().includes(q)
        );
      });

      return {
        ...unit,
        matchingAlgos,
      };
    }).filter((unit) => unit.matchingAlgos.length > 0);
  }, [searchQuery, levelFilter]);

  // Nodos y coordenadas para el Roadmap SVG
  const roadmapNodes = useMemo(() => {
    const nodes: {
      id: string;
      name: string;
      unitNumber: string;
      x: number;
      y: number;
      level: AlgorithmLevel;
      isCompleted: boolean;
      isSelected: boolean;
    }[] = [];

    CURRICULUM_UNITS.forEach((unit, uIdx) => {
      const y = 80 + uIdx * 110;
      unit.algorithms.forEach((algoId, aIdx) => {
        const algo = ALGORITHM_REGISTRY[algoId];
        nodes.push({
          id: algoId,
          name: algo?.metadata.name ?? algoId,
          unitNumber: unit.number,
          x: 100 + aIdx * 180,
          y,
          level: ALGORITHM_LEVELS[algoId] ?? 'intermediate',
          isCompleted: completedTopics.has(algoId),
          isSelected: algoId === selectedAlgorithm,
        });
      });
    });

    return nodes;
  }, [completedTopics, selectedAlgorithm]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, (typeof roadmapNodes)[0]>();
    for (const node of roadmapNodes) {
      map.set(node.id, node);
    }
    return map;
  }, [roadmapNodes]);

  const levelBadgeClass = (level: AlgorithmLevel) => {
    switch (level) {
      case 'introductory':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const levelLabel = (level: AlgorithmLevel) => {
    switch (level) {
      case 'introductory':
        return 'Introductorio';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Header del Plan de Estudios */}
      <div className={`${TACTILE_CARD} p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-paper-surface`}>
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-surface-container border border-paper-border text-ink-primary shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline font-bold text-xl text-ink-primary">
                Plan de Estudios — Currículum DSA
              </h1>
              <span className={ARCHIVAL_STAMP}>6 Unidades Académicas</span>
            </div>
            <p className="text-xs text-ink-secondary mt-1">
              Ruta estructurada para el dominio sistemático de Algoritmos y Estructuras de Datos.
            </p>
          </div>
        </div>

        {/* Barra de progreso global */}
        <div className="flex flex-col sm:items-end gap-1.5 shrink-0 min-w-[220px]">
          <div className="flex items-center justify-between w-full text-xs font-mono">
            <span className="text-ink-secondary">Progreso de Dominio</span>
            <span className="font-bold text-ink-primary">
              {completedCount} / {totalAlgorithms} ({progressPercentage}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden border border-paper-border">
            <div
              className="h-full bg-emerald-600 transition-[width] duration-300 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controles de Vista, Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Toggle Unidades vs Roadmap */}
        <div className="inline-flex rounded-md border border-paper-border bg-paper-surface p-0.5 shadow-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('units')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === 'units'
                ? 'bg-ink-primary text-paper-surface font-semibold shadow-xs'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Unidades Temáticas</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === 'roadmap'
                ? 'bg-ink-primary text-paper-surface font-semibold shadow-xs'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Mapa de Prerrequisitos (DAG)</span>
          </button>
        </div>

        {/* Filtros para vista de unidades */}
        {activeTab === 'units' && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Buscador */}
            <div className="relative min-w-[180px] sm:min-w-[220px] flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Buscar algoritmo o Big-O..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-paper-surface border border-paper-border rounded-md text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-ink-primary/20"
              />
            </div>

            {/* Selector de Nivel */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as 'all' | AlgorithmLevel)}
              className="text-xs bg-paper-surface border border-paper-border rounded-md px-2.5 py-1.5 text-ink-primary focus:outline-none focus:ring-1 focus:ring-ink-primary/20"
              aria-label="Filtrar por nivel"
            >
              <option value="all">Todos los niveles</option>
              <option value="introductory">Introductorio</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>
        )}
      </div>

      {/* Vista 1: Unidades Temáticas */}
      {activeTab === 'units' && (
        <div className="flex flex-col gap-6">
          {filteredUnits.length === 0 ? (
            <div className={`${TACTILE_CARD} p-8 text-center text-ink-secondary text-xs`}>
              No se encontraron algoritmos coincidentes con los filtros aplicados.
            </div>
          ) : (
            filteredUnits.map((unit) => (
              <section
                key={unit.number}
                className={`${TACTILE_CARD} overflow-hidden border border-paper-border`}
              >
                {/* Cabecera de la Unidad */}
                <div className="px-5 py-3.5 border-b border-paper-border bg-surface-container-low/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-ink-primary px-2 py-0.5 rounded bg-surface-container border border-paper-border">
                      {unit.number}
                    </span>
                    <h2 className="font-headline font-bold text-sm text-ink-primary">
                      {unit.title}
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-ink-secondary">
                    {unit.matchingAlgos.length}{' '}
                    {unit.matchingAlgos.length === 1 ? 'módulo' : 'módulos'}
                  </span>
                </div>

                <div className="px-5 py-2.5 bg-paper-surface/40 border-b border-paper-border/50 text-xs text-ink-secondary">
                  {unit.description}
                </div>

                {/* Lista de Algoritmos en la Unidad */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-paper-base/30">
                  {unit.matchingAlgos.map((algoId) => {
                    const algo = ALGORITHM_REGISTRY[algoId];
                    if (!algo) return null;

                    const isCompleted = completedTopics.has(algoId);
                    const isSelected = algoId === selectedAlgorithm;
                    const level = ALGORITHM_LEVELS[algoId] ?? 'intermediate';

                    return (
                      <div
                        key={algoId}
                        onClick={() => onSelectAlgorithm(algoId)}
                        className={`group relative p-3.5 rounded-lg border transition-all cursor-pointer bg-paper-surface flex flex-col justify-between ${
                          isSelected
                            ? 'border-ink-primary ring-1 ring-ink-primary shadow-sm bg-surface-container-low/40'
                            : 'border-paper-border hover:border-ink-primary/40 hover:shadow-xs'
                        }`}
                      >
                        <div>
                          {/* Fila superior: Nivel + Checkbox */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${levelBadgeClass(
                                level
                              )}`}
                            >
                              {levelLabel(level)}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => toggleComplete(algoId, e)}
                              className={`p-1 rounded transition-colors ${
                                isCompleted
                                  ? 'text-emerald-600 hover:text-emerald-700'
                                  : 'text-ink-muted hover:text-ink-secondary'
                              }`}
                              title={
                                isCompleted
                                  ? 'Marcado como dominado (clic para desmarcar)'
                                  : 'Marcar como dominado'
                              }
                            >
                              <CheckCircle2
                                className={`w-4 h-4 ${
                                  isCompleted ? 'fill-emerald-100' : ''
                                }`}
                              />
                            </button>
                          </div>

                          {/* Nombre del Algoritmo */}
                          <h3 className="font-headline font-bold text-sm text-ink-primary group-hover:text-ink-primary flex items-center gap-1.5">
                            <span>{algo.metadata.name}</span>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                            )}
                          </h3>

                          {/* Descripción corta */}
                          <p className="text-[11px] text-ink-secondary mt-1 line-clamp-2">
                            {algo.metadata.description}
                          </p>
                        </div>

                        {/* Fila inferior: Complejidad Big-O y botón acción */}
                        <div className="mt-3 pt-2.5 border-t border-paper-border/70 flex items-center justify-between text-[11px] font-mono text-ink-secondary">
                          <div className="flex items-center gap-1.5">
                            <span className="text-ink-muted">Peor:</span>
                            <span className="font-bold text-ink-primary">
                              {algo.metadata.timeComplexity.worst}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-ink-primary group-hover:translate-x-0.5 transition-transform">
                            <span className="text-[10px] font-sans font-medium">Abrir</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {/* Vista 2: Mapa de Prerrequisitos (DAG Roadmap) */}
      {activeTab === 'roadmap' && (
        <div className={`${TACTILE_CARD} p-5 overflow-hidden flex flex-col bg-paper-surface`}>
          <div className="flex items-center justify-between pb-3 border-b border-paper-border mb-4">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-ink-primary" />
              <h2 className="font-headline font-bold text-sm text-ink-primary">
                Grafo de Prerrequisitos y Progresión Pedagógica
              </h2>
            </div>
            <span className="text-[11px] font-mono text-ink-secondary">
              Haz clic en cualquier nodo para cargarlo en el visualizador interactivo
            </span>
          </div>

          <div className="overflow-x-auto pb-4">
            <svg
              className="w-full min-w-[1300px] h-[720px] select-none"
              viewBox="0 0 1350 720"
            >
              <defs>
                <marker
                  id="arrow-marker"
                  viewBox="0 0 10 10"
                  refX="14"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#5A6474" />
                </marker>
              </defs>

              {/* Conexiones de Prerrequisitos */}
              {DSA_PREREQUISITES.map((prereq, pIdx) => {
                const fromNode = nodeMap.get(prereq.from);
                const toNode = nodeMap.get(prereq.to);
                if (!fromNode || !toNode) return null;

                const midX = (fromNode.x + toNode.x) / 2;
                const pathD = `M ${fromNode.x} ${fromNode.y} C ${midX} ${fromNode.y}, ${midX} ${toNode.y}, ${toNode.x} ${toNode.y}`;

                return (
                  <g key={`edge-${pIdx}`} className="transition-opacity">
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                      markerEnd="url(#arrow-marker)"
                    />
                  </g>
                );
              })}

              {/* Nodos del Grafo */}
              {roadmapNodes.map((node) => {
                const width = 150;
                const height = 48;
                const rx = node.x - width / 2;
                const ry = node.y - height / 2;

                return (
                  <g
                    key={node.id}
                    onClick={() => onSelectAlgorithm(node.id)}
                    className="cursor-pointer group"
                  >
                    {/* Tarjeta del Nodo */}
                    <rect
                      x={rx}
                      y={ry}
                      width={width}
                      height={height}
                      rx="6"
                      className={`transition-all ${
                        node.isSelected
                          ? 'fill-paper-surface stroke-ink-primary stroke-2 filter drop-shadow-sm'
                          : node.isCompleted
                          ? 'fill-emerald-50/50 dark:fill-emerald-950/40 stroke-emerald-300 dark:stroke-emerald-700 stroke-1 hover:stroke-ink-primary'
                          : 'fill-paper-surface stroke-paper-border stroke-1 hover:stroke-ink-primary hover:drop-shadow-xs'
                      }`}
                    />

                    {/* Badge de Unidad */}
                    <text
                      x={rx + 8}
                      y={ry + 15}
                      className="font-mono text-[9px] fill-ink-muted font-bold tracking-wider"
                    >
                      {node.unitNumber}
                    </text>

                    {/* Indicador de completado */}
                    {node.isCompleted && (
                      <circle
                        cx={rx + width - 12}
                        cy={ry + 12}
                        r="4"
                        className="fill-emerald-500"
                      />
                    )}

                    {/* Título del Algoritmo */}
                    <text
                      x={rx + 8}
                      y={ry + 32}
                      className="font-headline font-bold text-[11px] fill-ink-primary group-hover:fill-ink-primary"
                    >
                      {node.name.length > 18 ? `${node.name.slice(0, 16)}...` : node.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumView;
