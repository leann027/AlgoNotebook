/**
 * AlgoNotebook — Algoritmo de Kadane Module
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
import { generateKadaneTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateKadaneTrace };

export const KADANE_METADATA: AlgorithmMetadata = {
  id: 'kadane',
  name: 'Algoritmo de Kadane',
  category: 'dp',
  figureId: 'FIG 9.1: MAXIMUM CONTIGUOUS SUBARRAY WINDOW DP',
  viewportType: 'linear',
  timeComplexity: {
    best: 'O(N)',
    average: 'O(N)',
    worst: 'O(N)',
  },
  spaceComplexity: 'O(1) In-Place',
  description:
    'Cálculo de la subsecuencia contigua de suma máxima en tiempo lineal estricto O(N) y espacio auxiliar O(1) mediante programación dinámica escalar.',
};

export const KADANE_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const KADANE_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Determinar el subarreglo contiguo no vacío dentro de un arreglo unidimensional de números reales o enteros cuya suma de elementos sea máxima.',
  mechanism: [
    'Inicializar current_sum y max_sum con el primer elemento arr[0].',
    'Iterar secuencialmente desde el índice 1 hasta n - 1.',
    'En cada posición i, decidir localmente si reiniciar la ventana (arr[i]) o extender la ventana acumulada previa (current_sum + arr[i]), satisfaciendo la ecuación de Bellman M[i] = max(A[i], M[i-1] + A[i]).',
    'Actualizar el máximo histórico global max_sum = max(max_sum, current_sum) y actualizar los límites de la ventana óptima.',
    'Al finalizar la pasada lineal única, retornar max_sum y el intervalo [start .. end].',
  ],
  loopInvariant:
    'Al finalizar la iteración i, current_sum contiene el valor exacto de la máxima subsuma de cualquier subarreglo contiguo que termine estrictamente en el índice i, y max_sum contiene la máxima subsuma de cualquier subarreglo contenido en arr[0 .. i].',
  properties: {
    paradigm: 'Programación Dinámica Escalar / Ventana Deslizante',
    isInPlace: true,
    isStable: true,
  },
  complexity: {
    best: 'O(N) (una única pasada lineal incondicional)',
    average: 'O(N)',
    worst: 'O(N)',
    auxiliarySpace: 'O(1) (variables escalares auxiliares)',
  },
  analogy:
    'Como evaluar una racha financiera de ganancias y pérdidas diarias: si tus pérdidas acumuladas previas son tan grandes que arrastran tu saldo por debajo de cero, es financieramente óptimo declarar quiebra técnica y reiniciar la cuenta desde el ingreso del día presente.',
  inPlainWords:
    'Recorre el arreglo sumando números. Si en algún momento la suma acumulada se vuelve menor que el número actual solo, descarta el pasado y empieza una nueva suma desde ahí. Simultáneamente va guardando el récord más alto alcanzado.',
  complexityExplanation:
    'Evalúa exactamente cada elemento una única vez realizando comparaciones en tiempo constante O(1). No requiere memoria tabular multidimensional ya que el estado en la posición i depende exclusivamente del estado escalar en i - 1. Recurrencia T(n) = T(n-1) + Theta(1) = Theta(n).',
  edgeCases: [
    'Todos los números negativos: el algoritmo retorna el número negativo de menor valor absoluto (el máximo)',
    'Todos los números positivos: la ventana óptima abarca el arreglo completo [0 .. n-1]',
    'Arreglo de un solo elemento (n = 1): retorna inmediatamente arr[0]',
    'Presencia de ceros intermedios: no alteran la suma pero extienden la longitud de la ventana óptima',
  ],
};

export const kadaneModule: AlgorithmDefinition = {
  metadata: KADANE_METADATA,
  generateTrace: generateKadaneTrace,
  code: KADANE_CODE,
  technicalSheet: KADANE_TECHNICAL_SHEET,
};
