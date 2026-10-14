/**
 * AlgoNotebook — Breadth-First Search (BFS) Module
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
import { generateBFSTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateBFSTrace };

export const BFS_METADATA: AlgorithmMetadata = {
  id: 'bfs-graph',
  name: 'BFS: Recorrido en Anchura',
  category: 'graphs',
  figureId: 'FIG 5.1: BREADTH-FIRST SEARCH (FIFO QUEUE)',
  viewportType: 'graph',
  timeComplexity: {
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
  },
  spaceComplexity: 'O(V) Queue',
  description: 'Level-by-level breadth-first graph traversal using a FIFO queue.',
};

export const BFS_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const BFS_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Explorar sistemáticamente todos los vértices alcanzables de un grafo por niveles de distancia desde un nodo origen.',
  mechanism: [
    'Inicializar una cola FIFO y encolar el vértice origen marcándolo como visitado.',
    'Mientras la cola no esté vacía, extraer el vértice en el frente.',
    'Para cada vecino no visitado del vértice actual, marcarlo como visitado y encolarlo.',
    'Repetir hasta agotar todos los vértices de la componente conexa.',
  ],
  loopInvariant:
    'La cola contiene únicamente vértices a distancia d o d+1 del origen, y todos los vértices visitados a distancia menor ya han sido procesados.',
  properties: {
    paradigm: 'Búsqueda en Grafos / Cola FIFO',
    isInPlace: false,
  },
  complexity: {
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
    auxiliarySpace: 'O(V)',
  },
  analogy:
    'Como arrojar una piedra a un estanque quieto: las ondas de agua se expanden en círculos concéntricos hacia afuera, tocando primero a los vecinos más cercanos (a 1 salto de distancia), luego a los de distancia 2, y así sucesivamente en oleadas ordenadas.',
  inPlainWords:
    'Utiliza una cola FIFO (First-In, First-Out). Empieza encolando el nodo de origen y marcándolo como visitado. En cada iteración desencola el nodo del frente, explora todos sus vecinos no visitados, los marca para no repetir y los encola. Así garantiza descubrir siempre el camino con menor número de aristas.',
  complexityExplanation:
    'Cada uno de los V vértices se inserta y extrae de la cola exactamente una vez (tiempo O(V)). A lo largo de todo el recorrido se examina cada arista incidente a lo sumo dos veces (tiempo O(E)). La suma total arroja una cota lineal O(V + E).',
  edgeCases: [
    'Grafo disconexo (solo visita la componente del origen)',
    'Vértice aislado sin aristas',
    'Grafos con ciclos (evita lazos infinitos gracias al conjunto visited[])',
  ],
};

export const bfsModule: AlgorithmDefinition = {
  metadata: BFS_METADATA,
  generateTrace: generateBFSTrace,
  code: BFS_CODE,
  technicalSheet: BFS_TECHNICAL_SHEET,
};

