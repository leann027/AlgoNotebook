import { bubbleSortModule } from './sorting/bubble-sort';
import { insertionSortModule } from './sorting/insertion-sort';
import { selectionSortModule } from './sorting/selection-sort';
import { quickSortModule } from './sorting/quick-sort';
import { mergeSortModule } from './sorting/merge-sort';
import { bstInsertModule } from './trees/bst';
import { inorderTraversalModule } from './trees/inorder-traversal';
import { dijkstraModule } from './graphs/dijkstra';
import { bfsModule } from './graphs/bfs';
import { dfsModule } from './graphs/dfs';
import { knapsackModule } from './dp/knapsack';
import { lcsModule } from './dp/lcs';
import { kruskalModule } from './graphs/kruskal';
import { reverseLinkedListModule } from './lists/reverse-linked-list';
import { cycleDetectionModule } from './lists/cycle-detection';
import { stackOperationsModule } from './lists/stack-operations';
import { binarySearchModule } from './search/binary-search';
import { minHeapModule } from './trees/min-heap';
import { preorderTraversalModule } from './trees/preorder-traversal';
import { queueOperationsModule } from './lists/queue-operations';
import { coinChangeModule } from './dp/coin-change';
import { insertLinkedListModule } from './lists/insert-linked-list';
import { linearBinarySearchModule } from './search/linear-binary-search';
import { priorityQueueModule } from './trees/priority-queue';
import { kadaneModule } from './dp/kadane';
import { topologicalSortModule } from './graphs/topological-sort';
import { avlTreeModule } from './trees/avl-tree';
import { bellmanFordModule } from './graphs/bellman-ford';
import { levenshteinModule } from './dp/levenshtein';
import { stronglyConnectedComponentsModule } from './graphs/strongly-connected-components';
import type { AlgorithmDefinition } from '../core/types';

export * from './sorting/bubble-sort';
export * from './sorting/insertion-sort';
export * from './sorting/selection-sort';
export * from './sorting/quick-sort';
export * from './sorting/merge-sort';
export * from './trees/bst';
export * from './trees/inorder-traversal';
export * from './trees/preorder-traversal';
export * from './trees/min-heap';
export * from './trees/priority-queue';
export * from './trees/avl-tree';
export * from './graphs/dijkstra';
export * from './graphs/bfs';
export * from './graphs/dfs';
export * from './graphs/kruskal';
export * from './graphs/topological-sort';
export * from './graphs/bellman-ford';
export * from './graphs/strongly-connected-components';
export * from './dp/knapsack';
export * from './dp/lcs';
export * from './dp/coin-change';
export * from './dp/kadane';
export * from './dp/levenshtein';
export * from './lists/reverse-linked-list';
export * from './lists/cycle-detection';
export * from './lists/stack-operations';
export * from './lists/queue-operations';
export * from './lists/insert-linked-list';
export * from './search/binary-search';
export * from './search/linear-binary-search';

/**
 * Registro central de algoritmos disponibles indexados por su identificador único.
 */
export const ALGORITHM_REGISTRY: Record<string, AlgorithmDefinition> = {
  'bubble-sort': bubbleSortModule,
  'insertion-sort': insertionSortModule,
  'insertion_sort': insertionSortModule,
  'selection-sort': selectionSortModule,
  'selection_sort': selectionSortModule,
  'quick-sort': quickSortModule,
  'merge-sort': mergeSortModule,
  'merge_sort': mergeSortModule,
  'bst-insertion': bstInsertModule,
  'bst_insertion': bstInsertModule,
  'inorder-traversal': inorderTraversalModule,
  'inorder': inorderTraversalModule,
  'dijkstra-graph': dijkstraModule,
  'dijkstra': dijkstraModule,
  'bfs-graph': bfsModule,
  'bfs': bfsModule,
  'dfs-graph': dfsModule,
  'dfs': dfsModule,
  'knapsack-dp': knapsackModule,
  'knapsack': knapsackModule,
  '01-knapsack': knapsackModule,
  'lcs-dp': lcsModule,
  'lcs': lcsModule,
  'longest-common-subsequence': lcsModule,
  'kruskal-graph': kruskalModule,
  'kruskal': kruskalModule,
  'kruskal-mst': kruskalModule,
  'reverse-linked-list': reverseLinkedListModule,
  'linked-list': reverseLinkedListModule,
  'reverse-list': reverseLinkedListModule,
  'cycle-detection': cycleDetectionModule,
  'floyd-cycle': cycleDetectionModule,
  'stack-operations': stackOperationsModule,
  'stack': stackOperationsModule,
  'queue-operations': queueOperationsModule,
  'queue': queueOperationsModule,
  'insert-linked-list': insertLinkedListModule,
  'linked-list-insert': insertLinkedListModule,
  'min-heap': minHeapModule,
  'heap': minHeapModule,
  'binary-search': binarySearchModule,
  'binary_search': binarySearchModule,
  'coin-change-dp': coinChangeModule,
  'coin-change': coinChangeModule,
  'preorder-traversal': preorderTraversalModule,
  'preorder': preorderTraversalModule,
  'linear-binary-search': linearBinarySearchModule,
  'search-comparator': linearBinarySearchModule,
  'priority-queue': priorityQueueModule,
  'min-max-heap': priorityQueueModule,
  'kadane': kadaneModule,
  'kadane-dp': kadaneModule,
  'topological-sort': topologicalSortModule,
  'kahn': topologicalSortModule,
  'avl-tree': avlTreeModule,
  'avl': avlTreeModule,
  'bellman-ford': bellmanFordModule,
  'bellman_ford': bellmanFordModule,
  'levenshtein-distance': levenshteinModule,
  'levenshtein': levenshteinModule,
  'levenshtein-dp': levenshteinModule,
  'strongly-connected-components': stronglyConnectedComponentsModule,
  'tarjan-scc': stronglyConnectedComponentsModule,
  'scc': stronglyConnectedComponentsModule,
};

/**
 * Lista de módulos de algoritmos disponibles para poblar menús y catálogos.
 */
export const AVAILABLE_ALGORITHMS: AlgorithmDefinition[] = [
  bubbleSortModule,
  insertionSortModule,
  selectionSortModule,
  quickSortModule,
  mergeSortModule,
  linearBinarySearchModule,
  binarySearchModule,
  bstInsertModule,
  inorderTraversalModule,
  preorderTraversalModule,
  minHeapModule,
  priorityQueueModule,
  avlTreeModule,
  bfsModule,
  dfsModule,
  dijkstraModule,
  kruskalModule,
  topologicalSortModule,
  bellmanFordModule,
  stronglyConnectedComponentsModule,
  knapsackModule,
  lcsModule,
  coinChangeModule,
  kadaneModule,
  levenshteinModule,
  reverseLinkedListModule,
  cycleDetectionModule,
  stackOperationsModule,
  queueOperationsModule,
  insertLinkedListModule,
];

/**
 * Obtiene el módulo de algoritmo por su id, con fallback seguro a Bubble Sort.
 */
export function getAlgorithmById(id: string): AlgorithmDefinition {
  return ALGORITHM_REGISTRY[id] ?? bubbleSortModule;
}
