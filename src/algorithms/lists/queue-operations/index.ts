/**
 * AlgoNotebook — Cola FIFO (Queue Operations) Algorithm Module
 *
 * Exporta el contrato unificado AlgorithmDefinition (AlgorithmModule),
 * metadatos pedagógicos, código fuente en C99 / Python 3, ficha técnica
 * y generador puro de trazas de memoria para operaciones de cola FIFO.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateQueueOperationsTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateQueueOperationsTrace };

export const QUEUE_OPERATIONS_METADATA: AlgorithmMetadata = {
  id: 'queue-operations',
  name: 'Cola FIFO (Queue)',
  category: 'pointers',
  figureId: 'FIG 6.2: FIFO MEMORY RING BUFFER',
  viewportType: 'linked-list',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(1)',
    worst: 'O(1)',
  },
  spaceComplexity: 'O(N) Búfer Contiguo',
  description:
    'FIFO contiguous queue buffer with enqueue, dequeue, and peek operations synchronized with front and rear pointers.',
};

export const QUEUE_OPERATIONS_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const QUEUE_OPERATIONS_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Gestionar una secuencia de elementos bajo el principio First-In, First-Out (FIFO), donde las inserciones se realizan en la retaguardia (rear) y las extracciones se efectúan en el frente (front).',
  mechanism: [
    'Inicializar un búfer contiguo con punteros front = 0, rear = -1 y conteo = 0.',
    'Operación enqueue(value): Verificar que no haya desbordamiento (count < CAPACITY), avanzar rear circularmente (rear = (rear + 1) % CAPACITY), almacenar value e incrementar count.',
    'Operación dequeue(): Verificar que la cola no esté vacía (count > 0), recuperar el valor en data[front], avanzar front circularmente (front = (front + 1) % CAPACITY) y decrementar count.',
    'Operación peek(): Retornar data[front] en tiempo O(1) sin alterar el estado de los punteros ni el conteo.',
  ],
  loopInvariant:
    'En cualquier instante de la ejecución, el elemento ubicado en front es el elemento de mayor antigüedad en la estructura, y todo nuevo elemento ingresa detrás del último elemento encolado.',
  properties: {
    paradigm: 'Estructura de Datos Lineal FIFO / Búfer Circular',
    isInPlace: true,
    isStable: true,
  },
  complexity: {
    best: 'O(1)',
    average: 'O(1)',
    worst: 'O(1)',
    auxiliarySpace: 'O(N)',
  },
  edgeCases: [
    'Desbordamiento (Overflow): intento de enqueue en cola llena.',
    'Subdesbordamiento (Underflow): intento de dequeue o peek en cola vacía.',
    'Alineación circular: reinicio de índices (wrap-around) al alcanzar el límite de capacidad.',
  ],
  analogy:
    'Fila de espera en un banco: la primera persona que llega a la ventanilla es la primera en ser atendida.',
};

export const queueOperationsModule: AlgorithmDefinition = {
  metadata: QUEUE_OPERATIONS_METADATA,
  code: QUEUE_OPERATIONS_CODE,
  generateTrace: (input?: number[]) => generateQueueOperationsTrace(input),
  technicalSheet: QUEUE_OPERATIONS_TECHNICAL_SHEET,
};

