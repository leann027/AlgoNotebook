/**
 * AlgoNotebook — 0/1 Knapsack Dynamic Programming Algorithm Module
 *
 * Exporta el contrato unificado AlgorithmDefinition (AlgorithmModule),
 * metadatos pedagógicos, código fuente en C99 / Python 3, ficha técnica
 * y generador puro de trazas para la Mochila 0/1.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateKnapsackTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateKnapsackTrace };

export const KNAPSACK_METADATA: AlgorithmMetadata = {
  id: 'knapsack-dp',
  name: 'Mochila 0/1 (Knapsack DP)',
  category: 'dp',
  figureId: 'FIG 6.1: 0/1 KNAPSACK DYNAMIC PROGRAMMING TABLE',
  viewportType: 'matrix',
  timeComplexity: {
    best: 'O(N · W)',
    average: 'O(N · W)',
    worst: 'O(N · W)',
  },
  spaceComplexity: 'O(N · W) DP Table',
  description:
    'Dynamic programming algorithm solving the 0/1 Knapsack problem via bottom-up 2D tabulation and backtracking.',
};

export const KNAPSACK_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const KNAPSACK_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Maximizar el valor total acumulado dentro de una mochila con capacidad de peso finita W, seleccionando un subconjunto óptimo de N objetos indivisibles (donde cada objeto puede ser tomado 0 o 1 vez).',
  mechanism: [
    'Subestructura Óptima: La solución óptima al subproblema dp[i][w] se compone directamente de las soluciones óptimas de subproblemas más pequeños con i-1 objetos.',
    'Superposición de Subproblemas: Múltiples combinaciones de decisiones convergen en la misma capacidad residual w, permitiendo memorizar y reutilizar cálculos previos sin recomputación exponencial.',
    'Ecuación de Recurrencia de Bellman: Si wt[i-1] <= w, dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]]); de lo contrario, dp[i][w] = dp[i-1][w].',
    'Tabulación Bottom-Up: Se llena sistemáticamente una cuadrícula bidimensional de dimensiones (N+1) x (W+1), resolviendo primero capacidades menores y conjuntos reducidos de objetos.',
    'Reconstrucción por Retroceso (Backtracking): Iniciando desde la celda destino dp[N][W], si dp[i][w] != dp[i-1][w], el objeto i-1 formó parte de la mochila; se descuenta su peso y se retrocede a la fila i-1.',
  ],
  loopInvariant:
    'Al finalizar la iteración externa i, cada celda dp[i][w] para toda capacidad 0 <= w <= W contiene el valor máximo exacto alcanzable considerando exclusivamente un subconjunto de los primeros i objetos.',
  properties: {
    paradigm: 'Programación Dinámica (Tabulación Bottom-Up)',
    isInPlace: false,
    isStable: true,
  },
  complexity: {
    best: 'O(N · W)',
    average: 'O(N · W)',
    worst: 'O(N · W) (Pseudopolinomial en el valor de W)',
    auxiliarySpace: 'O(N · W) para la tabla 2D completa con reconstrucción de ítems',
  },
  analogy:
    'Como preparar una mochila de expedición con límite de peso estricto: para cada objeto valioso debes tomar una decisión binaria: "¿Vale la pena cargarlo ocupando su peso, o es mejor dejarlo y conservar ese espacio para la mejor combinación posible de objetos anteriores?".',
  inPlainWords:
    'Construye una matriz de cálculo donde las filas son los objetos (0 a N) y las columnas las capacidades de peso disponibles (0 a W). Para cada celda dp[i][w], compara dos alternativas: NO incluir el objeto (copiar dp[i-1][w]) o SÍ incluirlo (sumar su valor al óptimo con la capacidad restante dp[i-1][w - peso]). Guarda siempre la mejor de las dos opciones.',
  complexityExplanation:
    'Llena sistemáticamente una cuadrícula bidimensional de (N + 1) filas por (W + 1) columnas. Dado que el cálculo de cada celda se realiza en tiempo constante O(1), el tiempo total y la memoria espacial son directamente proporcionales a N × W (complejidad pseudo-polinomial).',
  edgeCases: [
    'Capacidad de mochila W = 0: Toda la columna 0 permanece en valor 0 (ningún objeto cabe).',
    'Sin objetos disponibles (N = 0): Toda la fila 0 permanece en valor 0 (conjunto vacío).',
    'Objetos con peso mayor a la capacidad total (wt[i] > W): El objeto nunca puede ser incluido y hereda siempre el valor de la fila superior.',
    'Pesos idénticos o valores iguales: El operador max resuelve empates preservando la primera mejor alternativa de forma determinista.',
    'Capacidades fraccionarias o no enteras: Requiere formulación Greedy (Mochila Fraccionaria) en lugar de DP 0/1.',
  ],
};

export const knapsackModule: AlgorithmDefinition = {
  metadata: KNAPSACK_METADATA,
  generateTrace: generateKnapsackTrace,
  code: KNAPSACK_CODE,
  technicalSheet: KNAPSACK_TECHNICAL_SHEET,
};

