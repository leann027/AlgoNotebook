/**
 * AlgoNotebook — Floyd's Tortoise and Hare Cycle Detection Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Modela una lista simplemente enlazada con ciclo en memoria.
 * - Utiliza punteros slow (tortuga, 1 paso) y fast (liebre, 2 pasos).
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  LinkedListAlgorithmState,
  LinkedListNodeData,
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
  linkedListState: LinkedListAlgorithmState;
  explanation: {
    stepLabel: string;
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

/**
 * Nodos de la lista con ciclo.
 * Por defecto 6 nodos: 10 -> 25 -> 38 -> 47 -> 62 -> 75 -> 38...
 * El último nodo apunta de regreso a la mitad de la lista, formando un ciclo.
 */
function createCanonicalCycleNodes(customValues?: number[]): LinkedListNodeData[] {
  const defaultVals = [10, 25, 38, 47, 62, 75];
  const vals = customValues && customValues.length >= 4 ? customValues : defaultVals;
  const cycleTarget = Math.floor(vals.length / 2);
  return vals.map((val, idx) => ({
    id: `node-${idx}`,
    value: val,
    address: `0x1A${(idx * 16).toString(16).toUpperCase().padStart(2, '0')}`,
    nextId: idx === vals.length - 1 ? `node-${cycleTarget}` : `node-${idx + 1}`,
    state: 'default' as const,
  }));
}

function cloneNodes(nodes: LinkedListNodeData[]): LinkedListNodeData[] {
  return nodes.map((n) => ({ ...n }));
}

/**
 * Generador puro de traza para Detección de Ciclos de Floyd.
 */
