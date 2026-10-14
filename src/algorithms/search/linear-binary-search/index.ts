/**
 * AlgoNotebook — Búsqueda Lineal vs Binaria (Módulo Comparador)
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
import { generateLinearBinarySearchTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateLinearBinarySearchTrace };

export const LINEAR_BINARY_SEARCH_METADATA: AlgorithmMetadata = {
  id: 'linear-binary-search',
  name: 'Búsqueda Lineal vs Binaria',
  category: 'pointers',
  figureId: 'FIG 7.3: COMPARATIVE SEARCH EFFICIENCY AND MASTER THEOREM',
  viewportType: 'linear',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(N) vs O(log N)',
    worst: 'O(N) vs O(log N)',
  },
  spaceComplexity: 'O(1) Auxiliar',
  description:
    'Comparador pedagógico directo entre la búsqueda secuencial O(N) y la búsqueda binaria logarítmica O(log N) gobernada por el Teorema Maestro (Caso 2).',
};

export const LINEAR_BINARY_SEARCH_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const LINEAR_BINARY_SEARCH_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Contrastar de forma experimental y analítica la divergencia asintótica entre el recorrido secuencial exhaustivo y la poda logarítmica por bisección de intervalos.',
  mechanism: [
    'Inicializar punteros de la búsqueda lineal en i = 0 y de la búsqueda binaria en low = 0, high = n - 1.',
    'En cada ciclo, la búsqueda lineal inspecciona arr[i] secuencialmente hasta hallar coincidencia o agotar n elementos.',
    'Simultáneamente, la búsqueda binaria calcula mid = low + (high - low) / 2 y evalúa arr[mid].',
    'Si arr[mid] < target, la búsqueda binaria descarta de golpe la mitad izquierda ajustando low = mid + 1.',
    'Si arr[mid] > target, descarta la mitad derecha fijando high = mid - 1.',
    'Se comparan los totales de operaciones demostrando la cota superior Theta(log N) frente a Theta(N).',
  ],
  loopInvariant:
    'En todo paso k, la búsqueda lineal asegura que target no está en arr[0 .. k-1], mientras que la búsqueda binaria preserva que si target existe en el conjunto, debe residir estrictamente en arr[low .. high].',
  properties: {
    paradigm: 'Comparativa Asintótica / Divide y Vencerás',
    isInPlace: true,
    isStable: true,
  },
  complexity: {
    best: 'O(1) (coincidencia en primer índice evaluado)',
    average: 'Lineal: O(N) | Binaria: O(log N)',
    worst: 'Lineal: O(N) | Binaria: O(log N)',
    auxiliarySpace: 'O(1) en ambas variantes',
  },
  analogy:
    'Buscar un contacto telefónico hojeando cada página una por una desde la A hasta la Z (Lineal) versus abrir la guía telefónica justo por el centro y descartar la mitad del libro en cada corte (Binaria).',
  inPlainWords:
    'Muestra en tiempo real cómo dos algoritmos resuelven la misma tarea con órdenes de eficiencia radicalmente distintos: el lineal avanza a paso de tortuga probando cada casilla, mientras el binario vuela dividiendo a la mitad el problema.',
  complexityExplanation:
    'La búsqueda binaria cumple T(n) = T(n/2) + Theta(1), resolviéndose por el Teorema Maestro Caso 2 en Theta(log N). La búsqueda lineal cumple T(n) = T(n-1) + Theta(1), resolviéndose en Theta(N).',
  edgeCases: [
    'Arreglo unitario (n = 1): ambas resuelven en 1 sola comparación',
    'Clave en primer índice arr[0]: lineal resuelve en O(1), binaria en O(log N)',
    'Clave en último índice arr[n-1]: lineal requiere N comparaciones, binaria ceil(log2 N)',
    'Clave inexistente menor que el mínimo o mayor que el máximo',
  ],
};

export const linearBinarySearchModule: AlgorithmDefinition = {
  metadata: LINEAR_BINARY_SEARCH_METADATA,
  generateTrace: generateLinearBinarySearchTrace,
  code: LINEAR_BINARY_SEARCH_CODE,
  technicalSheet: LINEAR_BINARY_SEARCH_TECHNICAL_SHEET,
};
