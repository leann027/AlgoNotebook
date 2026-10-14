import type {
  ActiveAction,
  ElementState,
  LinkedListAlgorithmState,
  LinkedListNodeData,
  TraceFrame,
} from '../../../core/types';

export const DEFAULT_INSERT_VALUES: readonly number[] = [12, 25, 42, 68];
const BASE_ADDRESS = 0x7fff00;
const NODE_SIZE = 0x18;

const addressOf = (index: number): string => `0x${(BASE_ADDRESS + index * NODE_SIZE).toString(16)}`;

interface RawFrame {
  readonly highlightLines: { readonly c: number[]; readonly python: number[] };
  readonly arrayState: number[];
  readonly elementStates: Record<number, ElementState>;
  readonly pointers: Record<string, number>;
  readonly activeAction: ActiveAction;
  readonly linkedListState: LinkedListAlgorithmState;
  readonly explanation: { readonly text: string; readonly subNote?: string };
  readonly metrics: { readonly comparisons: number; readonly swaps: number; readonly passNumber: number };
}

export function generateInsertLinkedListTrace(input?: number[]): TraceFrame[] {
  const values = Array.isArray(input) && input.length > 0 ? [...input] : [...DEFAULT_INSERT_VALUES];
  const nodes: LinkedListNodeData[] = [];
  const frames: RawFrame[] = [];
  let comparisons = 0;
  let writes = 0;

  const snapshotNodes = (): LinkedListNodeData[] => nodes.map((node) => ({ ...node }));
  const record = (
    c: number[],
    python: number[],
    activeAction: ActiveAction,
    text: string,
    subNote: string,
    pointers: Record<string, number>,
    activeIndex: number,
  ): void => {
    const elementStates: Record<number, ElementState> = {};
    nodes.forEach((node, index) => {
      elementStates[index] = index === activeIndex ? 'comparing' : node.state;
    });
    frames.push({
      highlightLines: { c, python },
      arrayState: nodes.map((node) => node.value),
      elementStates,
      pointers,
      activeAction,
      linkedListState: {
        nodes: snapshotNodes(),
        headId: nodes[0]?.id ?? null,
        pointers: {
          curr: pointers.curr === undefined ? null : nodes[pointers.curr]?.id ?? null,
          rear: pointers.tail === undefined ? null : nodes[pointers.tail]?.id ?? null,
          next: pointers.newNode === undefined ? null : nodes[pointers.newNode]?.id ?? null,
        },
      },
      explanation: { text, subNote },
      metrics: { comparisons, swaps: writes, passNumber: nodes.length },
    });
  };

  record(
    [12, 13, 14],
    [8, 9],
    'idle',
    'Inicializamos la lista vacía y preparamos la inserción al final.',
    'Cada nodo nuevo se reservará con next = NULL antes de conectarlo.',
    {},
    -1,
  );

  values.forEach((value, insertionIndex) => {
    const newNodeIndex = nodes.length;
    nodes.push({
      id: `node-${newNodeIndex}`,
      value,
      address: addressOf(newNodeIndex),
      nextId: null,
      state: 'pointer',
    });
    writes++;
    record(
      [5, 6, 7],
      [2, 3, 4],
      'pivot',
      `Reservamos newNode = ${value} en ${addressOf(newNodeIndex)}.`,
      'El nodo comienza aislado: su campo next todavía apunta a NULL.',
      { newNode: newNodeIndex },
      newNodeIndex,
    );

    if (insertionIndex === 0) {
      writes++;
      nodes[0].state = 'sorted';
      record(
        [10, 11],
        [6, 7],
        'locked',
        `La lista estaba vacía: head y tail ahora apuntan a ${value}.`,
        'El primer nodo se convierte simultáneamente en cabeza y cola.',
        { head: 0, tail: 0 },
        0,
      );
      return;
    }

    let tailIndex = 0;
    while (nodes[tailIndex].nextId !== null) {
      comparisons++;
      tailIndex++;
      record(
        [14, 15],
        [10, 11],
        'compare',
        `Recorremos tail hasta encontrar next == NULL (nodo ${nodes[tailIndex - 1].value}).`,
        'El cursor avanza sin modificar los enlaces existentes.',
        { curr: tailIndex - 1, tail: tailIndex - 1, newNode: newNodeIndex },
        tailIndex - 1,
      );
    }
    comparisons++;
    record(
      [14],
      [10],
      'compare',
      `Encontramos la cola en ${nodes[tailIndex].address}; su next es NULL.`,
      'Podemos enlazar el nodo nuevo sin perder la cadena.',
      { curr: tailIndex, tail: tailIndex, newNode: newNodeIndex },
      tailIndex,
    );
    nodes[tailIndex].nextId = nodes[newNodeIndex].id;
    nodes[tailIndex].state = 'sorted';
    nodes[newNodeIndex].state = 'sorted';
    writes++;
    record(
      [16],
      [12],
      'swap',
      `tail->next = newNode: ${value} queda conectado después de ${nodes[tailIndex].value}.`,
      `Inserción ${insertionIndex + 1}/${values.length} completada; la lista conserva su orden.`,
      { tail: tailIndex, newNode: newNodeIndex },
      newNodeIndex,
    );
  });

  const totalSteps = frames.length;
  return frames.map((frame, index) => ({
    ...frame,
    stepIndex: index + 1,
    totalSteps,
    explanation: { stepLabel: `Paso ${index + 1} de ${totalSteps}:`, ...frame.explanation },
  }));
}