export function generateCycleDetectionTrace(customValues?: number[]): TraceFrame[] {
  const rawFrames: RawFrame[] = [];
  const nodes = createCanonicalCycleNodes(customValues);
  const nodeValues = nodes.map((n) => n.value);

  // Mapa dinámico de índices sucesores en la lista enlazada
  const cycleTarget = Math.floor(nodes.length / 2);
  const nextIndexMap: Record<number, number> = {};
  for (let i = 0; i < nodes.length; i++) {
    nextIndexMap[i] = i === nodes.length - 1 ? cycleTarget : i + 1;
  }

  let slowIdx = 0;
  let fastIdx = 0;
  let iterations = 0;

  // Frame 0: Inicialización
  rawFrames.push({
    highlightLines: { c: [13, 14], python: [9, 10] },
    arrayState: [...nodeValues],
    elementStates: { 0: 'comparing' },
    pointers: { slow: 0, fast: 0 },
    activeAction: 'idle',
    linkedListState: {
      nodes: cloneNodes(nodes),
      headId: 'node-0',
      pointers: { slow: 'node-0', fast: 'node-0' },
      hasCycle: true,
    },
    explanation: {
      stepLabel: 'Inicialización de Punteros:',
      text: 'Se ubican ambos punteros en la cabeza de la lista: slow (tortuga) y fast (liebre) en node-0 (val: 10).',
      subNote: 'La lista contiene un ciclo interno desde el nodo 5 (val: 75) hacia el nodo 2 (val: 38).',
    },
    metrics: {
      comparisons: 0,
      swaps: 0,
      passNumber: 0,
      totalPasses: 8,
      maxComparisons: 10,
    },
  });

  // Iteraciones de avance hasta la colisión
  while (iterations < 10) {
    iterations++;

    // 1. Paso de comprobación de condición del bucle
    rawFrames.push({
      highlightLines: { c: [15], python: [11] },
      arrayState: [...nodeValues],
      elementStates: {
        [slowIdx]: 'comparing',
        [fastIdx]: 'pointer',
      },
      pointers: { slow: slowIdx, fast: fastIdx },
      activeAction: 'compare',
      linkedListState: {
        nodes: cloneNodes(nodes),
        headId: 'node-0',
        pointers: { slow: `node-${slowIdx}`, fast: `node-${fastIdx}` },
        hasCycle: true,
      },
      explanation: {
        stepLabel: `Iteración #${iterations}: Evaluación de Bucle:`,
        text: `Comprobando fast != NULL && fast->next != NULL. La liebre se ubica en el nodo ${fastIdx} (val: ${nodes[fastIdx].value}). La cadena continúa.`,
        subNote: 'La liebre puede avanzar 2 saltos seguros sin violación de segmento.',
      },
      metrics: {
        comparisons: iterations,
        swaps: 0,
        passNumber: iterations,
        totalPasses: 6,
        maxComparisons: 10,
      },
    });

    // 2. Avance del puntero slow (1 salto)
    const oldSlow = slowIdx;
    slowIdx = nextIndexMap[slowIdx];

    rawFrames.push({
      highlightLines: { c: [16], python: [12] },
      arrayState: [...nodeValues],
      elementStates: {
        [oldSlow]: 'default',
        [slowIdx]: 'comparing',
        [fastIdx]: 'pointer',
      },
      pointers: { slow: slowIdx, fast: fastIdx },
      activeAction: 'idle',
      linkedListState: {
        nodes: cloneNodes(nodes),
        headId: 'node-0',
        pointers: { slow: `node-${slowIdx}`, fast: `node-${fastIdx}` },
        hasCycle: true,
      },
      explanation: {
        stepLabel: `Avance Tortuga (1x):`,
        text: `Puntero slow avanza 1 posición: de nodo ${oldSlow} (${nodes[oldSlow].value}) a nodo ${slowIdx} (${nodes[slowIdx].value}).`,
        subNote: 'Velocidad de avance: 1 paso por ciclo.',
      },
      metrics: {
        comparisons: iterations,
        swaps: 0,
        passNumber: iterations,
        totalPasses: 6,
        maxComparisons: 10,
      },
    });

    // 3. Avance del puntero fast (2 saltos)
    const oldFast = fastIdx;
    const midFast = nextIndexMap[fastIdx];
    fastIdx = nextIndexMap[midFast];

    rawFrames.push({
      highlightLines: { c: [17], python: [13] },
      arrayState: [...nodeValues],
      elementStates: {
        [slowIdx]: slowIdx === fastIdx ? 'sorted' : 'comparing',
        [fastIdx]: slowIdx === fastIdx ? 'sorted' : 'pointer',
      },
      pointers: { slow: slowIdx, fast: fastIdx },
      activeAction: 'idle',
      linkedListState: {
        nodes: cloneNodes(nodes),
        headId: 'node-0',
        pointers: { slow: `node-${slowIdx}`, fast: `node-${fastIdx}` },
        hasCycle: true,
      },
      explanation: {
        stepLabel: `Avance Liebre (2x):`,
        text: `Puntero fast salta 2 posiciones: de nodo ${oldFast} (${nodes[oldFast].value}) a través de nodo ${midFast} (${nodes[midFast].value}) hacia nodo ${fastIdx} (${nodes[fastIdx].value}).`,
        subNote: 'Velocidad de avance: 2 pasos por ciclo.',
      },
      metrics: {
        comparisons: iterations,
        swaps: 0,
        passNumber: iterations,
        totalPasses: 6,
        maxComparisons: 10,
      },
    });

    // 4. Comprobación de colisión: if (slow == fast)
    const isCollision = slowIdx === fastIdx;

    rawFrames.push({
      highlightLines: { c: [19, 20], python: [15, 16] },
      arrayState: [...nodeValues],
      elementStates: {
        [slowIdx]: isCollision ? 'sorted' : 'comparing',
        [fastIdx]: isCollision ? 'sorted' : 'pointer',
      },
      pointers: { slow: slowIdx, fast: fastIdx },
      activeAction: isCollision ? 'locked' : 'compare',
      linkedListState: {
        nodes: cloneNodes(nodes),
        headId: 'node-0',
        pointers: { slow: `node-${slowIdx}`, fast: `node-${fastIdx}` },
        hasCycle: true,
      },
      explanation: {
        stepLabel: isCollision ? '¡COLISIÓN CONFIRMADA!' : `Comprobación slow == fast:`,
        text: isCollision
          ? `¡slow y fast coinciden en el mismo nodo ${slowIdx} (val: ${nodes[slowIdx].value}, dir: ${nodes[slowIdx].address})! Se confirma la existencia de un ciclo.`
          : `slow (${nodes[slowIdx].value}) != fast (${nodes[fastIdx].value}). No hay colisión en esta ronda; la diferencia relativa se reduce.`,
        subNote: isCollision
          ? 'Retorno inmediato de true; ciclo matemáticamente garantizado.'
          : 'En cada paso dentro del ciclo, la distancia circular entre ambos punteros decrece en 1.',
      },
      metrics: {
        comparisons: iterations,
        swaps: isCollision ? 1 : 0,
        passNumber: iterations,
        totalPasses: 6,
        maxComparisons: 10,
      },
    });

    if (isCollision) {
      break;
    }
  }

  // Fotograma final de confirmación
  const finalNodes = cloneNodes(nodes);
  // Resaltar dinámicamente los nodos que forman parte del bucle en menta
  const cycleIndices: number[] = [];
  const cycleStates: Record<number, 'sorted'> = {};
  for (let idx = cycleTarget; idx < finalNodes.length; idx++) {
    if (finalNodes[idx]) {
      finalNodes[idx].state = 'sorted';
      cycleStates[idx] = 'sorted';
      cycleIndices.push(idx);
    }
  }

  const cycleValuesStr = cycleIndices
    .map((i) => nodes[i]?.value)
    .filter((v) => v !== undefined)
    .join(', ');

  rawFrames.push({
    highlightLines: { c: [20], python: [16] },
    arrayState: [...nodeValues],
    elementStates: cycleStates,
    pointers: { slow: slowIdx, fast: fastIdx },
    activeAction: 'locked',
    linkedListState: {
      nodes: finalNodes,
      headId: 'node-0',
      pointers: { slow: `node-${slowIdx}`, fast: `node-${fastIdx}` },
      hasCycle: true,
    },
    explanation: {
      stepLabel: 'Algoritmo de Floyd Finalizado:',
      text: `Ciclo detectado exitosamente en ${iterations} iteraciones sin memoria auxiliar adicional (Espacio O(1)).`,
      subNote: `Punto de encuentro: nodo ${slowIdx} (${nodes[slowIdx]?.value ?? ''}). El ciclo abarca los nodos [${cycleValuesStr}].`,
    },
    metrics: {
      comparisons: iterations,
      swaps: 1,
      passNumber: iterations,
      totalPasses: iterations,
      maxComparisons: 10,
    },
  });

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
    explanation: frame.explanation,
    metrics: frame.metrics,
  }));
}
