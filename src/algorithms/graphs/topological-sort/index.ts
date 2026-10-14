/**
 * AlgoNotebook — Topological Sort (Kahn's Algorithm) Module
 *
 * Exporta el contrato unificado AlgorithmDefinition, metadatos pedagógicos,
 * código fuente dual en C99 / Python 3 y generador puro de trazas.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateTopologicalSortTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateTopologicalSortTrace };

export const TOPOLOGICAL_SORT_METADATA: AlgorithmMetadata = {
  id: 'topological-sort',
  name: 'Ordenamiento Topológico (Kahn)',
  category: 'graphs',
  figureId: 'FIG 10.1: DAG IN-DEGREE SOURCE EXTRACTION',
  viewportType: 'graph',
  timeComplexity: {
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
  },
  spaceComplexity: 'O(V) Grados y Cola',
  description:
    'Linearización de dependencias en Grafos Acíclicos Dirigidos (DAG) mediante el algoritmo de Kahn, colas FIFO de nodos fuente y detección de ciclos en tiempo O(V + E).',
};

export const TOPOLOGICAL_SORT_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const TOPOLOGICAL_SORT_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Calcular un ordenamiento lineal de los vértices de un grafo dirigido tal que para toda arista dirigida (u, v), u aparezca antes que v en la secuencia resultante.',
  mechanism: [
    'Calcular el grado de entrada (in-degree) para cada vértice del grafo sumando las aristas incidentes en él.',
    'Insertar en una cola FIFO todas las fuentes iniciales (vértices con in-degree igual a 0).',
    'Mientras la cola contenga vértices, extraer el primer vértice u y añadirlo a la secuencia ordenada de salida.',
    'Para cada arista saliente (u, v), decrementar en 1 el grado de entrada de v simulando la eliminación de la dependencia.',
    'Si el grado de entrada de v llega a 0, insertar v en la cola de fuentes disponibles.',
    'Al finalizar, si la cantidad de nodos emitidos es menor a |V|, se declara la presencia de al menos un ciclo dirigido en el grafo.',
  ],
  loopInvariant:
    'En todo momento, si una arista dirigida (u, v) existe en el grafo original y u aún no ha sido emitido, entonces in-degree(v) >= 1 y v no puede ingresar a la cola. Todo nodo emitido precede estrictamente a todos sus descendientes.',
  properties: {
    paradigm: 'Grafos / Eliminación Voraz de Grados (Kahn)',
    isInPlace: false,
    isStable: false,
  },
  complexity: {
    best: 'O(V + E) (visita cada nodo una vez y cada arista una vez)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
    auxiliarySpace: 'O(V) (arreglo de grados y cola FIFO)',
  },
  analogy:
    'Planificar la malla curricular de una carrera universitaria: no puedes cursar Cálculo II antes de aprobar Cálculo I. Las materias sin correlativas previas son las fuentes con grado 0 que puedes cursar en el primer cuatrimestre.',
  inPlainWords:
    'Cuenta cuántas tareas previas necesita cada tarea. Empieza haciendo todas las que no necesitan nada antes. Cada vez que terminas una tarea, tachas ese requisito de las demás; en cuanto alguna se queda sin requisitos pendientes, la agregas a la lista para hacer.',
  complexityExplanation:
    'La inicialización recorre todas las listas de adyacencia en O(V + E). Cada vértice se encola y desencola exactamente una vez en O(1), y cada arista saliente se descuenta una sola vez. Sumatoria total Theta(V + E).',
  edgeCases: [
    'Grafo con ciclo dirigido: la cola se vacía antes de emitir todos los nodos, detectando la imposibilidad de ordenar',
    'Grafo disconexo (múltiples componentes acíclicas): encola todas las fuentes de todas las componentes',
    'Grafo sin aristas (E = 0): todos los vértices tienen grado 0 y se emiten en orden de índice',
    'Cadena lineal simple (A -> B -> C): procesa secuencialmente en tiempo O(V)',
  ],
};

export const topologicalSortModule: AlgorithmDefinition = {
  metadata: TOPOLOGICAL_SORT_METADATA,
  generateTrace: generateTopologicalSortTrace,
  code: TOPOLOGICAL_SORT_CODE,
  technicalSheet: TOPOLOGICAL_SORT_TECHNICAL_SHEET,
};
