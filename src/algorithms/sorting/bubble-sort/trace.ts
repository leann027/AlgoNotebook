/**
 * AlgoNotebook — Bubble Sort Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
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
 * Genera un mapa completo de estados de elementos para un tamaño dado de arreglo,
 * asignando 'sorted' a los índices bloqueados y aplicando cualquier estado activo.
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
 * Generador puro y síncrono de fotogramas de ejecución (TraceFrame[]) para Bubble Sort.
 *
 * @param initialArray Arreglo numérico a ordenar (no es mutado; se clona inmutablemente).
 * @returns Lista inmutable de fotogramas paso a paso.
 */
export function generateBubbleSortTrace(initialArray: number[]): TraceFrame[] {
  // Manejo de entrada inválida o vacía
  if (!Array.isArray(initialArray) || initialArray.length === 0) {
    return [];
  }

  const n = initialArray.length;
  const arr = [...initialArray];
  const maxComparisons = Math.floor((n * (n - 1)) / 2);
  const totalPasses = Math.max(1, n - 1);

  // Caso base: arreglo de un único elemento
  if (n === 1) {
    const singleElementStates = { 0: 'sorted' as const };
    const singleFrame: TraceFrame = {
      stepIndex: 1,
      totalSteps: 1,
      highlightLines: { c: [1], python: [1] },
      arrayState: [...arr],
      elementStates: singleElementStates,
      pointers: { i: 0, j: 0 },
      activeAction: 'locked',
      explanation: {
        stepLabel: 'Step 1 of 1:',
        text: `Array contains single element (${arr[0]}). Already sorted.`,
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
        pointers: { i: 0, j: 0 },
      },
    };
    return [singleFrame];
  }

  const rawFrames: RawFrame[] = [];
  const sortedIndices = new Set<number>();
  let comparisons = 0;
  let swaps = 0;

  // Recorrido de pasadas Bubble Sort
  for (let i = 0; i < n - 1; i++) {
    const passNumber = i + 1;
    let swappedThisPass = false;

    // Bucle interno de comparación e intercambio adyacente
    for (let j = 0; j < n - i - 1; j++) {
      const leftVal = arr[j];
      const rightVal = arr[j + 1];
      comparisons++;
      const conditionMet = leftVal > rightVal;

      // 1. Fotograma de COMPARACIÓN
      const compareStates = buildElementStates(n, sortedIndices, {
        [j]: 'comparing',
        [j + 1]: 'comparing',
      });
      const comparePointers = { i, j, 'j+1': j + 1 };
      const comparisonDetails = {
        leftIndex: j,
        rightIndex: j + 1,
        leftValue: leftVal,
        rightValue: rightVal,
        conditionMet,
      };

      rawFrames.push({
        highlightLines: {
          python: [5], // if arr[j] > arr[j + 1]:
          c: [4],      // if (arr[j] > arr[j + 1]) {
        },
        arrayState: [...arr],
        elementStates: compareStates,
        pointers: comparePointers,
        activeAction: 'compare',
        comparison: comparisonDetails,
        explanation: {
          text: `Comparing arr[j=${j}] (val: ${leftVal}) and arr[j+1=${j + 1}] (val: ${rightVal}).`,
          subNote: conditionMet
            ? `Since ${leftVal} > ${rightVal}, a memory register swap will trigger on the next step.`
            : `${leftVal} <= ${rightVal}, elements are in relative order. Advancing pointer j.`,
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
          rightIndex: j + 1,
          leftValue: leftVal,
          rightValue: rightVal,
          conditionMet,
        },
        snapshot: {
          kind: 'compare',
          comparison: comparisonDetails,
          arrayState: [...arr],
          elementStates: compareStates,
          pointers: comparePointers,
        },
      });

      // 2. Fotograma de SWAP (si la condición se cumple)
      if (conditionMet) {
        swaps++;
        swappedThisPass = true;

        // Mutación local en memoria del arreglo
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;

        const swapStates = buildElementStates(n, sortedIndices, {
          [j]: 'swapping',
          [j + 1]: 'swapping',
        });
        const swapPointers = { i, j, 'j+1': j + 1 };

        rawFrames.push({
          highlightLines: {
            python: [6, 7],         // arr[j], arr[j + 1] = arr[j + 1], arr[j] / swaps += 1
            c: [5, 6, 7, 8],        // temp = arr[j]; ... swaps++;
          },
          arrayState: [...arr],
          elementStates: swapStates,
          pointers: swapPointers,
          activeAction: 'swap',
          explanation: {
            text: `Swapping arr[${j}] (${temp}) and arr[${j + 1}] (${arr[j]}).`,
            subNote: `In-place memory values exchanged. Array updated: [${arr.slice(0, 5).join(', ')}${arr.length > 5 ? ', ...' : ''}].`,
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
            leftIndex: j,
            rightIndex: j + 1,
            leftValue: temp,
            rightValue: arr[j],
          },
          snapshot: {
            kind: 'swap',
            swappedIndices: [j, j + 1],
            arrayState: [...arr],
            elementStates: swapStates,
            pointers: swapPointers,
          },
        });
      }
    }

    // Al finalizar el bucle interno, el elemento en (n - 1 - i) queda bloqueado
    const lockedIndex = n - 1 - i;
    sortedIndices.add(lockedIndex);

    // 3. Fotograma de BLOQUEO de la pasada actual
    const lockStates = buildElementStates(n, sortedIndices);
    const lockPointers = { i: i + 1, j: 0 };

    rawFrames.push({
      highlightLines: {
        python: [3], // for i in range(n):
        c: [2],      // for (int i = 0; i < n; i++) {
      },
      arrayState: [...arr],
      elementStates: lockStates,
      pointers: lockPointers,
      activeAction: 'locked',
      explanation: {
        text: `Pass #${passNumber} complete. Largest unsorted value (${arr[lockedIndex]}) settled at position ${lockedIndex}.`,
        subNote: swappedThisPass
          ? `Outer loop index advances to i = ${i + 1} for Pass #${passNumber + 1}.`
          : 'Array verified sorted. No swaps detected in this pass.',
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
        index: lockedIndex,
        value: arr[lockedIndex],
      },
      snapshot: {
        kind: 'locked',
        lockedIndex,
        arrayState: [...arr],
        elementStates: lockStates,
        pointers: lockPointers,
      },
    });

    // Optimización pedagógica: si en una pasada no hubo intercambios, el arreglo ya está ordenado
    if (!swappedThisPass) {
      break;
    }
  }

  // Asegurar que todos los elementos queden marcados como ordenados al finalizar
  for (let k = 0; k < n; k++) {
    sortedIndices.add(k);
  }

  const finalStates = buildElementStates(n, sortedIndices);
  const finalPointers = { i: n - 1, j: n - 1 };

  // 4. Fotograma FINAL de finalización con todos los elementos en 'sorted'
  rawFrames.push({
    highlightLines: {
      python: [1], // def bubble_sort(arr):
      c: [1],      // void bubble_sort(int arr[], int n) {
    },
    arrayState: [...arr],
    elementStates: finalStates,
    pointers: finalPointers,
    activeAction: 'locked',
    explanation: {
      text: `Sorting complete. All N=${n} elements locked in ascending order.`,
      subNote: swaps === 0
        ? `Array was already sorted. Verified in ${comparisons} comparisons (O(N) best case).`
        : `Algorithm terminated in-place with O(1) auxiliary space and ${swaps} total swaps.`,
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

  // Cálculo final de totalSteps y asignación de stepIndex (1-based) inmutable
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

