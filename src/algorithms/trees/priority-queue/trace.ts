/**
 * AlgoNotebook — Priority Queue / Min-Heap Pure Trace Generator
 *
 * Muestra el ciclo de vida completo de una cola de prioridad basada en min-heap:
 * 1. Operaciones Push con burbujeo ascendente (Sift-Up) para cada clave.
 * 2. Operación Peek para inspeccionar el mínimo global en la raíz en O(1).
 * 3. Operaciones Pop (Extract-Min) con burbujeo descendente (Sift-Down) en O(log N).
 *
 * Emite simultáneamente treeState (árbol jerárquico binario completo)
 * y arrayState (búfer contiguo en memoria plana).
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  TreeAlgorithmState,
  TreeNodeData,
  ComparisonDetails,
} from '../../../core/types';

export const DEFAULT_PQ_KEYS: readonly number[] = [38, 20, 15, 42, 10, 8, 25];

interface RawFrame {
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

function buildTreeState(
  heap: number[],
  activeIdx?: number | null,
  highlightIdx?: number | null,
  visitedPath?: string[]
): TreeAlgorithmState {
  const nodes: Record<string, TreeNodeData> = {};

  for (let i = 0; i < heap.length; i++) {
    const leftIdx = 2 * i + 1;
    const rightIdx = 2 * i + 2;

    let state: ElementState = 'default';
    if (i === activeIdx) {
      state = 'comparing';
    } else if (i === highlightIdx) {
      state = 'sorted';
    }

    nodes[`node-${i}`] = {
      id: `node-${i}`,
      value: heap[i],
      leftId: leftIdx < heap.length ? `node-${leftIdx}` : null,
      rightId: rightIdx < heap.length ? `node-${rightIdx}` : null,
      state,
    };
  }

  return {
    rootId: heap.length > 0 ? 'node-0' : null,
    nodes,
    activeNodeId: activeIdx !== null && activeIdx !== undefined ? `node-${activeIdx}` : null,
    insertedNodeId: highlightIdx !== null && highlightIdx !== undefined ? `node-${highlightIdx}` : null,
    visitedPath: visitedPath ?? [],
    currentKey: activeIdx !== null && activeIdx !== undefined && activeIdx < heap.length ? heap[activeIdx] : null,
  };
}

export function generatePriorityQueueTrace(initialKeys?: number[]): TraceFrame[] {
  const keys = Array.isArray(initialKeys) && initialKeys.length > 0
    ? initialKeys.slice(0, 7)
    : [...DEFAULT_PQ_KEYS];

  const rawFrames: RawFrame[] = [];
  const heap: number[] = [];
  let totalComparisons = 0;
  let totalSwaps = 0;
  let stepCount = 0;

  // Frame 1: Cola inicial vacía
  rawFrames.push({
    highlightLines: { c: [18, 19], python: [7, 8] },
    arrayState: [],
    elementStates: {},
    pointers: {},
    activeAction: 'idle',
    treeState: buildTreeState([]),
    explanation: {
      text: 'Inicializando Cola de Prioridad basada en Min-Heap. Capacidad disponible.',
      subNote: 'Invariante: heap[padre] <= heap[hijos]. La raíz mantendrá permanentemente el elemento mínimo.',
    },
    metrics: {
      comparisons: 0,
      swaps: 0,
      passNumber: 0,
    },
  });

  // Fase 1: Inserciones (push)
  for (let k = 0; k < keys.length; k++) {
    const val = keys[k];
    stepCount++;
    heap.push(val);
    let idx = heap.length - 1;

    // Frame: Insertar al final
    rawFrames.push({
      highlightLines: { c: [27, 28], python: [14, 15] },
      arrayState: [...heap],
      elementStates: Object.fromEntries(
        heap.map((_, i) => [i, i === idx ? 'pointer' : 'default'])
      ),
      pointers: { inserted: idx },
      activeAction: 'pivot',
      treeState: buildTreeState(heap, idx, idx),
      explanation: {
        text: `Push(${val}): Insertando elemento al final del montículo en el índice ${idx}.`,
        subNote: 'Iniciando fase de burbujeo ascendente (Sift-Up) para restaurar el invariante de min-heap.',
      },
      metrics: {
        comparisons: totalComparisons,
        swaps: totalSwaps,
        passNumber: stepCount,
      },
    });

    // Bucle Sift-Up
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      totalComparisons++;
      const conditionMet = heap[idx] < heap[parent];

      rawFrames.push({
        highlightLines: { c: [31, 32], python: [18, 19] },
        arrayState: [...heap],
        elementStates: Object.fromEntries(
          heap.map((_, i) => [
            i,
            i === idx || i === parent ? 'comparing' : 'default',
          ])
        ),
        pointers: { child: idx, parent },
        activeAction: 'compare',
        treeState: buildTreeState(heap, idx, parent),
        comparison: {
          leftIndex: idx,
          rightIndex: parent,
          leftValue: heap[idx],
          rightValue: heap[parent],
          conditionMet,
        },
        explanation: {
          text: `Sift-Up: Comparando hijo heap[${idx}]=${heap[idx]} con padre heap[${parent}]=${heap[parent]}.`,
          subNote: conditionMet
            ? `Como ${heap[idx]} < ${heap[parent]}, viola el invariante de min-heap. Intercambiando hacia arriba.`
            : `Invariante satisfecho: ${heap[parent]} <= ${heap[idx]}. Posición definitiva alcanzada.`,
        },
        metrics: {
          comparisons: totalComparisons,
          swaps: totalSwaps,
          passNumber: stepCount,
        },
      });

      if (conditionMet) {
        totalSwaps++;
        const tmp = heap[idx];
        heap[idx] = heap[parent];
        heap[parent] = tmp;

        rawFrames.push({
          highlightLines: { c: [33, 34, 35], python: [20] },
          arrayState: [...heap],
          elementStates: Object.fromEntries(
            heap.map((_, i) => [
              i,
              i === parent ? 'swapping' : 'default',
            ])
          ),
          pointers: { current: parent },
          activeAction: 'swap',
          treeState: buildTreeState(heap, parent, parent),
          explanation: {
            text: `Intercambio realizado: ${tmp} ascendió al índice de su padre (${parent}).`,
            subNote: `Nueva posición para evaluar: índice ${parent}.`,
          },
          metrics: {
            comparisons: totalComparisons,
            swaps: totalSwaps,
            passNumber: stepCount,
          },
        });

        idx = parent;
      } else {
        break;
      }
    }
  }

  // Fase 2: Peek (Inspeccionar mínimo)
  if (heap.length > 0) {
    stepCount++;
    rawFrames.push({
      highlightLines: { c: [21, 22], python: [10, 11] },
      arrayState: [...heap],
      elementStates: Object.fromEntries(
        heap.map((_, i) => [i, i === 0 ? 'sorted' : 'default'])
      ),
      pointers: { minRoot: 0 },
      activeAction: 'locked',
      treeState: buildTreeState(heap, 0, 0),
      explanation: {
        text: `Peek(): Inspeccionando la raíz heap[0] = ${heap[0]}. Es el mínimo global garantizado en O(1).`,
        subNote: 'La cola de prioridad permite consultar el elemento más prioritario en tiempo constante sin modificar el árbol.',
      },
      metrics: {
        comparisons: totalComparisons,
        swaps: totalSwaps,
        passNumber: stepCount,
      },
    });
  }

  // Fase 3: Pop (Extract-Min)
  if (heap.length > 0) {
    stepCount++;
    const minExtracted = heap[0];
    const lastVal = heap.pop()!;

    if (heap.length > 0) {
      heap[0] = lastVal;

      rawFrames.push({
        highlightLines: { c: [42, 43], python: [27, 28] },
        arrayState: [...heap],
        elementStates: Object.fromEntries(
          heap.map((_, i) => [i, i === 0 ? 'swapping' : 'default'])
        ),
        pointers: { root: 0 },
        activeAction: 'swap',
        treeState: buildTreeState(heap, 0, 0),
        explanation: {
          text: `Pop(): Extrayendo mínimo global (${minExtracted}). Último elemento (${lastVal}) colocado en la raíz.`,
          subNote: 'Iniciando burbujeo descendente (Sift-Down) para restablecer la propiedad de montículo.',
        },
        metrics: {
          comparisons: totalComparisons,
          swaps: totalSwaps,
          passNumber: stepCount,
        },
      });

      // Sift-Down
      let downIdx = 0;
      while (2 * downIdx + 1 < heap.length) {
        const left = 2 * downIdx + 1;
        const right = 2 * downIdx + 2;
        let smallest = downIdx;

        totalComparisons++;
        if (heap[left] < heap[smallest]) {
          smallest = left;
        }

        if (right < heap.length) {
          totalComparisons++;
          if (heap[right] < heap[smallest]) {
            smallest = right;
          }
        }

        rawFrames.push({
          highlightLines: { c: [49, 50, 52], python: [35, 36, 37] },
          arrayState: [...heap],
          elementStates: Object.fromEntries(
            heap.map((_, i) => [
              i,
              i === downIdx ? 'comparing' : i === smallest ? 'swapping' : 'default',
            ])
          ),
          pointers: { current: downIdx, minCandidate: smallest },
          activeAction: 'compare',
          treeState: buildTreeState(heap, downIdx, smallest),
          explanation: {
            text: `Sift-Down: Comparando nodo ${downIdx} (${heap[downIdx]}) con sus hijos disponibles.`,
            subNote: smallest !== downIdx
              ? `Hijo menor encontrado en índice ${smallest} (valor ${heap[smallest]}). Se procede a intercambiar.`
              : 'El nodo actual es menor o igual a ambos hijos. El invariante de min-heap está completamente restaurado.',
          },
          metrics: {
            comparisons: totalComparisons,
            swaps: totalSwaps,
            passNumber: stepCount,
          },
        });

        if (smallest !== downIdx) {
          totalSwaps++;
          const temp = heap[downIdx];
          heap[downIdx] = heap[smallest];
          heap[smallest] = temp;

          rawFrames.push({
            highlightLines: { c: [55, 56, 57], python: [40, 41] },
            arrayState: [...heap],
            elementStates: Object.fromEntries(
              heap.map((_, i) => [i, i === smallest ? 'sorted' : 'default'])
            ),
            pointers: { current: smallest },
            activeAction: 'swap',
            treeState: buildTreeState(heap, smallest, smallest),
            explanation: {
              text: `Intercambio descendente completado: valor ${temp} descendió al índice ${smallest}.`,
              subNote: `Continuando descenso en índice ${smallest} si existen hijos adicionales.`,
            },
            metrics: {
              comparisons: totalComparisons,
              swaps: totalSwaps,
              passNumber: stepCount,
            },
          });

          downIdx = smallest;
        } else {
          break;
        }
      }
    } else {
      rawFrames.push({
        highlightLines: { c: [42, 43], python: [27, 28] },
        arrayState: [],
        elementStates: {},
        pointers: {},
        activeAction: 'locked',
        treeState: buildTreeState([]),
        explanation: {
          text: `Pop(): Extrayendo único elemento (${minExtracted}). El montículo queda vacío.`,
          subNote: 'La cola de prioridad no contiene elementos adicionales.',
        },
        metrics: {
          comparisons: totalComparisons,
          swaps: totalSwaps,
          passNumber: stepCount,
        },
      });
    }
  }


  // Frame final
  rawFrames.push({
    highlightLines: { c: [63], python: [46] },
    arrayState: [...heap],
    elementStates: heap.length > 0 ? Object.fromEntries(heap.map((_, i) => [i, 'sorted'])) : {},
    pointers: heap.length > 0 ? { minRoot: 0 } : {},
    activeAction: 'locked',
    treeState: buildTreeState(heap, null, heap.length > 0 ? 0 : null),
    explanation: {
      text: `Estado final de la Cola de Prioridad: ${heap.length} elementos estructurados en Min-Heap válido.`,
      subNote:
        heap.length > 0
          ? `Nuevo mínimo en la raíz: ${heap[0]}. Complejidad garantizada O(log N) para push/pop y O(1) para peek.`
          : 'La cola de prioridad se encuentra vacía.',
    },
    metrics: {
      comparisons: totalComparisons,
      swaps: totalSwaps,
      passNumber: stepCount,
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
    treeState: rf.treeState,
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
      totalPasses: stepCount,
      maxComparisons: Math.ceil(Math.log2(keys.length + 1)) * 3,
    },
  }));
}
