/**
 * AlgoNotebook — Selection Sort Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Punteros: i, j, min_idx.
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
 * Generador puro y síncrono de fotogramas de ejecución para Selection Sort.
 *
 * @param initialArray Arreglo numérico a ordenar (no es mutado; se clona inmutablemente).
 * @returns Lista inmutable de fotogramas paso a paso.
 */
export function generateSelectionSortTrace(initialArray: number[]): TraceFrame[] {
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
      pointers: { i: 0, min_idx: 0 },
      activeAction: 'locked',
      explanation: {
        stepLabel: 'Step 1 of 1:',
        text: `Array contains single element (${arr[0]}). Already sorted by definition.`,
        subNote: 'No comparisons or swaps required.',
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
        pointers: { i: 0, min_idx: 0 },
      },
    };
    return [singleFrame];
  }

  const rawFrames: RawFrame[] = [];
  const sortedIndices = new Set<number>();
  let comparisons = 0;
  let swaps = 0;

  // Bucle principal de Selection Sort
  for (let i = 0; i < n - 1; i++) {
    const passNumber = i + 1;
    let min_idx = i;

    // 1. Fotograma: Inicio de pasada e inicialización de min_idx = i
    const passStartStates = buildElementStates(n, sortedIndices, {
      [i]: 'pointer',
    });
    const passStartPointers: Record<string, number> = { i, min_idx: i };

    rawFrames.push({
      highlightLines: {
        c: [2, 3],
        python: [3, 4],
      },
      arrayState: [...arr],
      elementStates: passStartStates,
      pointers: passStartPointers,
      activeAction: 'pivot',
      explanation: {
        text: `Pass #${passNumber}: Starting minimum search in unsorted suffix arr[${i}..${n - 1}].`,
        subNote: `Initial candidate assumed at min_idx = ${i} (value: ${arr[i]}). Pointer j will scan remaining elements.`,
      },
      metrics: {
        comparisons,
        swaps,
        passNumber,
        totalPasses,
        maxComparisons,
      },
      event: {
        type: 'pointer',
        name: 'min_idx',
        index: i,
      },
      snapshot: {
        kind: 'pivot',
        pivotIndex: i,
        arrayState: [...arr],
        elementStates: passStartStates,
        pointers: passStartPointers,
      },
    });

    // Bucle interno: búsqueda del elemento mínimo en arr[i+1 .. n-1]
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const currentVal = arr[j];
      const minVal = arr[min_idx];
      const conditionMet = currentVal < minVal;

      // 2. Fotograma: Comparación arr[j] < arr[min_idx]
      const compareStates = buildElementStates(n, sortedIndices, {
        [min_idx]: 'comparing',
        [j]: 'comparing',
      });
      const comparePointers: Record<string, number> = { i, min_idx, j };
      const compDetails = {
        leftIndex: j,
        rightIndex: min_idx,
        leftValue: currentVal,
        rightValue: minVal,
        conditionMet,
      };

      rawFrames.push({
        highlightLines: {
          c: [4, 5],
          python: [5, 6],
        },
        arrayState: [...arr],
        elementStates: compareStates,
        pointers: comparePointers,
        activeAction: 'compare',
        comparison: compDetails,
        explanation: {
          text: `Comparing arr[j=${j}] (${currentVal}) < arr[min_idx=${min_idx}] (${minVal}).`,
          subNote: conditionMet
            ? `Condition met: ${currentVal} < ${minVal}. New minimum candidate found! min_idx will update to ${j}.`
            : `${currentVal} >= ${minVal}. Current minimum ${minVal} remains optimal candidate. Advancing pointer j.`,
        },
        metrics: {
          comparisons,
          swaps,
          passNumber,
          totalPasses,
          maxComparisons,
        },
        event: {
          type: 'compare',
          leftIndex: j,
          rightIndex: min_idx,
          leftValue: currentVal,
          rightValue: minVal,
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

      // 3. Fotograma: Actualización de min_idx si se encontró un valor menor
      if (conditionMet) {
        min_idx = j;
        const updateMinStates = buildElementStates(n, sortedIndices, {
          [min_idx]: 'pointer',
        });
        const updateMinPointers: Record<string, number> = { i, min_idx: j, j };

        rawFrames.push({
          highlightLines: {
            c: [6, 7],
            python: [7],
          },
          arrayState: [...arr],
          elementStates: updateMinStates,
          pointers: updateMinPointers,
          activeAction: 'pivot',
          explanation: {
            text: `Updated minimum index: min_idx = ${j} (new min value: ${arr[j]}).`,
            subNote: `Continuing scan to check if even smaller elements exist further down the array.`,
          },
          metrics: {
            comparisons,
            swaps,
            passNumber,
            totalPasses,
            maxComparisons,
          },
          event: {
            type: 'pointer',
            name: 'min_idx',
            index: j,
          },
          snapshot: {
            kind: 'pivot',
            pivotIndex: j,
            arrayState: [...arr],
            elementStates: updateMinStates,
            pointers: updateMinPointers,
          },
        });
      }
    }

    // 4. Fotograma: Intercambio final al término de la pasada (si min_idx !== i)
    if (min_idx !== i) {
      swaps++;
      const oldArrI = arr[i];
      const oldArrMin = arr[min_idx];

      arr[i] = oldArrMin;
      arr[min_idx] = oldArrI;

      const swapStates = buildElementStates(n, sortedIndices, {
        [i]: 'swapping',
        [min_idx]: 'swapping',
      });
      const swapPointers: Record<string, number> = { i, min_idx };

      rawFrames.push({
        highlightLines: {
          c: [9, 10, 11, 12, 13],
          python: [8, 9, 10],
        },
        arrayState: [...arr],
        elementStates: swapStates,
        pointers: swapPointers,
        activeAction: 'swap',
        explanation: {
          text: `Swapping minimum arr[min_idx=${min_idx}] (${oldArrMin}) with arr[i=${i}] (${oldArrI}).`,
          subNote: `Single physical memory swap places the smallest unsorted element into its definitive index ${i}.`,
        },
        metrics: {
          comparisons,
          swaps,
          passNumber,
          totalPasses,
          maxComparisons,
        },
        event: {
          type: 'swap',
          leftIndex: i,
          rightIndex: min_idx,
          leftValue: oldArrI,
          rightValue: oldArrMin,
        },
        snapshot: {
          kind: 'swap',
          swappedIndices: [i, min_idx],
          arrayState: [...arr],
          elementStates: swapStates,
          pointers: swapPointers,
        },
      });
    } else {
      // Elemento mínimo ya estaba en posición i
      const noSwapStates = buildElementStates(n, sortedIndices, {
        [i]: 'pointer',
      });
      const noSwapPointers: Record<string, number> = { i, min_idx: i };

      rawFrames.push({
        highlightLines: {
          c: [9],
          python: [8],
        },
        arrayState: [...arr],
        elementStates: noSwapStates,
        pointers: noSwapPointers,
        activeAction: 'pivot',
        explanation: {
          text: `Minimum element is already at position i = ${i} (${arr[i]}). No swap needed.`,
          subNote: `Zero memory writes performed. The element is already in its definitive position.`,
        },
        metrics: {
          comparisons,
          swaps,
          passNumber,
          totalPasses,
          maxComparisons,
        },
        event: {
          type: 'pointer',
          name: 'min_idx',
          index: i,
        },
        snapshot: {
          kind: 'pivot',
          pivotIndex: i,
          arrayState: [...arr],
          elementStates: noSwapStates,
          pointers: noSwapPointers,
        },
      });
    }

    // 5. Fotograma: Fijar elemento en índice i como 'sorted'
    sortedIndices.add(i);
    const lockStates = buildElementStates(n, sortedIndices);
    const lockPointers: Record<string, number> = { i };

    rawFrames.push({
      highlightLines: {
        c: [2],
        python: [3],
      },
      arrayState: [...arr],
      elementStates: lockStates,
      pointers: lockPointers,
      activeAction: 'locked',
      explanation: {
        text: `Pass #${passNumber} completed. Element ${arr[i]} locked at position ${i}.`,
        subNote: `Sorted prefix extended to arr[0..${i}]. Advancing to next pass.`,
      },
      metrics: {
        comparisons,
        swaps,
        passNumber,
        totalPasses,
        maxComparisons,
      },
      event: {
        type: 'locked',
        index: i,
        value: arr[i],
      },
      snapshot: {
        kind: 'locked',
        lockedIndex: i,
        arrayState: [...arr],
        elementStates: lockStates,
        pointers: lockPointers,
      },
    });
  }

  // Asegurar que todos los elementos (incluyendo el último arr[n-1]) queden ordenados
  for (let k = 0; k < n; k++) {
    sortedIndices.add(k);
  }

  const finalStates = buildElementStates(n, sortedIndices);
  const finalPointers: Record<string, number> = { i: n - 1 };

  // 6. Fotograma FINAL de terminación
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
      text: `Selection Sort completed. All N=${n} elements locked in ascending order.`,
      subNote: `Total: ${comparisons} comparisons (exactly N(N-1)/2 = ${maxComparisons}) and ${swaps} swaps (at most N-1 = ${n - 1}). O(1) auxiliary space.`,
    },
    metrics: {
      comparisons,
      swaps,
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

