/**
 * AlgoNotebook — Merge Sort Module
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
import { generateMergeSortTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateMergeSortTrace };

export const MERGE_SORT_METADATA: AlgorithmMetadata = {
  id: 'merge-sort',
  name: 'Merge Sort',
  category: 'sorting',
  figureId: 'FIG 3.3: DIVIDE & CONQUER BUFFER MERGE',
  viewportType: 'linear',
  timeComplexity: {
    best: 'O(N log N)',
    average: 'O(N log N)',
    worst: 'O(N log N)',
  },
  spaceComplexity: 'O(N) Auxiliary Buffer',
  description:
    'Algoritmo recursivo divide y vencerás estable que divide a la mitad y fusiona ordenadamente.',
};

export const MERGE_SORT_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const MERGE_SORT_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Ordenar un arreglo de n elementos comparables en orden no decreciente dividiéndolo recursivamente y fusionando subarreglos ordenados.',
  mechanism: [
    'Dividir el arreglo a la mitad calculando el punto medio mid = left + (right - left) / 2.',
    'Llamar recursivamente a merge_sort para ordenar la mitad izquierda arr[left..mid].',
    'Llamar recursivamente a merge_sort para ordenar la mitad derecha arr[mid+1..right].',
    'Fusionar (merge) las dos mitades ordenadas utilizando buffers temporales L y R.',
    'Comparar los elementos en el frente de ambos buffers y copiar el menor a arr[k].',
    'Copiar los elementos restantes del buffer no agotado.',
  ],
  loopInvariant:
    'Al inicio de cada iteración del bucle while en merge, arr[left..k-1] contiene en orden no decreciente los k-left elementos menores de L y R, y L[i] y R[j] son los elementos menores no copiados de sus respectivos arreglos.',
  properties: {
    paradigm: 'Divide y Vencerás',
    isInPlace: false,
    isStable: true,
  },
  complexity: {
    best: 'O(N log N)',
    average: 'O(N log N)',
    worst: 'O(N log N)',
    auxiliarySpace: 'O(N)',
  },
  analogy:
    'Como barajar dos mazos de cartas que ya están ordenados de menor a mayor: solo necesitas mirar la carta del frente de cada mazo, tomar la menor y ponerla sobre la mesa. Repites el proceso hasta que ambos mazos queden vacíos.',
  inPlainWords:
    'Parte el arreglo por la mitad repetidamente hasta obtener fragmentos unitarios (de 1 solo elemento, que por definición ya están ordenados). A continuación, en la fase de retorno recursivo, fusiona (merge) parejas de subarreglos ordenados comparando sus frentes y copiando el menor en un búfer auxiliar.',
  complexityExplanation:
    'La fase de división crea un árbol binario perfecto de profundidad log₂(N). En cada uno de esos niveles de profundidad, la rutina de fusión inspecciona y reubica exactamente los N elementos. Por tanto, el trabajo total es rigurosamente constante e igual a N × log₂(N) en todos los casos.',
  edgeCases: [
    'Arreglos de tamaño <= 1 (caso base de retorno inmediato)',
    'Arreglo ya ordenado (requiere el mismo tiempo O(N log N) debido a la división)',
    'Arreglo en orden inverso',
    'Elementos duplicados (la estabilidad se preserva mediante la condición L[i] <= R[j])',
  ],
};

export const mergeSortModule: AlgorithmDefinition = {
  metadata: MERGE_SORT_METADATA,
  generateTrace: generateMergeSortTrace,
  code: MERGE_SORT_CODE,
  technicalSheet: MERGE_SORT_TECHNICAL_SHEET,
};
