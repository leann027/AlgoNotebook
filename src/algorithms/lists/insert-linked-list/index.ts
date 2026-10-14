import type {
  AlgorithmDefinition,
  AlgorithmMetadata,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateInsertLinkedListTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateInsertLinkedListTrace };

const metadata: AlgorithmMetadata = {
  id: 'insert-linked-list',
  name: 'Lista Enlazada: Insertar al Final',
  category: 'pointers',
  figureId: 'FIG 7.2: LINKED LIST TAIL INSERTION',
  viewportType: 'linked-list',
  timeComplexity: { best: 'O(1)', average: 'O(N)', worst: 'O(N)' },
  spaceComplexity: 'O(1) auxiliar por inserción',
  description: 'Inserción de nodos al final de una lista enlazada simple mediante recorrido de punteros.',
};

const code: AlgorithmSourceCode = { c: codeC, python: codePy };

const technicalSheet: AlgorithmTechnicalSheet = {
  objective: 'Insertar cada valor de entrada al final de una lista enlazada simple, preservando el orden de llegada y devolviendo la cabeza de la lista.',
  mechanism: [
    'Reservar un nodo nuevo, copiar el valor y establecer newNode->next = NULL.',
    'Si la lista está vacía, devolver el nodo nuevo como head.',
    'Recorrer desde head hasta hallar el nodo cuyo next es NULL.',
    'Conectar tail->next con el nodo nuevo y conservar la cadena existente.',
  ],
  loopInvariant: 'Antes de cada iteración del recorrido, todos los enlaces desde head hasta tail permanecen válidos y tail apunta al último nodo visitado.',
  properties: { paradigm: 'Manipulación de punteros / lista enlazada', isInPlace: false, isStable: true },
  complexity: { best: 'O(1)', average: 'O(N)', worst: 'O(N)', auxiliarySpace: 'O(1) por inserción' },
  edgeCases: ['Lista vacía: el nuevo nodo se convierte en head.', 'Un único nodo: la conexión se realiza directamente.', 'Valores duplicados: se preservan y se insertan en orden.', 'Fallo de reserva de memoria en C: la cabeza existente no se modifica.'],
};

export const insertLinkedListModule: AlgorithmDefinition = {
  metadata,
  code,
  generateTrace: (input?: number[]) => generateInsertLinkedListTrace(input),
  technicalSheet,
};
