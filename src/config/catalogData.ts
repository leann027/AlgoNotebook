import { BookOpen } from 'lucide-react';
import type { CatalogGroup, NavTabItem } from '../components';
import type { TraceFrame } from '../core';

/**
 * Arreglos numéricos iniciales por defecto según categoría
 */
export const DEFAULT_SORTING_ARRAY: number[] = [12, 25, 42, 18, 56, 34, 68, 88];
export const DEFAULT_BST_KEYS: number[] = [15, 8, 23, 4, 11, 19, 30];
export const DEFAULT_LINKED_LIST: number[] = [12, 25, 42, 68, 88];
export const DEFAULT_CYCLE_ARRAY: number[] = [10, 25, 38, 47, 62, 75];
export const DEFAULT_QUEUE_ARRAY: number[] = [10, 25, 42, 68];
export const DEFAULT_KADANE_ARRAY: number[] = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
export const DEFAULT_PQ_KEYS: number[] = [38, 20, 15, 42, 10, 8, 25];
export const DEFAULT_AVL_KEYS: number[] = [30, 20, 10, 25, 40, 50, 22];
export const DEFAULT_COINS_ARRAY: number[] = [1, 2, 5, 10];

export function getDefaultInput(category: string, id: string): number[] {
  if (id === 'kadane' || id === 'kadane-dp') return [...DEFAULT_KADANE_ARRAY];
  if (id === 'priority-queue' || id === 'min-max-heap') return [...DEFAULT_PQ_KEYS];
  if (id === 'avl-tree' || id === 'avl') return [...DEFAULT_AVL_KEYS];
  if (category === 'trees') return [...DEFAULT_BST_KEYS];
  if (id === 'cycle-detection') return [...DEFAULT_CYCLE_ARRAY];
  if (id === 'queue-operations') return [...DEFAULT_QUEUE_ARRAY];
  if (id === 'coin-change-dp') return [...DEFAULT_COINS_ARRAY];
  if (category === 'pointers') return [...DEFAULT_LINKED_LIST];
  return [...DEFAULT_SORTING_ARRAY];
}

export type NavTab = 'visualizer' | 'curriculum' | 'notebooks' | 'complexity-lab';

export const CATALOG_GROUPS: CatalogGroup[] = [
  {
    category: 'Ordenamiento',
    items: [
      { id: 'bubble-sort', name: 'Bubble Sort', subtitle: 'O(N²)' },
      { id: 'insertion-sort', name: 'Insertion Sort', subtitle: 'O(N²)' },
      { id: 'selection-sort', name: 'Selection Sort', subtitle: 'O(N²)' },
      { id: 'quick-sort', name: 'QuickSort (Lomuto)', subtitle: 'O(N log N)' },
      { id: 'merge-sort', name: 'Merge Sort', subtitle: 'O(N log N)' },
    ],
  },
  {
    category: 'Búsqueda Logarítmica',
    items: [
      { id: 'linear-binary-search', name: 'Búsqueda Lineal vs Binaria', subtitle: 'O(N) vs O(log N)' },
      { id: 'binary-search', name: 'Búsqueda Binaria', subtitle: 'O(log N)' },
    ],
  },
  {
    category: 'Árboles y Montículos',
    items: [
      { id: 'bst-insertion', name: 'BST: Inserción Jerárquica', subtitle: 'O(H)' },
      { id: 'inorder-traversal', name: 'Recorrido Inorder (Árbol)', subtitle: 'O(N)' },
      { id: 'preorder-traversal', name: 'Recorrido Preorder (Árbol)', subtitle: 'O(N)' },
      { id: 'min-heap', name: 'Min-Heap (Montículo)', subtitle: 'O(log N)' },
      { id: 'priority-queue', name: 'Cola de Prioridad (Min-Heap)', subtitle: 'O(log N)' },
      { id: 'avl-tree', name: 'Árbol AVL (Rotaciones)', subtitle: 'O(log N)' },
    ],
  },
  {
    category: 'Grafos y Rutas',
    items: [
      { id: 'bfs-graph', name: 'BFS: Recorrido en Anchura', subtitle: 'O(V + E)' },
      { id: 'dfs-graph', name: 'DFS: Recorrido en Profundidad', subtitle: 'O(V + E)' },
      { id: 'dijkstra-graph', name: 'Dijkstra: Camino Mínimo', subtitle: 'O((V+E) log V)' },
      { id: 'kruskal-graph', name: 'Kruskal: Árbol Mínimo (MST)', subtitle: 'O(E log E)' },
      { id: 'topological-sort', name: 'Ordenamiento Topológico (Kahn)', subtitle: 'O(V + E)' },
      { id: 'bellman-ford', name: 'Bellman-Ford: Rutas Negativas', subtitle: 'O(V · E)' },
      { id: 'strongly-connected-components', name: 'Componentes Fuertemente Conexas', subtitle: 'O(V + E)' },
    ],
  },
  {
    category: 'Programación Dinámica',
    items: [
      { id: 'kadane', name: 'Algoritmo de Kadane (Subsuma)', subtitle: 'O(N)' },
      { id: 'knapsack-dp', name: 'Mochila 0/1 (Knapsack DP)', subtitle: 'O(N · W)' },
      { id: 'lcs-dp', name: 'LCS: Subsecuencia Común (2D DP)', subtitle: 'O(M · N)' },
      { id: 'levenshtein-distance', name: 'Distancia de Levenshtein (2D DP)', subtitle: 'O(M · N)' },
      { id: 'coin-change-dp', name: 'Cambio de Monedas (DP)', subtitle: 'O(A · C)' },
    ],
  },
  {
    category: 'Punteros y Memoria',
    items: [
      { id: 'reverse-linked-list', name: 'Lista Enlazada: Invertir', subtitle: 'O(N)' },
      { id: 'cycle-detection', name: 'Detección de Ciclos (Floyd)', subtitle: 'O(N)' },
      { id: 'stack-operations', name: 'Pila LIFO: Operaciones y Memoria', subtitle: 'O(1)' },
      { id: 'queue-operations', name: 'Cola FIFO: Operaciones y Memoria', subtitle: 'O(1)' },
      { id: 'insert-linked-list', name: 'Lista Enlazada: Insertar al Final', subtitle: 'O(N)' },
    ],
  },
];

export const NAV_TABS: NavTabItem[] = [
  { id: 'visualizer', label: 'Visualizador' },
  { id: 'curriculum', label: 'Currículum DSA' },
  { id: 'notebooks', label: 'Cuadernos' },
  { id: 'complexity-lab', label: 'Lab Complejidad' },
];

export const HEADER_BRAND = {
  name: 'AlgoNotebook',
  icon: BookOpen,
  archivalStamp: 'Laboratorio de Algoritmos DSA',
};

export const FALLBACK_TRACE_FRAME: TraceFrame = {
  stepIndex: 1,
  totalSteps: 1,
  highlightLines: { python: [], c: [] },
  arrayState: [],
  elementStates: {},
  pointers: {},
  activeAction: 'idle',
  explanation: {
    stepLabel: 'Step 1 of 1:',
    text: 'Arreglo vacío o no inicializado.',
  },
  metrics: {
    comparisons: 0,
    swaps: 0,
    passNumber: 0,
    totalPasses: 0,
    maxComparisons: 0,
  },
};
