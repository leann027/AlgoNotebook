/**
 * AlgoNotebook — Montículo Binario (Min-Heap / Heapify-Up) Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona, sin `any`.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Emite treeState (árbol binario balanceado con padre < hijos) Y arrayState (representación en memoria contigua).
 * - Mapeo topológico de árbol completo: hijo izquierdo = 2i + 1, hijo derecho = 2i + 2, padre = (i - 1) / 2.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  TreeAlgorithmState,
  TreeNodeData,
  ComparisonDetails,
} from '../../../core/types';

export const DEFAULT_MIN_HEAP_KEYS: readonly number[] = [45, 20, 14, 32, 25, 8];

interface RawTraceFrame {
  highlightLines: {
    c: number[];
    python: number[];
  };
  arrayState: number[];
  elementStates: Record<number, ElementState>;
  pointers: Record<string, number>;
  activeAction: ActiveAction;
  treeState: TreeAlgorithmState;
  comparison?: ComparisonDetails;
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
 * Construye el estado tipado del árbol binario completo a partir del arreglo contiguo del heap.
 */
function buildTreeState(
  heap: number[],
  activeNodeIdx?: number | null,
  insertedNodeIdx?: number | null,
  visitedPath?: string[],
  currentKey?: number | null
): TreeAlgorithmState {
  const nodes: Record<string, TreeNodeData> = {};

  for (let idx = 0; idx < heap.length; idx++) {
    const leftIdx = 2 * idx + 1;
    const rightIdx = 2 * idx + 2;

    let state: ElementState = 'default';
    if (idx === activeNodeIdx) {
      state = 'comparing';
    } else if (idx === insertedNodeIdx) {
      state = 'sorted';
    }

    nodes[`node-${idx}`] = {
      id: `node-${idx}`,
      value: heap[idx],
      leftId: leftIdx < heap.length ? `node-${leftIdx}` : null,
      rightId: rightIdx < heap.length ? `node-${rightIdx}` : null,
      state,
    };
  }

  return {
    rootId: heap.length > 0 ? 'node-0' : null,
    nodes,
    activeNodeId:
      activeNodeIdx !== null && activeNodeIdx !== undefined
        ? `node-${activeNodeIdx}`
        : null,
    insertedNodeId:
      insertedNodeIdx !== null && insertedNodeIdx !== undefined
        ? `node-${insertedNodeIdx}`
        : null,
    visitedPath: visitedPath ?? [],
    currentKey: currentKey ?? null,
  };
}

/**
 * Generador puro y síncrono de fotogramas de ejecución para inserción en Min-Heap con burbujeo ascendente (heapifyUp).
 *
 * @param initialKeys Secuencia numérica opcional de claves a insertar (por defecto [45, 20, 14, 32, 25, 8]).
 * @returns Lista inmutable de fotogramas paso a paso (TraceFrame[]).
 */
