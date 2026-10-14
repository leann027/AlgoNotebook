/**
 * AlgoNotebook — Inversión de Lista Enlazada (Reverse Linked List) Algorithm Module
 *
 * Exporta el contrato unificado AlgorithmDefinition (AlgorithmModule),
 * metadatos pedagógicos, código fuente en C99 / Python 3, ficha técnica
 * y generador puro de trazas para Lista Enlazada.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateReverseListTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateReverseListTrace };

export const REVERSE_LIST_METADATA: AlgorithmMetadata = {
  id: 'reverse-linked-list',
  name: 'Lista Enlazada: Invertir Lista',
  category: 'pointers',
  figureId: 'FIG 7.1: IN-PLACE LINKED LIST REVERSAL',
  viewportType: 'linked-list',
  timeComplexity: {
    best: 'O(N)',
    average: 'O(N)',
    worst: 'O(N)',
  },
  spaceComplexity: 'O(1) In-Place',
  description:
    'In-place iterative reversal of a singly linked list using three memory pointers (prev, curr, next).',
};

export const REVERSE_LIST_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const REVERSE_LIST_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Invertir in-place el sentido de todos los enlaces de una lista enlazada simple, transformando la secuencia original en su reversa exacta sin asignar nuevos nodos en memoria.',
  mechanism: [
    'Mantener tres punteros de seguimiento: prev (nodo anterior procesado), curr (nodo bajo inspección) y next (resguardo del nodo sucesor).',
    'En cada iteración, resguardar next = curr->next para no perder la referencia al resto de la cadena de memoria.',
    'Reasignar el enlace del nodo actual: curr->next = prev, invirtiendo la dirección física del puntero en memoria.',
    'Desplazar el puntero prev hacia curr y el puntero curr hacia next.',
    'Al alcanzar curr == NULL, retornar prev como la nueva cabeza definitiva de la lista invertida.',
  ],
  loopInvariant:
    'Al inicio de cada iteración, la subcadena de nodos que precede a curr ha sido completamente invertida y tiene a prev como su cabeza, mientras que la subcadena que comienza en curr preserva su orden original inalterado.',
  properties: {
    paradigm: 'Manipulación de Punteros In-Place',
    isInPlace: true,
    isStable: true,
  },
  complexity: {
    best: 'O(N)',
    average: 'O(N)',
    worst: 'O(N)',
    auxiliarySpace: 'O(1) (solo 3 variables puntero de memoria)',
  },
  analogy:
    'Como una fila de personas tomadas de la mano mirando hacia adelante: para invertir la dirección de la fila, cada persona suelta la mano de la persona de adelante y se da vuelta para tomar la mano de la persona de atrás, sin mover a nadie de su sitio físico.',
  inPlainWords:
    'Utiliza tres punteros: prev (el nodo anterior ya invertido), curr (el nodo actual) y next (el resguardo temporal). En cada paso guarda el puntero siguiente para no perder la lista, redirige la flecha de curr hacia atrás (curr->next = prev), y avanza prev y curr un paso hacia adelante. Al llegar a NULL, prev es la nueva cabeza.',
  complexityExplanation:
    'Recorre linealmente los N nodos de la lista exactamente una vez sin retroceder. En cada nodo ejecuta un número constante de operaciones de reasignación de punteros en memoria física (O(1) por nodo), resultando en O(N) temporal y O(1) de memoria auxiliar.',
  edgeCases: [
    'Lista vacía (head == NULL): Retorno inmediato de NULL sin mutaciones de punteros.',
    'Lista con un único nodo (head->next == NULL): El enlace apunta a NULL y la lista permanece idéntica en O(1).',
    'Lista con dos nodos: Inversión en un único ciclo completo sin ciclos huérfanos.',
    'Ciclos en la lista (Linked List Cycle): Requiere detección previa con algoritmo de Floyd (Liebre y Tortuga) para evitar bucles infinitos.',
  ],
};

export const reverseLinkedListModule: AlgorithmDefinition = {
  metadata: REVERSE_LIST_METADATA,
  generateTrace: generateReverseListTrace,
  code: REVERSE_LIST_CODE,
  technicalSheet: REVERSE_LIST_TECHNICAL_SHEET,
};

