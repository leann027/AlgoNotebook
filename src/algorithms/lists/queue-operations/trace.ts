/**
 * AlgoNotebook — Cola FIFO (Queue Operations) Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona, sin `any`.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Buffer contiguo de memoria con direcciones hexadecimales simuladas (0x7ffe20, 0x7ffe28, etc.).
 * - Emite linkedListState con banderas de punteros `front` y `rear`.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  LinkedListAlgorithmState,
  LinkedListNodeData,
} from '../../../core/types';

export const DEFAULT_QUEUE_VALUES: readonly number[] = [10, 25, 42, 68, 88];

const BASE_ADDRESS = 0x7ffe20;
const ELEMENT_SIZE_BYTES = 0x8;

function formatHexAddress(index: number): string {
  const addr = BASE_ADDRESS + index * ELEMENT_SIZE_BYTES;
  return `0x${addr.toString(16)}`;
}

interface RawTraceFrame {
  highlightLines: {
    c: number[];
    python: number[];
  };
  arrayState: number[];
  elementStates: Record<number, ElementState>;
  pointers: Record<string, number>;
  activeAction: ActiveAction;
  linkedListState: LinkedListAlgorithmState;
  explanation: {
    text: string;
    subNote?: string;
  };
  metrics: {
    comparisons: number;
    swaps: number;
    passNumber: number;
  };
}

/**
 * Generador puro y síncrono de trazas de ejecución para operaciones de cola FIFO.
 * Traza la secuencia didáctica: enqueue(10), enqueue(25), enqueue(42), peek(), dequeue() -> extrae 10, enqueue(68), enqueue(88).
 *
 * @param initialValues Array numérico opcional con al menos 5 valores de entrada.
 * @returns Lista inmutable de fotogramas paso a paso (TraceFrame[]).
 */
