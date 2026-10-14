/**
 * AlgoNotebook — Merge Sort Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Manejo recursivo de pila simulada `callStack: StackFrame[]`.
 * - Algoritmo divide y vencerás estable con buffer auxiliar.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  StackFrame,
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
  callStack?: StackFrame[];
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

function buildElementStates(
  length: number,
  sortedIndices: Set<number>,
  overrides?: Record<number, ElementState>
): Record<number, ElementState> {
  const states: Record<number, ElementState> = {};
  for (let k = 0; k < length; k++) {
    if (overrides && k in overrides) {
      states[k] = overrides[k];
    } else if (sortedIndices.has(k)) {
      states[k] = 'sorted';
    } else {
      states[k] = 'default';
    }
  }
  return states;
}

export function generateMergeSortTrace(initialArray: number[]): TraceFrame[] {
  if (!Array.isArray(initialArray) || initialArray.length === 0) {
    return [];
  }

  const arr = [...initialArray];
  const n = arr.length;
  const rawFrames: RawFrame[] = [];
  const sortedIndices = new Set<number>();
  const callStack: StackFrame[] = [];

  let comparisonsCount = 0;
  let writesCount = 0;
  let passNumber = 0;
  let stackIdCounter = 0;

  function pushCall(functionName: string, args: Record<string, number | string>) {
    stackIdCounter++;
    for (const f of callStack) f.isActive = false;
    callStack.push({
      id: `frame-${stackIdCounter}`,
      functionName,
      args,
      isActive: true,
    });
  }

  function popCall() {
    callStack.pop();
    if (callStack.length > 0) {
      callStack[callStack.length - 1].isActive = true;
    }
  }

  // Frame 1: Inicialización
  rawFrames.push({
    highlightLines: { c: [34, 35], python: [27, 28] },
    arrayState: [...arr],
    elementStates: buildElementStates(n, sortedIndices),
    pointers: { left: 0, right: n - 1 },
    activeAction: 'idle',
    callStack: callStack.map((f) => ({ ...f })),
    explanation: {
      text: `Iniciando Merge Sort sobre un arreglo de ${n} elementos.`,
      subNote: 'Divide recursivamente el arreglo hasta subarreglos unitarios y luego fusiona ordenadamente.',
    },
    metrics: {
      comparisons: 0,
      swaps: 0,
      passNumber: 0,
    },
  });

  function mergeSort(left: number, right: number) {
    pushCall('merge_sort', { left, right });

    rawFrames.push({
      highlightLines: { c: [35], python: [28] },
      arrayState: [...arr],
      elementStates: buildElementStates(n, sortedIndices, {
        [left]: 'pointer',
        [right]: 'pointer',
      }),
      pointers: { left, right },
      activeAction: 'idle',
      callStack: callStack.map((f) => ({ ...f })),
      explanation: {
        text: `Llamada merge_sort(left=${left}, right=${right}). Subarreglo de ${right - left + 1} elementos.`,
        subNote: left < right ? 'Condición de división satisfecha: left < right.' : 'Caso base: subarreglo de tamaño 1.',
      },
      metrics: {
        comparisons: comparisonsCount,
        swaps: writesCount,
        passNumber,
      },
    });

    if (left < right) {
      const mid = Math.floor(left + (right - left) / 2);

      rawFrames.push({
        highlightLines: { c: [36], python: [29] },
        arrayState: [...arr],
        elementStates: buildElementStates(n, sortedIndices, {
          [left]: 'pointer',
          [mid]: 'pointer',
          [right]: 'pointer',
        }),
        pointers: { left, mid, right },
        activeAction: 'idle',
        callStack: callStack.map((f) => ({ ...f })),
        explanation: {
          text: `Punto medio calculado en mid = ${mid}.`,
          subNote: `División: parte izquierda [${left}..${mid}] y parte derecha [${mid + 1}..${right}].`,
        },
        metrics: {
          comparisons: comparisonsCount,
          swaps: writesCount,
          passNumber,
        },
      });

      // Recurse izquierda
      mergeSort(left, mid);

      // Recurse derecha
      mergeSort(mid + 1, right);

      // Fusionar
      merge(left, mid, right);
    } else {
      sortedIndices.add(left);
    }

    popCall();
  }

  function merge(left: number, mid: number, right: number) {
    passNumber++;
    pushCall('merge', { left, mid, right });

    const n1 = mid - left + 1;
    const n2 = right - mid;
    const L = arr.slice(left, mid + 1);
    const R = arr.slice(mid + 1, right + 1);

    rawFrames.push({
      highlightLines: { c: [1, 2, 3, 4, 6, 7], python: [1, 2, 3] },
      arrayState: [...arr],
      elementStates: buildElementStates(n, sortedIndices, {
        [left]: 'pointer',
        [mid]: 'pointer',
        [right]: 'pointer',
      }),
      pointers: { left, mid, right },
      activeAction: 'idle',
      callStack: callStack.map((f) => ({ ...f })),
      explanation: {
        text: `Fusión: merge(left=${left}, mid=${mid}, right=${right}).`,
        subNote: `Buffers auxiliares creados: L=[${L.join(', ')}] y R=[${R.join(', ')}].`,
      },
      metrics: {
        comparisons: comparisonsCount,
        swaps: writesCount,
        passNumber,
      },
    });

    let i = 0;
    let j = 0;
    let k = left;

    while (i < n1 && j < n2) {
      comparisonsCount++;
      const leftVal = L[i];
      const rightVal = R[j];
      const conditionMet = leftVal <= rightVal;

      rawFrames.push({
        highlightLines: { c: [10, 11], python: [8, 9] },
        arrayState: [...arr],
        elementStates: buildElementStates(n, sortedIndices, {
          [k]: 'comparing',
        }),
        pointers: { k, i, j },
        activeAction: 'compare',
        callStack: callStack.map((f) => ({ ...f })),
        comparison: {
          leftIndex: left + i,
          rightIndex: mid + 1 + j,
          leftValue: leftVal,
          rightValue: rightVal,
          conditionMet,
        },
        explanation: {
          text: `Comparando buffer L[i=${i}] (${leftVal}) con R[j=${j}] (${rightVal}).`,
          subNote: conditionMet
            ? `${leftVal} <= ${rightVal}: seleccionamos L[i] para arr[k=${k}].`
            : `${leftVal} > ${rightVal}: seleccionamos R[j] para arr[k=${k}].`,
        },
        metrics: {
          comparisons: comparisonsCount,
          swaps: writesCount,
          passNumber,
        },
      });

      if (conditionMet) {
        arr[k] = L[i];
        i++;
      } else {
        arr[k] = R[j];
        j++;
      }
      writesCount++;

      rawFrames.push({
        highlightLines: { c: [12, 13, 14, 15, 16], python: [10, 11, 12, 13, 14] },
        arrayState: [...arr],
        elementStates: buildElementStates(n, sortedIndices, {
          [k]: 'swapping',
        }),
        pointers: { k },
        activeAction: 'swap',
        callStack: callStack.map((f) => ({ ...f })),
        explanation: {
          text: `Escritura en memoria principal: arr[k=${k}] = ${arr[k]}.`,
          subNote: 'El menor elemento de los dos buffers ocupa su lugar ordenado en el subarreglo.',
        },
        metrics: {
          comparisons: comparisonsCount,
          swaps: writesCount,
          passNumber,
        },
      });

      k++;
    }

    // Vaciar restantes de L
    while (i < n1) {
      arr[k] = L[i];
      writesCount++;

      rawFrames.push({
        highlightLines: { c: [21, 22, 23, 24], python: [17, 18, 19, 20] },
        arrayState: [...arr],
        elementStates: buildElementStates(n, sortedIndices, {
          [k]: 'swapping',
        }),
        pointers: { k, i },
        activeAction: 'swap',
        callStack: callStack.map((f) => ({ ...f })),
        explanation: {
          text: `Copiando elemento restante de L: arr[k=${k}] = L[i=${i}] (${L[i]}).`,
          subNote: 'R se ha agotado; los elementos restantes de L ya están ordenados.',
        },
        metrics: {
          comparisons: comparisonsCount,
          swaps: writesCount,
          passNumber,
        },
      });

      i++;
      k++;
    }

    // Vaciar restantes de R
    while (j < n2) {
      arr[k] = R[j];
      writesCount++;

      rawFrames.push({
        highlightLines: { c: [27, 28, 29, 30], python: [22, 23, 24, 25] },
        arrayState: [...arr],
        elementStates: buildElementStates(n, sortedIndices, {
          [k]: 'swapping',
        }),
        pointers: { k, j },
        activeAction: 'swap',
        callStack: callStack.map((f) => ({ ...f })),
        explanation: {
          text: `Copiando elemento restante de R: arr[k=${k}] = R[j=${j}] (${R[j]}).`,
          subNote: 'L se ha agotado; los elementos restantes de R se copian directamente.',
        },
        metrics: {
          comparisons: comparisonsCount,
          swaps: writesCount,
          passNumber,
        },
      });

      j++;
      k++;
    }

    // Marcar rango [left..right] como consolidado
    for (let idx = left; idx <= right; idx++) {
      sortedIndices.add(idx);
    }

    popCall();
  }

  // Ejecutar Merge Sort principal
  mergeSort(0, n - 1);

  // Asegurar todos los elementos en sortedIndices
  for (let idx = 0; idx < n; idx++) {
    sortedIndices.add(idx);
  }

  // Fotograma final de ordenación completada
  rawFrames.push({
    highlightLines: { c: [34], python: [27] },
    arrayState: [...arr],
    elementStates: buildElementStates(n, sortedIndices),
    pointers: {},
    activeAction: 'locked',
    callStack: [],
    explanation: {
      text: '¡Merge Sort completado con éxito!',
      subNote: `Arreglo totalmente ordenado en ${comparisonsCount} comparaciones y ${writesCount} escrituras de memoria.`,
    },
    metrics: {
      comparisons: comparisonsCount,
      swaps: writesCount,
      passNumber,
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
    callStack: rf.callStack,
    comparison: rf.comparison,
    explanation: {
      stepLabel: `Paso ${idx + 1} de ${totalSteps}:`,
      text: rf.explanation.text,
      subNote: rf.explanation.subNote,
    },
    metrics: {
      comparisons: rf.metrics.comparisons,
      swaps: rf.metrics.swaps,
      passNumber: rf.metrics.passNumber,
      totalPasses: passNumber,
      maxComparisons: Math.ceil(n * Math.log2(n)),
    },
  }));
}
