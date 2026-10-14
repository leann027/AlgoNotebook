/**
 * AlgoNotebook — Pila LIFO (Stack Operations) Algorithm Module
 *
 * Exporta el contrato unificado AlgorithmDefinition (AlgorithmModule),
 * metadatos pedagógicos, código fuente en C99 / Python 3, ficha técnica
 * y generador puro de trazas de memoria para operaciones de pila.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateStackOperationsTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateStackOperationsTrace };

export const STACK_OPERATIONS_METADATA: AlgorithmMetadata = {
  id: 'stack-operations',
  name: 'Pila LIFO (Stack)',
  category: 'pointers',
  figureId: 'FIG 6.1: LIFO CALL STACK MEMORY BUFFER',
  viewportType: 'linked-list',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(1)',
    worst: 'O(1)',
  },
  spaceComplexity: 'O(N) Buffer Contiguo',
  description:
    'LIFO contiguous memory stack buffer with push, pop, and peek operations synchronized with top index pointer.',
};

export const STACK_OPERATIONS_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const STACK_OPERATIONS_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Gestionar una colección de elementos bajo el principio Last-In, First-Out (LIFO), donde las inserciones y extracciones ocurren exclusivamente en el extremo superior de la estructura denominado cima (top).',
  mechanism: [
    'Inicializar un búfer estático o dinámico contiguo con puntero de cima top = -1 para representar el estado vacío.',
    'Operación push(value): Comprobar ausencia de desbordamiento (top < CAPACITY - 1), incrementar el puntero top y escribir el nuevo valor en la posición indexada.',
    'Operación pop(): Comprobar ausencia de subdesbordamiento (top >= 0), resguardar el elemento ubicado en top, decrementar el puntero top en una unidad y retornar el elemento recuperado.',
    'Operación peek(): Comprobar ausencia de subdesbordamiento (top >= 0) y devolver una copia del valor en data[top] sin mutar el puntero de cima.',
  ],
  loopInvariant:
    'En todo momento de la ejecución, para cualquier índice 0 <= k <= top, data[k] almacena un elemento activo apilado estrictamente antes que el elemento data[k + 1], preservando el orden temporal LIFO.',
  properties: {
    paradigm: 'Estructura de Datos Lineal LIFO / Manejo de Punteros',
    isInPlace: true,
    isStable: true,
  },
  complexity: {
    best: 'O(1)',
    average: 'O(1)',
    worst: 'O(1)',
    auxiliarySpace: 'O(1) auxiliar (espacio del búfer acotado a O(N))',
  },
  analogy:
    'Como una pila de bandejas en un comedor universitario o la pila de llamadas (call stack) del procesador: la última bandeja que se coloca arriba es obligatoriamente la primera que alguien retira. Intentar tomar una bandeja cuando no hay ninguna causa un error de vacío (underflow), y amontonar más bandejas de las que el dispensador tolera provoca un desborde (overflow).',
  inPlainWords:
    'Una pila restringe el acceso a un solo extremo: la cima. push empuja un dato hacia la cima incrementando el puntero, pop saca el último dato insertado decrementando el puntero, y peek inspecciona la cima sin extraer nada. Todas estas operaciones toman tiempo constante e inmediato O(1).',
  complexityExplanation:
    'Dado que el acceso ocurre directamente mediante indexación fija de un arreglo contiguo (data[top]) o aritmética elemental de punteros, tanto la lectura como la escritura no dependen del número N de elementos apilados, garantizando O(1) estricto en tiempo y espacio auxiliar.',
  edgeCases: [
    'Desbordamiento de Pila (Stack Overflow): Invocación de push cuando top == CAPACITY - 1; la operación debe abortar o retornar código de error sin corromper memoria adyacente.',
    'Subdesbordamiento de Pila (Stack Underflow): Invocación de pop o peek sobre una pila vacía (top == -1); requiere retornar un centinela de error o abortar la rutina.',
    'Pila unitaria (top == 0): Un pop decrementa top a -1, dejando la estructura en estado vacío sin fugas ni dangling pointers.',
  ],
};

export const stackOperationsModule: AlgorithmDefinition = {
  metadata: STACK_OPERATIONS_METADATA,
  generateTrace: generateStackOperationsTrace,
  code: STACK_OPERATIONS_CODE,
  technicalSheet: STACK_OPERATIONS_TECHNICAL_SHEET,
};
