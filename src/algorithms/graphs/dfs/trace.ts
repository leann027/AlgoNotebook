/**
 * AlgoNotebook — Depth-First Search (DFS) Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Grafo conexo canónico de 6 vértices (A, B, C, D, E, F) en lienzo 800x460.
 * - Integración con CallStackWidget simulando marcos de recursión LIFO.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  GraphAlgorithmState,
  GraphNodeData,
  GraphEdgeData,
  StackFrame,
} from '../../../core/types';

export const CANONICAL_DFS_NODES: Record<string, { x: number; y: number; label: string }> = {
  A: { x: 160, y: 220, label: 'A' },
  B: { x: 300, y: 110, label: 'B' },
  C: { x: 300, y: 330, label: 'C' },
  D: { x: 500, y: 110, label: 'D' },
  E: { x: 500, y: 330, label: 'E' },
  F: { x: 640, y: 220, label: 'F' },
};

export const CANONICAL_DFS_EDGES: readonly [string, string][] = [
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

export const DFS_ADJACENCY_LIST: Record<string, readonly string[]> = {
  A: ['B', 'C'],
  B: ['A', 'C', 'D'],
  C: ['A', 'B', 'D', 'E'],
  D: ['B', 'C', 'E', 'F'],
  E: ['C', 'D', 'F'],
  F: ['D', 'E'],
};

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
  explanation: {
    stepLabel: string;
    text: string;
    subNote?: string;
  };
  metrics: {
    comparisons: number;
    swaps: number;
    passNumber: number;
    totalPasses: number;
    maxComparisons: number;
  };
}

function edgeMatches(e: GraphEdgeData, u: string, v: string): boolean {
  return (e.from === u && e.to === v) || (e.from === v && e.to === u);
}

function buildInitialEdges(): GraphEdgeData[] {
  return CANONICAL_DFS_EDGES.map(([u, v], idx) => ({
    id: `e-${idx}-${u}-${v}`,
    from: u,
    to: v,
    state: 'default',
  }));
}

function cloneEdges(edges: GraphEdgeData[]): GraphEdgeData[] {
  return edges.map((e) => ({ ...e }));
}

function cloneNodes(nodes: Record<string, GraphNodeData>): Record<string, GraphNodeData> {
  const result: Record<string, GraphNodeData> = {};
  for (const [key, val] of Object.entries(nodes)) {
    result[key] = { ...val };
  }
  return result;
}

function cloneCallStack(stack: StackFrame[]): StackFrame[] {
  return stack.map((f) => ({ ...f, args: { ...f.args } }));
}

/**
 * Generador puro de traza para Recorrido en Profundidad (DFS).
 */
