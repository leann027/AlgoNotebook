/**
 * AlgoNotebook — Binary Search Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Manejo de punteros: low, mid, high y clave objetivo target.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  ComparisonDetails,
} from '../../../core/types';

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

export function generateBinarySearchTrace(initialArray: number[]): TraceFrame[] {
  if (!Array.isArray(initialArray) || initialArray.length === 0) {
    return [];
  }

  // Búsqueda binaria requiere arreglo ordenado: ordenamos una copia inmutable
  const sorted = [...initialArray].sort((a, b) => a - b);
  const n = sorted.length;
  const rawFrames: RawFrame[] = [];

  // Elegimos un target presente en el arreglo para visualización didáctica completa
  // (por defecto el valor en la posición 5 o en el tercio final, o 42 si existe)
  const targetIndex = sorted.includes(42)
    ? sorted.indexOf(42)
    : Math.min(n - 1, Math.max(0, Math.floor(n * 0.65)));
  const target = sorted[targetIndex];

  let low = 0;
  let high = n - 1;
  let iterations = 0;
  let comparisonsCount = 0;

  // Frame 1: Inicialización
  rawFrames.push({
    highlightLines: { c: [4, 5], python: [2, 3] },
    arrayState: [...sorted],
    elementStates: Object.fromEntries(sorted.map((_, i) => [i, 'default'])),
    pointers: { low: 0, high: n - 1 },
    activeAction: 'idle',
    explanation: {
      text: `Iniciando Búsqueda Binaria. Clave objetivo: target = ${target}.`,
      subNote: `Rango inicial completo: [low=0 .. high=${n - 1}]. Arreglo previamente ordenado.`,
    },
    metrics: {
      comparisons: 0,
      swaps: 0,
      passNumber: 0,
    },
  });

  let foundIndex = -1;

  while (low <= high) {
    iterations++;
    const mid = Math.floor(low + (high - low) / 2);
    const midVal = sorted[mid];

    // Frame: Evaluación de condición del bucle y cálculo de mid
    rawFrames.push({
      highlightLines: { c: [7, 8], python: [5, 6] },
      arrayState: [...sorted],
      elementStates: Object.fromEntries(
        sorted.map((_, i) => [
          i,
          i === mid
            ? 'pointer'
            : i >= low && i <= high
            ? 'default'
            : 'default',
        ])
      ),
      pointers: { low, mid, high },
      activeAction: 'pivot',
      explanation: {
        text: `Iteración #${iterations}: Evaluando punto medio mid = ${mid} (valor: ${midVal}).`,
        subNote: `Rango activo: [${low}..${high}]. mid = ${low} + (${high} - ${low}) / 2 = ${mid}.`,
      },
      metrics: {
        comparisons: comparisonsCount,
        swaps: 0,
        passNumber: iterations,
      },
    });

    // Frame: Comparación de igualdad arr[mid] == target
    comparisonsCount++;
    const isEqual = midVal === target;

    rawFrames.push({
      highlightLines: { c: [10], python: [8] },
      arrayState: [...sorted],
      elementStates: Object.fromEntries(
        sorted.map((_, i) => [
          i,
          i === mid
            ? 'comparing'
            : i >= low && i <= high
            ? 'default'
            : 'default',
        ])
      ),
      pointers: { low, mid, high },
      activeAction: 'compare',
      comparison: {
        leftIndex: mid,
        rightIndex: targetIndex,
        leftValue: midVal,
        rightValue: target,
        conditionMet: isEqual,
      },
      explanation: {
        text: `Comparando: ¿arr[mid=${mid}] (${midVal}) == target (${target})?`,
        subNote: isEqual
          ? '¡Coincidencia exacta encontrada!'
          : `No coinciden. Evaluando si arr[mid] (${midVal}) < target (${target}).`,
      },
      metrics: {
        comparisons: comparisonsCount,
        swaps: 0,
        passNumber: iterations,
      },
    });

    if (isEqual) {
      foundIndex = mid;
      // Frame: Retorno exitoso
      rawFrames.push({
        highlightLines: { c: [11], python: [9] },
        arrayState: [...sorted],
        elementStates: Object.fromEntries(
          sorted.map((_, i) => [
            i,
            i === mid ? 'sorted' : 'default',
          ])
        ),
        pointers: { mid },
        activeAction: 'locked',
        explanation: {
          text: `¡Elemento encontrado con éxito en el índice ${mid}! Retornando ${mid}.`,
          subNote: `Búsqueda logarítmica O(log N) finalizada en ${comparisonsCount} comparaciones.`,
        },
        metrics: {
          comparisons: comparisonsCount,
          swaps: 0,
          passNumber: iterations,
        },
      });
      break;
    }

    // Frame: Comparación de menor arr[mid] < target
    comparisonsCount++;
    const isLess = midVal < target;

    rawFrames.push({
      highlightLines: { c: [14], python: [11] },
      arrayState: [...sorted],
      elementStates: Object.fromEntries(
        sorted.map((_, i) => [
          i,
          i === mid ? 'comparing' : 'default',
        ])
      ),
      pointers: { low, mid, high },
      activeAction: 'compare',
      comparison: {
        leftIndex: mid,
        rightIndex: targetIndex,
        leftValue: midVal,
        rightValue: target,
        conditionMet: isLess,
      },
      explanation: {
        text: `¿arr[mid=${mid}] (${midVal}) < target (${target})? ${isLess ? 'SÍ' : 'NO'}.`,
        subNote: isLess
          ? `Como ${midVal} < ${target}, la clave debe estar en la mitad derecha: low = ${mid + 1}.`
          : `Como ${midVal} > ${target}, la clave debe estar en la mitad izquierda: high = ${mid - 1}.`,
      },
      metrics: {
        comparisons: comparisonsCount,
        swaps: 0,
        passNumber: iterations,
      },
    });

    if (isLess) {
      low = mid + 1;
      rawFrames.push({
        highlightLines: { c: [15], python: [12] },
        arrayState: [...sorted],
        elementStates: Object.fromEntries(
          sorted.map((_, i) => [
            i,
            i >= low && i <= high ? 'default' : 'default',
          ])
        ),
        pointers: { low, high },
        activeAction: 'idle',
        explanation: {
          text: `Actualizando límite inferior: low = ${low}. Descartando subarreglo izquierdo [0..${mid}].`,
          subNote: `Nuevo rango de búsqueda activo: [${low}..${high}].`,
        },
        metrics: {
          comparisons: comparisonsCount,
          swaps: 0,
          passNumber: iterations,
        },
      });
    } else {
      high = mid - 1;
      rawFrames.push({
        highlightLines: { c: [17], python: [14] },
        arrayState: [...sorted],
        elementStates: Object.fromEntries(
          sorted.map((_, i) => [
            i,
            i >= low && i <= high ? 'default' : 'default',
          ])
        ),
        pointers: { low, high },
        activeAction: 'idle',
        explanation: {
          text: `Actualizando límite superior: high = ${high}. Descartando subarreglo derecho [${mid}..${n - 1}].`,
          subNote: `Nuevo rango de búsqueda activo: [${low}..${high}].`,
        },
        metrics: {
          comparisons: comparisonsCount,
          swaps: 0,
          passNumber: iterations,
        },
      });
    }
  }

  if (foundIndex === -1) {
    rawFrames.push({
      highlightLines: { c: [21], python: [16] },
      arrayState: [...sorted],
      elementStates: Object.fromEntries(sorted.map((_, i) => [i, 'default'])),
      pointers: {},
      activeAction: 'idle',
      explanation: {
        text: `Rango agotado (low > high). La clave ${target} no se encuentra en el arreglo.`,
        subNote: 'Retornando -1 (clave inexistente).',
      },
      metrics: {
        comparisons: comparisonsCount,
        swaps: 0,
        passNumber: iterations,
      },
    });
  }

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
      totalPasses: iterations,
      maxComparisons: Math.ceil(Math.log2(n + 1)) * 2,
    },
  }));
}
