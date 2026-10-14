/**
 * AlgoNotebook — Dijkstra's Shortest Path Algorithm Module
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
import { generateDijkstraTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateDijkstraTrace };

export const DIJKSTRA_METADATA: AlgorithmMetadata = {
  id: 'dijkstra-graph',
  name: 'Dijkstra: Camino Mínimo',
  category: 'graphs',
  figureId: 'FIG 5.2: DIJKSTRA SINGLE-SOURCE SHORTEST PATH',
  viewportType: 'graph',
  timeComplexity: {
    best: 'O((V + E) log V)',
    average: 'O((V + E) log V)',
    worst: 'O(V²)',
  },
  spaceComplexity: 'O(V) Distances Table',
  description:
    'Greedy single-source shortest path algorithm using relaxation on weighted edges.',
};

export const DIJKSTRA_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const DIJKSTRA_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Calcular la distancia mínima y camino más corto desde un vértice origen hacia todos los demás vértices en un grafo con pesos no negativos.',
  mechanism: [
    'Inicializar dist[src] = 0 y dist[v] = infinito para los demás vértices.',
    'En cada ronda, seleccionar el vértice u no asentado con la menor distancia tentativa dist[u].',
    'Marcar u como permanentemente asentado.',
    'Para cada vecino v de u, relajar la arista: si dist[u] + peso(u, v) < dist[v], actualizar dist[v] y registrar a u como su predecesor.',
    'Repetir hasta asentar todos los vértices alcanzables.',
  ],
  loopInvariant:
    'Para todo vértice asentado u en S, dist[u] es la longitud del camino más corto definitivo desde el origen, y para todo v fuera de S, dist[v] es la longitud del camino más corto que utiliza exclusivamente vértices intermedios en S.',
  properties: {
    paradigm: 'Algoritmo Voraz (Greedy)',
    isInPlace: false,
  },
  complexity: {
    best: 'O((V + E) log V)',
    average: 'O((V + E) log V)',
    worst: 'O(V²)',
    auxiliarySpace: 'O(V)',
  },
  analogy:
    'Como la propagación de agua en una red de tuberías de distintas longitudes: el agua brota del origen y llega primero a las intersecciones conectadas por los tramos más cortos y directos de menor resistencia.',
  inPlainWords:
    'Mantiene una tabla con la mejor distancia tentativa conocida hacia cada nodo. En cada ronda elige el nodo no visitado con la menor distancia (decisión voraz o greedy) y lo asienta como definitivo. Luego revisa si viajar a través de él permite encontrar un atajo más corto hacia sus vecinos (relajación de aristas).',
  complexityExplanation:
    'Utilizando una cola de prioridad (min-heap), extraer el vértice mínimo toma O(log V) para cada uno de los V vértices. A su vez, relajar las E aristas e insertar en el heap toma O(E log V). El total asintótico combinado es O((V + E) log V).',
  edgeCases: [
    'Aristas con pesos negativos (Dijkstra no es aplicable; produce resultados incorrectos)',
    'Vértices inalcanzables (permanecen con distancia infinita)',
    'Grafo con múltiples caminos de igual costo mínimo',
  ],
};

export const dijkstraModule: AlgorithmDefinition = {
  metadata: DIJKSTRA_METADATA,
  generateTrace: generateDijkstraTrace,
  code: DIJKSTRA_CODE,
  technicalSheet: DIJKSTRA_TECHNICAL_SHEET,
};

