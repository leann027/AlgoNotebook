/**
 * AlgoNotebook — QuickSort Module
 *
 * Exporta el contrato unificado AlgorithmDefinition (AlgorithmModule),
 * metadatos pedagógicos, código fuente en C99 / Python 3 y generador puro de trazas.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateQuickSortTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateQuickSortTrace };

export const QUICK_SORT_METADATA: AlgorithmMetadata = {
  id: 'quick-sort',
  name: 'QuickSort',
  category: 'sorting',
  figureId: 'FIG 3.2: LOMUTO PARTITION RECURSION',
  timeComplexity: {
    best: 'O(N log N)',
    average: 'O(N log N)',
    worst: 'O(N²)',
  },
  spaceComplexity: 'O(log N) Call Stack',
  description:
    'Divide-and-conquer recursive sorting algorithm using Lomuto partitioning.',
};

export const QUICK_SORT_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const QUICK_SORT_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Ordenar in-place un arreglo particionando recursivamente alrededor de un elemento pivote.',
  mechanism: [
    'Seleccionar un elemento centinela como pivote (esquema Lomuto: arr[high]).',
    'Reorganizar el subarreglo arr[low..high] de modo que todos los elementos menores al pivote queden a su izquierda y los mayores a su derecha.',
    'Colocar el pivote en su índice de partición definitivo pi.',
    'Llamar recursivamente a quick_sort sobre arr[low .. pi-1] y arr[pi+1 .. high].',
  ],
  loopInvariant:
    'Durante el barrido de Lomuto con puntero j, todos los elementos en arr[low .. i] son estrictamente menores que el pivote, y todos los elementos en arr[i+1 .. j-1] son mayores o iguales al pivote.',
  properties: {
    paradigm: 'Divide y Vencerás',
    isInPlace: true,
    isStable: false,
  },
  complexity: {
    best: 'O(N log N)',
    average: 'O(N log N)',
    worst: 'O(N²)',
    auxiliarySpace: 'O(log N)',
  },
  analogy:
    'Como organizar una fila de personas por estatura eligiendo a una persona como punto de referencia (el pivote): pones a todas las personas más bajas a su izquierda y a todas las más altas a su derecha. En ese instante, la persona pivote ya está en su lugar definitivo exacto. Luego repites el mismo proceso con cada grupo.',
  inPlainWords:
    'Elige un elemento pivote (en este caso el último elemento del subarreglo). Recorre la memoria moviendo todos los valores menores que el pivote hacia la izquierda mediante el puntero i. Al finalizar la partición, inserta el pivote en su posición correcta y se invoca a sí mismo recursivamente sobre la mitad izquierda y derecha.',
  complexityExplanation:
    'En el caso promedio, cada partición divide el arreglo en dos mitades aproximadamente iguales, formando un árbol de recursión de altura log₂(N). En cada nivel del árbol se inspeccionan N elementos en total, resultando en O(N log N). En el peor caso (arreglo ya ordenado con pivote extremo), el árbol tiene altura N, alcanzando O(N²).',
  edgeCases: [
    'Arreglo ya ordenado con pivote fijo en extremo (peor caso O(N²))',
    'Todos los elementos con claves idénticas',
    'Subarreglos de tamaño <= 1 (caso base de retorno inmediato)',
  ],
};

export const quickSortModule: AlgorithmDefinition = {
  metadata: QUICK_SORT_METADATA,
  generateTrace: generateQuickSortTrace,
  code: QUICK_SORT_CODE,
  technicalSheet: QUICK_SORT_TECHNICAL_SHEET,
};
