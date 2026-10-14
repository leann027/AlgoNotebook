/**
 * AlgoNotebook — Breadth-First Search (BFS) Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Grafo conexo canónico de 6 vértices (A, B, C, D, E, F) en lienzo 800x460.
 * - Cola FIFO reactiva y estados de nodos/aristas:
 *   * pointer: nodo encolado (lavanda)
 *   * comparing: nodo desencolado en proceso activo (amarillo)
 *   * sorted: nodo completamente procesado (menta)
 *   * active / traversed: aristas evaluadas y de árbol generador
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  GraphAlgorithmState,
  GraphNodeData,
  GraphEdgeData,
  StackFrame,
  TraceEvent,
  TraceSnapshot,
} from '../../../core/types';

/**
 * Coordenadas y etiquetas canónicas de los 6 vértices en un viewport 800x460.
 */
export const CANONICAL_BFS_NODES: Record<string, { x: number; y: number; label: string }> = {
  A: { x: 160, y: 220, label: 'A' },
  B: { x: 300, y: 110, label: 'B' },
  C: { x: 300, y: 330, label: 'C' },
  D: { x: 500, y: 110, label: 'D' },
  E: { x: 500, y: 330, label: 'E' },
  F: { x: 640, y: 220, label: 'F' },
};

/**
 * Lista canónica de aristas no dirigidas según especificación pedagógica:
 * A-B, A-C, B-C, B-D, C-D, C-E, D-E, D-F, E-F.
 */
export const CANONICAL_BFS_EDGES: readonly [string, string][] = [
  ['A', 'B'],
  ['A', 'C'],
  ['B', 'C'],
  ['B', 'D'],
  ['C', 'D'],
  ['C', 'E'],
  ['D', 'E'],
  ['D', 'F'],
  ['E', 'F'],
];

/**
 * Lista de adyacencia ordenada alfabéticamente (coincidente con matriz C y dict Python).
 */
export const BFS_ADJACENCY_LIST: Record<string, readonly string[]> = {
  A: ['B', 'C'],
  B: ['A', 'C', 'D'],
  C: ['A', 'B', 'D', 'E'],
  D: ['B', 'C', 'E', 'F'],
  E: ['C', 'D', 'F'],
  F: ['D', 'E'],
};

/**
 * Mapeo de identificadores de nodo a índices numéricos para compatibilidad con arrayState.
 */
export const VERTEX_INDICES: Record<string, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
};

const ALL_NODE_IDS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

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
  graphState: GraphAlgorithmState;
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
 * Clona inmutablemente el mapa de nodos del grafo.
 */
function cloneNodes(nodes: Record<string, GraphNodeData>): Record<string, GraphNodeData> {
  const cloned: Record<string, GraphNodeData> = {};
  for (const [id, node] of Object.entries(nodes)) {
    cloned[id] = { ...node };
  }
  return cloned;
}

/**
 * Clona inmutablemente el arreglo de aristas del grafo.
 */
function cloneEdges(edges: GraphEdgeData[]): GraphEdgeData[] {
  return edges.map((e) => ({ ...e }));
}

/**
 * Obtiene el identificador canónico de arista no dirigida ('u-v' o 'v-u').
 */
function getEdgeId(u: string, v: string): string {
  const match = CANONICAL_BFS_EDGES.find(
    ([from, to]) => (from === u && to === v) || (from === v && to === u)
  );
  if (match) {
    return `${match[0]}-${match[1]}`;
  }
  return `${u}-${v}`;
}

/**
 * Generador puro y síncrono de fotogramas de ejecución para BFS en grafo canónico.
 *
 * @param startInput Nodo de inicio opcional ('A' por defecto o número/array equivalente).
 * @returns Lista inmutable de fotogramas paso a paso (TraceFrame[]).
 */