export function generateDFSTrace(startNode = 'A'): TraceFrame[] {
  const rawFrames: RawFrame[] = [];
  const edges: GraphEdgeData[] = buildInitialEdges();

  const nodes: Record<string, GraphNodeData> = {};
  for (const id of ALL_NODE_IDS) {
    nodes[id] = {
      id,
      label: id,
      x: CANONICAL_DFS_NODES[id].x,
      y: CANONICAL_DFS_NODES[id].y,
      state: 'default',
    };
  }

  const visitedSet = new Set<string>();
  const callStack: StackFrame[] = [];
  let edgeInspections = 0;
  let backtrackCount = 0;

  // Frame 0: Inicialización
  rawFrames.push({
    highlightLines: { c: [16, 17], python: [9, 10] },
    arrayState: [0, 1, 2, 3, 4, 5],
    elementStates: { 0: 'default', 1: 'default', 2: 'default', 3: 'default', 4: 'default', 5: 'default' },
    pointers: { start: VERTEX_INDICES[startNode] },
    activeAction: 'idle',
    callStack: [],
    graphState: {
      nodes: cloneNodes(nodes),
      edges: cloneEdges(edges),
      currentNodeId: undefined,
    },
    explanation: {
      stepLabel: 'Inicialización DFS:',
      text: `Iniciando recorrido en profundidad desde el nodo origen '${startNode}'. Pila de recursión vacía.`,
      subNote: 'DFS explorará cada rama hasta la profundidad máxima antes de retroceder (backtracking).',
    },
    metrics: {
      comparisons: 0,
      swaps: 0,
      passNumber: 0,
      totalPasses: 6,
      maxComparisons: CANONICAL_DFS_EDGES.length,
    },
  });

  function dfsUtil(curr: string, parent?: string) {
    visitedSet.add(curr);
    nodes[curr].state = 'comparing';

    // Apilar marco en la pila de llamadas
    callStack.forEach((f) => { f.isActive = false; });
    const currentFrameId = `dfs-${curr}-${callStack.length}`;
    callStack.unshift({
      id: currentFrameId,
      functionName: 'dfs_util',
      args: { curr, parent: parent ?? 'NULL', depth: callStack.length + 1 },
      isActive: true,
    });

    const currIdx = VERTEX_INDICES[curr];
    const elemStates: Record<number, ElementState> = {};
    ALL_NODE_IDS.forEach((id) => {
      const idx = VERTEX_INDICES[id];
      if (id === curr) elemStates[idx] = 'comparing';
      else if (visitedSet.has(id)) elemStates[idx] = 'pointer';
      else elemStates[idx] = 'default';
    });

    // Paso de entrada a función y marcado
    rawFrames.push({
      highlightLines: { c: [6, 7], python: [1, 2] },
      arrayState: [0, 1, 2, 3, 4, 5],
      elementStates: { ...elemStates },
      pointers: { curr: currIdx },
      activeAction: 'compare',
      callStack: cloneCallStack(callStack),
      graphState: {
        nodes: cloneNodes(nodes),
        edges: cloneEdges(edges),
        currentNodeId: curr,
      },
      explanation: {
        stepLabel: `Entrada dfs_util('${curr}'):`,
        text: `Vértice '${curr}' visitado. Se añade a la pila de llamadas y se marca como visitado.`,
        subNote: `Profundidad de recursión actual: ${callStack.length}.`,
      },
      metrics: {
        comparisons: edgeInspections,
        swaps: backtrackCount,
        passNumber: callStack.length,
        totalPasses: 6,
        maxComparisons: CANONICAL_DFS_EDGES.length,
      },
    });

    // Explorar vecinos
    const neighbors = DFS_ADJACENCY_LIST[curr] || [];
    for (const neighbor of neighbors) {
      edgeInspections++;
      const isAlreadyVisited = visitedSet.has(neighbor);

      // Resaltar arista activa
      const currentEdges = cloneEdges(edges);
      const targetEdge = currentEdges.find((e) => edgeMatches(e, curr, neighbor));
      if (targetEdge) {
        targetEdge.state = 'active';
      }

      rawFrames.push({
        highlightLines: { c: [9, 10], python: [4, 5] },
        arrayState: [0, 1, 2, 3, 4, 5],
        elementStates: { ...elemStates, [VERTEX_INDICES[neighbor]]: isAlreadyVisited ? 'pointer' : 'default' },
        pointers: { curr: currIdx, neighbor: VERTEX_INDICES[neighbor] },
        activeAction: 'compare',
        callStack: cloneCallStack(callStack),
        graphState: {
          nodes: cloneNodes(nodes),
          edges: currentEdges,
          currentNodeId: curr,
        },
        explanation: {
          stepLabel: `Inspeccionando arista (${curr} → ${neighbor}):`,
          text: isAlreadyVisited
            ? `Vecino '${neighbor}' ya fue visitado previamente. No se desciende recursivamente.`
            : `Vecino '${neighbor}' no ha sido visitado. Descendiendo en profundidad...`,
          subNote: isAlreadyVisited ? 'Arista de retroceso o cruzada.' : 'Arista del árbol de expansión DFS (tree edge).',
        },
        metrics: {
          comparisons: edgeInspections,
          swaps: backtrackCount,
          passNumber: callStack.length,
          totalPasses: 6,
          maxComparisons: CANONICAL_DFS_EDGES.length,
        },
      });

      if (!isAlreadyVisited) {
        // Fijar arista como recorrida
        const persistentEdge = edges.find((e) => edgeMatches(e, curr, neighbor));
        if (persistentEdge) {
          persistentEdge.state = 'traversed';
        }

        // Llamada recursiva
        dfsUtil(neighbor, curr);

        // Al retornar de la recursión:
        backtrackCount++;
        nodes[curr].state = 'comparing';
        callStack.forEach((f) => { f.isActive = false; });
        if (callStack.length > 0) callStack[0].isActive = true;

        rawFrames.push({
          highlightLines: { c: [11], python: [6] },
          arrayState: [0, 1, 2, 3, 4, 5],
          elementStates: { ...elemStates },
          pointers: { curr: currIdx },
          activeAction: 'idle',
          callStack: cloneCallStack(callStack),
          graphState: {
            nodes: cloneNodes(nodes),
            edges: cloneEdges(edges),
            currentNodeId: curr,
          },
          explanation: {
            stepLabel: `Retorno de recursión a '${curr}':`,
            text: `Regresando a '${curr}' tras finalizar la rama de '${neighbor}'. Continuando con los siguientes vecinos.`,
            subNote: `Profundidad de llamada restaurada a ${callStack.length}.`,
          },
          metrics: {
            comparisons: edgeInspections,
            swaps: backtrackCount,
            passNumber: callStack.length,
            totalPasses: 6,
            maxComparisons: CANONICAL_DFS_EDGES.length,
          },
        });
      } else {
        // Devolver arista a default o traversed
        const persistentEdge = edges.find((e) => edgeMatches(e, curr, neighbor));
        if (persistentEdge && persistentEdge.state !== 'traversed') {
          persistentEdge.state = 'default';
        }
      }
    }

    // Al terminar todos los vecinos de curr:
    nodes[curr].state = 'sorted';
    callStack.shift();
    if (callStack.length > 0) {
      callStack[0].isActive = true;
    }

    rawFrames.push({
      highlightLines: { c: [13], python: [6] },
      arrayState: [0, 1, 2, 3, 4, 5],
      elementStates: { ...elemStates, [currIdx]: 'sorted' },
      pointers: callStack.length > 0 ? { curr: VERTEX_INDICES[callStack[0].args.curr as string] } : {},
      activeAction: 'locked',
      callStack: cloneCallStack(callStack),
      graphState: {
        nodes: cloneNodes(nodes),
        edges: cloneEdges(edges),
        currentNodeId: callStack.length > 0 ? (callStack[0].args.curr as string) : undefined,
      },
      explanation: {
        stepLabel: `Fin de exploración para '${curr}':`,
        text: `Todos los vecinos de '${curr}' han sido explorados. Vértice asentado completamente y desapilado.`,
        subNote: 'El marco de llamada sale del Call Stack.',
      },
      metrics: {
        comparisons: edgeInspections,
        swaps: backtrackCount,
        passNumber: callStack.length,
        totalPasses: 6,
        maxComparisons: CANONICAL_DFS_EDGES.length,
      },
    });
  }

  dfsUtil(startNode);

  // Fotograma final de finalización
  rawFrames.push({
    highlightLines: { c: [17], python: [10] },
    arrayState: [0, 1, 2, 3, 4, 5],
    elementStates: { 0: 'sorted', 1: 'sorted', 2: 'sorted', 3: 'sorted', 4: 'sorted', 5: 'sorted' },
    pointers: {},
    activeAction: 'idle',
    callStack: [],
    graphState: {
      nodes: cloneNodes(nodes),
      edges: cloneEdges(edges),
      currentNodeId: undefined,
    },
    explanation: {
      stepLabel: 'DFS Completado:',
      text: 'Recorrido en profundidad finalizado con éxito. Todos los nodos alcanzables han sido explorados y la pila retornó a cero.',
      subNote: `Inspecciones totales de aristas: ${edgeInspections} | Pasos de retroceso: ${backtrackCount}`,
    },
    metrics: {
      comparisons: edgeInspections,
      swaps: backtrackCount,
      passNumber: 6,
      totalPasses: 6,
      maxComparisons: CANONICAL_DFS_EDGES.length,
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
    callStack: frame.callStack,
    graphState: frame.graphState,
    explanation: frame.explanation,
    metrics: frame.metrics,
  }));
}
