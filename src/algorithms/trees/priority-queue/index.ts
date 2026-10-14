/**
 * AlgoNotebook — Priority Queue / Min-Heap Module
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
import { generatePriorityQueueTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generatePriorityQueueTrace };

export const PRIORITY_QUEUE_METADATA: AlgorithmMetadata = {
  id: 'priority-queue',
  name: 'Cola de Prioridad (Min-Heap)',
  category: 'trees',
  figureId: 'FIG 8.1: COMPLETE BINARY TREE PRIORITY QUEUE',
  viewportType: 'tree',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(log N)',
    worst: 'O(log N)',
  },
  spaceComplexity: 'O(N) Estructural / O(1) Auxiliar',
  description:
    'Estructura de datos en árbol binario completo que garantiza acceso al elemento mínimo en O(1) e inserción/extracción en O(log N) mediante rebalanceos sift-up y sift-down.',
};

export const PRIORITY_QUEUE_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const PRIORITY_QUEUE_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Gestionar una colección dinámica de elementos donde la extracción del valor mínimo (o máxima prioridad) se ejecuta en tiempo logarítmico óptimo conservando el invariante de montículo.',
  mechanism: [
    'El montículo binario se almacena contiguamente en un arreglo donde para el nodo i: hijo izquierdo = 2i + 1, hijo derecho = 2i + 2 y padre = (i - 1) / 2.',
    'Push(x): Agrega x al final del arreglo y ejecuta sift-up comparando con el padre e intercambiando si x < padre hasta alcanzar la raíz o un padre menor.',
    'Peek(): Devuelve directamente el elemento en la raíz arr[0] en tiempo O(1).',
    'Pop(): Extrae arr[0], mueve el último elemento del arreglo a la raíz y ejecuta sift-down comparando con el menor de sus hijos e intercambiando hasta que ningún hijo sea menor.',
  ],
  loopInvariant:
    'Para todo nodo en el índice i > 0, arr[padre(i)] <= arr[i]. La raíz en el índice 0 contiene permanentemente la clave de menor valor (mínimo global de la estructura).',
  properties: {
    paradigm: 'Estructuras Jerárquicas / Montículo Binario',
    isInPlace: true,
    isStable: false,
  },
  complexity: {
    best: 'O(1) (Peek o Push sin violación de orden)',
    average: 'O(log N) (Push y Pop)',
    worst: 'O(log N) (recorrido completo de la altura floor(log2 N))',
    auxiliarySpace: 'O(1) sobre búfer contiguo O(N)',
  },
  analogy:
    'Como la sala de urgencias de un hospital: los pacientes no se atienden por orden de llegada, sino por un triage estricto. El caso más crítico siempre encabeza la atención médica de forma inmediata.',
  inPlainWords:
    'Organiza los datos en un árbol casi perfecto donde cada padre es menor que sus hijos. Al insertar, el nuevo dato "burbujea hacia arriba" hasta su sitio. Al sacar el mínimo, el último elemento sube a la cima y "burbujea hacia abajo" hasta encontrar su lugar correcto.',
  complexityExplanation:
    'La altura máxima de un montículo binario de N nodos está rígidamente delimitada por floor(log2 N). Cada iteración de sift-up o sift-down desciende o asciende exactamente un nivel del árbol, requiriendo a lo sumo log2(N) comparaciones. Cumple la recurrencia T(n) <= T(2n/3) + Theta(1), resuelta por Teorema Maestro Caso 2 en Theta(log n).',
  edgeCases: [
    'Cola vacía: Peek y Pop retornan nulo / error controlado',
    'Cola con un único elemento: Pop extrae la raíz sin requerir sift-down',
    'Claves duplicadas: se preserva el invariante permitiendo valores idénticos en subárboles',
    'Inserción de una clave menor que el mínimo actual: asciende de inmediato hasta la raíz',
  ],
};

export const priorityQueueModule: AlgorithmDefinition = {
  metadata: PRIORITY_QUEUE_METADATA,
  generateTrace: generatePriorityQueueTrace,
  code: PRIORITY_QUEUE_CODE,
  technicalSheet: PRIORITY_QUEUE_TECHNICAL_SHEET,
};
