/**
 * AlgoNotebook — Depth-First Search (DFS) Module
 *
 * Exporta el contrato unificado AlgorithmDefinition (AlgorithmModule),
 * metadatos pedagógicos, código fuente en C99 / Python 3 y generador puro de trazas.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateDFSTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateDFSTrace };

export const DFS_METADATA: AlgorithmMetadata = {
  id: 'dfs-graph',
  name: 'DFS: Recorrido en Profundidad',
  category: 'graphs',
  figureId: 'FIG 5.3: DEPTH-FIRST SEARCH (RECURSION & BACKTRACKING)',
  viewportType: 'graph',
  timeComplexity: {
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
  },
  spaceComplexity: 'O(V) Call Stack',
  description: 'Deep recursive graph exploration exploring branches to their maximum depth before backtracking.',
};

export const DFS_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const DFS_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Explorar sistemáticamente todos los vértices alcanzables de un grafo descendiendo lo más profundo posible a lo largo de cada rama antes de retroceder (backtracking).',
  mechanism: [
    'Marcar el vértice actual como visitado e insertarlo en el marco superior del Call Stack.',
    'Para cada vecino del vértice actual, verificar si ya fue visitado.',
    'Si no ha sido visitado, avanzar recursivamente a través de la arista del árbol generador (tree edge).',
    'Si todos los vecinos adyacentes han sido visitados o agotados, desapilar el marco actual y retroceder al predecesor en la pila.',
    'Concluir cuando todos los vértices alcanzables hayan sido visitados y la pila quede vacía.',
  ],
  loopInvariant:
    'En cualquier instante de la recursión, los vértices en la pila de llamadas forman un camino simple desde el origen hasta el vértice activo actual.',
  properties: {
    paradigm: 'Búsqueda en Grafos / Recursión LIFO',
    isInPlace: false,
  },
  complexity: {
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
    auxiliarySpace: 'O(V)',
  },
  analogy:
    'Como explorar un laberinto desconocido con un ovillo de hilo: eliges un pasillo y avanzas todo lo que puedas hasta chocar contra una pared o callejón sin salida. En ese momento recoges el hilo y retrocedes (backtracking) hasta la última bifurcación para probar el siguiente pasillo.',
  inPlainWords:
    'Visita un vértice, lo marca como visitado y de inmediato se sumerge en el primer vecino no explorado que encuentre mediante una llamada recursiva. Solo retrocede (desapila del Call Stack) cuando un vértice ya no tiene ningún vecino pendiente de visita.',
  complexityExplanation:
    'Al igual que BFS, recorre cada vértice una sola vez y examina cada arista en ambas direcciones. La diferencia radica en la estructura LIFO (pila de llamadas en lugar de cola), manteniendo la misma cota lineal estricta de O(V + E).',
  edgeCases: [
    'Grafos con ciclos (el arreglo visited previene bucles infinitos)',
    'Grafos no conexos (sólo visita los nodos de la componente alcanzable)',
    'Grafos en estrella o lineales (alcanza profundidad máxima O(V))',
  ],
};

export const dfsModule: AlgorithmDefinition = {
  metadata: DFS_METADATA,
  code: DFS_CODE,
  generateTrace: () => generateDFSTrace(),
  technicalSheet: DFS_TECHNICAL_SHEET,
};
