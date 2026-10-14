/**
 * AlgoNotebook — Cambio de Monedas (Coin Change DP) Algorithm Module
 *
 * Exporta el contrato unificado AlgorithmDefinition (AlgorithmModule),
 * metadatos pedagógicos, código fuente en C99 / Python 3, ficha técnica
 * y generador puro de trazas de matriz 2D DP.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateCoinChangeTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateCoinChangeTrace };

export const COIN_CHANGE_METADATA: AlgorithmMetadata = {
  id: 'coin-change-dp',
  name: 'Cambio de Monedas (DP)',
  category: 'dp',
  figureId: 'FIG 8.2: COIN CHANGE 2D DP VS GREEDY',
  viewportType: 'matrix',
  timeComplexity: {
    best: 'O(N · M)',
    average: 'O(N · M)',
    worst: 'O(N · M)',
  },
  spaceComplexity: 'O(N · M) Matriz DP',
  description:
    'Optimal coin change minimization demonstrating greedy strategy failure and dynamic programming optimality.',
};

export const COIN_CHANGE_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const COIN_CHANGE_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Determinar el número mínimo de monedas necesarias para formar una cantidad objetivo utilizando denominaciones predefinidas con suministro infinito.',
  mechanism: [
    'Construir una tabla bidimensional dp[i][j] donde i representa las monedas disponibles y j el monto acumulado de 0 a M.',
    'Establecer casos base: monto 0 requiere 0 monedas (dp[i][0] = 0); 0 monedas para montos mayores es imposible (dp[0][j] = ∞).',
    'Para cada celda: si el monto j es menor que la moneda actual, heredar el valor superior dp[i-1][j].',
    'En caso contrario, tomar el mínimo entre excluir la moneda (dp[i-1][j]) e incluirla (1 + dp[i][j - moneda]).',
    'Reconstruir la solución óptima mediante retroceso (backtracking) desde dp[N][M].',
  ],
  loopInvariant:
    'Para cada celda evaluada (i, j), dp[i][j] contiene estrictamente la cantidad mínima global de monedas de entre las primeras i denominaciones requeridas para formar la cantidad exacta j.',
  properties: {
    paradigm: 'Programación Dinámica / Tabulación Bottom-Up',
    isInPlace: false,
    isStable: true,
  },
  complexity: {
    best: 'O(N · M)',
    average: 'O(N · M)',
    worst: 'O(N · M)',
    auxiliarySpace: 'O(N · M)',
  },
  edgeCases: [
    'Monto 0: requiere exactamente 0 monedas.',
    'Monto inalcanzable: si las denominaciones no permiten sumar el valor objetivo, retorna -1 / ∞.',
    'Fallo de la estrategia Greedy: para denominaciones no canónicas (ej. [1, 3, 4] y monto 6), Greedy falla (4+1+1=3 vs 3+3=2).',
  ],
  analogy:
    'Máquina expendedora de cambio que evalúa todas las combinaciones posibles en vez de simplemente entregar la moneda más grande disponible.',
};

export const coinChangeModule: AlgorithmDefinition = {
  metadata: COIN_CHANGE_METADATA,
  code: COIN_CHANGE_CODE,
  generateTrace: (input?: number[]) => generateCoinChangeTrace(input),
  technicalSheet: COIN_CHANGE_TECHNICAL_SHEET,
};

