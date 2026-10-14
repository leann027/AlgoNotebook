/**
 * AlgoNotebook — Kruskal's Minimum Spanning Tree (MST) Algorithm Module
 *
 * Exporta el contrato unificado AlgorithmDefinition (AlgorithmModule),
 * metadatos pedagógicos, código fuente en C99 / Python 3, ficha técnica
 * y generador puro de trazas para el Árbol de Expansión Mínima de Kruskal.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateKruskalTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateKruskalTrace };

export const KRUSKAL_METADATA: AlgorithmMetadata = {
  id: 'kruskal-graph',
  name: 'Kruskal (Árbol Mínimo)',
  category: 'graphs',
  figureId: 'FIG 5.3: KRUSKAL MINIMUM SPANNING TREE (DSU)',
  viewportType: 'graph',
  timeComplexity: {
    best: 'O(E log E)',
    average: 'O(E log E)',
    worst: 'O(E log E)',
  },
  spaceComplexity: 'O(V) Disjoint Sets (DSU)',
  description:
    'Greedy algorithm for finding a Minimum Spanning Tree (MST) in a weighted undirected graph using Union-Find (DSU).',
};

export const KRUSKAL_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const KRUSKAL_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Construir un árbol de expansión que conecte todos los vértices del grafo ponderado minimizando la suma total de los pesos de las aristas seleccionadas, sin generar ciclos.',
  mechanism: [
    'Ordenamiento Inicial de Aristas: Se ordenan todas las E aristas del grafo en orden no decreciente de peso en tiempo O(E log E).',
    'Estructura de Conjuntos Disjuntos (DSU): Cada vértice comienza en su propio conjunto unitario independiente mediante inicialización de arrays parent y rank.',
    'Selección Voraz (Greedy): Se examinan las aristas una a una en orden ascendente de peso.',
    'Detección de Ciclos con Find: Se consulta la raíz representativa de los extremos u y v de la arista mediante find con compresión de caminos.',
    'Unión y Aceptación en MST: Si find(u) != find(v), la arista no forma ciclo; se incluye en el MST con estado traversed y se unen sus componentes con unionSets por rango. Si find(u) == find(v), la arista se descarta.',
    'Criterio de Parada: El algoritmo finaliza al seleccionar exactamente V - 1 aristas, momento en el que el árbol generador abarca todos los vértices.',
  ],
  loopInvariant:
    'En cada iteración, el conjunto de aristas aceptadas forma un bosque acíclico que es subconjunto estricto de algún Árbol de Expansión Mínima (MST) del grafo original.',
  properties: {
    paradigm: 'Algoritmo Voraz (Greedy)',
    isInPlace: false,
    isStable: false,
  },
  complexity: {
    best: 'O(E log E)',
    average: 'O(E log E)',
    worst: 'O(E log E)',
    auxiliarySpace: 'O(V) para almacenar los arrays parent y rank de la estructura DSU',
  },
  analogy:
    'Como tender una red interurbana de fibra óptica entre 6 ciudades con el menor presupuesto: ordenas las opciones de conexión desde la más barata a la más cara e instalas cada tramo, a menos que ambas ciudades ya tengan conectividad indirecta a través de la red ya construida.',
  inPlainWords:
    'Ordena todas las conexiones de menor a mayor costo. Luego toma las más económicas una por una y las une a la red siempre y cuando no cierren un circuito cerrado (ciclo innecesario). Se detiene tan pronto como todos los nodos quedan interconectados con exactamente V - 1 enlaces.',
  complexityExplanation:
    'Ordenar las E aristas requiere O(E log E) = O(E log V) comparaciones. Las operaciones find y union sobre DSU con compresión de camino y unión por rango toman O(α(V)) casi lineal (función inversa de Ackermann). Por tanto, la complejidad global está dominada por el paso de ordenamiento O(E log E).',
  edgeCases: [
    'Grafo no conexo: No existe un único árbol generador abarcador; el algoritmo produce un bosque generador mínimo (MSF).',
    'Aristas con pesos idénticos: Kruskal resuelve empates de manera determinista según el ordenamiento, produciendo cualquiera de los árboles mínimos equivalentes.',
    'Grafo con aristas de peso negativo: Kruskal sigue siendo óptimo y correcto aun con aristas negativas (a diferencia de Dijkstra).',
    'Grafo denso (|E| ≈ |V|²): El algoritmo de Prim con montículo de Fibonacci puede alcanzar O(E + V log V), pero Kruskal con DSU es altamente eficiente y sencillo de implementar.',
  ],
};

export const kruskalModule: AlgorithmDefinition = {
  metadata: KRUSKAL_METADATA,
  generateTrace: generateKruskalTrace,
  code: KRUSKAL_CODE,
  technicalSheet: KRUSKAL_TECHNICAL_SHEET,
};

