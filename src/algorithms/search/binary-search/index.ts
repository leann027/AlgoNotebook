/**
 * AlgoNotebook — Binary Search Module
 *
 * Exporta el contrato unificado AlgorithmDefinition, metadatos pedagógicos,
 * código fuente en C99 / Python 3 y generador puro de trazas.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateBinarySearchTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateBinarySearchTrace };

export const BINARY_SEARCH_METADATA: AlgorithmMetadata = {
  id: 'binary-search',
  name: 'Búsqueda Binaria',
  category: 'pointers',
  figureId: 'FIG 7.2: LOGARITHMIC TWO-POINTER PROBE',
  viewportType: 'linear',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(log N)',
    worst: 'O(log N)',
  },
  spaceComplexity: 'O(1) Iterative',
  description:
    'Búsqueda logarítmica sobre un arreglo ordenado reduciendo el espacio de búsqueda a la mitad en cada paso.',
};

export const BINARY_SEARCH_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const BINARY_SEARCH_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Localizar el índice de un elemento clave (target) dentro de un arreglo previamente ordenado o determinar que no existe.',
  mechanism: [
    'Inicializar punteros de frontera en los extremos del arreglo: low = 0 y high = n - 1.',
    'Mientras low <= high, calcular el índice central mid = low + (high - low) / 2.',
    'Comparar arr[mid] con target. Si son iguales, retornar mid.',
    'Si arr[mid] < target, descartar la mitad izquierda ajustando low = mid + 1.',
    'Si arr[mid] > target, descartar la mitad derecha ajustando high = mid - 1.',
    'Si low > high sin encontrar coincidencia, retornar -1.',
  ],
  loopInvariant:
    'Si la clave target está presente en el arreglo, debe pertenecer al subarreglo activo arr[low .. high]. Si target no está en arr[low .. high], entonces no está en el arreglo completo.',
  properties: {
    paradigm: 'Búsqueda / Punteros de Reducción',
    isInPlace: true,
    isStable: true,
  },
  complexity: {
    best: 'O(1)',
    average: 'O(log N)',
    worst: 'O(log N)',
    auxiliarySpace: 'O(1)',
  },
  analogy:
    'Como buscar una palabra en un diccionario de 1.000 páginas: no comienzas en la página 1, sino que abres el libro justo en la página 500. Si la palabra buscada es anterior alfabéticamente, descartas de un solo golpe las 500 páginas posteriores y repites con la mitad restante.',
  inPlainWords:
    'Mantiene dos punteros: low y high. En cada paso calcula el índice central mid = low + (high - low) / 2. Compara el valor en mid con la clave buscada. Si coinciden, termina inmediatamente. Si la clave es menor, descarta toda la mitad derecha (high = mid - 1); si es mayor, descarta la izquierda (low = mid + 1).',
  complexityExplanation:
    'En cada comparación, el espacio de búsqueda se reduce rigurosamente a la mitad (N, N/2, N/4, ..., 1). La cantidad máxima de divisiones posibles antes de que quede un solo elemento es log₂(N), logrando una velocidad logarítmica extrema en arreglos ordenados.',
  edgeCases: [
    'Arreglo vacío (n = 0): retorna inmediatamente -1',
    'Clave en los extremos (primer elemento arr[0] o último arr[n-1])',
    'Clave no existente menor que el mínimo o mayor que el máximo',
    'Arreglo de un solo elemento (n = 1)',
  ],
};

export const binarySearchModule: AlgorithmDefinition = {
  metadata: BINARY_SEARCH_METADATA,
  generateTrace: generateBinarySearchTrace,
  code: BINARY_SEARCH_CODE,
  technicalSheet: BINARY_SEARCH_TECHNICAL_SHEET,
};
