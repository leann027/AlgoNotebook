/**
 * AlgoNotebook — Distancia de Levenshtein (Programación Dinámica 2D) Module
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
import { generateLevenshteinTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateLevenshteinTrace };

export const LEVENSHTEIN_METADATA: AlgorithmMetadata = {
  id: 'levenshtein-distance',
  name: 'Distancia de Levenshtein',
  category: 'dp',
  figureId: 'FIG 13.1: 2D MATRIX DYNAMIC PROGRAMMING EDIT DISTANCE',
  viewportType: 'matrix',
  timeComplexity: {
    best: 'O(M · N)',
    average: 'O(M · N)',
    worst: 'O(M · N)',
  },
  spaceComplexity: 'O(M · N) Matriz Tabular',
  description:
    'Cálculo matricial de la distancia de edición mínima entre dos secuencias de texto mediante tabulación bidimensional bottom-up y retroceso para alineamiento óptimo.',
};

export const LEVENSHTEIN_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const LEVENSHTEIN_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Calcular el número mínimo de operaciones elementales de edición (inserción, eliminación o sustitución de caracteres individuales) requeridas para transformar una cadena de origen en una cadena de destino.',
  mechanism: [
    'Construir una tabla matricial DP de dimensiones (M + 1) x (N + 1), donde D[i, j] representa la distancia entre los prefijos S1[0 .. i-1] y S2[0 .. j-1].',
    'Inicializar la primera fila con D[0, j] = j (j inserciones) y la primera columna con D[i, 0] = i (i eliminaciones).',
    'Iterar por filas y columnas: si los caracteres coinciden (S1[i-1] == S2[j-1]), D[i, j] = D[i-1, j-1] sin costo adicional.',
    'Si los caracteres difieren, D[i, j] = 1 + min(D[i-1, j], D[i, j-1], D[i-1, j-1]), representando eliminación, inserción y sustitución respectivamente.',
    'El valor final en la esquina inferior derecha D[M, N] es la distancia de edición mínima.',
    'Reconstruir la traza de operaciones óptimas mediante retroceso (backtracking) desde D[M, N] hasta D[0, 0].',
  ],
  loopInvariant:
    'La celda D[i, j] almacena el costo mínimo exacto de transformar el prefijo S1[0 .. i-1] en el prefijo S2[0 .. j-1] mediante operaciones elementales de edición.',
  properties: {
    paradigm: 'Programación Dinámica Tabular Bidimensional',
    isInPlace: false,
    isStable: true,
  },
  complexity: {
    best: 'O(M · N) (requiere evaluar cada celda de la matriz)',
    average: 'O(M · N)',
    worst: 'O(M · N)',
    auxiliarySpace: 'O(M · N) para la matriz completa y reconstrucción de camino',
  },
  analogy:
    'Como el corrector ortográfico de un procesador de texto: cuando cometes un error tipográfico, calcula instantáneamente cuántas teclas pulsadas de más, de menos o erróneas te separan de las palabras más cercanas del diccionario.',
  inPlainWords:
    'Llena una cuadrícula cruzando las dos palabras letra por letra. En cada casilla mira las tres casillas vecinas (arriba, izquierda y diagonal) y elige la opción que cueste menos operaciones. La última casilla te da el total de cambios necesarios.',
  complexityExplanation:
    'La matriz contiene exactamente (M+1) x (N+1) celdas. Cada celda realiza 3 accesos a memoria y una selección de mínimo en tiempo O(1). La complejidad temporal y espacial total es Theta(M · N).',
  edgeCases: [
    'Una de las cadenas está vacía: la distancia es exactamente la longitud de la otra cadena (M o N)',
    'Ambas cadenas son idénticas: la diagonal principal mantiene costo 0 sin operaciones requeridas',
    'Cadenas completamente disjuntas sin caracteres comunes: la distancia coincide con max(M, N) sustituciones e inserciones',
    'Cadenas de longitudes muy dispares: la matriz se expande asimétricamente reflejando inserciones acumuladas',
  ],
};

export const levenshteinModule: AlgorithmDefinition = {
  metadata: LEVENSHTEIN_METADATA,
  generateTrace: generateLevenshteinTrace,
  code: LEVENSHTEIN_CODE,
  technicalSheet: LEVENSHTEIN_TECHNICAL_SHEET,
};
