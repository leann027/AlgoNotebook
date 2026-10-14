import React, { useId } from 'react';
import { X, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ALGORITHM_REGISTRY } from '../../algorithms';

export interface CurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAlgorithm: (id: string) => void;
  selectedAlgorithm: string;
}

interface CurriculumUnit {
  number: string;
  title: string;
  description: string;
  algorithms: string[];
}

const CURRICULUM_UNITS: CurriculumUnit[] = [
  {
    number: 'UNIDAD 1',
    title: 'Fundamentos de Ordenamiento e Invariantes',
    description: 'Análisis de estabilidad, intercambio adyacente y partición recursiva mediante divide y vencerás.',
    algorithms: ['bubble-sort', 'quick-sort', 'merge-sort'],
  },
  {
    number: 'UNIDAD 2',
    title: 'Búsqueda y Reducción Logarítmica',
    description: 'Sondeo binario sobre secuencias ordenadas y descarte sistemático de mitades del espacio de búsqueda.',
    algorithms: ['binary-search'],
  },
  {
    number: 'UNIDAD 3',
    title: 'Estructuras Jerárquicas, Árboles y Montículos',
    description: 'Preservación del invariante de árbol binario de búsqueda, inspección simétrica inorden y colas de prioridad con min-heap.',
    algorithms: ['bst-insertion', 'inorder-traversal', 'preorder-traversal', 'min-heap'],
  },
  {
    number: 'UNIDAD 4',
    title: 'Grafos: Exploración, Rutas y Optimización',
    description: 'Recorridos sistemáticos por niveles (BFS), profundidad con backtracking (DFS), relajación greedy (Dijkstra) y árbol de expansión mínima (Kruskal).',
    algorithms: ['bfs-graph', 'dfs-graph', 'dijkstra-graph', 'kruskal-graph'],
  },
  {
    number: 'UNIDAD 5',
    title: 'Memorización y Programación Dinámica',
    description: 'Construcción tabular ascendente, subproblemas solapados, ecuación de Bellman para la Mochila 0/1, subsecuencia común (LCS) y cambio mínimo de monedas.',
    algorithms: ['knapsack-dp', 'lcs-dp', 'coin-change-dp'],
  },
  {
    number: 'UNIDAD 6',
    title: 'Topología de Punteros y Memoria Lineal',
    description: 'Manipulación física in-place de referencias de memoria, técnica de punteros rápidos/lentos (Tortoise & Hare), buffer LIFO (Stack) y buffer FIFO (Queue).',
    algorithms: ['reverse-linked-list', 'cycle-detection', 'stack-operations', 'queue-operations'],
  },
];

export const CurriculumModal: React.FC<CurriculumModalProps> = ({
  isOpen,
  onClose,
  onSelectAlgorithm,
  selectedAlgorithm,
}) => {
  const titleId = useId();

  if (!isOpen) return null;

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
        {/* Cabecera del Curriculum */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-paper-border bg-paper-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-surface-container border border-paper-border text-ink-primary">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 id={titleId} className="font-headline font-bold text-sm tracking-tight text-ink-primary">
                Plan de Estudios — Currículum DSA
              </h3>
              <p className="font-mono text-[11px] text-ink-secondary">
                Ruta formativa estructurada de Estructuras de Datos y Algoritmos de Ingeniería
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-ink-secondary hover:text-ink-primary hover:bg-surface-container transition-colors"
            title="Cerrar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Unidades Formativas con Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CURRICULUM_UNITS.map((unit) => (
              <div
                key={unit.number}
                className="bg-surface-container-low border border-paper-border rounded-lg p-4 flex flex-col justify-between hover:border-ink-secondary/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      {unit.number}
                    </span>
                    <span className="font-mono text-[10px] text-ink-secondary">
                      {unit.algorithms.length} {unit.algorithms.length === 1 ? 'módulo' : 'módulos'}
                    </span>
                  </div>

                  <h4 className="font-headline font-bold text-xs text-ink-primary mb-1">
                    {unit.title}
                  </h4>
                  <p className="text-xs text-ink-secondary leading-relaxed mb-3">
                    {unit.description}
                  </p>
                </div>

                {/* Lista de Algoritmos en la Unidad */}
                <div className="space-y-1.5 pt-2 border-t border-paper-border/60">
                  {unit.algorithms.map((algoId) => {
                    const algo = ALGORITHM_REGISTRY[algoId];
                    if (!algo) return null;
                    const isCurrent = algoId === selectedAlgorithm;

                    return (
                      <button
                        key={algoId}
                        type="button"
                        onClick={() => {
                          onSelectAlgorithm(algoId);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all ${
                          isCurrent
                            ? 'bg-paper-surface border-2 border-ink-primary shadow-xs font-bold text-ink-primary'
                            : 'bg-paper-surface/80 border border-paper-border hover:bg-paper-surface text-ink-primary'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {isCurrent ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-ink-muted shrink-0" />
                          )}
                          <span className="truncate">{algo.metadata.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-ink-secondary">
                            {algo.metadata.timeComplexity.worst}
                          </span>
                          <ArrowRight className="w-3 h-3 text-ink-muted group-hover:text-ink-primary" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="px-5 py-3 border-t border-paper-border bg-surface-container-low flex justify-between items-center text-xs font-mono text-ink-secondary">
          <span>💡 Selecciona cualquier módulo formativo para iniciar la simulación interactiva.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-paper-border bg-paper-surface text-ink-primary font-bold hover:bg-surface-container transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

