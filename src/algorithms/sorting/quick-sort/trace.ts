/**
 * AlgoNotebook — QuickSort Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Manejo recursivo de pila simulada `callStack: StackFrame[]`.
 * - Partición de Lomuto con pivote al final (arr[high]).
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  TraceEvent,
  TraceSnapshot,
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
 * Generador puro y síncrono de fotogramas de ejecución (TraceFrame[]) para QuickSort
 * utilizando el esquema de partición de Lomuto.
 *
 * @param initialArray Arreglo numérico a ordenar (no es mutado; se clona inmutablemente).
 * @returns Lista inmutable de fotogramas paso a paso.
 */
export function generateQuickSortTrace(initialArray: number[]): TraceFrame[] {
  // Manejo de entrada inválida o vacía
  if (!Array.isArray(initialArray) || initialArray.length === 0) {
    return [];
  }

  const n = initialArray.length;
  const arr = [...initialArray];
  // Límite teórico esperado O(N log N) para N elementos
  const maxComparisons = Math.round(n * Math.log2(Math.max(2, n)));
  const totalPasses = n;

  // Caso base: arreglo de un único elemento
  if (n === 1) {
    const singleElementStates: Record<number, ElementState> = { 0: 'sorted' };
    const singleCallStack: StackFrame[] = [
      {
        id: 'call-1',
        functionName: 'quick_sort',
        args: { low: 0, high: 0 },
        isActive: true,
      },
    ];
    const singleFrame: TraceFrame = {
      stepIndex: 1,
      totalSteps: 1,
      highlightLines: { c: [20, 21], python: [11, 12] },
      arrayState: [...arr],
      elementStates: singleElementStates,
      pointers: { low: 0, high: 0 },
      activeAction: 'locked',
      callStack: singleCallStack,
      explanation: {
        stepLabel: 'Step 1 of 1:',
        text: `Array contains a single element (${arr[0]}). Base condition met; already sorted.`,
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
        pointers: { low: 0, high: 0 },
      },
    };
    return [singleFrame];
  }

  const rawFrames: RawFrame[] = [];
  const sortedIndices = new Set<number>();
  const callStack: StackFrame[] = [];
  let callCounter = 0;
  let comparisons = 0;
  let swaps = 0;
  let partitionPass = 0;

  function pushCall(functionName: string, args: Record<string, string | number>): void {
    callCounter++;
    for (const f of callStack) {
      f.isActive = false;
    }
    callStack.push({
      id: `call-${callCounter}`,
      functionName,
      args,
      isActive: true,
    });
  }

  function popCall(): void {
    callStack.pop();
    if (callStack.length > 0) {
      callStack[callStack.length - 1].isActive = true;
    }
  }

  function cloneCallStack(): StackFrame[] {
    return callStack.map((frame) => ({
      ...frame,
      args: { ...frame.args },
    }));
  }

  function quick_sort_recurse(low: number, high: number): void {
    // 1. Apilar marco en callStack al entrar en quick_sort(low, high)
    pushCall('quick_sort', { low, high });

    // Caso base: subarreglo vacío o de un solo elemento (low >= high)
    if (low >= high) {
      if (low === high) {
        sortedIndices.add(low);
        const lockStates = buildElementStates(n, sortedIndices, { [low]: 'sorted' });
        const lockPointers = { low, high };

        rawFrames.push({
          highlightLines: {
            c: [20, 21],
            python: [11, 12],
          },
          arrayState: [...arr],
          elementStates: lockStates,
          pointers: lockPointers,
          activeAction: 'locked',
          callStack: cloneCallStack(),
          explanation: {
            text: `Base case in quick_sort(low=${low}, high=${high}): Range has 1 element (${arr[low]}).`,
            subNote: `Condition (low < high) is false. Single element at index ${low} is inherently sorted. Unwinding call stack.`,
          },
          metrics: {
            comparisons,
            swaps,
            passNumber: Math.max(1, partitionPass),
            totalPasses,
            maxComparisons,
          },
          event: {
            type: 'locked',
            index: low,
            value: arr[low],
          },
          snapshot: {
            kind: 'locked',
            lockedIndex: low,
            arrayState: [...arr],
            elementStates: lockStates,
            pointers: lockPointers,
          },
        });
      } else {
        // low > high (intervalo vacío)
        const idleStates = buildElementStates(n, sortedIndices);
        const idlePointers = { low, high };

        rawFrames.push({
          highlightLines: {
            c: [20, 21],
            python: [11, 12],
          },
          arrayState: [...arr],
          elementStates: idleStates,
          pointers: idlePointers,
          activeAction: 'idle',
          callStack: cloneCallStack(),
          explanation: {
            text: `Base case in quick_sort(low=${low}, high=${high}): Empty sub-array (low > high).`,
            subNote: `Condition (low < high) is false. No elements to partition in range [${low}..${high}]. Unwinding call stack.`,
          },
          metrics: {
            comparisons,
            swaps,
            passNumber: Math.max(1, partitionPass),
            totalPasses,
            maxComparisons,
          },
          event: {
            type: 'idle',
          },
          snapshot: {
            kind: 'idle',
            arrayState: [...arr],
            elementStates: idleStates,
            pointers: idlePointers,
          },
        });
      }

      // Desapilar llamada base
      popCall();
      return;
    }

    // 2. Fotograma previo a llamar a partition
    const enterStates = buildElementStates(n, sortedIndices);
    const enterPointers = { low, high };

    rawFrames.push({
      highlightLines: {
        c: [21, 22],
        python: [12, 13],
      },
      arrayState: [...arr],
      elementStates: enterStates,
      pointers: enterPointers,
      activeAction: 'idle',
      callStack: cloneCallStack(),
      explanation: {
        text: `quick_sort(low=${low}, high=${high}): Evaluating condition (${low} < ${high}) -> True. Scheduling partition.`,
        subNote: `Invoking partition(arr, low=${low}, high=${high}) to segment the ${high - low + 1}-element sub-array around a pivot.`,
      },
      metrics: {
        comparisons,
        swaps,
        passNumber: Math.max(1, partitionPass),
        totalPasses,
        maxComparisons,
      },
      event: {
        type: 'idle',
      },
      snapshot: {
        kind: 'idle',
        arrayState: [...arr],
        elementStates: enterStates,
        pointers: enterPointers,
      },
    });

    // 3. Entrar en partition(low, high)
    partitionPass++;
    const pivotVal = arr[high];
    pushCall('partition', { low, high, pivot: pivotVal });

    let i = low - 1;

    // 4. Selección del pivote (Lomuto: arr[high])
    const pivotStates = buildElementStates(n, sortedIndices, {
      [high]: 'pointer',
    });
    const pivotPointers = { low, high, pivot: high, i };

    rawFrames.push({
      highlightLines: {
        c: [7, 8, 9],
        python: [1, 2, 3],
      },
      arrayState: [...arr],
      elementStates: pivotStates,
      pointers: pivotPointers,
      activeAction: 'pivot',
      callStack: cloneCallStack(),
      explanation: {
        text: `Partition Pass #${partitionPass}: Selected pivot arr[high=${high}] = ${pivotVal}. Set boundary index i = low - 1 (${i}).`,
        subNote: `Lomuto partitioning designates the rightmost element as pivot. Pointer i tracks elements strictly smaller than ${pivotVal}.`,
      },
      metrics: {
        comparisons,
        swaps,
        passNumber: partitionPass,
        totalPasses,
        maxComparisons,
      },
      event: {
        type: 'pivot',
        index: high,
        value: pivotVal,
      },
      snapshot: {
        kind: 'pivot',
        pivotIndex: high,
        arrayState: [...arr],
        elementStates: pivotStates,
        pointers: pivotPointers,
      },
    });

    // 5. Bucle de partición: j recorre [low .. high - 1]
    for (let j = low; j <= high - 1; j++) {
      comparisons++;
      const leftVal = arr[j];
      const conditionMet = leftVal < pivotVal;

      const compareDetails: ComparisonDetails = {
        leftIndex: j,
        rightIndex: high,
        leftValue: leftVal,
        rightValue: pivotVal,
        conditionMet,
      };

      const compareStates = buildElementStates(n, sortedIndices, {
        [j]: 'comparing',
        [high]: 'comparing',
      });
      const comparePointers = { low, high, pivot: high, i, j };

      // 5a. Fotograma de COMPARACIÓN
      rawFrames.push({
        highlightLines: {
          c: [10, 11],
          python: [4, 5],
        },
        arrayState: [...arr],
        elementStates: compareStates,
        pointers: comparePointers,
        activeAction: 'compare',
        callStack: cloneCallStack(),
        comparison: compareDetails,
        explanation: {
          text: `Comparing element arr[j=${j}] (${leftVal}) with pivot (${pivotVal}).`,
          subNote: conditionMet
            ? `Condition (${leftVal} < ${pivotVal}) is TRUE. Incrementing boundary pointer i and swapping arr[i] with arr[j].`
            : `Condition (${leftVal} < ${pivotVal}) is FALSE (${leftVal} >= ${pivotVal}). Element belongs to upper partition; advancing j.`,
        },
        metrics: {
          comparisons,
          swaps,
          passNumber: partitionPass,
          totalPasses,
          maxComparisons,
        },
        event: {
          type: 'compare',
          leftIndex: j,
          rightIndex: high,
          leftValue: leftVal,
          rightValue: pivotVal,
          conditionMet,
        },
        snapshot: {
          kind: 'compare',
          comparison: compareDetails,
          arrayState: [...arr],
          elementStates: compareStates,
          pointers: comparePointers,
        },
      });

      // 5b. Fotograma de SWAP si arr[j] < pivot
      if (conditionMet) {
        i++;
        swaps++;

        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;

        const swapStates = buildElementStates(n, sortedIndices, {
          [i]: 'swapping',
          [j]: 'swapping',
          [high]: 'pointer',
        });
        const swapPointers = { low, high, pivot: high, i, j };

        rawFrames.push({
          highlightLines: {
            c: [12, 13],
            python: [6, 7],
          },
          arrayState: [...arr],
          elementStates: swapStates,
          pointers: swapPointers,
          activeAction: 'swap',
          callStack: cloneCallStack(),
          explanation: {
            text: `Incremented i to ${i}. Swapped arr[i=${i}] (${temp}) with arr[j=${j}] (${arr[i]}).`,
            subNote: `Elements at indices [${low}..${i}] are now confirmed strictly smaller than pivot (${pivotVal}).`,
          },
          metrics: {
            comparisons,
            swaps,
            passNumber: partitionPass,
            totalPasses,
            maxComparisons,
          },
          event: {
            type: 'swap',
            leftIndex: i,
            rightIndex: j,
            leftValue: temp,
            rightValue: arr[j],
          },
          snapshot: {
            kind: 'swap',
            swappedIndices: [i, j],
            arrayState: [...arr],
            elementStates: swapStates,
            pointers: swapPointers,
          },
        });
      }
    }

    // 6. Colocar el pivote en su posición final definitiva: swap(&arr[i + 1], &arr[high])
    const pi = i + 1;
    swaps++;

    const targetVal = arr[pi];
    arr[high] = targetVal;
    arr[pi] = pivotVal;

    const pivotSwapStates = buildElementStates(n, sortedIndices, {
      [pi]: 'swapping',
      [high]: 'swapping',
    });
    const pivotSwapPointers = { low, high, pivot: pi, i, j: high };

    rawFrames.push({
      highlightLines: {
        c: [16],
        python: [8],
      },
      arrayState: [...arr],
      elementStates: pivotSwapStates,
      pointers: pivotSwapPointers,
      activeAction: 'swap',
      callStack: cloneCallStack(),
      explanation: {
        text: `Partition loop finished. Swapping pivot (${pivotVal}) from arr[${high}] with boundary arr[i+1=${pi}] (${targetVal}).`,
        subNote: `Moving pivot to index ${pi} places all values < ${pivotVal} to its left, and all values >= ${pivotVal} to its right.`,
      },
      metrics: {
        comparisons,
        swaps,
        passNumber: partitionPass,
        totalPasses,
        maxComparisons,
      },
      event: {
        type: 'swap',
        leftIndex: pi,
        rightIndex: high,
        leftValue: targetVal,
        rightValue: pivotVal,
      },
      snapshot: {
        kind: 'swap',
        swappedIndices: [pi, high],
        arrayState: [...arr],
        elementStates: pivotSwapStates,
        pointers: pivotSwapPointers,
      },
    });

    // 7. Pivote bloqueado en su posición final
    sortedIndices.add(pi);
    const lockedStates = buildElementStates(n, sortedIndices, { [pi]: 'sorted' });
    const lockedPointers = { low, high, pivot: pi, pi };

    rawFrames.push({
      highlightLines: {
        c: [17],
        python: [9],
      },
      arrayState: [...arr],
      elementStates: lockedStates,
      pointers: lockedPointers,
      activeAction: 'locked',
      callStack: cloneCallStack(),
      explanation: {
        text: `Pivot value ${pivotVal} locked at index ${pi}. Partition index pi = ${pi} returned.`,
        subNote: `Pivot is settled in its permanent position. Sub-array splits into left [${low}..${pi - 1}] and right [${pi + 1}..${high}].`,
      },
      metrics: {
        comparisons,
        swaps,
        passNumber: partitionPass,
        totalPasses,
        maxComparisons,
      },
      event: {
        type: 'locked',
        index: pi,
        value: pivotVal,
      },
      snapshot: {
        kind: 'locked',
        lockedIndex: pi,
        arrayState: [...arr],
        elementStates: lockedStates,
        pointers: lockedPointers,
      },
    });

    // Desapilar marco de partición
    popCall();

    // 8. Preparar llamada recursiva izquierda: quick_sort(arr, low, pi - 1)
    const leftPrepStates = buildElementStates(n, sortedIndices);
    const leftPrepPointers = { low, high, pi };

    rawFrames.push({
      highlightLines: {
        c: [23],
        python: [14],
      },
      arrayState: [...arr],
      elementStates: leftPrepStates,
      pointers: leftPrepPointers,
      activeAction: 'idle',
      callStack: cloneCallStack(),
      explanation: {
        text: `Scheduling left recursive call: quick_sort(arr, low=${low}, high=${pi - 1}).`,
        subNote:
          low <= pi - 1
            ? `Recursively sorting ${pi - low} element(s) to the left of pivot ${pivotVal}.`
            : `Left partition is empty (${low} > ${pi - 1}). Base condition will handle range.`,
      },
      metrics: {
        comparisons,
        swaps,
        passNumber: partitionPass,
        totalPasses,
        maxComparisons,
      },
      event: {
        type: 'idle',
      },
      snapshot: {
        kind: 'idle',
        arrayState: [...arr],
        elementStates: leftPrepStates,
        pointers: leftPrepPointers,
      },
    });

    quick_sort_recurse(low, pi - 1);

    // 9. Preparar llamada recursiva derecha: quick_sort(arr, pi + 1, high)
    const rightPrepStates = buildElementStates(n, sortedIndices);
    const rightPrepPointers = { low, high, pi };

    rawFrames.push({
      highlightLines: {
        c: [24],
        python: [15],
      },
      arrayState: [...arr],
      elementStates: rightPrepStates,
      pointers: rightPrepPointers,
      activeAction: 'idle',
      callStack: cloneCallStack(),
      explanation: {
        text: `Left partition sorted. Scheduling right recursive call: quick_sort(arr, low=${pi + 1}, high=${high}).`,
        subNote:
          pi + 1 <= high
            ? `Recursively sorting ${high - pi} element(s) to the right of pivot ${pivotVal}.`
            : `Right partition is empty (${pi + 1} > ${high}). Base condition will handle range.`,
      },
      metrics: {
        comparisons,
        swaps,
        passNumber: partitionPass,
        totalPasses,
        maxComparisons,
      },
      event: {
        type: 'idle',
      },
      snapshot: {
        kind: 'idle',
        arrayState: [...arr],
        elementStates: rightPrepStates,
        pointers: rightPrepPointers,
      },
    });

    quick_sort_recurse(pi + 1, high);

    // Desapilar marco de quick_sort(low, high)
    popCall();
  }

  // Ejecución recursiva raíz
  quick_sort_recurse(0, n - 1);

  // Asegurar que todos los elementos queden confirmados en sorted
  for (let k = 0; k < n; k++) {
    sortedIndices.add(k);
  }

  const finalStates = buildElementStates(n, sortedIndices);
  const finalPointers = { low: 0, high: n - 1 };

  // 10. Fotograma final de ordenación completa
  rawFrames.push({
    highlightLines: {
      c: [20],
      python: [11],
    },
    arrayState: [...arr],
    elementStates: finalStates,
    pointers: finalPointers,
    activeAction: 'locked',
    callStack: [],
    explanation: {
      text: `QuickSort complete. All N=${n} elements are strictly sorted in ascending order.`,
      subNote: `Algorithm terminated in O(N log N) expected time with ${comparisons} comparisons and ${swaps} swaps across ${partitionPass} partition passes.`,
    },
    metrics: {
      comparisons,
      swaps,
      passNumber: partitionPass,
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

  // Cálculo final de totalSteps y asignación de stepIndex (1-based)
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
