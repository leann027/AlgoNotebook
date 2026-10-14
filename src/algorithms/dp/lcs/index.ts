/**
 * AlgoNotebook — Longest Common Subsequence (LCS) Dynamic Programming Algorithm Module
 *
 * Exporta el contrato unificado AlgorithmDefinition (AlgorithmModule),
 * metadatos pedagógicos, código fuente en C99 / Python 3, ficha técnica
 * y generador puro de trazas para la Subsecuencia Común Más Larga.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateLCSTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateLCSTrace };

export const LCS_METADATA: AlgorithmMetadata = {
  id: 'lcs-dp',
  name: 'LCS (Subsecuencia Común)',
  category: 'dp',
  figureId: 'FIG 8.1: LONGEST COMMON SUBSEQUENCE 2D DP',
  viewportType: 'matrix',
  timeComplexity: {
    best: 'O(M · N)',
    average: 'O(M · N)',
    worst: 'O(M · N)',
  },
  spaceComplexity: 'O(M · N) DP Table',
  description:
    'Dynamic programming algorithm solving the Longest Common Subsequence problem via bottom-up 2D tabulation and optimal diagonal backtracking.',
};

export const LCS_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const LCS_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Encontrar la subsecuencia de máxima longitud presente en ambas cadenas (S1="AGGTAB" y S2="GXTXAYB") preservando el orden relativo de los caracteres sin exigir contigüidad física.',
  mechanism: [
    'Subestructura Óptima: La solución óptima para los prefijos S1[1..i] y S2[1..j] se compone directamente de subproblemas menores: (i-1, j-1) si hay coincidencia de caracteres, o max(dp[i-1][j], dp[i][j-1]) en caso contrario.',
    'Superposición de Subproblemas: Diferentes ramas de bifurcación convergen en las mismas comparaciones de prefijos; memorizarlos en una tabla 2D evita recomputaciones de tiempo exponencial 2^(M+N).',
    'Ecuación de Recurrencia: Si S1[i-1] == S2[j-1], entonces dp[i][j] = dp[i-1][j-1] + 1; de lo contrario, dp[i][j] = max(dp[i-1][j], dp[i][j-1]).',
    'Tabulación Bottom-Up: Se llena sistemáticamente una cuadrícula bidimensional de (M+1) x (N+1) celdas, iniciando con fila 0 y columna 0 en 0 (casos base de cadena vacía).',
    'Reconstrucción por Retroceso (Backtracking): Comenzando en dp[M][N], cuando los caracteres coinciden se incluye el carácter en la solución y se retrocede diagonalmente; de lo contrario, se avanza hacia la celda adyacente de mayor valor.',
  ],
  loopInvariant:
    'Al finalizar la celda (i, j), el valor dp[i][j] contiene con exactitud la longitud de la subsecuencia común más larga considerando exclusivamente los prefijos S1[0..i-1] y S2[0..j-1].',
  properties: {
    paradigm: 'Programación Dinámica (Tabulación Bottom-Up)',
    isInPlace: false,
    isStable: true,
  },
  complexity: {
    best: 'O(M · N)',
    average: 'O(M · N)',
    worst: 'O(M · N)',
    auxiliarySpace: 'O(M · N) para la tabla de tabulación bidimensional completa',
  },
  analogy:
    'Como comparar dos transcripciones históricas del mismo evento: cuando un mismo hecho aparece en ambas líneas temporales, se conecta un hito común; cuando difieren, se explora cuál de los dos relatos conserva la mayor cantidad acumulada de hechos compartidos.',
  inPlainWords:
    'Construye una cuadrícula donde las filas son los caracteres de la primera cadena y las columnas los de la segunda. En cada celda, si las letras coinciden, suma 1 a la diagonal superior izquierda; si no coinciden, toma el valor más grande entre la celda superior y la izquierda. Al terminar, retrocede desde la esquina final para reconstruir la palabra resultante.',
  complexityExplanation:
    'La matriz posee (M + 1) filas y (N + 1) columnas. El cálculo de cada celda se realiza en tiempo constante O(1) evaluando igualdad o un operador max. Por tanto, el tiempo de tabulación es O(M · N). La fase posterior de backtracking recorre a lo sumo M + N celdas, resultando en una complejidad global estricta de O(M · N) tiempo y O(M · N) espacio.',
  edgeCases: [
    'Cadenas idénticas (S1 = S2): La LCS es la cadena completa (longitud M = N) con todos los pasos en diagonal.',
    'Cadenas disjuntas sin caracteres compartidos: Todas las celdas resultan en 0 (LCS vacía "").',
    'Una o ambas cadenas vacías (M = 0 o N = 0): Se reduce al caso base directo de longitud 0.',
    'Caracteres repetidos continuos: La recurrencia garantiza seleccionar la subsecuencia globalmente óptima sin duplicación inválida.',
    'Múltiples subsecuencias óptimas empatadas: La convención de desempate determina de forma determinista cuál de las variantes válidas se reconstruye.',
  ],
};

export const lcsModule: AlgorithmDefinition = {
  metadata: LCS_METADATA,
  generateTrace: generateLCSTrace,
  code: LCS_CODE,
  technicalSheet: LCS_TECHNICAL_SHEET,
};

