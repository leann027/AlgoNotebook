export type AlgorithmLevel = 'introductory' | 'intermediate' | 'advanced';

export interface CurriculumLevelInfo {
  level: AlgorithmLevel;
  dotColor: string;
  badge: string;
}

export const LEVEL_DOT_CLASSES: Record<AlgorithmLevel, string> = {
  introductory: 'bg-emerald-500',
  intermediate: 'bg-amber-500',
  advanced: 'bg-indigo-500',
};

export const LEVEL_LABELS: Record<AlgorithmLevel, string> = {
  introductory: 'Introductorio',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export const ALGORITHM_LEVELS: Record<string, AlgorithmLevel> = {
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

export const ALGORITHM_LEVEL_DETAILS: Record<string, CurriculumLevelInfo> = Object.fromEntries(
  Object.entries(ALGORITHM_LEVELS).map(([id, lvl]) => [
    id,
    {
      level: lvl,
      dotColor: LEVEL_DOT_CLASSES[lvl],
      badge: LEVEL_LABELS[lvl],
    },
  ])
);

export interface CurriculumUnit {
  number: string;
  title: string;
  description: string;
  algorithms: string[];
}

export const CURRICULUM_UNITS: CurriculumUnit[] = [
  {
    number: 'UNIDAD 1',
    title: 'Fundamentos de Ordenamiento e Invariantes',
    description:
      'Análisis de estabilidad, intercambio adyacente, inserción incremental, selección greedy y partición recursiva mediante divide y vencerás.',
    algorithms: ['bubble-sort', 'insertion-sort', 'selection-sort', 'quick-sort', 'merge-sort'],
  },
  {
    number: 'UNIDAD 2',
    title: 'Búsqueda y Reducción Logarítmica',
    description:
      'Sondeo binario sobre secuencias ordenadas y descarte sistemático de mitades del espacio de búsqueda.',
    algorithms: ['linear-binary-search', 'binary-search'],
  },
  {
    number: 'UNIDAD 3',
    title: 'Estructuras Jerárquicas, Árboles y Montículos',
    description:
      'Preservación del invariante de árbol binario de búsqueda, balanceo AVL, inspección simétrica inorden y colas de prioridad con min-heap.',
    algorithms: ['bst-insertion', 'inorder-traversal', 'preorder-traversal', 'min-heap', 'priority-queue', 'avl-tree'],
  },
  {
    number: 'UNIDAD 4',
    title: 'Grafos: Exploración, Rutas y Optimización',
    description:
      'Recorridos sistemáticos por niveles (BFS), profundidad con backtracking (DFS), orden topológico (Kahn), relajación greedy (Dijkstra), rutas con aristas negativas (Bellman-Ford), componentes fuertemente conexas (Tarjan) y árbol de expansión mínima (Kruskal).',
    algorithms: ['bfs-graph', 'dfs-graph', 'dijkstra-graph', 'kruskal-graph', 'topological-sort', 'bellman-ford', 'strongly-connected-components'],
  },
  {
    number: 'UNIDAD 5',
    title: 'Memorización y Programación Dinámica',
    description:
      'Construcción tabular ascendente, subproblemas solapados, subsuma máxima (Kadane), ecuación de Bellman para la Mochila 0/1, subsecuencia común (LCS), distancia de edición (Levenshtein) y cambio mínimo de monedas.',
    algorithms: ['kadane', 'knapsack-dp', 'lcs-dp', 'levenshtein-distance', 'coin-change-dp'],
  },
  {
    number: 'UNIDAD 6',
    title: 'Topología de Punteros y Memoria Lineal',
    description:
      'Manipulación física in-place de referencias de memoria, técnica de punteros rápidos/lentos (Tortoise & Hare), buffer LIFO (Stack) y buffer FIFO (Queue).',
    algorithms: [
      'reverse-linked-list',
      'cycle-detection',
      'stack-operations',
      'queue-operations',
      'insert-linked-list',
    ],
  },
];

export interface DsaPrerequisite {
  from: string;
  to: string;
  label: string;
}

export const DSA_PREREQUISITES: DsaPrerequisite[] = [
  { from: 'bubble-sort', to: 'selection-sort', label: 'Invariante de sufijo' },
  { from: 'insertion-sort', to: 'merge-sort', label: 'Divide y vencerás' },
  { from: 'selection-sort', to: 'quick-sort', label: 'Partición de pivote' },
  { from: 'linear-binary-search', to: 'binary-search', label: 'Bisección' },
  { from: 'bst-insertion', to: 'inorder-traversal', label: 'Inorden ascendente' },
  { from: 'bst-insertion', to: 'avl-tree', label: 'Balanceo estricto' },
  { from: 'min-heap', to: 'priority-queue', label: 'Cola abstracta' },
  { from: 'bfs-graph', to: 'dijkstra-graph', label: 'Relajación ponderada' },
  { from: 'dijkstra-graph', to: 'bellman-ford', label: 'Pesos negativos' },
  { from: 'dfs-graph', to: 'topological-sort', label: 'Kahn in-degree' },
  { from: 'dfs-graph', to: 'strongly-connected-components', label: 'Tarjan low-link' },
  { from: 'bfs-graph', to: 'kruskal-graph', label: 'Conectividad / DSU' },
  { from: 'kadane', to: 'knapsack-dp', label: 'Subestructura óptima' },
  { from: 'knapsack-dp', to: 'lcs-dp', label: 'Matriz 2D DP' },
  { from: 'lcs-dp', to: 'levenshtein-distance', label: 'Transiciones de edición' },
  { from: 'knapsack-dp', to: 'coin-change-dp', label: 'Espacio de estados' },
  { from: 'reverse-linked-list', to: 'cycle-detection', label: 'Tortoise & Hare' },
  { from: 'stack-operations', to: 'queue-operations', label: 'Buffer FIFO/LIFO' },
  { from: 'insert-linked-list', to: 'reverse-linked-list', label: 'Nodos en memoria' },
];
