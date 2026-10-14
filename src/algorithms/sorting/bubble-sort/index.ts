/**
 * AlgoNotebook — Bubble Sort Module
 *
 * Exporta el contrato unificado AlgorithmModule, metadatos, código fuente y generador de trazas.
 */

import type {
  AlgorithmMetadata,
  AlgorithmModule,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateBubbleSortTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateBubbleSortTrace };

export const BUBBLE_SORT_METADATA: AlgorithmMetadata = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  category: 'sorting',
  figureId: 'FIG 3.1: IN-PLACE BUBBLE PASS #1',
  timeComplexity: {
    best: 'O(N) Best',
    worst: 'O(N²) Worst',
    average: 'O(N²) Avg',
  },
  spaceComplexity: 'O(1) In-Place',
  description:
    'In-place comparison sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
};

export const BUBBLE_SORT_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const BUBBLE_SORT_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Ordenar in-place un arreglo de n elementos comparables en orden no decreciente mediante intercambios adyacentes.',
  mechanism: [
    'Iterar sobre el arreglo n-1 veces (pasadas externas i).',
    'En cada pasada, comparar elementos contiguos arr[j] y arr[j+1].',
    'Si arr[j] > arr[j+1], intercambiar sus posiciones en memoria y registrar el swap.',
    'Al final de la pasada i, el elemento de mayor valor del prefijo queda fijado en la posición definitiva n-1-i.',
    'Terminar prematuramente si una pasada no produce intercambios.',
  ],
  loopInvariant:
    'Al inicio de cada pasada externa i, el sufijo arr[n-i .. n-1] contiene los i elementos mayores del arreglo ordenados de forma definitiva, y cada elemento en arr[0 .. n-i-1] es menor o igual que cualquier elemento en arr[n-i .. n-1].',
  properties: {
    paradigm: 'Fuerza Bruta / Intercambio',
    isInPlace: true,
    isStable: true,
  },
  complexity: {
    best: 'O(N)',
    average: 'O(N²)',
    worst: 'O(N²)',
    auxiliarySpace: 'O(1)',
  },
  analogy:
    'Como las burbujas en un vaso con gas: las burbujas más grandes y pesadas (los números de mayor valor) flotan gradualmente hacia la superficie (el extremo derecho) paso a paso mediante intercambios continuos con el líquido vecino.',
  inPlainWords:
    'Recorre el arreglo comparando cada pareja de elementos vecinos (arr[j] con arr[j+1]). Si el elemento izquierdo es mayor que el derecho, los intercambia de lugar. Al terminar cada pasada completa, el número más grande del subarreglo queda fijado para siempre en su posición final. El proceso se repite para los restantes hasta que ninguna pareja necesite intercambio.',
  complexityExplanation:
    'En la 1.ª pasada se realizan N-1 comparaciones; en la 2.ª, N-2; y así sucesivamente. La suma aritmética es (N-1) + (N-2) + ... + 1 = N(N-1)/2 ≈ ½N², lo que produce una cota asintótica cuadrática O(N²) en tiempo.',
  edgeCases: [
    'Arreglo ya ordenado (detectable con bandera de 0 swaps en O(N))',
    'Arreglo en orden inverso (peor caso cuadrático O(N²))',
    'Elementos duplicados (estabilidad garantizada al no intercambiar si son iguales)',
    'Arreglos de tamaño n <= 1 (retorno inmediato sin operaciones)',
  ],
};

export const bubbleSortModule: AlgorithmModule = {
  metadata: BUBBLE_SORT_METADATA,
  generateTrace: generateBubbleSortTrace,
  code: BUBBLE_SORT_CODE,
  technicalSheet: BUBBLE_SORT_TECHNICAL_SHEET,
};

