/**
 * AlgoNotebook — Selection Sort Module
 *
 * Exporta el contrato unificado AlgorithmDefinition (AlgorithmModule),
 * metadatos pedagógicos, código fuente en C99 / Python 3, generador de trazas y ficha técnica.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateSelectionSortTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateSelectionSortTrace };

export const SELECTION_SORT_METADATA: AlgorithmMetadata = {
  id: 'selection-sort',
  name: 'Selection Sort',
  category: 'sorting',
  figureId: 'FIG 2.2: MINIMUM KEY SEARCH AND SWAP',
  viewportType: 'linear',
  timeComplexity: {
    best: 'O(N²) Best',
    worst: 'O(N²) Worst',
    average: 'O(N²) Avg',
  },
  spaceComplexity: 'O(1) In-Place',
  description:
    'Algoritmo de ordenamiento in-place que divide el arreglo en un prefijo ordenado y un sufijo no ordenado, buscando repetidamente el valor mínimo del tramo no ordenado para intercambiarlo con la primera posición disponible.',
};

export const SELECTION_SORT_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const SELECTION_SORT_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Ordenar in-place un arreglo de n elementos seleccionando iterativamente el elemento de menor valor de la porción desordenada y colocándolo al final de la porción ordenada.',
  mechanism: [
    'Dividir conceptualmente el arreglo en un prefijo ordenado arr[0 .. i-1] y un sufijo no ordenado arr[i .. n-1].',
    'Para cada pasada externa con índice i desde 0 hasta n - 2, asumir provisionalmente que el menor elemento reside en min_idx = i.',
    'Escanear el subarreglo arr[i+1 .. n-1] con puntero j, comparando arr[j] contra arr[min_idx].',
    'Actualizar min_idx = j cada vez que se encuentre un elemento estrictamente menor.',
    'Al culminar el barrido interno, si min_idx != i, realizar un único intercambio físico swap(arr[i], arr[min_idx]).',
    'Bloquear la posición i como ordenada definitivamente y avanzar el límite del prefijo ordenado.',
  ],
  loopInvariant:
    'Al inicio de cada iteración del bucle externo i, el subarreglo arr[0 .. i-1] contiene los i elementos más pequeños del arreglo original ordenados de forma ascendente definitiva, y ningún elemento en arr[i .. n-1] es menor que cualquiera en arr[0 .. i-1].',
  properties: {
    paradigm: 'Fuerza Bruta / Selección Greedy Local',
    isInPlace: true,
    isStable: false,
  },
  complexity: {
    best: 'O(N²)',
    average: 'O(N²)',
    worst: 'O(N²)',
    auxiliarySpace: 'O(1)',
  },
  analogy:
    'Como buscar la persona de menor estatura en una fila desordenada y pedirle que intercambie lugar con la primera persona; luego buscar la más baja entre los restantes y cambiarla con la segunda persona, garantizando exactamente un intercambio físico por ronda.',
  inPlainWords:
    'En cada pasada, revisa todos los números que aún no están ordenados para descubrir cuál es el más pequeño de todos. Cuando lo tiene plenamente identificado, hace un único intercambio de memoria para ubicarlo en su posición final al comienzo. Repite esta búsqueda hasta completar el arreglo.',
  complexityExplanation:
    'El número de comparaciones es estrictamente invariante respecto al orden inicial de la entrada: siempre realiza (N-1) + (N-2) + ... + 1 = N(N-1)/2 comparaciones, lo que determina una cota temporal cuadrática O(N²) en el mejor, peor y caso promedio. Su propiedad distintiva es la minimización de escrituras: ejecuta a lo sumo N - 1 intercambios físicos (O(N) swaps).',
  edgeCases: [
    'Arreglo ya ordenado (mantiene O(N²) comparaciones obligatorias pero ejecuta 0 swaps)',
    'Arreglo en orden inverso (O(N²) comparaciones y ⌊N/2⌋ swaps)',
    'Elementos duplicados idénticos (puede invertir el orden relativo original de claves iguales, demostrando inestabilidad algorítmica)',
    'Arreglos de tamaño n <= 1 (retorno inmediato sin operaciones)',
  ],
};

export const selectionSortModule: AlgorithmDefinition = {
  metadata: SELECTION_SORT_METADATA,
  generateTrace: generateSelectionSortTrace,
  code: SELECTION_SORT_CODE,
  technicalSheet: SELECTION_SORT_TECHNICAL_SHEET,
};

