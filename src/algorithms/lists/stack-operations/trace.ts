/**
 * AlgoNotebook — Pila LIFO (Stack Operations) Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona, sin `any`.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Buffer contiguo de memoria con direcciones hexadecimales simuladas (0x7ffe10, 0x7ffe18, etc.).
 * - Emite linkedListState con bandera de puntero `top` en la cima activa de la pila.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  LinkedListAlgorithmState,
  LinkedListNodeData,
} from '../../../core/types';

export const DEFAULT_STACK_VALUES: readonly number[] = [10, 25, 42, 68, 88];

const BASE_ADDRESS = 0x7ffe10;
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
 * Generador puro y síncrono de trazas de ejecución para operaciones de pila LIFO.
 * Traza la secuencia didáctica: push(10), push(25), push(42), peek(), pop() -> extrae 42, push(68), push(88).
 *
 * @param initialValues Array numérico opcional con al menos 5 valores de entrada.
 * @returns Lista inmutable de fotogramas paso a paso (TraceFrame[]).
 */
export function generateStackOperationsTrace(initialValues?: number[]): TraceFrame[] {
  const values =
    Array.isArray(initialValues) && initialValues.length >= 5
      ? initialValues
      : Array.from(DEFAULT_STACK_VALUES);

  const [v0, v1, v2, v3, v4] = values;

  const rawFrames: RawTraceFrame[] = [];
  const stack: number[] = [];
  let comparisonsCount = 0;
  let operationsCount = 0;

  const buildLinkedListState = (
    highlightTopState?: ElementState
  ): LinkedListAlgorithmState => {
    const nodes: LinkedListNodeData[] = stack.map((val, idx) => {
      const isTop = idx === stack.length - 1;
      let state: ElementState = 'default';
      if (isTop && highlightTopState) {
        state = highlightTopState;
      } else if (isTop) {
        state = 'sorted';
      }
      return {
        id: `node-${idx}`,
        value: val,
        address: formatHexAddress(idx),
        nextId: idx < stack.length - 1 ? `node-${idx + 1}` : null,
        state,
      };
    });

    const topNodeId = nodes.length > 0 ? nodes[nodes.length - 1].id : null;
    const headNodeId = nodes.length > 0 ? nodes[0].id : null;

    return {
      nodes,
      headId: headNodeId,
      pointers: {
        top: topNodeId,
      },
    };
  };

  const recordFrame = (
    cLines: number[],
    pyLines: number[],
    action: ActiveAction,
    text: string,
    subNote: string,
    topState?: ElementState
  ) => {
    const topIndex = stack.length - 1;
    const elemStates: Record<number, ElementState> = {};
    stack.forEach((_, idx) => {
      if (idx === topIndex) {
        elemStates[idx] = topState ?? (action === 'compare' ? 'comparing' : 'sorted');
      } else {
        elemStates[idx] = 'default';
      }
    });

    const numPointers: Record<string, number> = {};
    if (topIndex >= 0) {
      numPointers.top = topIndex;
    }

    rawFrames.push({
      highlightLines: {
        c: cLines,
        python: pyLines,
      },
      arrayState: [...stack],
      elementStates: elemStates,
      pointers: numPointers,
      activeAction: action,
      linkedListState: buildLinkedListState(topState),
      explanation: {
        text,
        subNote,
      },
      metrics: {
        comparisons: comparisonsCount,
        swaps: operationsCount,
        passNumber: operationsCount,
      },
    });
  };

  // ==========================================================================
  // PASO 1: Inicialización de la pila contigua
  // ==========================================================================
  operationsCount++;
  recordFrame(
    [11, 12, 13],
    [4, 5, 6],
    'idle',
    'Inicialización del buffer: s->top = -1. La pila reside en un bloque contiguo de memoria y se encuentra vacía.',
    'El puntero de cima top = -1 indica que el búfer no contiene elementos activos.'
  );

  // ==========================================================================
  // OPERACIÓN 1: push(v0) [ej. 10]
  // ==========================================================================
  comparisonsCount++;
  recordFrame(
    [15, 16, 17, 18],
    [8, 9, 10],
    'compare',
    `push(${v0}) — Comprobación de capacidad: Se verifica si top (${stack.length - 1}) >= CAPACITY - 1 (7).`,
    'No hay riesgo de Stack Overflow. Existe capacidad disponible en el búfer contiguo.'
  );

  stack.push(v0);
  operationsCount++;
  recordFrame(
    [19, 20, 21, 22],
    [11, 12, 13],
    'locked',
    `push(${v0}) — Inserción en memoria: top avanza a 0. Se escribe ${v0} en data[0] (${formatHexAddress(0)}).`,
    `El puntero top señala ahora la dirección ${formatHexAddress(0)}, donde reside la nueva cima.`,
    'sorted'
  );

  // ==========================================================================
  // OPERACIÓN 2: push(v1) [ej. 25]
  // ==========================================================================
  comparisonsCount++;
  recordFrame(
    [15, 16, 17, 18],
    [8, 9, 10],
    'compare',
    `push(${v1}) — Comprobación de capacidad: Comprobamos si top (${stack.length - 1}) >= CAPACITY - 1.`,
    'La condición de overflow es falsa (0 < 7). Procedemos a reservar la siguiente ranura contigua.'
  );

  stack.push(v1);
  operationsCount++;
  recordFrame(
    [19, 20, 21, 22],
    [11, 12, 13],
    'locked',
    `push(${v1}) — Inserción en memoria: top avanza a 1. Se escribe ${v1} en data[1] (${formatHexAddress(1)}).`,
    `El elemento ${v1} se apila sobre ${v0}. El puntero top se actualiza a ${formatHexAddress(1)}.`,
    'sorted'
  );

  // ==========================================================================
  // OPERACIÓN 3: push(v2) [ej. 42]
  // ==========================================================================
  comparisonsCount++;
  recordFrame(
    [15, 16, 17, 18],
    [8, 9, 10],
    'compare',
    `push(${v2}) — Comprobación de capacidad: Comprobamos si top (${stack.length - 1}) >= CAPACITY - 1.`,
    'Condición satisfecha (1 < 7). Procedemos a almacenar el tercer elemento.'
  );

  stack.push(v2);
  operationsCount++;
  recordFrame(
    [19, 20, 21, 22],
    [11, 12, 13],
    'locked',
    `push(${v2}) — Inserción en memoria: top avanza a 2. Se almacena ${v2} en data[2] (${formatHexAddress(2)}).`,
    `La pila contiene ahora 3 elementos: [${stack.join(', ')}]. La cima activa es ${v2}.`,
    'sorted'
  );

  // ==========================================================================
  // OPERACIÓN 4: peek()
  // ==========================================================================
  comparisonsCount++;
  recordFrame(
    [33, 34, 35, 36],
    [22, 23, 24],
    'compare',
    `peek() — Inspección de cima: Se comprueba que top >= 0 (top = ${stack.length - 1}).`,
    'La pila no está vacía; no se produce Stack Underflow.',
    'comparing'
  );

  recordFrame(
    [37, 38],
    [25],
    'compare',
    `peek() — Retorno sin mutación: Lee data[top] = ${stack[stack.length - 1]} en ${formatHexAddress(stack.length - 1)}.`,
    `peek() retorna ${stack[stack.length - 1]} en tiempo O(1) sin alterar el puntero top ni extraer el elemento.`,
    'comparing'
  );

  // ==========================================================================
  // OPERACIÓN 5: pop() -> extrae 42
  // ==========================================================================
  comparisonsCount++;
  recordFrame(
    [24, 25, 26, 27],
    [15, 16, 17],
    'compare',
    `pop() — Comprobación de subdesbordamiento: Verificamos si top >= 0 (top = ${stack.length - 1}).`,
    'La pila contiene elementos activos; procedemos a recuperar y decrementar.',
    'swapping'
  );

  const poppedValue = stack.pop()!;
  operationsCount++;
  recordFrame(
    [28, 29, 30, 31],
    [18, 19, 20],
    'swap',
    `pop() -> extrae ${poppedValue}: Se recupera ${poppedValue} y top retrocede a ${stack.length - 1} (${formatHexAddress(stack.length - 1)}).`,
    `El espacio en ${formatHexAddress(stack.length)} queda lógicamente desasignado. La nueva cima es ${stack[stack.length - 1]}.`,
    'sorted'
  );

  // ==========================================================================
  // OPERACIÓN 6: push(v3) [ej. 68]
  // ==========================================================================
  comparisonsCount++;
  recordFrame(
    [15, 16, 17, 18],
    [8, 9, 10],
    'compare',
    `push(${v3}) — Comprobación de capacidad: Verificamos si top (${stack.length - 1}) >= CAPACITY - 1.`,
    'Espacio disponible. Reutilizaremos la ranura de memoria liberada por la operación pop previa.'
  );

  stack.push(v3);
  operationsCount++;
  recordFrame(
    [19, 20, 21, 22],
    [11, 12, 13],
    'locked',
    `push(${v3}) — Inserción en memoria: top avanza a 2. Se almacena ${v3} en data[2] (${formatHexAddress(2)}).`,
    `Se sobrescribe la posición física ${formatHexAddress(2)}. El puntero top se sitúa en ${v3}.`,
    'sorted'
  );

  // ==========================================================================
  // OPERACIÓN 7: push(v4) [ej. 88]
  // ==========================================================================
  comparisonsCount++;
  recordFrame(
    [15, 16, 17, 18],
    [8, 9, 10],
    'compare',
    `push(${v4}) — Comprobación de capacidad: Verificamos si top (${stack.length - 1}) >= CAPACITY - 1.`,
    'Capacidad disponible en el búfer contiguo.'
  );

  stack.push(v4);
  operationsCount++;
  recordFrame(
    [19, 20, 21, 22],
    [11, 12, 13],
    'locked',
    `push(${v4}) — Inserción en memoria: top avanza a 3. Se almacena ${v4} en data[3] (${formatHexAddress(3)}).`,
    `La pila cuenta ahora con 4 elementos: [${stack.join(', ')}]. La cima actual es ${v4}.`,
    'sorted'
  );

  // ==========================================================================
  // FOTOGRAMA FINAL: Estado de equilibrio
  // ==========================================================================
  recordFrame(
    [1, 2],
    [1, 2],
    'idle',
    `Secuencia de operaciones completada: La pila contiene [${stack.join(', ')}] con cima top = ${stack.length - 1} (${formatHexAddress(stack.length - 1)}).`,
    'Todas las operaciones (push, pop, peek) se ejecutaron en tiempo O(1) con espacio contiguo O(N).',
    'sorted'
  );

  const totalSteps = rawFrames.length;
  return rawFrames.map((frame, index) => {
    const stepIndex = index + 1;
    return {
      ...frame,
      stepIndex,
      totalSteps,
      explanation: {
        stepLabel: `Paso ${stepIndex} de ${totalSteps}:`,
        text: frame.explanation.text,
        subNote: frame.explanation.subNote,
      },
    };
  });
}
