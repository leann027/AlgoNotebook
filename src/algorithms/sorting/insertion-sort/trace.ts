/**
 * AlgoNotebook — Insertion Sort Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  TraceEvent,
  TraceSnapshot,
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
  comparison?: {
    leftIndex: number;
    rightIndex: number;
    leftValue: number;
    rightValue: number;
    conditionMet: boolean;
  };
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
  event?: TraceEvent;
  snapshot?: TraceSnapshot;
}

/**
 * Construye el mapa de estados de los elementos del arreglo dado el prefijo ordenado y overrides.
 */
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

/**
 * Generador puro y síncrono de fotogramas de ejecución para Insertion Sort.
 *
 * @param initialArray Arreglo numérico a ordenar (no es mutado; se clona inmutablemente).
 * @returns Lista inmutable de fotogramas paso a paso.
 */
export function generateInsertionSortTrace(initialArray: number[]): TraceFrame[] {
  if (!Array.isArray(initialArray) || initialArray.length === 0) {
    return [];
  }

  const n = initialArray.length;
  const arr = [...initialArray];
  const maxComparisons = Math.floor((n * (n - 1)) / 2);
  const totalPasses = Math.max(1, n - 1);

  // Caso base: arreglo de tamaño 1
  if (n === 1) {
    const singleElementStates = { 0: 'sorted' as const };
    const singleFrame: TraceFrame = {
      stepIndex: 1,
      totalSteps: 1,
      highlightLines: { c: [1], python: [1] },
      arrayState: [...arr],
      elementStates: singleElementStates,
      pointers: { i: 0 },
      activeAction: 'locked',
      explanation: {
        stepLabel: 'Step 1 of 1:',
        text: `Array contains single element (${arr[0]}). Already sorted by definition.`,
        subNote: 'No comparisons or displacements required.',
      },
      metrics: {
        comparisons: 0,
        swaps: 0,
        passNumber: 1,
        totalPasses: 1,
        maxComparisons: 0,
      },
      event: { type: 'locked', index: 0, value: arr[0] },
      snapshot: {
        kind: 'locked',
        lockedIndex: 0,
        arrayState: [...arr],
        elementStates: singleElementStates,
        pointers: { i: 0 },
      },
    };
    return [singleFrame];
  }

  const rawFrames: RawFrame[] = [];
  const sortedIndices = new Set<number>();
  let comparisons = 0;
  let shifts = 0;

  // El elemento en el índice 0 se considera trivialmente ordenado
  sortedIndices.add(0);

  // Fotograma inicial: Prefijo arr[0..0] ordenado trivialmente
  const initialStates = buildElementStates(n, sortedIndices);
  rawFrames.push({
    highlightLines: {
      c: [1, 2],
      python: [1, 3],
    },
    arrayState: [...arr],
    elementStates: initialStates,
    pointers: { i: 1 },
    activeAction: 'locked',
    explanation: {
      text: `Initial state: Prefix arr[0..0] (${arr[0]}) is trivially sorted.`,
      subNote: `Incremental expansion begins at outer index i = 1 with ${n} total elements.`,
    },
    metrics: {
      comparisons: 0,
      swaps: 0,
      passNumber: 1,
      totalPasses,
      maxComparisons,
    },
    event: {
      type: 'locked',
      index: 0,
      value: arr[0],
    },
    snapshot: {
      kind: 'locked',
      lockedIndex: 0,
      arrayState: [...arr],
      elementStates: initialStates,
      pointers: { i: 1 },
    },
  });

  // Bucle principal de Insertion Sort
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    const passNumber = i;

    // 1. Fotograma: Selección de Clave (key = arr[i], j = i - 1)
    const selectKeyStates = buildElementStates(n, sortedIndices, {
      [i]: 'pointer',
    });
    const selectKeyPointers: Record<string, number> = { i, key: i, j };

    rawFrames.push({
      highlightLines: {
        c: [2, 3, 4],
        python: [3, 4, 5],
      },
      arrayState: [...arr],
      elementStates: selectKeyStates,
      pointers: selectKeyPointers,
      activeAction: 'pivot',
      explanation: {
        text: `Pass #${passNumber}: Key extracted key = arr[i=${i}] (value: ${key}). Initialized j = ${j}.`,
        subNote: `Scanning sorted prefix arr[0..${i - 1}] from right to left to locate target insertion position.`,
      },
      metrics: {
        comparisons,
        swaps: shifts,
        passNumber,
        totalPasses,
        maxComparisons,
      },
      event: {
        type: 'pivot',
        index: i,
        value: key,
      },
      snapshot: {
        kind: 'pivot',
        pivotIndex: i,
        arrayState: [...arr],
        elementStates: selectKeyStates,
        pointers: selectKeyPointers,
      },
    });

    // Bucle interno: Comparar y desplazar elementos mayores hacia la derecha
    while (j >= 0) {
      comparisons++;
      const currentVal = arr[j];
      const conditionMet = currentVal > key;

      // 2. Fotograma: Comparación arr[j] > key
      const compareStates = buildElementStates(n, sortedIndices, {
        [j]: 'comparing',
        [j + 1]: 'pointer',
      });
      const comparePointers: Record<string, number> = { i, j, 'j+1': j + 1 };
      const compDetails = {
        leftIndex: j,
        rightIndex: i,
        leftValue: currentVal,
        rightValue: key,
        conditionMet,
      };

      rawFrames.push({
        highlightLines: {
          c: [5],
          python: [6],
        },
        arrayState: [...arr],
        elementStates: compareStates,
        pointers: comparePointers,
        activeAction: 'compare',
        comparison: compDetails,
        explanation: {
          text: `Comparing arr[j=${j}] (${currentVal}) > key (${key}).`,
          subNote: conditionMet
            ? `Since ${currentVal} > ${key}, element must shift right to arr[${j + 1}] to open slot.`
            : `${currentVal} <= ${key}, correct slot found at index ${j + 1}. While loop terminates.`,
        },
        metrics: {
          comparisons,
          swaps: shifts,
          passNumber,
          totalPasses,
          maxComparisons,
        },
        event: {
          type: 'compare',
          leftIndex: j,
          rightIndex: i,
          leftValue: currentVal,
          rightValue: key,
          conditionMet,
        },
        snapshot: {
          kind: 'compare',
          comparison: compDetails,
          arrayState: [...arr],
          elementStates: compareStates,
          pointers: comparePointers,
        },
      });

      if (!conditionMet) {
        break;
      }

      // 3. Fotograma: Desplazamiento arr[j + 1] = arr[j]
      shifts++;
      arr[j + 1] = arr[j];

      const shiftStates = buildElementStates(n, sortedIndices, {
        [j]: 'default',
        [j + 1]: 'swapping',
      });
      const shiftPointers: Record<string, number> = { i, j, 'j+1': j + 1 };

      rawFrames.push({
        highlightLines: {
          c: [6, 7],
          python: [7, 8],
        },
        arrayState: [...arr],
        elementStates: shiftStates,
        pointers: shiftPointers,
        activeAction: 'swap',
        explanation: {
          text: `Shifting arr[${j}] (${currentVal}) → arr[${j + 1}]. Pointer j decrements to ${j - 1}.`,
          subNote: `Slot at index ${j} made available for key (${key}) or previous larger elements.`,
        },
        metrics: {
          comparisons,
          swaps: shifts,
          passNumber,
          totalPasses,
          maxComparisons,
        },
        event: {
          type: 'swap',
          leftIndex: j,
          rightIndex: j + 1,
          leftValue: currentVal,
          rightValue: arr[j + 1],
        },
        snapshot: {
          kind: 'swap',
          swappedIndices: [j, j + 1],
          arrayState: [...arr],
          elementStates: shiftStates,
          pointers: shiftPointers,
        },
      });

      j--;
    }

    // 4. Fotograma: Inserción final de la clave en arr[j + 1] = key
    arr[j + 1] = key;
    const insertedIndex = j + 1;

    // Actualizar conjunto de índices ordenados hasta i
    for (let k = 0; k <= i; k++) {
      sortedIndices.add(k);
    }

    const insertStates = buildElementStates(n, sortedIndices, {
      [insertedIndex]: 'sorted',
    });
    const insertPointers: Record<string, number> = { i, 'j+1': insertedIndex };

    rawFrames.push({
      highlightLines: {
        c: [9],
        python: [9],
      },
      arrayState: [...arr],
      elementStates: insertStates,
      pointers: insertPointers,
      activeAction: 'locked',
      explanation: {
        text: `Key (${key}) inserted into arr[j+1=${insertedIndex}].`,
        subNote: `Sorted prefix successfully expanded to arr[0..${i}] (${i + 1} elements sorted).`,
      },
      metrics: {
        comparisons,
        swaps: shifts,
        passNumber,
        totalPasses,
        maxComparisons,
      },
      event: {
        type: 'locked',
        index: insertedIndex,
        value: key,
      },
      snapshot: {
        kind: 'locked',
        lockedIndex: insertedIndex,
        arrayState: [...arr],
        elementStates: insertStates,
        pointers: insertPointers,
      },
    });
  }

  // Asegurar que todos los elementos queden marcados como ordenados al finalizar
  for (let k = 0; k < n; k++) {
    sortedIndices.add(k);
  }

  const finalStates = buildElementStates(n, sortedIndices);
  const finalPointers: Record<string, number> = { i: n - 1 };

  // 5. Fotograma FINAL de terminación
  rawFrames.push({
    highlightLines: {
      c: [1],
      python: [1],
    },
    arrayState: [...arr],
    elementStates: finalStates,
    pointers: finalPointers,
    activeAction: 'locked',
    explanation: {
      text: `Insertion Sort completed. All N=${n} elements are in non-decreasing order.`,
      subNote: shifts === 0
        ? `Array was already sorted. Verified in ${comparisons} comparisons (O(N) best case).`
        : `Execution terminated with ${comparisons} comparisons and ${shifts} memory shifts. O(1) auxiliary space.`,
    },
    metrics: {
      comparisons,
      swaps: shifts,
      passNumber: totalPasses,
      totalPasses,
      maxComparisons,
    },
    event: {
      type: 'idle',
    },
    snapshot: {
      kind: 'idle',
      arrayState: [...arr],
      elementStates: finalStates,
      pointers: finalPointers,
    },
  });

  // Mapear fotogramas con stepIndex (1-based) y totalSteps
  const totalSteps = rawFrames.length;
  return rawFrames.map((frame, index) => {
    const stepIndex = index + 1;
    return {
      ...frame,
      stepIndex,
      totalSteps,
      explanation: {
        stepLabel: `Step ${stepIndex} of ${totalSteps}:`,
        text: frame.explanation.text,
        subNote: frame.explanation.subNote,
      },
    };
  });
}