export function generateBFSTrace(startInput?: number[] | string): TraceFrame[] {
  let startNode = 'A';
  if (typeof startInput === 'string' && CANONICAL_BFS_NODES[startInput.toUpperCase()]) {
    startNode = startInput.toUpperCase();
  } else if (Array.isArray(startInput) && startInput.length > 0) {
    const candidateIdx = startInput[0];
    const candidateId = ALL_NODE_IDS[candidateIdx];
    if (candidateId && CANONICAL_BFS_NODES[candidateId]) {
      startNode = candidateId;
    }
  }

  const rawFrames: RawFrame[] = [];

  // 1. Inicialización de nodos del grafo
  const nodes: Record<string, GraphNodeData> = {};
  for (const id of ALL_NODE_IDS) {
    const coord = CANONICAL_BFS_NODES[id];
    nodes[id] = {
      id,
      label: coord.label,
      x: coord.x,
      y: coord.y,
      state: 'default',
    };
  }

  // 2. Inicialización de aristas del grafo
  const edges: GraphEdgeData[] = CANONICAL_BFS_EDGES.map(([from, to]) => ({
    id: `${from}-${to}`,
    from,
    to,
    state: 'default',
  }));

  // Registro de aristas que ya forman parte del árbol generador BFS
  const treeEdgeIds = new Set<string>();

  // Estructuras del algoritmo
  const visited = new Set<string>();
  const queue: string[] = [];

  let comparisonsCount = 0; // Conteo de comprobaciones de aristas
  let nodesEnqueuedCount = 0; // Conteo de nodos descubiertos/encolados
  let dequeuedCount = 0; // Conteo de vértices procesados

  // Helper para construir el estado lineal compatible con el panel de array
  function buildLinearState(): {
    arrayState: number[];
    elementStates: Record<number, ElementState>;
  } {
    const arrayState = ALL_NODE_IDS.map((id) => VERTEX_INDICES[id]);
    const elementStates: Record<number, ElementState> = {};
    for (const id of ALL_NODE_IDS) {
      const idx = VERTEX_INDICES[id];
      elementStates[idx] = nodes[id].state ?? 'default';
    }
    return { arrayState, elementStates };
  }

  // Helper para generar y registrar un snapshot inmutable
  function recordFrame(params: {
    activeAction: ActiveAction;
    currentNodeId?: string | null;
    activeEdgeId?: string | null;
    activeNeighborId?: string | null;
    highlightLines: { c: number[]; python: number[] };
    explanation: { text: string; subNote?: string };
    comparison?: {
      leftIndex: number;
      rightIndex: number;
      leftValue: number;
      rightValue: number;
      conditionMet: boolean;
    };
    event?: TraceEvent;
  }): void {
    const { arrayState, elementStates } = buildLinearState();

    const pointers: Record<string, number> = {};
    if (params.currentNodeId) {
      pointers.curr = VERTEX_INDICES[params.currentNodeId];
    }
    if (params.activeNeighborId) {
      pointers.neighbor = VERTEX_INDICES[params.activeNeighborId];
    }
    if (queue.length > 0) {
      pointers.front = VERTEX_INDICES[queue[0]];
      pointers.rear = VERTEX_INDICES[queue[queue.length - 1]];
    }

    const currentGraphEdges = edges.map((e) => {
      if (e.id === params.activeEdgeId) {
        return { ...e, state: 'active' as const };
      }
      if (treeEdgeIds.has(e.id)) {
        return { ...e, state: 'traversed' as const };
      }
      return { ...e, state: 'default' as const };
    });

    const callStack: StackFrame[] = [
      {
        id: 'call-bfs',
        functionName: 'bfs',
        args: {
          start: startNode,
          curr: params.currentNodeId ?? '-',
          queueLen: queue.length,
        },
        isActive: true,
      },
    ];

    rawFrames.push({
      highlightLines: params.highlightLines,
      arrayState: [...arrayState],
      elementStates: { ...elementStates },
      pointers,
      activeAction: params.activeAction,
      callStack,
      graphState: {
        nodes: cloneNodes(nodes),
        edges: cloneEdges(currentGraphEdges),
        currentNodeId: params.currentNodeId ?? null,
        activeEdgeId: params.activeEdgeId ?? null,
        queue: [...queue],
      },
      comparison: params.comparison,
      explanation: params.explanation,
      metrics: {
        comparisons: comparisonsCount,
        swaps: nodesEnqueuedCount,
        passNumber: Math.max(1, dequeuedCount),
        totalPasses: 6,
        maxComparisons: 18,
      },
      event: params.event ?? { type: 'idle' },
      snapshot: {
        kind: 'idle',
        arrayState: [...arrayState],
        elementStates: { ...elementStates },
        pointers: { ...pointers },
      },
    });
  }

  // ==========================================================================
  // PASO 1: Encolar el nodo inicial (startNode, ej. 'A')
  // ==========================================================================
  visited.add(startNode);
  queue.push(startNode);
  nodes[startNode].state = 'pointer';
  nodesEnqueuedCount++;

  recordFrame({
    activeAction: 'pivot',
    currentNodeId: null,
    activeNeighborId: startNode,
    highlightLines: {
      c: [11, 12],
      python: [4, 5],
    },
    explanation: {
      text: `Inicialización BFS: Marcamos el vértice inicial ${startNode} como visitado y lo encolamos en la cola FIFO.`,
      subNote: `Cola: [${queue.join(', ')}] | front = 0, rear = 1. Estado en cola: pointer (lavanda).`,
    },
    event: {
      type: 'pointer',
      name: 'queue',
      index: VERTEX_INDICES[startNode],
    },
  });

  // ==========================================================================
  // BUCLE PRINCIPAL: while (front < rear) / while queue:
  // ==========================================================================
  while (queue.length > 0) {
    const curr = queue.shift()!;
    dequeuedCount++;
    nodes[curr].state = 'comparing';

    // Fotograma: Desencolar curr
    recordFrame({
      activeAction: 'compare',
      currentNodeId: curr,
      highlightLines: {
        c: [14, 15],
        python: [7, 8],
      },
      explanation: {
        text: `Desencolamos el vértice ${curr} de la cola FIFO (front). Pasa a estado de exploración activa (amarillo / comparing).`,
        subNote: `Cola restante: [${queue.length > 0 ? queue.join(', ') : 'vacía'}]. Inspeccionando vecinos adyacentes en orden.`,
      },
      event: {
        type: 'compare',
        leftIndex: VERTEX_INDICES[curr],
        rightIndex: VERTEX_INDICES[curr],
        leftValue: VERTEX_INDICES[curr],
        rightValue: VERTEX_INDICES[curr],
        conditionMet: true,
      },
    });

    // Explorar cada vecino según la lista de adyacencia
    const neighbors = BFS_ADJACENCY_LIST[curr] ?? [];

    for (const neighbor of neighbors) {
      comparisonsCount++;
      const edgeId = getEdgeId(curr, neighbor);
      const isNeighborVisited = visited.has(neighbor);

      if (!isNeighborVisited) {
        // Subpaso 1: Evaluar arista activa hacia vecino no visitado
        recordFrame({
          activeAction: 'compare',
          currentNodeId: curr,
          activeEdgeId: edgeId,
          activeNeighborId: neighbor,
          highlightLines: {
            c: [16, 17],
            python: [9, 10],
          },
          comparison: {
            leftIndex: VERTEX_INDICES[curr],
            rightIndex: VERTEX_INDICES[neighbor],
            leftValue: VERTEX_INDICES[curr],
            rightValue: VERTEX_INDICES[neighbor],
            conditionMet: true,
          },
          explanation: {
            text: `Evaluando arista (${curr}, ${neighbor}). El vecino ${neighbor} no ha sido visitado aún (!visited[${neighbor}] == true).`,
            subNote: `Arista (${edgeId}) en estado activo. Preparando para registrar y encolar el nuevo vértice.`,
          },
          event: {
            type: 'compare',
            leftIndex: VERTEX_INDICES[curr],
            rightIndex: VERTEX_INDICES[neighbor],
            leftValue: VERTEX_INDICES[curr],
            rightValue: VERTEX_INDICES[neighbor],
            conditionMet: true,
          },
        });

        // Subpaso 2: Marcar como visitado, incorporar arista de árbol y encolar
        visited.add(neighbor);
        queue.push(neighbor);
        nodes[neighbor].state = 'pointer';
        treeEdgeIds.add(edgeId);
        nodesEnqueuedCount++;

        recordFrame({
          activeAction: 'pivot',
          currentNodeId: curr,
          activeEdgeId: edgeId,
          activeNeighborId: neighbor,
          highlightLines: {
            c: [18, 19],
            python: [11, 12],
          },
          explanation: {
            text: `Vértice ${neighbor} marcado como visitado y encolado en la cola FIFO. Arista (${edgeId}) consolidada en el árbol BFS.`,
            subNote: `Cola actual: [${queue.join(', ')}] | Vértices descubiertos: ${visited.size}/6.`,
          },
          event: {
            type: 'pointer',
            name: 'queue',
            index: VERTEX_INDICES[neighbor],
          },
        });
      } else {
        // Vecino ya visitado: arista inspeccionada (arista cruzada o de retorno)
        recordFrame({
          activeAction: 'compare',
          currentNodeId: curr,
          activeEdgeId: edgeId,
          activeNeighborId: neighbor,
          highlightLines: {
            c: [16, 17],
            python: [9, 10],
          },
          comparison: {
            leftIndex: VERTEX_INDICES[curr],
            rightIndex: VERTEX_INDICES[neighbor],
            leftValue: VERTEX_INDICES[curr],
            rightValue: VERTEX_INDICES[neighbor],
            conditionMet: false,
          },
          explanation: {
            text: `Inspeccionando arista (${curr}, ${neighbor}). El vecino ${neighbor} ya fue visitado previamente; se omite.`,
            subNote: `visited[${neighbor}] es verdadero. Arista explorada sin modificar la cola FIFO.`,
          },
          event: {
            type: 'compare',
            leftIndex: VERTEX_INDICES[curr],
            rightIndex: VERTEX_INDICES[neighbor],
            leftValue: VERTEX_INDICES[curr],
            rightValue: VERTEX_INDICES[neighbor],
            conditionMet: false,
          },
        });
      }
    }

    // Al terminar todos los vecinos de curr: marcar como procesado (sorted / menta)
    nodes[curr].state = 'sorted';

    recordFrame({
      activeAction: 'locked',
      currentNodeId: curr,
      highlightLines: {
        c: [21],
        python: [9],
      },
      explanation: {
        text: `Completada la exploración de adyacencias del vértice ${curr}. Estado: Procesado (menta / sorted).`,
        subNote: `Vértices procesados: ${dequeuedCount}/6 | Cola pendiente: [${queue.length > 0 ? queue.join(', ') : 'vacía'}].`,
      },
      event: {
        type: 'locked',
        index: VERTEX_INDICES[curr],
        value: VERTEX_INDICES[curr],
      },
    });
  }

  // ==========================================================================
  // FOTOGRAMA FINAL: Todos los nodos visitados ('sorted'), cola vacía
  // ==========================================================================
  recordFrame({
    activeAction: 'idle',
    currentNodeId: null,
    activeEdgeId: null,
    highlightLines: {
      c: [22],
      python: [7],
    },
    explanation: {
      text: 'Recorrido en Anchura (BFS) finalizado. La cola FIFO está vacía y todos los vértices conexos han sido explorados por niveles.',
      subNote: `Total vértices visitados: ${visited.size}/6 | Aristas de árbol BFS: ${treeEdgeIds.size} | Comprobaciones: ${comparisonsCount}.`,
    },
    event: { type: 'idle' },
  });

  // Asignar numeración exacta de pasos e inmutabilidad estricta
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