export function generateQueueOperationsTrace(initialValues?: number[]): TraceFrame[] {
  const values =
    Array.isArray(initialValues) && initialValues.length >= 5
      ? initialValues
      : Array.from(DEFAULT_QUEUE_VALUES);

  const [v0, v1, v2, v3, v4] = values;

  const rawFrames: RawTraceFrame[] = [];
  const queue: number[] = [];
  let operationsCount = 0;

  const buildLinkedListState = (
    highlightFrontState?: ElementState,
    highlightRearState?: ElementState
  ): LinkedListAlgorithmState => {
    const nodes: LinkedListNodeData[] = queue.map((val, idx) => {
      const isFront = idx === 0;
      const isRear = idx === queue.length - 1;
      let state: ElementState = 'default';

      if (isFront && highlightFrontState) {
        state = highlightFrontState;
      } else if (isRear && highlightRearState) {
        state = highlightRearState;
      } else if (isFront || isRear) {
        state = 'sorted';
      }

      return {
        id: `node-${idx}`,
        value: val,
        address: formatHexAddress(idx),
        nextId: idx < queue.length - 1 ? `node-${idx + 1}` : null,
        state,
      };
    });

    const frontId = queue.length > 0 ? 'node-0' : null;
    const rearId = queue.length > 0 ? `node-${queue.length - 1}` : null;

    return {
      nodes,
      headId: frontId,
      pointers: {
        front: frontId,
        rear: rearId,
      },
    };
  };

  const pushFrame = (
    cLines: number[],
    pyLines: number[],
    activeAction: ActiveAction,
    explanation: { text: string; subNote?: string },
    highlightFront?: ElementState,
    highlightRear?: ElementState
  ) => {
    const elementStates: Record<number, ElementState> = {};
    queue.forEach((_, idx) => {
      if (idx === 0) {
        elementStates[idx] = highlightFront ?? 'sorted';
      } else if (idx === queue.length - 1) {
        elementStates[idx] = highlightRear ?? 'pointer';
      } else {
        elementStates[idx] = 'default';
      }
    });

    rawFrames.push({
      highlightLines: { c: cLines, python: pyLines },
      arrayState: [...queue],
      elementStates,
      pointers: {
        front: queue.length > 0 ? 0 : -1,
        rear: queue.length > 0 ? queue.length - 1 : -1,
      },
      activeAction,
      linkedListState: buildLinkedListState(highlightFront, highlightRear),
      explanation,
      metrics: {
        comparisons: 0,
        swaps: operationsCount,
        passNumber: queue.length,
      },
    });
  };

  // 1. Estado Inicial: Cola vacía
  pushFrame(
    [12, 13, 14, 15, 16],
    [2, 3, 4, 5, 6],
    'idle',
    {
      text: 'Inicialización de la Cola FIFO. Búfer en memoria vacío con punteros front = 0, rear = -1 y conteo = 0.',
      subNote: 'La cola sigue la regla estricta First-In, First-Out: las inserciones entran por rear y las extracciones salen por front.',
    }
  );

  // 2. enqueue(v0)
  operationsCount++;
  queue.push(v0);
  pushFrame(
    [27, 28, 29, 30, 31],
    [13, 14, 15, 16],
    'compare',
    {
      text: `enqueue(${v0}): Primer elemento ingresado a la cola. Se almacena en la posición rear=0 (${formatHexAddress(0)}).`,
      subNote: `front = 0 y rear = 0 coinciden apuntando a este único elemento.`,
    },
    'comparing',
    'comparing'
  );

  // 3. enqueue(v1)
  operationsCount++;
  queue.push(v1);
  pushFrame(
    [27, 28, 29, 30, 31],
    [13, 14, 15, 16],
    'compare',
    {
      text: `enqueue(${v1}): Se encola en rear=1 (${formatHexAddress(1)}). El puntero front permanece en 0 (${v0}).`,
      subNote: `Tamaño actual de la cola = 2 elementos. front apunta a ${v0}, rear apunta a ${v1}.`,
    },
    'sorted',
    'comparing'
  );

  // 4. enqueue(v2)
  operationsCount++;
  queue.push(v2);
  pushFrame(
    [27, 28, 29, 30, 31],
    [13, 14, 15, 16],
    'compare',
    {
      text: `enqueue(${v2}): Se encola en rear=2 (${formatHexAddress(2)}).`,
      subNote: `Cola activa: [${queue.join(', ')}]. front=${v0}, rear=${v2}.`,
    },
    'sorted',
    'comparing'
  );

  // 5. peek()
  pushFrame(
    [42, 43, 44, 45],
    [26, 27, 28],
    'idle',
    {
      text: `peek(): Inspección del elemento frontal sin extracción. Retorna data[front] = ${queue[0]} (${formatHexAddress(0)}).`,
      subNote: 'La operación peek() toma tiempo O(1) y no modifica los punteros de la cola.',
    },
    'pointer',
    'default'
  );

  // 6. dequeue() -> extrae v0
  operationsCount++;
  const dequeuedVal = queue.shift()!;
  pushFrame(
    [34, 35, 36, 37, 38],
    [19, 20, 21, 22, 23],
    'swap',
    {
      text: `dequeue(): Extracción del elemento al frente. Se retira ${dequeuedVal} de memoria. El puntero front avanza al siguiente elemento (${queue[0]}).`,
      subNote: `Principio FIFO garantizado: ${dequeuedVal} fue el primer elemento en ingresar y el primero en salir.`,
    },
    'swapping',
    'sorted'
  );

  // 7. enqueue(v3)
  operationsCount++;
  queue.push(v3);
  pushFrame(
    [27, 28, 29, 30, 31],
    [13, 14, 15, 16],
    'compare',
    {
      text: `enqueue(${v3}): Nuevo elemento agregado en la retaguardia rear=${queue.length - 1} (${formatHexAddress(queue.length - 1)}).`,
      subNote: `Búfer activo con ${queue.length} elementos: [${queue.join(', ')}].`,
    },
    'sorted',
    'comparing'
  );

  // 8. enqueue(v4)
  operationsCount++;
  queue.push(v4);
  pushFrame(
    [27, 28, 29, 30, 31],
    [13, 14, 15, 16],
    'compare',
    {
      text: `enqueue(${v4}): Inserción exitosa en rear=${queue.length - 1}. La cola se expande a ${queue.length} elementos.`,
      subNote: `front=${queue[0]}, rear=${v4}.`,
    },
    'sorted',
    'comparing'
  );

  // 9. Estado final consolidado
  pushFrame(
    [20, 21, 22],
    [7, 8, 9],
    'locked',
    {
      text: `Cola FIFO Operacional Consolidada. Elementos activos en búfer: [${queue.join(', ')}]. front=${queue[0]} y rear=${queue[queue.length - 1]}.`,
      subNote: 'Todas las operaciones enqueue, dequeue y peek ejecutadas en tiempo constante O(1).',
    },
    'sorted',
    'sorted'
  );

  const totalSteps = rawFrames.length;
  return rawFrames.map((frame, index) => ({
    stepIndex: index + 1,
    totalSteps,
    highlightLines: frame.highlightLines,
    arrayState: frame.arrayState,
    elementStates: frame.elementStates,
    pointers: frame.pointers,
    activeAction: frame.activeAction,
    linkedListState: frame.linkedListState,
    explanation: {
      stepLabel: `Paso ${index + 1} de ${totalSteps}:`,
      text: frame.explanation.text,
      subNote: frame.explanation.subNote,
    },
    metrics: {
      comparisons: frame.metrics.comparisons,
      swaps: frame.metrics.swaps,
      passNumber: frame.metrics.passNumber,
      totalPasses: 8,
      maxComparisons: 0,
    },
  }));
}
