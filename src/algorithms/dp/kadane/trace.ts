/**
 * AlgoNotebook — Kadane's Maximum Subarray Sum Pure Trace Generator
 *
 * Traza pedagógica paso a paso del algoritmo de Kadane en O(N) tiempo y O(1) espacio.
 * Resalta la ventana contigua activa frente a la ventana óptima global.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  ComparisonDetails,
} from '../../../core/types';

export const DEFAULT_KADANE_ARRAY: readonly number[] = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

interface RawFrame {
  highlightLines: {
    c: number[];
    python: number[];
  };
  arrayState: number[];
  elementStates: Record<number, ElementState>;
  pointers: Record<string, number>;
  activeAction: ActiveAction;
  comparison?: ComparisonDetails;
  explanation: {
    text: string;
    subNote?: string;
  };
  metrics: {
    comparisons: number;
    swaps: number;
    passNumber: number;
    totalPasses?: number;
    maxComparisons?: number;
  };
}

export function generateKadaneTrace(initialArray?: number[]): TraceFrame[] {
  const arr = Array.isArray(initialArray) && initialArray.length > 0
    ? [...initialArray]
    : [...DEFAULT_KADANE_ARRAY];

  const n = arr.length;
  const rawFrames: RawFrame[] = [];

  let currentSum = arr[0];
  let maxSum = arr[0];
  let bestStart = 0;
  let bestEnd = 0;
  let tempStart = 0;
  let comparisonsCount = 0;

  // Frame 1: Inicialización
  rawFrames.push({
    highlightLines: { c: [11, 12, 13, 14], python: [9, 10, 11, 12, 13] },
    arrayState: [...arr],
    elementStates: Object.fromEntries(
      arr.map((_, i) => [i, i === 0 ? 'pointer' : 'default'])
    ),
    pointers: { i: 0, winStart: 0, bestStart: 0, bestEnd: 0 },
    activeAction: 'idle',
    explanation: {
      text: `Iniciando Algoritmo de Kadane. Caso base i=0: arr[0] = ${arr[0]}.`,
      subNote: `current_sum = ${currentSum}, max_sum = ${maxSum}. Ventana activa inicial: [0..0].`,
    },
    metrics: {
      comparisons: 0,
      swaps: 0,
      passNumber: 1,
    },
  });

  for (let i = 1; i < n; i++) {
    const val = arr[i];
    comparisonsCount++;

    const extendSum = currentSum + val;
    const shouldRestart = val > extendSum;

    // Frame: Evaluación de la ecuación de Bellman M[i] = max(A[i], M[i-1] + A[i])
    rawFrames.push({
      highlightLines: { c: [17, 18, 19], python: [17, 18, 19] },
      arrayState: [...arr],
      elementStates: Object.fromEntries(
        arr.map((_, idx) => [
          idx,
          idx === i
            ? 'comparing'
            : idx >= tempStart && idx < i
            ? 'pointer'
            : idx >= bestStart && idx <= bestEnd
            ? 'sorted'
            : 'default',
        ])
      ),
      pointers: { i, winStart: tempStart, bestStart, bestEnd },
      activeAction: 'compare',
      comparison: {
        leftIndex: i,
        rightIndex: tempStart,
        leftValue: val,
        rightValue: extendSum,
        conditionMet: shouldRestart,
      },
      explanation: {
        text: `Paso i=${i} (valor ${val}): ¿Conviene reiniciar la ventana en arr[${i}] (${val}) o extenderla (${extendSum})?`,
        subNote: shouldRestart
          ? `Reiniciar ventana: el valor aislado ${val} es mayor que la suma acumulada extendida (${extendSum}). Nueva ventana desde índice ${i}.`
          : `Extender ventana: la suma acumulada previa beneficia el total (${extendSum} >= ${val}). Ventana extendida a [${tempStart}..${i}].`,
      },
      metrics: {
        comparisons: comparisonsCount,
        swaps: 0,
        passNumber: i + 1,
      },
    });

    if (shouldRestart) {
      currentSum = val;
      tempStart = i;
    } else {
      currentSum = extendSum;
    }

    // Frame: Comparación con el óptimo global max_sum
    comparisonsCount++;
    const isNewGlobalMax = currentSum > maxSum;

    rawFrames.push({
      highlightLines: { c: [25, 26, 27, 28], python: [24, 25, 26, 27] },
      arrayState: [...arr],
      elementStates: Object.fromEntries(
        arr.map((_, idx) => [
          idx,
          isNewGlobalMax && idx >= tempStart && idx <= i
            ? 'sorted'
            : idx >= tempStart && idx <= i
            ? 'comparing'
            : idx >= bestStart && idx <= bestEnd
            ? 'sorted'
            : 'default',
        ])
      ),
      pointers: {
        i,
        winStart: tempStart,
        bestStart: isNewGlobalMax ? tempStart : bestStart,
        bestEnd: isNewGlobalMax ? i : bestEnd,
      },
      activeAction: isNewGlobalMax ? 'locked' : 'idle',
      comparison: {
        leftIndex: i,
        rightIndex: bestEnd,
        leftValue: currentSum,
        rightValue: maxSum,
        conditionMet: isNewGlobalMax,
      },
      explanation: {
        text: `¿Ventana activa sum=${currentSum} supera el récord global max_sum=${maxSum}? ${isNewGlobalMax ? '¡NUEVO RÉCORD GLOBAL!' : 'No supera el récord'}.`,
        subNote: isNewGlobalMax
          ? `Actualizando máximo global: max_sum = ${currentSum}, intervalo óptimo = [${tempStart}..${i}].`
          : `Récord conservado: max_sum = ${maxSum} en [${bestStart}..${bestEnd}].`,
      },
      metrics: {
        comparisons: comparisonsCount,
        swaps: 0,
        passNumber: i + 1,
      },
    });

    if (isNewGlobalMax) {
      maxSum = currentSum;
      bestStart = tempStart;
      bestEnd = i;
    }
  }

  // Frame Final: Resultado definitivo
  rawFrames.push({
    highlightLines: { c: [32, 33, 34], python: [29] },
    arrayState: [...arr],
    elementStates: Object.fromEntries(
      arr.map((_, idx) => [
        idx,
        idx >= bestStart && idx <= bestEnd ? 'sorted' : 'default',
      ])
    ),
    pointers: { bestStart, bestEnd },
    activeAction: 'locked',
    explanation: {
      text: `Algoritmo de Kadane finalizado en O(N): Máxima subsuma contigua = ${maxSum}.`,
      subNote: `Subarreglo óptimo: arr[${bestStart} .. ${bestEnd}] = [${arr.slice(bestStart, bestEnd + 1).join(', ')}]. Espacio auxiliar: O(1).`,
    },
    metrics: {
      comparisons: comparisonsCount,
      swaps: 0,
      passNumber: n,
    },
  });

  const totalSteps = rawFrames.length;

  return rawFrames.map((rf, idx) => ({
    stepIndex: idx + 1,
    totalSteps,
    highlightLines: rf.highlightLines,
    arrayState: rf.arrayState,
    elementStates: rf.elementStates,
    pointers: rf.pointers,
    activeAction: rf.activeAction,
    comparison: rf.comparison,
    explanation: {
      stepLabel: `Paso ${idx + 1} de ${totalSteps}:`,
      text: rf.explanation.text,
      subNote: rf.explanation.subNote,
    },
    metrics: {
      comparisons: rf.metrics.comparisons,
      swaps: 0,
      passNumber: rf.metrics.passNumber,
      totalPasses: n,
      maxComparisons: n * 2,
    },
  }));
}
