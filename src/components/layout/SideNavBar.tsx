import React, { useState } from 'react';
import {
  FlaskConical,
  BarChart2,
  Search,
  Network,
  GitBranch,
  Grid,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { ALGORITHM_REGISTRY } from '../../algorithms';

type AlgorithmLevel = 'introductory' | 'intermediate' | 'advanced';

const ALGORITHM_LEVELS: Record<string, AlgorithmLevel> = {
  'bubble-sort': 'introductory',
  'insertion-sort': 'introductory',
  'selection-sort': 'introductory',
  'binary-search': 'introductory',
  'linear-binary-search': 'introductory',
  'priority-queue': 'introductory',

  'quick-sort': 'intermediate',
  'merge-sort': 'intermediate',
  'bst-insertion': 'intermediate',
  'inorder-traversal': 'intermediate',
  'preorder-traversal': 'intermediate',
  'stack-operations': 'intermediate',
  'queue-operations': 'intermediate',
  'reverse-linked-list': 'intermediate',
  'insert-linked-list': 'intermediate',
  'kadane': 'intermediate',
  'topological-sort': 'intermediate',
  'avl-tree': 'intermediate',

  'min-heap': 'advanced',
  'bfs-graph': 'advanced',
  'dfs-graph': 'advanced',
  'dijkstra-graph': 'advanced',
  'kruskal-graph': 'advanced',
  'knapsack-dp': 'advanced',
  'lcs-dp': 'advanced',
  'coin-change-dp': 'advanced',
  'cycle-detection': 'advanced',
  'bellman-ford': 'advanced',
  'levenshtein-distance': 'advanced',
  'strongly-connected-components': 'advanced',
};

const LEVEL_DOT_CLASSES: Record<AlgorithmLevel, string> = {
  introductory: 'bg-emerald-500',
  intermediate: 'bg-amber-500',
  advanced: 'bg-indigo-500',
};

const LEVEL_LABELS: Record<AlgorithmLevel, string> = {
  introductory: 'Introductorio',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export interface SideNavCategoryGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  algorithms: Array<{
    id: string;
    name: string;
  }>;
}

export interface SideNavBarProps {
  selectedAlgorithm: string;
  onSelectAlgorithm: (id: string) => void;
}

const SIDEBAR_CATEGORIES: SideNavCategoryGroup[] = [
  {
    id: 'sorting',
    label: 'Ordenamiento',
    icon: BarChart2,
    algorithms: [
      { id: 'bubble-sort', name: 'Bubble Sort' },
      { id: 'insertion-sort', name: 'Insertion Sort' },
      { id: 'selection-sort', name: 'Selection Sort' },
      { id: 'quick-sort', name: 'QuickSort (Lomuto)' },
      { id: 'merge-sort', name: 'Merge Sort' },
    ],
  },
  {
    id: 'search',
    label: 'Búsqueda',
    icon: Search,
    algorithms: [
      { id: 'linear-binary-search', name: 'Búsqueda Lineal vs Binaria' },
      { id: 'binary-search', name: 'Búsqueda Binaria' },
    ],
  },
  {
    id: 'trees',
    label: 'Árboles y Montículos',
    icon: Network,
    algorithms: [
      { id: 'bst-insertion', name: 'BST: Inserción' },
      { id: 'inorder-traversal', name: 'Recorrido Inorder' },
      { id: 'preorder-traversal', name: 'Recorrido Preorder' },
      { id: 'min-heap', name: 'Min-Heap (Montículo)' },
      { id: 'priority-queue', name: 'Cola de Prioridad' },
      { id: 'avl-tree', name: 'Árbol AVL (Rotaciones)' },
    ],
  },
  {
    id: 'graphs',
    label: 'Grafos y Rutas',
    icon: GitBranch,
    algorithms: [
      { id: 'bfs-graph', name: 'BFS (Anchura)' },
      { id: 'dfs-graph', name: 'DFS (Profundidad)' },
      { id: 'dijkstra-graph', name: 'Dijkstra (Mínimo)' },
      { id: 'kruskal-graph', name: 'Kruskal (Árbol Mínimo)' },
      { id: 'topological-sort', name: 'Ordenamiento Topológico' },
      { id: 'bellman-ford', name: 'Bellman-Ford' },
      { id: 'strongly-connected-components', name: 'Tarjan SCC' },
    ],
  },
  {
    id: 'dp',
    label: 'Prog. Dinámica',
    icon: Grid,
    algorithms: [
      { id: 'kadane', name: 'Algoritmo de Kadane' },
      { id: 'knapsack-dp', name: 'Mochila 0/1' },
      { id: 'lcs-dp', name: 'LCS (Subsecuencia)' },
      { id: 'levenshtein-distance', name: 'Distancia de Levenshtein' },
      { id: 'coin-change-dp', name: 'Cambio de Monedas' },
    ],
  },
  {
    id: 'pointers',
    label: 'Punteros y Memoria',
    icon: Sliders,
    algorithms: [
      { id: 'reverse-linked-list', name: 'Invertir Lista' },
      { id: 'cycle-detection', name: 'Detección Ciclos' },
      { id: 'stack-operations', name: 'Pila LIFO (Stack)' },
      { id: 'queue-operations', name: 'Cola FIFO (Queue)' },
      { id: 'insert-linked-list', name: 'Lista Enlazada: Insertar al Final' },
    ],
  },
];

export const SideNavBar: React.FC<SideNavBarProps> = ({
  selectedAlgorithm,
  onSelectAlgorithm,
}) => {
  // Estado para controlar qué categorías están expandidas
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  return (
    <aside className="hidden xl:flex flex-col justify-between w-64 bg-paper-base border-r border-paper-border p-3 select-none shrink-0 overflow-y-auto">
      <div className="space-y-4">
        {/* Cabecera del Sidebar */}
        <div className="px-2 pt-1 border-b border-paper-border pb-3">
          <div className="flex items-center gap-2 text-ink-primary">
            <FlaskConical className="w-5 h-5 text-ink-primary" />
            <span className="font-mono text-xs uppercase tracking-wider font-bold">
              ARCHIVO DS&amp;A
            </span>
          </div>
          <p className="text-[11px] text-ink-secondary ml-7">
            Estructuras de Datos y Algoritmos
          </p>
        </div>

        {/* Grupos de Categorías y Algoritmos Organizados */}
        <nav className="space-y-3">
          {SIDEBAR_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isCollapsed = collapsedCategories[cat.id];
            const hasActiveAlgo = cat.algorithms.some((a) => a.id === selectedAlgorithm);

            return (
              <div key={cat.id} className="space-y-1">
                {/* Título de Categoría Clickeable */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                    hasActiveAlgo
                      ? 'text-ink-primary font-bold bg-surface-container-low'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-ink-primary shrink-0" />
                    <span className="font-mono text-[11px] uppercase tracking-wide">
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[9px] text-ink-muted">
                      ({cat.algorithms.length})
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 text-ink-muted transition-transform duration-150 ${
                        isCollapsed ? '-rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Lista de Algoritmos en esta categoría */}
                {!isCollapsed && (
                  <div className="pl-5 space-y-0.5 border-l-2 border-paper-border/80 ml-3.5 animate-fade-in">
                    {cat.algorithms.map((algo) => {
                      const isActive = selectedAlgorithm === algo.id;
                      const level = ALGORITHM_LEVELS[algo.id] ?? 'intermediate';
                      const dotColor = LEVEL_DOT_CLASSES[level];
                      const algoDef = ALGORITHM_REGISTRY[algo.id];
                      const worstComplexity = algoDef?.metadata.timeComplexity.worst ?? 'O(1)';

                      return (
                        <button
                          key={algo.id}
                          type="button"
                          onClick={() => onSelectAlgorithm(algo.id)}
                          className={`w-full px-2.5 py-1.5 rounded text-xs text-left transition-all flex items-center justify-between gap-1.5 ${
                            isActive
                              ? 'bg-paper-surface border border-paper-border font-bold text-ink-primary shadow-xs'
                              : 'border border-transparent text-ink-secondary hover:text-ink-primary hover:bg-paper-surface/60 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`}
                              title={`Nivel: ${LEVEL_LABELS[level]}`}
                            />
                            <span className="truncate">{algo.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-1">
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-container text-ink-secondary border border-paper-border">
                              {worstComplexity}
                            </span>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-ink-primary shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Pie Institucional del Sidebar */}
      <div className="border-t border-paper-border pt-3 px-2 space-y-1 text-xs select-none mt-auto">
        <div className="flex items-center justify-between text-ink-secondary">
          <span className="font-mono text-[11px] font-semibold">AlgoNotebook</span>
          <span className="px-1.5 py-0.5 rounded bg-highlighter-success/40 text-ink-primary font-mono text-[9px] font-bold border border-ink-primary/20">
            v1.0 Listo
          </span>
        </div>
        <p className="text-[10px] text-ink-muted leading-tight">
          Laboratorio Paso a Paso C99 y Python 3
        </p>
      </div>
    </aside>
  );
};
