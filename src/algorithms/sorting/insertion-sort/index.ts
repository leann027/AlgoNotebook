/**
 * AlgoNotebook — Insertion Sort Module
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
import { generateInsertionSortTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateInsertionSortTrace };

export const INSERTION_SORT_METADATA: AlgorithmMetadata = {
  id: 'insertion-sort',
  name: 'Insertion Sort',
  category: 'sorting',
  figureId: 'FIG 2.1: INCREMENTAL SORTED SUBARRAY EXPANSION',
  viewportType: 'linear',
  timeComplexity: {
    best: 'O(N) Best',
    worst: 'O(N²) Worst',
    average: 'O(N²) Avg',
  },
  spaceComplexity: 'O(1) In-Place',
  description:
    'Algoritmo incremental in-place que construye la secuencia ordenada elemento por elemento, insertando cada valor en su posición relativa correcta dentro del prefijo previamente ordenado.',
};

export const INSERTION_SORT_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const INSERTION_SORT_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Ordenar in-place un arreglo de n elementos comparables en orden no decreciente expandiendo de forma incremental un prefijo ordenado mediante desplazamientos e inserción local.',
  mechanism: [
    'Establecer arr[0] como un prefijo ordenado trivial de tamaño 1.',
    'Iterar con el índice externo i desde 1 hasta n - 1, extrayendo key = arr[i] como elemento a insertar.',
    'Comparar la clave contra los elementos del prefijo arr[0 .. i-1] de derecha a izquierda (j = i - 1 hacia 0).',
    'Desplazar hacia la derecha (arr[j+1] = arr[j]) cada elemento estrictamente mayor que la clave para liberar el espacio necesario.',
    'Depositar la clave en su posición adecuada arr[j+1] = key tan pronto como arr[j] <= key o j < 0.',
    'Repetir hasta que el prefijo ordenado abarque la totalidad de los n elementos.',
  ],
  loopInvariant:
    'Al inicio de cada iteración del bucle externo i, el subarreglo arr[0 .. i-1] contiene los mismos elementos originales de esas posiciones pero dispuestos en orden ascendente (permutación ordenada del prefijo).',
  properties: {
    paradigm: 'Incremental / Inserción',
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
    'Similar a ordenar una mano de naipes: sostienes un grupo de cartas ya ordenadas en la mano izquierda y, al tomar una nueva carta con la derecha, la comparas de derecha a izquierda y abres espacio entre las cartas mayores para colocarla en su lugar preciso.',
  inPlainWords:
    'Toma un elemento a la vez (la "clave") y mira hacia atrás en la parte del arreglo que ya tienes ordenada. Si los elementos anteriores son más grandes que la clave, los corre un casillero a la derecha para hacerle hueco. Apenas encuentra uno menor o igual (o llega al principio), inserta la clave en ese hueco.',
  complexityExplanation:
    'En el mejor de los casos (arreglo ya ordenado), cada elemento se compara una sola vez con su antecesor inmediato sin desplazamientos (N - 1 comparaciones = O(N)). En el peor caso (orden inverso), cada clave arr[i] se desplaza contra todos los i elementos precedentes, totalizando 1 + 2 + ... + (N-1) = N(N-1)/2 comparaciones y movimientos = O(N²).',
  edgeCases: [
    'Arreglo ya ordenado (tiempo lineal óptimo O(N) con 0 desplazamientos)',
    'Arreglo en orden inverso (peor caso cuadrático O(N²) con desplazamientos máximos)',
    'Elementos duplicados idénticos (estabilidad estricta garantizada al detener el desplazamiento si arr[j] == key)',
    'Arreglos de tamaño n <= 1 (retorno inmediato sin desplazamientos ni comparaciones)',
    'Arreglo casi ordenado (complejidad cercana a O(N + k) donde k es el número de inversiones)',
  ],
};

export const insertionSortModule: AlgorithmDefinition = {
  metadata: INSERTION_SORT_METADATA,
  generateTrace: generateInsertionSortTrace,
  code: INSERTION_SORT_CODE,
  technicalSheet: INSERTION_SORT_TECHNICAL_SHEET,
};