export function generateMinHeapTrace(initialKeys?: number[]): TraceFrame[] {
  const keys =
    Array.isArray(initialKeys) && initialKeys.length >= 2
      ? initialKeys
      : Array.from(DEFAULT_MIN_HEAP_KEYS);

  const rawFrames: RawTraceFrame[] = [];
  const heap: number[] = [];
  let comparisonsCount = 0;
  let swapsCount = 0;
  let insertionPass = 0;

  const recordFrame = (
    cLines: number[],
    pyLines: number[],
    action: ActiveAction,
    text: string,
    subNote: string,
    options?: {
      activeIdx?: number | null;
      parentIdx?: number | null;
      insertedIdx?: number | null;
      comparison?: ComparisonDetails;
      currentKey?: number | null;
      swapIndices?: [number, number];
    }
  ) => {
    const activeIdx = options?.activeIdx ?? null;
    const parentIdx = options?.parentIdx ?? null;
    const insertedIdx = options?.insertedIdx ?? null;
    const swapIndices = options?.swapIndices;

    const elemStates: Record<number, ElementState> = {};
    for (let idx = 0; idx < heap.length; idx++) {
      if (swapIndices && (idx === swapIndices[0] || idx === swapIndices[1])) {
        elemStates[idx] = 'swapping';
      } else if (idx === activeIdx || idx === parentIdx) {
        elemStates[idx] = 'comparing';
      } else if (idx === insertedIdx) {
        elemStates[idx] = 'sorted';
      } else {
        elemStates[idx] = 'default';
      }
    }

    const numPointers: Record<string, number> = {};
    if (activeIdx !== null && activeIdx !== undefined) {
      numPointers.i = activeIdx;
    }
    if (parentIdx !== null && parentIdx !== undefined) {
      numPointers.parent = parentIdx;
    }

    const visitedPath: string[] = [];
    if (parentIdx !== null && activeIdx !== null) {
      visitedPath.push(`node-${parentIdx}`, `node-${activeIdx}`);
    }

    rawFrames.push({
      highlightLines: {
        c: cLines,
        python: pyLines,
      },
      arrayState: [...heap],
      elementStates: elemStates,
      pointers: numPointers,
      activeAction: action,
      treeState: buildTreeState(
        heap,
        activeIdx,
        insertedIdx,
        visitedPath,
        options?.currentKey ?? null
      ),
      comparison: options?.comparison,
      explanation: {
        text,
        subNote,
      },
      metrics: {
        comparisons: comparisonsCount,
        swaps: swapsCount,
        passNumber: insertionPass,
      },
    });
  };

  // ==========================================================================
  // PASO 0: Montículo vacío inicial
  // ==========================================================================
  recordFrame(
    [7, 8, 9],
    [4, 5],
    'idle',
    'Inicialización del Min-Heap: Estructura vacía en memoria con size = 0.',
    'Los nodos del árbol binario completo se indexarán secuencialmente en el arreglo: para cada nodo i, su hijo izquierdo reside en 2i+1, el derecho en 2i+2, y su padre en (i-1)/2.'
  );

  // ==========================================================================
  // INSERCIONES SECUENCIALES
  // ==========================================================================
  for (const key of keys) {
    insertionPass++;
    const insertIdx = heap.length;

    // 1. Colocar elemento en la última posición disponible
    heap.push(key);
    recordFrame(
      [32, 33, 34],
      [19, 20],
      'locked',
      `insert(${key}) — Colocación al final: Se añade ${key} en la ranura libre índice ${insertIdx}.`,
      insertIdx === 0
        ? 'Al ser el primer elemento, se establece directamente como la raíz del montículo (índice 0).'
        : `El nodo ${key} se ubica como hoja en el nivel inferior (posición ${insertIdx}), manteniendo la forma de árbol binario completo.`,
      {
        activeIdx: insertIdx,
        insertedIdx: insertIdx,
        currentKey: key,
      }
    );

    // 2. Procedimiento heapifyUp (burbujeo hacia arriba)
    let i = insertIdx;

    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      comparisonsCount++;
      const conditionMet = heap[i] < heap[p];

      // Fotograma de comparación entre hijo y padre
      recordFrame(
        [22],
        [11],
        'compare',
        `heapifyUp(${i}) — Comparación con el padre: ¿heap[${i}] (${heap[i]}) < heap[${p}] (${heap[p]})? ${conditionMet ? 'SÍ' : 'NO'}.`,
        conditionMet
          ? `La clave hija (${heap[i]}) es menor que su padre (${heap[p]}), violando el invariante de montículo mínimo. Requiere ascenso (swap).`
          : `La clave hija (${heap[i]}) es mayor o igual que su padre (${heap[p]}). La propiedad de min-heap se satisface en esta rama.`,
        {
          activeIdx: i,
          parentIdx: p,
          currentKey: key,
          comparison: {
            leftIndex: p,
            rightIndex: i,
            leftValue: heap[p],
            rightValue: heap[i],
            conditionMet,
          },
        }
      );

      if (!conditionMet) {
        break;
      }

      // Intercambio físico de valores
      swapsCount++;
      const prevI = i;
      const prevP = p;
      const temp = heap[i];
      heap[i] = heap[p];
      heap[p] = temp;

      recordFrame(
        [23],
        [12, 13],
        'swap',
        `heapifyUp — Intercambio en memoria: swap(&data[${prevI}], &data[${prevP}]). ${key} asciende a la posición ${prevP} y ${heap[prevI]} desciende a ${prevI}.`,
        `Se intercambian los valores en el arreglo y se reajustan sus enlaces padre-hijo en el árbol binario.`,
        {
          swapIndices: [prevI, prevP],
          currentKey: key,
        }
      );

      // Desplazamiento del puntero de índice hacia el padre
      i = p;
      recordFrame(
        [24],
        [14],
        'locked',
        `heapifyUp — Ascenso de puntero: i = parent(i) = ${i}. El valor ${key} continúa inspeccionando el siguiente nivel superior.`,
        i === 0
          ? 'i ha alcanzado la raíz del montículo (índice 0). No existen más ancestros.'
          : `El nodo ${key} evaluará ahora a su nuevo padre en el nivel superior.`,
        {
          activeIdx: i,
          currentKey: key,
        }
      );
    }

    // Inserción de la clave finalizada y confirmada
    recordFrame(
      [26, 36],
      [15, 22],
      'locked',
      `insert(${key}) completada: Montículo reequilibrado. Subárbol ordenado con propiedad min-heap preservada.`,
      `El elemento ${key} ha alcanzado su posición estable definitiva en el índice ${i}.`,
      {
        insertedIdx: i,
        currentKey: key,
      }
    );
  }

  // ==========================================================================
  // FOTOGRAMA FINAL: Estado global consolidado
  // ==========================================================================
  recordFrame(
    [1, 2],
    [1, 2],
    'idle',
    `Min-Heap construido: [${heap.join(', ')}]. La raíz (índice 0) contiene el valor mínimo absoluto (${heap[0]}).`,
    `Cada elemento fue insertado en tiempo O(log N). El arreglo lineal preserva la topología de montículo completo con espacio auxiliar O(1).`
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
